import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Info, Wifi, WifiOff, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseResumeFile, type ParsedResumeData } from '@/lib/resume-parser';
import { refineResumeWithGemini, mapRefinedDataToResumeForm, type RefinedResumeData } from '@/lib/gemini-api';
import { processFile, validateFile } from '@/lib/file-processing';
import type { ResumeData } from '@/pages/builder';

interface ResumeUploadProps {
  onParseComplete: (data: Partial<ResumeData>) => void;
  onError: (error: string) => void;
}

interface ExtractedField {
  label: string;
  value: string;
  confirmed: boolean;
}

export function ResumeUpload({ onParseComplete, onError }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ParsedResumeData | null>(null);
  const [refinedData, setRefinedData] = useState<RefinedResumeData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [useAiRefinement, setUseAiRefinement] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline' | null>(null);
  const [showPdfHelp, setShowPdfHelp] = useState(false);

  // Check server status
  const checkServerStatus = async () => {
    setServerStatus('checking');
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setServerStatus('online');
        setDebugInfo('Server is running and healthy');
      } else {
        setServerStatus('offline');
        setDebugInfo('Server responded but with error status');
      }
    } catch (error) {
      setServerStatus('offline');
      setDebugInfo('Server is not running or not accessible');
    }
  };

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Process uploaded file
  const handleFileUpload = async (file: File) => {
    console.log('File upload started:', file.name, 'Size:', file.size, 'Type:', file.type);
    setDebugInfo(`Processing: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Validate file using production-ready validation
    const validation = validateFile(file);
    if (!validation.valid) {
      console.error('File validation failed:', validation.error);
      onError(validation.error || 'Invalid file');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      // Check if server is available for PDF processing
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const healthCheck = await fetch('/api/pdf/health');
          if (!healthCheck.ok) {
            throw new Error('PDF processing service unavailable');
          }
        } catch (error) {
          console.warn('PDF service health check failed:', error);
          setDebugInfo('PDF processing service may be unavailable. Trying anyway...');
        }
      }

      // Use production-ready file processing for text extraction
      const result = await processFile(file);
      
      if (!result.success) {
        console.error('File processing failed:', result.error);
        
        // Check if it's a PDF compatibility issue
        if (result.error?.includes('version') || result.error?.includes('not supported')) {
          setShowPdfHelp(true);
          onError('PDF compatibility issue detected. Please see the help section below for solutions.');
          return;
        }
        
        throw new Error(result.error || 'Failed to process file');
      }

      console.log('File processed successfully, extracted text length:', result.text?.length);
      setDebugInfo(`Successfully extracted ${result.text?.length || 0} characters`);

      // Create parsed data structure compatible with existing flow
      const parsedData: ParsedResumeData = {
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        rawText: result.text || ''
      };

      // Parse the extracted text using existing parser logic
      if (result.text) {
        try {
          const fullParsedData = await parseResumeFile(file);
          // Use the full parsed data but ensure we have the server-extracted text
          parsedData.personalInfo = fullParsedData.personalInfo;
          parsedData.summary = fullParsedData.summary;
          parsedData.experience = fullParsedData.experience;
          parsedData.education = fullParsedData.education;
          parsedData.skills = fullParsedData.skills;
        } catch (parseError) {
          console.warn('Parser failed, using basic extraction:', parseError);
          // Continue with basic text extraction if parser fails
        }
      }

      setExtractedData(parsedData);

      // If AI refinement is enabled, send the raw text to DeepSeek
      if (useAiRefinement && parsedData.rawText && parsedData.rawText.length > 50) {
        setIsRefining(true);
        setDebugInfo('Refining with AI...');
        try {
          const refined = await refineResumeWithGemini(parsedData.rawText);
          setRefinedData(refined);
          setDebugInfo('AI refinement completed successfully');
        } catch (aiError) {
          console.error('AI refinement failed:', aiError);
          setDebugInfo('AI refinement failed, using basic parsing');
          // Continue with basic parsing if AI fails
        } finally {
          setIsRefining(false);
        }
      }

      setShowConfirmation(true);
    } catch (error) {
      console.error('Error parsing resume:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse resume file.';
      
      // Provide specific guidance based on error type
      if (errorMessage.includes('PDF') || errorMessage.includes('pdf')) {
        setShowPdfHelp(true);
        onError(`${errorMessage} Please see the help section below for solutions.`);
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        onError(`${errorMessage} Please check your internet connection and try again.`);
      } else {
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert parsed data to resume format
  const handleConfirmExtraction = () => {
    if (!extractedData) return;

    let resumeData: Partial<ResumeData>;

    // Use AI-refined data if available, otherwise use basic parsed data
    if (refinedData) {
      resumeData = mapRefinedDataToResumeForm(refinedData);
    } else {
      resumeData = {
        personalInfo: extractedData.personalInfo,
        summary: extractedData.summary,
        experience: extractedData.experience,
        education: extractedData.education,
        skills: extractedData.skills,
        template: 'azurill' // Default template
      };
    }

    onParseComplete(resumeData);
    setShowConfirmation(false);
    setExtractedData(null);
    setRefinedData(null);
    setUploadedFile(null);
    setDebugInfo('');
    setShowPdfHelp(false);
  };

  // Reset upload state
  const handleReset = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setRefinedData(null);
    setShowConfirmation(false);
    setIsProcessing(false);
    setIsRefining(false);
    setDebugInfo('');
    setShowPdfHelp(false);
  };

  if (showConfirmation && extractedData) {
    // Use refined data for display if available
    const displayData = refinedData ? mapRefinedDataToResumeForm(refinedData) : {
      personalInfo: extractedData.personalInfo,
      summary: extractedData.summary,
      experience: extractedData.experience,
      education: extractedData.education,
      skills: extractedData.skills,
    };

    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <CheckCircle2 className="text-green-600 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-slate-800">
              {refinedData ? 'Resume Refined with AI!' : 'Resume Parsed Successfully!'}
            </h3>
          </div>
          
          <p className="text-slate-600 mb-4">
            {refinedData 
              ? 'Your resume has been enhanced with AI for better formatting and structure. Review the information below:'
              : 'Review the extracted information below and confirm to auto-fill your resume form:'
            }
          </p>

          {debugInfo && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm text-blue-700">{debugInfo}</span>
              </div>
            </div>
          )}

          {isRefining && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                <span className="text-sm text-blue-700">Refining with AI...</span>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {/* Personal Info */}
            <div>
              <h4 className="font-medium text-slate-700 mb-2">Personal Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Name:</span>
                  <span className="ml-2 font-medium">
                    {displayData.personalInfo.firstName} {displayData.personalInfo.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>
                  <span className="ml-2 font-medium">{displayData.personalInfo.email}</span>
                </div>
                <div>
                  <span className="text-slate-500">Phone:</span>
                  <span className="ml-2 font-medium">{displayData.personalInfo.phone}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            {displayData.summary && (
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Summary</h4>
                <p className="text-sm text-slate-600 bg-white p-3 rounded border">
                  {displayData.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {displayData.experience.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Work Experience ({displayData.experience.length} entries)
                </h4>
                <div className="space-y-2">
                  {displayData.experience.slice(0, 2).map((exp, index) => (
                    <div key={index} className="text-sm bg-white p-3 rounded border">
                      <div className="font-medium">{exp.title} at {exp.company}</div>
                      <div className="text-slate-500">{exp.startDate} - {exp.endDate}</div>
                    </div>
                  ))}
                  {displayData.experience.length > 2 && (
                    <div className="text-sm text-slate-500">
                      +{displayData.experience.length - 2} more entries
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {displayData.education.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Education ({displayData.education.length} entries)
                </h4>
                <div className="space-y-2">
                  {displayData.education.map((edu, index) => (
                    <div key={index} className="text-sm bg-white p-3 rounded border">
                      <div className="font-medium">{edu.degree}</div>
                      <div className="text-slate-500">{edu.school} - {edu.graduationYear}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {displayData.skills.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Skills ({displayData.skills.length} items)
                </h4>
                <div className="flex flex-wrap gap-1">
                  {displayData.skills.slice(0, 10).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {displayData.skills.length > 10 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      +{displayData.skills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button onClick={handleConfirmExtraction} className="flex-1" disabled={isRefining}>
              {isRefining ? 'Processing...' : 'Confirm & Auto-Fill Form'}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isRefining}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed border-slate-300 hover:border-purple-400 transition-colors bg-background dark:bg-slate-700">
      <CardContent className="p-8">
        {/* Server Status Check */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {serverStatus === 'online' ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : serverStatus === 'offline' ? (
              <WifiOff className="h-4 w-4 text-red-500" />
            ) : serverStatus === 'checking' ? (
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            ) : null}
            <span className="text-sm text-slate-600">
              {serverStatus === 'online' ? 'Server Online' : 
               serverStatus === 'offline' ? 'Server Offline' : 
               serverStatus === 'checking' ? 'Checking...' : 'Server Status Unknown'}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkServerStatus}
            disabled={serverStatus === 'checking'}
          >
            Check Server
          </Button>
        </div>

        <div
          className={`text-center ${isDragging ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-400' : 'bg-background dark:bg-slate-700'} 
            border-2 border-dashed border-transparent rounded-lg p-8 transition-all`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <div className="animate-spin mx-auto w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  Processing Resume...
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Extracting text and analyzing content from {uploadedFile?.name}
                </p>
                {debugInfo && (
                  <p className="text-xs text-slate-500 mt-2">{debugInfo}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-full">
                  <Upload className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  Upload Your Resume
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Drag and drop your resume file here, or click to browse
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="resume-upload">
                  <Button asChild className="cursor-pointer">
                    <span>
                      <FileText className="mr-2" size={16} />
                      Choose File
                    </span>
                  </Button>
                </label>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                  <p><strong>Recommended:</strong> DOCX files (max 10MB) - Work perfectly!</p>
                  <p><strong>PDF files:</strong> Require server processing - may take longer</p>
                  <p><strong>Note:</strong> Make sure the server is running for PDF processing</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong> Upload your existing resume and we'll automatically 
            extract your information to pre-fill the form. You can review and edit all 
            extracted data before finalizing.
          </AlertDescription>
        </Alert>

        {/* PDF Help Section */}
        {showPdfHelp && (
          <Alert className="mt-4 bg-orange-50 border-orange-200">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <p><strong>PDF Compatibility Issue Detected</strong></p>
                <p>Your PDF file is not compatible with our parser. Here are the best solutions:</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Option 1:</strong> Convert PDF to DOCX using online tools:</p>
                  <div className="flex flex-wrap gap-2">
                    <a href="https://smallpdf.com/pdf-to-word" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                      SmallPDF <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    <a href="https://www.ilovepdf.com/pdf_to_word" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                      ILovePDF <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    <a href="https://www.pdftoword.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                      PDFtoWord <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  <p><strong>Option 2:</strong> Open PDF in Word/Google Docs and save as DOCX</p>
                  <p><strong>Option 3:</strong> Try a different PDF file</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Troubleshooting Tips */}
        <Alert className="mt-4 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Troubleshooting:</strong> If PDF upload fails, try converting to DOCX format 
            or ensure the server is running. Check browser console for detailed error messages.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
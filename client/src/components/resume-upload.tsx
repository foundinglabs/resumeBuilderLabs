import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    // Validate file using production-ready validation
    const validation = validateFile(file);
    if (!validation.valid) {
      onError(validation.error || 'Invalid file');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      // Use production-ready file processing for text extraction
      const result = await processFile(file);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process file');
      }

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
        const fullParsedData = await parseResumeFile(file);
        // Use the full parsed data but ensure we have the server-extracted text
        parsedData.personalInfo = fullParsedData.personalInfo;
        parsedData.summary = fullParsedData.summary;
        parsedData.experience = fullParsedData.experience;
        parsedData.education = fullParsedData.education;
        parsedData.skills = fullParsedData.skills;
      }

      setExtractedData(parsedData);

      // If AI refinement is enabled, send the raw text to DeepSeek
      if (useAiRefinement && parsedData.rawText && parsedData.rawText.length > 50) {
        setIsRefining(true);
        try {
          const refined = await refineResumeWithGemini(parsedData.rawText);
          setRefinedData(refined);
        } catch (aiError) {
          console.error('AI refinement failed:', aiError);
          // Continue with basic parsing if AI fails
        } finally {
          setIsRefining(false);
        }
      }

      setShowConfirmation(true);
    } catch (error) {
      console.error('Error parsing resume:', error);
      onError(error instanceof Error ? error.message : 'Failed to parse resume file.');
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
        template: 'modern' // Default template
      };
    }

    onParseComplete(resumeData);
    setShowConfirmation(false);
    setExtractedData(null);
    setRefinedData(null);
    setUploadedFile(null);
  };

  // Reset upload state
  const handleReset = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setRefinedData(null);
    setShowConfirmation(false);
    setIsProcessing(false);
    setIsRefining(false);
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
    <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
      <CardContent className="p-8">
        <div
          className={`text-center ${isDragging ? 'bg-blue-50 border-blue-300' : ''} 
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
              <div className="animate-spin mx-auto w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Processing Resume...
                </h3>
                <p className="text-slate-600">
                  Extracting text and analyzing content from {uploadedFile?.name}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Upload className="text-blue-600" size={32} />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Upload Your Resume
                </h3>
                <p className="text-slate-600 mb-4">
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
                
                <div className="text-sm text-slate-500 space-y-1">
                  <p><strong>Recommended:</strong> DOCX files (max 10MB) - Work perfectly!</p>
                  <p><strong>PDF files:</strong> Require conversion to DOCX for best results</p>
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
      </CardContent>
    </Card>
  );
}
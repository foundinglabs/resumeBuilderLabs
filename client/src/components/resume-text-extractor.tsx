import React, { useState, useCallback } from 'react';
import { Upload, FileText, Copy, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

// Import production-ready file processing
import { processFile, validateFile, FileProcessingResult } from '@/lib/file-processing';

// Helper functions for structured data extraction
function extractContactInfo(text: string) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?1[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}/);
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin\.com\/profile\/view\?id=)([a-zA-Z0-9-]+)/i);
  
  // Extract name from first few lines (usually appears early in resume)
  const lines = text.split('\n').slice(0, 10);
  let name = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    // Look for a line that could be a name (2-4 words, title case, no special chars except spaces and common name chars)
    if (trimmedLine && 
        trimmedLine.length > 5 && 
        trimmedLine.length < 50 && 
        /^[A-Z][a-z]+ [A-Z][a-z]+/i.test(trimmedLine) &&
        !trimmedLine.includes('@') &&
        !trimmedLine.includes('phone') &&
        !trimmedLine.includes('email') &&
        !trimmedLine.includes('address')) {
      name = trimmedLine;
      break;
    }
  }
  
  // Extract address/location
  const addressKeywords = ['address', 'location', 'city', 'state', 'zip'];
  let address = '';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (addressKeywords.some(keyword => lowerLine.includes(keyword))) {
      address = line.replace(/address:?/gi, '').trim();
      break;
    }
  }
  
  // Look for city/state patterns
  if (!address) {
    const cityStateMatch = text.match(/([A-Z][a-z]+,?\s+[A-Z]{2}|\w+,\s*\w+)/);
    if (cityStateMatch) {
      address = cityStateMatch[0];
    }
  }
  
  return {
    name: name || '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    address: address || '',
    linkedin: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : ''
  };
}

function extractSummarySection(text: string) {
  const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (summaryKeywords.some(keyword => line.includes(keyword) && line.length < 50)) {
      // Found summary section, get the content
      let content = '';
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].trim() && !lines[j].toLowerCase().match(/experience|education|skills/)) {
          content += lines[j].trim() + ' ';
        } else break;
      }
      return content.trim() || null;
    }
  }
  return null;
}

function extractExperienceSection(text: string) {
  const experiences = [];
  const lines = text.split('\n');
  let inExperienceSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (line.includes('experience') || line.includes('work history')) {
      inExperienceSection = true;
      continue;
    }
    if (inExperienceSection && (line.includes('education') || line.includes('skills'))) {
      break;
    }
    if (inExperienceSection && lines[i].trim()) {
      // Look for patterns like "Job Title at Company (Date - Date)"
      const experienceMatch = lines[i].match(/^(.+?)\s+(?:at|@)\s+(.+?)(?:\s+\((.+?)\))?$/i);
      if (experienceMatch) {
        // Split period into start and end dates if available
        const period = experienceMatch[3] || '';
        const dateParts = period.split('-').map(d => d.trim());
        
        experiences.push({
          title: experienceMatch[1].trim(),
          company: experienceMatch[2].trim(),
          startDate: dateParts[0] || '',
          endDate: dateParts[1] || dateParts[0] || '',
          description: '' // Will be enhanced in future iterations
        });
      }
    }
  }
  
  return experiences;
}

function extractEducationSection(text: string) {
  const education = [];
  const lines = text.split('\n');
  let inEducationSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (line.includes('education') || line.includes('academic')) {
      inEducationSection = true;
      continue;
    }
    if (inEducationSection && (line.includes('experience') || line.includes('skills'))) {
      break;
    }
    if (inEducationSection && lines[i].trim()) {
      // Look for degree patterns
      const degreeMatch = lines[i].match(/^(.+?)\s+(?:from|at|-)\s+(.+?)(?:\s+\((.+?)\))?$/i);
      if (degreeMatch) {
        education.push({
          degree: degreeMatch[1].trim(),
          school: degreeMatch[2].trim(),
          graduationYear: degreeMatch[3] || ''
        });
      }
    }
  }
  
  return education;
}

function extractSkillsSection(text: string) {
  const lines = text.split('\n');
  let inSkillsSection = false;
  const skills = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (line.includes('skills') || line.includes('technologies')) {
      inSkillsSection = true;
      continue;
    }
    if (inSkillsSection && (line.includes('experience') || line.includes('education'))) {
      break;
    }
    if (inSkillsSection && lines[i].trim()) {
      // Split by common delimiters
      const lineSkills = lines[i].split(/[,;|•·]/).map(s => s.trim()).filter(s => s.length > 0);
      skills.push(...lineSkills);
    }
  }
  
  return skills.slice(0, 20); // Limit to first 20 skills
}

// Detect and highlight resume sections
function detectResumeSections(text: string): Array<{ section: string; content: string; startIndex: number }> {
  const sections = [
    { name: 'Contact Information', keywords: ['email', 'phone', 'address', 'linkedin'] },
    { name: 'Summary/Objective', keywords: ['summary', 'objective', 'profile', 'about'] },
    { name: 'Experience', keywords: ['experience', 'work', 'employment', 'career'] },
    { name: 'Education', keywords: ['education', 'academic', 'university', 'college', 'school'] },
    { name: 'Skills', keywords: ['skills', 'technologies', 'technical', 'competencies'] },
    { name: 'Projects', keywords: ['projects', 'portfolio', 'achievements'] },
    { name: 'Certifications', keywords: ['certifications', 'certificates', 'awards'] }
  ];

  const detectedSections: Array<{ section: string; content: string; startIndex: number }> = [];
  const lines = text.split('\n');

  sections.forEach(section => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      if (section.keywords.some(keyword => line.includes(keyword) && line.length < 50)) {
        // Found a section header, collect content until next section
        let content = '';
        let j = i + 1;
        
        while (j < lines.length) {
          const nextLine = lines[j].toLowerCase().trim();
          // Stop if we hit another section
          const isNextSection = sections.some(s => 
            s.keywords.some(k => nextLine.includes(k) && nextLine.length < 50)
          );
          
          if (isNextSection) break;
          
          content += lines[j] + '\n';
          j++;
          
          // Limit section content length
          if (content.length > 1000) break;
        }

        if (content.trim()) {
          detectedSections.push({
            section: section.name,
            content: content.trim(),
            startIndex: text.indexOf(lines[i])
          });
        }
        break; // Found this section, move to next
      }
    }
  });

  return detectedSections;
}

interface ResumeTextExtractorProps {
  className?: string;
}

export function ResumeTextExtractor({ className = '' }: ResumeTextExtractorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [detectedSections, setDetectedSections] = useState<Array<{ section: string; content: string; startIndex: number }>>([]);
  const [error, setError] = useState<string>('');
  const [showSections, setShowSections] = useState(false);


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
    if (!file) return;
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    
    setError('');
    setUploadedFile(file);
    setIsProcessing(true);
    setExtractedText('');
    setDetectedSections([]);
    
    try {
      const result: FileProcessingResult = await processFile(file);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process file');
      }
      
      if (!result.text || result.text.trim().length === 0) {
        throw new Error('No text could be extracted from the file');
      }
      
      // Clean up the text
      const cleanText = result.text
        .replace(/\r\n/g, '\n')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
      
      setExtractedText(cleanText);
      
      // Detect sections
      const sections = detectResumeSections(cleanText);
      setDetectedSections(sections);
      
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Failed to process file');
      setUploadedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy text to clipboard
  const handleCopyText = async () => {
    if (extractedText) {
      try {
        await navigator.clipboard.writeText(extractedText);
        // Show success feedback
      } catch (error) {
        console.error('Failed to copy text:', error);
      }
    }
  };

  // Download text as file
  const handleDownloadText = () => {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${uploadedFile?.name || 'resume'}_extracted.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Download as JSON format
  const handleDownloadJSON = () => {
    if (extractedText && detectedSections) {
      const contactInfo = extractContactInfo(extractedText);
      const experiences = extractExperienceSection(extractedText);
      const educations = extractEducationSection(extractedText);
      
      const jsonData = {
        metadata: {
          filename: uploadedFile?.name || 'unknown',
          extractedAt: new Date().toISOString(),
          totalCharacters: extractedText.length,
          sectionsDetected: detectedSections.length
        },
        fullText: extractedText,
        sections: detectedSections.map(section => ({
          name: section.section,
          content: section.content,
          wordCount: section.content.split(/\s+/).length
        })),
        resumeTemplate: {
          name: contactInfo.name || "Not specified",
          email: contactInfo.email || "Not specified",
          phone: contactInfo.phone || "Not specified",
          location: contactInfo.address || "Not specified",
          summary: extractSummarySection(extractedText) || "Not specified",
          workExperience: experiences.map(exp => ({
            jobTitle: exp.title || "Not specified",
            company: exp.company || "Not specified",
            location: "Not specified",
            startDate: exp.startDate || "Not specified",
            endDate: exp.endDate || "Not specified",
            description: exp.description ? [exp.description] : ["Not specified"]
          })),
          education: educations.map(edu => ({
            degree: edu.degree || "Not specified",
            institution: edu.school || "Not specified",
            location: "Not specified",
            startYear: edu.graduationYear ? (parseInt(edu.graduationYear) - 4).toString() : "Not specified",
            endYear: edu.graduationYear || "Not specified"
          })),
          skills: extractSkillsSection(extractedText),
          certifications: [],
          projects: [],
          languages: []
        }
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${uploadedFile?.name || 'resume'}_structured.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Copy JSON to clipboard
  const handleCopyJSON = async () => {
    if (extractedText && detectedSections) {
      const contactInfo = extractContactInfo(extractedText);
      const experiences = extractExperienceSection(extractedText);
      const educations = extractEducationSection(extractedText);
      
      const jsonData = {
        metadata: {
          filename: uploadedFile?.name || 'unknown',
          extractedAt: new Date().toISOString(),
          totalCharacters: extractedText.length,
          sectionsDetected: detectedSections.length
        },
        fullText: extractedText,
        sections: detectedSections.map(section => ({
          name: section.section,
          content: section.content,
          wordCount: section.content.split(/\s+/).length
        })),
        resumeTemplate: {
          name: contactInfo.name || "Not specified",
          email: contactInfo.email || "Not specified",
          phone: contactInfo.phone || "Not specified",
          location: contactInfo.address || "Not specified",
          summary: extractSummarySection(extractedText) || "Not specified",
          workExperience: experiences.map(exp => ({
            jobTitle: exp.title || "Not specified",
            company: exp.company || "Not specified",
            location: "Not specified",
            startDate: exp.startDate || "Not specified",
            endDate: exp.endDate || "Not specified",
            description: exp.description ? [exp.description] : ["Not specified"]
          })),
          education: educations.map(edu => ({
            degree: edu.degree || "Not specified",
            institution: edu.school || "Not specified",
            location: "Not specified",
            startYear: edu.graduationYear ? (parseInt(edu.graduationYear) - 4).toString() : "Not specified",
            endYear: edu.graduationYear || "Not specified"
          })),
          skills: extractSkillsSection(extractedText),
          certifications: [],
          projects: [],
          languages: []
        }
      };

      try {
        await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      } catch (error) {
        console.error('Failed to copy JSON:', error);
      }
    }
  };

  // Reset component
  const handleReset = () => {
    setUploadedFile(null);
    setExtractedText('');
    setDetectedSections([]);
    setError('');
    setIsProcessing(false);
    setShowSections(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
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
                <Loader2 className="animate-spin mx-auto w-12 h-12 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Processing Document...
                  </h3>
                  <p className="text-slate-600">
                    Extracting text from {uploadedFile?.name}
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
                    Upload Resume Document
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Drag and drop your resume file here, or click to browse
                  </p>
                </div>

                <div className="space-y-3">
                  <label htmlFor="document-upload">
                    <Button asChild className="cursor-pointer">
                      <span>
                        <FileText className="mr-2" size={16} />
                        Choose File
                      </span>
                    </Button>
                  </label>
                  <input
                    id="document-upload"
                    type="file"
                    accept=".docx,.pdf"
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

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {extractedText && (
        <div className="space-y-4">
          {/* Success Message */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Success!</strong> Extracted {extractedText.length} characters from {uploadedFile?.name}.
              {detectedSections.length > 0 && ` Found ${detectedSections.length} resume sections.`}
            </AlertDescription>
          </Alert>



          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCopyText} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy Text
            </Button>
            <Button onClick={handleDownloadText} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download TXT
            </Button>
            <Button onClick={handleCopyJSON} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy JSON
            </Button>
            <Button onClick={handleDownloadJSON} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
            {detectedSections.length > 0 && (
              <Button 
                onClick={() => setShowSections(!showSections)} 
                variant="outline"
              >
                {showSections ? 'Hide' : 'Show'} Sections ({detectedSections.length})
              </Button>
            )}
            <Button onClick={handleReset} variant="outline">
              Upload New File
            </Button>
          </div>

          {/* Detected Sections */}
          {showSections && detectedSections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detected Resume Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detectedSections.map((section, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {section.section}
                      </h4>
                      <div className="bg-slate-50 p-3 rounded text-sm">
                        <pre className="whitespace-pre-wrap font-sans text-slate-700">
                          {section.content.length > 200 
                            ? section.content.substring(0, 200) + '...'
                            : section.content
                          }
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Extracted Text Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Extracted Plain Text</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Extracted text will appear here..."
                className="min-h-[400px] font-mono text-sm"
              />
              <p className="text-sm text-slate-500 mt-2">
                You can edit the extracted text above. Changes will be reflected when copying or downloading.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use:</strong> Upload your resume file to extract both plain text and structured JSON data. 
          The tool automatically detects resume sections like Experience, Education, and Skills, then formats them 
          into a structured JSON format perfect for integrations, databases, or further processing.
          <br/><br/>
          <strong>Output formats:</strong> Plain text for reading, structured JSON with metadata, sections, and parsed data fields.
        </AlertDescription>
      </Alert>
    </div>
  );
}
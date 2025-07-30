import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, File, Code, Loader2, CheckCircle } from 'lucide-react';
import { ResumeData } from '@/pages/builder';
import { generatePDF } from '@/lib/pdf-utils';
import { generateDOCX } from '@/lib/docx-utils';
import { generateJSON } from '@/lib/json-utils';

interface DownloadModalProps {
  resumeData: ResumeData;
  children?: React.ReactNode;
}

interface DownloadFormat {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  estimatedSize: string;
  recommended?: boolean;
}

const downloadFormats: DownloadFormat[] = [
  {
    id: 'pdf',
    label: 'PDF',
    icon: <FileText className="h-5 w-5" />,
    description: 'Professional, print-ready format',
    estimatedSize: '~200KB',
    recommended: true,
  },
  {
    id: 'docx',
    label: 'DOCX',
    icon: <File className="h-5 w-5" />,
    description: 'Editable Word document',
    estimatedSize: '~150KB',
  },
  {
    id: 'json',
    label: 'JSON',
    icon: <Code className="h-5 w-5" />,
    description: 'Raw data for developers',
    estimatedSize: '~5KB',
  },
];

export function DownloadModal({ resumeData, children }: DownloadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownload = async (format: string) => {
    setDownloadingFormat(format);
    setDownloadSuccess(null);
    
    try {
      const fileName = `${resumeData.personalInfo.firstName}_${resumeData.personalInfo.lastName}_Resume`.replace(/\s+/g, '_');
      
      switch (format) {
        case 'pdf':
          await generatePDF(resumeData, fileName);
          break;
        case 'docx':
          await generateDOCX(resumeData, fileName);
          break;
        case 'json':
          await generateJSON(resumeData, fileName);
          break;
        default:
          throw new Error('Unsupported format');
      }
      
      setLastDownloaded(format);
      setDownloadSuccess(format);
      
      // Store preference in localStorage
      localStorage.setItem('preferredDownloadFormat', format);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDownloadSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error(`Failed to download ${format}:`, error);
      alert(`Failed to download ${format.toUpperCase()}. Please try again.`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const getPreferredFormat = () => {
    return localStorage.getItem('preferredDownloadFormat') || 'pdf';
  };

  const preferredFormat = getPreferredFormat();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Download Resume
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Choose Download Format</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {downloadFormats.map((format) => {
            const isDownloading = downloadingFormat === format.id;
            const wasDownloaded = downloadSuccess === format.id;
            const isPreferred = preferredFormat === format.id;
            
            return (
              <div
                key={format.id}
                className={`relative p-4 border rounded-lg transition-all duration-200 ${
                  isPreferred 
                    ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950' 
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                } ${wasDownloaded ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
                  <div className="flex items-center gap-3 flex-1 w-full">
                    <div className="flex-shrink-0 text-gray-600 dark:text-gray-400">
                      {format.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {format.label}
                        </h3>
                        {format.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                        {isPreferred && (
                          <Badge variant="outline" className="text-xs">
                            Last used
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {format.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {format.estimatedSize}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    {wasDownloaded && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <Button
                      onClick={() => handleDownload(format.id)}
                      disabled={isDownloading}
                      size="sm"
                      variant={isPreferred ? "default" : "outline"}
                      className="w-full sm:w-auto flex-shrink-0"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {downloadSuccess && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Resume downloaded successfully as {downloadSuccess.toUpperCase()}!
              </span>
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Your preferred format will be remembered for next time
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
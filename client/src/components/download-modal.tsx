import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, CheckCircle2, FileText, File, Code } from 'lucide-react';
import { ResumeData } from '@/pages/builder';
import { generatePDFWithPuppeteer } from '@/lib/pdf-utils-puppeteer';
import { generateDOCX } from '@/lib/docx-utils';
import { generateJSON } from '@/lib/json-utils';
import { MagicCard } from './ui/magic-card';
import { ShimmerButton } from './ui/shimmer-button';
import { cn } from '@/lib/utils';

interface DownloadModalProps {
  resumeData: ResumeData;
  className?: string;
  children?: React.ReactNode;
}

interface DownloadFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
}

export function DownloadModal({ resumeData, className, children }: DownloadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf-puppeteer');

  const formats: DownloadFormat[] = [
    {
      id: 'pdf-puppeteer',
      name: 'PDF',
      description: 'Professional PDF format',
      icon: <FileText className="w-5 h-5" />,
      extension: '.pdf'
    },
    {
      id: 'docx',
      name: 'Word',
      description: 'Microsoft Word document',
      icon: <File className="w-5 h-5" />,
      extension: '.docx'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Raw data export',
      icon: <Code className="w-5 h-5" />,
      extension: '.json'
    }
  ];

  const isDownloading = downloadingFormat !== null;

  const handleDownload = async (format: string) => {
    setDownloadingFormat(format);
    setDownloadSuccess(null);
    
    try {
      const fileName = `${resumeData.personalInfo.firstName}_${resumeData.personalInfo.lastName}_Resume`.replace(/\s+/g, '_');
      
      switch (format) {
        case 'pdf-puppeteer':
          await generatePDFWithPuppeteer(resumeData, fileName);
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
      
      setDownloadSuccess(format);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to download ${format.toUpperCase()}. Please try again.`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <ShimmerButton 
            className={cn("h-10 px-6", className)}
            shimmerColor="#60a5fa"
            background="hsl(var(--primary))"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Resume
          </ShimmerButton>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Download Resume
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Choose your preferred format to download your resume
            </p>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            {formats.map((format, index) => {
              const isSelected = selectedFormat === format.id;
              const isCurrentlyDownloading = downloadingFormat === format.id;
              const isSuccessful = downloadSuccess === format.id;

              return (
                <MagicCard
                  key={format.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 border-2",
                    isSelected 
                      ? "border-blue-500 bg-blue-50/50" 
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  )}
                  gradientSize={150}
                  gradientColor={isSelected ? "#3b82f6" : "#e5e7eb"}
                  gradientOpacity={isSelected ? 0.1 : 0.05}
                  onClick={() => setSelectedFormat(format.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                      )}>
                        {format.icon}
                      </div>
                      <div>
                        <h3 className={cn(
                          "font-medium transition-colors",
                          isSelected ? "text-blue-900" : "text-gray-900"
                        )}>
                          {format.name}
                        </h3>
                        <p className={cn(
                          "text-sm transition-colors",
                          isSelected ? "text-blue-600" : "text-gray-500"
                        )}>
                          {format.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {format.extension}
                      </Badge>
                      {isSelected && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                </MagicCard>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1"
              disabled={isDownloading}
            >
              Cancel
            </Button>
            
            <Button
              onClick={() => handleDownload(selectedFormat)}
              disabled={isDownloading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : downloadSuccess === selectedFormat ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download {formats.find(f => f.id === selectedFormat)?.name}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
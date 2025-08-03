import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, X, Download, Loader2 } from 'lucide-react';
import { ResumeData } from '@/pages/builder';
import { generatePDF } from '@/lib/pdf-utils';

interface PrintPreviewModalProps {
  resumeData: ResumeData;
  children?: React.ReactNode;
  resumeElement?: HTMLElement | null;
}

export function PrintPreviewModal({ resumeData, children, resumeElement }: PrintPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');

  // Generate preview when modal opens
  useEffect(() => {
    if (isOpen && resumeElement) {
      generatePreview();
    }
  }, [isOpen, resumeElement]);

  const generatePreview = async () => {
    if (!resumeElement) return;

    try {
      // Clone the resume element for preview
      const clonedElement = resumeElement.cloneNode(true) as HTMLElement;
      
      // Apply print-optimized classes
      clonedElement.classList.add('print-optimized', 'pdf-optimized-container');
      
      // Remove any interactive elements
      const interactiveElements = clonedElement.querySelectorAll('button, input, textarea, select');
      interactiveElements.forEach(el => el.remove());
      
      // Get the HTML content
      setPreviewContent(clonedElement.outerHTML);
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewContent('<div class="p-4 text-center text-red-600">Preview generation failed. Please try again.</div>');
    }
  };

  const handleDownload = async () => {
    if (!resumeData) return;
    
    setIsGenerating(true);
    try {
      const fileName = `${resumeData.personalInfo.firstName}_${resumeData.personalInfo.lastName}_Resume`.replace(/\s+/g, '_');
      await generatePDF(resumeData, fileName);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Print Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Print Preview</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              size="sm"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="bg-white shadow-lg mx-auto" style={{ width: '612px', minHeight: '792px' }}>
              {previewContent ? (
                <div
                  className="print-preview-content"
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading preview...</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-4">
          This preview shows how your resume will appear in the PDF export. 
          Actual PDF may vary slightly depending on your browser and system fonts.
        </div>
      </DialogContent>
    </Dialog>
  );
} 
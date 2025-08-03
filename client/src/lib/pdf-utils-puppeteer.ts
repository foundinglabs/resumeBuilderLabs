import type { ResumeData } from '@/pages/builder';

export async function generatePDFWithPuppeteer(resumeData: ResumeData, fileName: string = 'Resume'): Promise<void> {
  console.log('Starting server-side PDF generation with Puppeteer...');
  
  try {
    // Create a clean filename
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Send request to server-side Puppeteer service
    const response = await fetch('/api/pdf/generate-puppeteer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData,
        templateId: resumeData.template,
        filename: cleanFileName
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }
    
    // Get the PDF blob from the response
    const pdfBlob = await response.blob();
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanFileName}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    window.URL.revokeObjectURL(url);
    
    console.log('PDF downloaded successfully via Puppeteer!');
    
  } catch (error) {
    console.error('Puppeteer PDF generation failed:', error);
    throw new Error(`Failed to generate PDF: ${(error as Error).message}`);
  }
} 
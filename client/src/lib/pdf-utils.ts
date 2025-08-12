import type { ResumeData } from '@/pages/builder';

export async function generatePDF(resumeData: ResumeData, fileName: string = 'Resume') {
  try {
    console.log('Generating PDF for:', fileName);
    
    // Call the server API to generate PDF using Puppeteer
    const response = await fetch('/api/pdf/generate-puppeteer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData,
        templateId: resumeData.template,
        filename: fileName
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate PDF');
    }

    // Get the PDF blob
    const pdfBlob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(url);
    
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

import html2pdf from 'html2pdf.js';
import type { ResumeData } from '@/pages/builder';

export async function generatePDF(resumeData: ResumeData, fileName: string = 'Resume') {
  // Try to find the resume preview element - check both possible locations
  let element = document.getElementById('resume-preview');
  
  // If not found, try to find it within the template error boundary
  if (!element) {
    const templateErrorBoundary = document.querySelector('[data-template-error-boundary]');
    if (templateErrorBoundary) {
      element = templateErrorBoundary.querySelector('#resume-preview');
    }
  }
  
  // If still not found, try to find any element with resume-preview class
  if (!element) {
    element = document.querySelector('.resume-preview');
  }
  
  // Final fallback - look for any element that might contain the resume
  if (!element) {
    const possibleElements = [
      document.querySelector('.resume-preview'),
      document.querySelector('[id*="resume"]'),
      document.querySelector('[class*="resume"]'),
      document.querySelector('.w-full.mx-auto'),
      document.querySelector('.flex.justify-center.items-center')
    ];
    
    element = possibleElements.find(el => el !== null) || null;
  }
  
  if (!element) {
    console.error('Resume preview element not found. Available elements:', {
      byId: document.getElementById('resume-preview'),
      byClass: document.querySelector('.resume-preview'),
      templateBoundary: document.querySelector('[data-template-error-boundary]'),
      allResumeElements: document.querySelectorAll('[id*="resume"], [class*="resume"]')
    });
    throw new Error('Resume preview element not found. Please ensure the resume is properly loaded and try again.');
  }

  // Create a clean filename
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');

  const options = {
    margin: 0.5,
    filename: `${cleanFileName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: true
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'portrait',
      compress: true
    }
  };

  try {
    console.log('Generating PDF for:', cleanFileName);
    console.log('Using element:', element);
    console.log('Element content length:', element.innerHTML.length);
    
    // Ensure the element is visible and properly rendered
    const originalDisplay = element.style.display;
    element.style.display = 'block';
    element.style.visibility = 'visible';
    
    // Wait a bit for any animations or rendering to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await html2pdf().set(options).from(element).save();
    console.log('PDF generated successfully');
    
    // Restore original display
    element.style.display = originalDisplay;
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Try with different options if the first attempt fails
    try {
      console.log('Retrying with simplified options...');
      const fallbackOptions = {
        margin: 0.25,
        filename: `${cleanFileName}.pdf`,
        image: { type: 'jpeg', quality: 0.8 },
        html2canvas: { 
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait'
        }
      };
      
      await html2pdf().set(fallbackOptions).from(element).save();
      console.log('PDF generated successfully with fallback options');
    } catch (fallbackError) {
      console.error('Fallback PDF generation also failed:', fallbackError);
      throw new Error('Failed to generate PDF. Please try refreshing the page and try again.');
    }
  }
}

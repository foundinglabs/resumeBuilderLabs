import puppeteer from 'puppeteer';
import { Request, Response } from 'express';

export interface PuppeteerPDFOptions {
  resumeData: any;
  templateId: string;
  filename: string;
}

export class PuppeteerPDFService {
  private static browser: any = null;

  static async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-dev-shm-usage',
          '--no-first-run'
        ]
      });
    }
    return this.browser;
  }

    static async generatePDF(options: PuppeteerPDFOptions): Promise<Buffer> {
    const { resumeData, templateId, filename } = options;
    
    console.log('Starting Puppeteer PDF generation for:', filename);
    
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      // Set a high-resolution viewport for better quality
      await page.setViewport({ width: 1920, height: 2400 });
      
      // Navigate to the builder page with the resume data
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000' 
        : process.env.PUBLIC_URL || 'http://localhost:5000';
      
      // Create a special PDF generation URL with the resume data
      const pdfUrl = `${baseUrl}/builder?pdf=true&template=${templateId}`;
      
      console.log('Navigating to:', pdfUrl);
      
      // Inject the resume data into the page before navigation
      await page.evaluateOnNewDocument((data: any) => {
        window.localStorage.setItem('resume_builder_data', JSON.stringify(data));
        window.localStorage.setItem('pdf_generation_mode', 'true');
      }, resumeData);
      
      // Navigate and wait for the page to be fully loaded
      await page.goto(pdfUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait for the page to load and find the resume content element
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Use the standardized resume-preview selector
      const resumeElement = '#resume-preview';
      
      // Log which selector we're using
      console.log('Using standardized selector:', resumeElement);
      
      // Wait for the standardized resume-preview element to be available
      await page.waitForSelector(resumeElement, { timeout: 10000 });
      
      // Get the actual element
      const element = await page.$(resumeElement);
      
      if (!element) {
        throw new Error('Resume preview element not found. Please ensure the resume is properly loaded.');
      }
      
      // Get the element's exact dimensions using scrollWidth and scrollHeight
      const width = await page.evaluate((el: Element) => (el as HTMLElement).scrollWidth, element);
      const height = await page.evaluate((el: Element) => (el as HTMLElement).scrollHeight, element);
      
      if (!width || !height) {
        throw new Error('Could not get element dimensions');
      }
      
      console.log('Element dimensions:', { width, height });
      
      // Extract the HTML content of the resume element with better cloning
      const resumeHTML = await page.evaluate((el: Element) => {
        // Clone the element to avoid modifying the original
        const clone = el.cloneNode(true) as HTMLElement;
        
        // Remove any interactive elements that shouldn't be in PDF
        const interactiveElements = clone.querySelectorAll('button, input, select, textarea, [contenteditable], .toolbar, .controls');
        interactiveElements.forEach((element: Element) => element.remove());
        
        // Remove any hover effects or animations that might interfere
        const styleElements = clone.querySelectorAll('style, script');
        styleElements.forEach((element: Element) => element.remove());
        
        // Ensure all styles are inline for PDF generation
        const computedStyles = window.getComputedStyle(el as HTMLElement);
        clone.style.cssText = computedStyles.cssText;
        
        // Remove any data attributes that might cause issues
        const allElements = clone.querySelectorAll('*');
        allElements.forEach((element: Element) => {
          const attrs = element.attributes;
          for (let i = attrs.length - 1; i >= 0; i--) {
            const attr = attrs[i];
            if (attr.name.startsWith('data-') || attr.name.startsWith('aria-')) {
              element.removeAttribute(attr.name);
            }
          }
        });
        
        return clone.outerHTML;
      }, element);
      
            // Generate PDF directly from the current page with only the template container
      // Extract all CSS styles from the current page
      const styles = await page.evaluate(() => {
        const styleSheets = Array.from(document.styleSheets);
        let cssText = '';
        
        styleSheets.forEach(sheet => {
          try {
            const rules = Array.from(sheet.cssRules || sheet.rules);
            rules.forEach(rule => {
              cssText += rule.cssText + '\n';
            });
          } catch (e) {
            // Skip external stylesheets that might cause CORS issues
          }
        });
        
        return cssText;
      });
      

      
      // Create a new page with the template content and all styles
      const pdfPage = await browser.newPage();
      
      try {
        // Set viewport to match the template container dimensions
        await pdfPage.setViewport({
          width: width,
          height: height
        });
        
        // Create complete HTML with all styles and the template content
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                ${styles}
                
                /* Additional PDF-specific styles */
                body {
                  margin: 0;
                  padding: 0;
                  background: white;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  -webkit-font-smoothing: antialiased;
                  -moz-osx-font-smoothing: grayscale;
                  text-rendering: optimizeLegibility;
                }
                
                /* PDF container styling */
                #resume-preview {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                  width: 100% !important;
                  height: auto !important;
                  overflow: visible !important;
                }
                
                /* Custom template specific fixes */
                .bg-pink-600, .bg-pink-400, .from-pink-600, .to-pink-400 {
                  background: #db2777 !important;
                  color: white !important;
                }
                
                .bg-gradient-to-b {
                  background: linear-gradient(to bottom, var(--tw-gradient-stops)) !important;
                }
                
                /* Ensure proper dimensions for custom templates */
                .max-w-5xl, .w-full {
                  max-width: none !important;
                  width: 100% !important;
                }
                
                .shadow-lg, .shadow-2xl {
                  box-shadow: none !important;
                }
                
                .rounded-2xl, .rounded-xl {
                  border-radius: 0 !important;
                }
                
                /* Grid layout fixes */
                .grid {
                  display: grid !important;
                }
                
                .grid-cols-1 {
                  grid-template-columns: repeat(1, 1fr) !important;
                }
                
                @media (min-width: 1024px) {
                  .lg\\:grid-cols-3 {
                    grid-template-columns: repeat(3, 1fr) !important;
                  }
                  .lg\\:col-span-1 {
                    grid-column: span 1 / span 1 !important;
                  }
                  .lg\\:col-span-2 {
                    grid-column: span 2 / span 2 !important;
                  }
                }
                
                .template-container {
                  margin: 0 !important;
                  padding: 0 !important;
                  background-color: white !important;
                  box-shadow: none !important;
                  width: 100% !important;
                  min-height: 100% !important;
                  position: relative !important;
                }
                
                /* Ensure all text is visible */
                * {
                  color-adjust: exact !important;
                  -webkit-print-color-adjust: exact !important;
                }
                
                /* Remove any print-specific styles that might interfere */
                @media print {
                  * { box-shadow: none !important; }
                }
              </style>
            </head>
            <body>
              ${resumeHTML}
            </body>
          </html>
        `;
        
        // Load the HTML content
        await pdfPage.setContent(htmlContent, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        // Wait for content to render properly
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate PDF with A4 format to ensure single page
        const pdfBuffer = await pdfPage.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0.2in',
            right: '0.2in',
            bottom: '0.2in',
            left: '0.2in'
          },
          displayHeaderFooter: false,
          preferCSSPageSize: true
        });
        
        await pdfPage.close();
        console.log('PDF generated successfully with template container only');
        return Buffer.from(pdfBuffer);
        
      } catch (error) {
        await pdfPage.close();
        throw error;
      }
      
      // Generate PDF with exact template container dimensions
      const pdfBuffer = await page.pdf({
        width: width,
        height: height,
        printBackground: true,
        margin: {
          top: '0.1in',
          right: '0.1in',
          bottom: '0.1in',
          left: '0.1in'
        },
        displayHeaderFooter: false,
        preferCSSPageSize: false
      });
      
      console.log('PDF generated successfully with template container only');
      return Buffer.from(pdfBuffer);
      
    } catch (error) {
      console.error('Puppeteer PDF generation error:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  static async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// PDF generation endpoint using Puppeteer
export async function generatePDFWithPuppeteer(req: Request, res: Response) {
  try {
    const { resumeData, templateId, filename } = req.body;
    
    if (!resumeData || !templateId || !filename) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: resumeData, templateId, filename' 
      });
    }
    
    console.log('Generating PDF with Puppeteer for:', filename);
    
    const pdfBuffer = await PuppeteerPDFService.generatePDF({
      resumeData,
      templateId,
      filename
    });
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send the PDF buffer
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'PDF generation failed: ' + (error as Error).message
    });
  }
}

// Graceful shutdown
process.on('exit', async () => {
  await PuppeteerPDFService.cleanup();
});

process.on('SIGINT', async () => {
  await PuppeteerPDFService.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await PuppeteerPDFService.cleanup();
  process.exit(0);
}); 
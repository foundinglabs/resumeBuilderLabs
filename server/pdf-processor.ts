import { Request, Response } from 'express';

// Lazy load pdf-parse to avoid module initialization issues
let pdfModule: any = null;
async function getPdfParser() {
  if (!pdfModule) {
    const pdfParse = await import('pdf-parse');
    pdfModule = pdfParse.default;
  }
  return pdfModule;
}

export interface PDFProcessingResult {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: {
    pages: number;
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

export async function processPDFBuffer(buffer: Buffer): Promise<PDFProcessingResult> {
  try {
    console.log('Processing PDF buffer of size:', buffer.length);

    // === 1. Primary: Try pdf-parse (fast for simple PDFs) ===
    let data;
    try {
      const pdf = await getPdfParser();
      data = await pdf(buffer, {
        normalizeWhitespace: true,
        disableCombineTextItems: false
      });

      if (data?.text?.trim().length > 50) {
        const cleanText = data.text
          .replace(/\n\s*\n/g, '\n')
          .replace(/\s+/g, ' ')
          .trim();

        return {
          success: true,
          text: cleanText,
          metadata: {
            pages: data.numpages,
            title: data.info?.Title,
            author: data.info?.Author,
            subject: data.info?.Subject,
            keywords: data.info?.Keywords,
            creator: data.info?.Creator,
            producer: data.info?.Producer,
            creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
            modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : undefined
          }
        };
      }
    } catch (parseError) {
      console.warn('pdf-parse failed, trying pdfjs-dist...', parseError);
      // Continue to fallback — don't return yet
    }

    // === 2. Fallback: Use pdfjs-dist (more robust) ===
    try {
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
      const uint8Array = new Uint8Array(buffer);
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdfDocument = await loadingTask.promise;

      let fullText = '';
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str || '')
          .join(' ');
        fullText += pageText + '\n';
      }

      const cleanText = fullText
        .replace(/\n\s*\n/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanText.length < 50) {
        return {
          success: false,
          error: 'PDF appears to be image-based or scanned. Little text could be extracted. Please convert to DOCX using SmallPDF.com or ILovePDF.com.'
        };
      }

      return {
        success: true,
        text: cleanText,
        metadata: {
          pages: pdfDocument.numPages
        }
      };
    } catch (fallbackError) {
      console.error('pdfjs-dist fallback also failed:', fallbackError);
      return {
        success: false,
        error: 'Failed to parse PDF: unsupported format or corrupted file. Please convert to DOCX using an online converter.'
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('password') || message.includes('encrypted')) {
      return {
        success: false,
        error: 'This PDF is password-protected. Please remove the password and try again.'
      };
    }
    if (message.includes('corrupt') || message.includes('invalid')) {
      return {
        success: false,
        error: 'The PDF file is corrupted or invalid. Please try a different file.'
      };
    }

    console.error('Unexpected PDF processing error:', error);
    return {
      success: false,
      error: 'We could not extract text from this PDF. It may be scanned, complex, or in an unsupported format.\n\n✅ Try this:\n1. Go to https://smallpdf.com/pdf-to-word\n2. Convert your PDF to DOCX\n3. Upload the DOCX file instead\n\nDOCX files work perfectly with our system!'
    };
  }
}

export function validatePDFFile(file: any): { valid: boolean; error?: string } {
  // Check file type
  if (!file.mimetype || !file.mimetype.includes('pdf')) {
    return { valid: false, error: 'File must be a PDF document' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check if file has content
  if (!file.buffer || file.buffer.length === 0) {
    return { valid: false, error: 'File appears to be empty' };
  }

  return { valid: true };
}

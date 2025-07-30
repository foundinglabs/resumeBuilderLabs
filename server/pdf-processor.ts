import pdf from 'pdf-parse';
import { Request, Response } from 'express';

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
    
    // Parse PDF using pdf-parse library
    const data = await pdf(buffer);
    
    if (!data || !data.text) {
      return {
        success: false,
        error: 'No text could be extracted from the PDF file'
      };
    }

    // Clean up extracted text
    const cleanText = data.text
      .replace(/\n\s*\n/g, '\n') // Remove excessive line breaks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (cleanText.length < 50) {
      return {
        success: false,
        error: 'PDF appears to contain very little text content. It may be image-based or encrypted.'
      };
    }

    console.log(`Successfully extracted ${cleanText.length} characters from PDF`);

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
        creationDate: data.info?.CreationDate,
        modificationDate: data.info?.ModDate
      }
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Provide specific error messages based on error type
    if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
      return {
        success: false,
        error: 'This PDF is password-protected or encrypted. Please remove the password and try again.'
      };
    } else if (errorMessage.includes('Invalid') || errorMessage.includes('corrupt')) {
      return {
        success: false,
        error: 'The PDF file appears to be corrupted or invalid. Please try a different file.'
      };
    } else if (errorMessage.includes('not supported') || errorMessage.includes('version')) {
      return {
        success: false,
        error: 'This PDF version is not supported. Please try saving it in a different format or use a DOCX file.'
      };
    } else {
      return {
        success: false,
        error: `PDF processing failed: ${errorMessage}. Please try converting to DOCX format for better compatibility.`
      };
    }
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
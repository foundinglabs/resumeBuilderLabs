// Production-ready file processing utilities
import mammoth from 'mammoth';

export interface FileProcessingResult {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: {
    filename: string;
    pages?: number;
    size: number;
  };
}

// Server-side PDF processing for production
export async function processPDFFile(file: File): Promise<FileProcessingResult> {
  try {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch('/api/pdf/extract', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to process PDF file'
      };
    }

    return {
      success: true,
      text: result.text,
      metadata: {
        filename: file.name,
        pages: result.metadata?.pages,
        size: file.size
      }
    };
  } catch (error) {
    console.error('PDF processing error:', error);
    return {
      success: false,
      error: 'Network error during PDF processing. Please check your connection and try again.'
    };
  }
}

// Client-side DOCX processing (continues to work well in browser)
export async function processDOCXFile(file: File): Promise<FileProcessingResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (!result.value || result.value.trim().length === 0) {
      return {
        success: false,
        error: 'No text content found in the DOCX file'
      };
    }

    // Clean up extracted text
    const cleanText = result.value
      .replace(/\r\n/g, '\n')
      .replace(/\n\s*\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanText.length < 20) {
      return {
        success: false,
        error: 'Document appears to contain very little text content'
      };
    }

    return {
      success: true,
      text: cleanText,
      metadata: {
        filename: file.name,
        size: file.size
      }
    };
  } catch (error) {
    console.error('DOCX processing error:', error);
    return {
      success: false,
      error: 'Failed to process DOCX file. Please ensure it is not corrupted.'
    };
  }
}

// Main file processing function that routes to appropriate handler
export async function processFile(file: File): Promise<FileProcessingResult> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return processPDFFile(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return processDOCXFile(file);
  } else {
    return {
      success: false,
      error: 'Unsupported file type. Please upload a PDF or DOCX file.'
    };
  }
}

// Validate file before processing
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const allowedExtensions = ['.pdf', '.docx'];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB'
    };
  }

  const fileName = file.name.toLowerCase();
  const hasValidType = allowedTypes.includes(file.type);
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!hasValidType && !hasValidExtension) {
    return {
      valid: false,
      error: 'Please upload a PDF or DOCX file'
    };
  }

  return { valid: true };
}
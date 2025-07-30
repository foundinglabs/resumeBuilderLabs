// Utility functions and types for Reactive-Resume templates
// This replaces the missing @reactive-resume/utils package

export type Template = 
  | "azurill"
  | "bronzor"
  | "chikorita"
  | "ditto"
  | "gengar"
  | "glalie"
  | "kakuna"
  | "leafish"
  | "nosepass"
  | "onyx"
  | "pikachu"
  | "rhyhorn"
  | "classic"
  | "modern"
  | "stylish"
  | "compact"
  | "overleaf"
  | "elegant";

// Utility function to combine class names
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Check if string is empty
export const isEmptyString = (value: any): boolean => {
  return !value || (typeof value === 'string' && value.trim().length === 0);
};

// Check if string is a valid URL
export const isUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// Sanitize HTML content (basic implementation)
export const sanitize = (html: string | undefined): string => {
  // Basic sanitization - in production, use a proper library like DOMPurify
  if (!html) return '';
  
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Convert hex color to RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Linear transformation function
export const linearTransform = (
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number
): number => {
  return outputMin + (outputMax - outputMin) * ((value - inputMin) / (inputMax - inputMin));
};

// Template metadata interface
export interface TemplateProps {
  columns?: [number, number];
  isFirstPage?: boolean;
}

// Resume data structure types
export interface ResumeBasics {
  name: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  url?: string;
  picture?: {
    url?: string;
    borderRadius?: number;
    effects?: {
      hidden?: boolean;
      border?: boolean;
      grayscale?: boolean;
    };
  };
}

export interface ResumeSection {
  name: string;
  columns: number;
  separateLinks: boolean;
  visible: boolean;
  items: any[];
}

export interface ResumeData {
  basics: ResumeBasics;
  sections: {
    [key: string]: ResumeSection;
  };
  metadata: {
    template: Template;
    theme: {
      background: string;
      text: string;
      primary: string;
    };
  };
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ResumeURL } from "../utils/reactive-resume-schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Additional utility functions for template compatibility
export const isEmptyString = (value: any): boolean => {
  return !value || (typeof value === 'string' && value.trim().length === 0);
};

export const isUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const sanitize = (html: string | undefined): string => {
  if (!html) return '';
  
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};
// URL helper functions for backward compatibility - Updated for ResumeURL
export const createURL = (href: string | undefined): ResumeURL | undefined => {
  if (!href) return undefined;
  return { href, label: undefined };
};

export const createSimpleURL = (href: string | undefined): ResumeURL => {
  return { href: href || '', label: undefined };
};

// Safely convert string to ResumeURL object
export const toURL = (value: string | undefined): ResumeURL => {
  if (!value) return { href: '', label: undefined };
  if (typeof value === 'string') return { href: value, label: undefined };
  return value as ResumeURL;
};
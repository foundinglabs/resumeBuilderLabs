// Template utilities to fix common TypeScript issues
import { URL } from '../utils/reactive-resume-schema';

// Type guards and utility functions for templates
export const isValidUrl = (url: any): url is URL => {
  return url && typeof url === 'object' && 'href' in url;
};

export const getUrlHref = (url: URL | undefined): string | undefined => {
  if (!url) return undefined;
  return isValidUrl(url) ? url.href : undefined;
};

export const safeUrlAccess = (url: URL | undefined): URL => {
  if (!url) {
    return { href: '#' };
  }
  return isValidUrl(url) ? url : { href: '#' };
};

// Fix for template component types
export const TemplateComponent = ({ className, ...props }: any) => {
  return null; // Placeholder component
};

// Layout array type fix
export type LayoutArray = Array<Array<string[]>>;

// Safe section access helpers
export const getSectionItems = (section: any): any[] => {
  return section && 'items' in section && Array.isArray(section.items) ? section.items : [];
};

export const getSectionColumns = (section: any): number => {
  return section && 'columns' in section && typeof section.columns === 'number' ? section.columns : 1;
};

export const getSectionId = (section: any): string => {
  return section && 'id' in section && typeof section.id === 'string' ? section.id : section.name || 'unknown';
};

export const getSeparateLinks = (section: any): boolean => {
  return section && 'separateLinks' in section && typeof section.separateLinks === 'boolean' ? section.separateLinks : false;
};

// Safe array access for layout
export const safeArrayMap = (arr: any, callback: (item: any, index: number) => any): any[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map(callback);
};

export const safeArrayLength = (arr: any): number => {
  return Array.isArray(arr) ? arr.length : 0;
};

// CSS property type fixes
export const safeTextTransform = (value: string): any => {
  const validValues = ['none', 'capitalize', 'uppercase', 'lowercase', 'initial', 'inherit'];
  return validValues.includes(value) ? value : 'none';
};

// URL string conversion
export const urlToString = (url: URL | string | undefined): string => {
  if (!url) return '#';
  if (typeof url === 'string') return url;
  return isValidUrl(url) ? url.href : '#';
};
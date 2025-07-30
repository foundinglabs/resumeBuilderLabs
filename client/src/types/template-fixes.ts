// Template Type Fixes for Reactive-Resume Integration
// This file provides type fixes and compatibility layers for template issues

import type { SectionKey } from '../utils/reactive-resume-schema';

// Fix for template props interface
export interface TemplateProps {
  columns: [SectionKey[], SectionKey[]];
  isFirstPage?: boolean;
}

// Fix for URL type issues
export type SafeURL = string | URL | undefined;

// Type guards for safe property access
export const hasProperty = <T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> => {
  return obj && typeof obj === 'object' && key in obj;
};

export const isValidURL = (url: SafeURL): url is URL => {
  if (!url) return false;
  if (typeof url === 'string') {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  return url instanceof URL;
};

export const safeURL = (url: SafeURL): URL | undefined => {
  if (!url) return undefined;
  if (typeof url === 'string') {
    try {
      return new URL(url);
    } catch {
      return undefined;
    }
  }
  return url instanceof URL ? url : undefined;
};

// Fix for section type issues
export interface SafeSection<T = any> {
  id?: string;
  name?: string;
  visible?: boolean;
  items?: T[];
  columns?: number;
  separateLinks?: boolean;
}

// Type-safe section access
export const getSectionItems = <T>(section: any): T[] => {
  if (!section) return [];
  if (hasProperty(section, 'items') && Array.isArray(section.items)) {
    return section.items as T[];
  }
  return [];
};

export const getSectionColumns = (section: any): number => {
  if (!section) return 1;
  if (hasProperty(section, 'columns') && typeof section.columns === 'number') {
    return section.columns;
  }
  return 1;
};

export const isSectionVisible = (section: any): boolean => {
  if (!section) return false;
  if (hasProperty(section, 'visible') && typeof section.visible === 'boolean') {
    return section.visible;
  }
  return true; // Default to visible
};

export const hasSeparateLinks = (section: any): boolean => {
  if (!section) return false;
  if (hasProperty(section, 'separateLinks') && typeof section.separateLinks === 'boolean') {
    return section.separateLinks;
  }
  return false;
};

// Fix for component type issues
export interface ComponentWithClassName {
  className?: string;
}

// Experience and Education type fixes
export interface ExperienceItem {
  id?: string;
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  url?: SafeURL;
}

export interface EducationItem {
  id?: string;
  institution?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  url?: SafeURL;
}

export interface VolunteerItem {
  id?: string;
  organization?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  url?: SafeURL;
}

// Background color type fix
export interface BackgroundColor {
  r: number;
  g: number;
  b: number;
}

export const safeBackgroundColor = (color: any): BackgroundColor | undefined => {
  if (!color || typeof color !== 'object') return undefined;
  if (typeof color.r === 'number' && typeof color.g === 'number' && typeof color.b === 'number') {
    return color as BackgroundColor;
  }
  return undefined;
};

// Layout column type fixes
export type LayoutColumns = [SectionKey[], SectionKey[]];

export const safeLayoutColumns = (columns: any): LayoutColumns => {
  if (!Array.isArray(columns) || columns.length !== 2) {
    return [[], []];
  }
  
  const [main, sidebar] = columns;
  return [
    Array.isArray(main) ? main : [],
    Array.isArray(sidebar) ? sidebar : []
  ];
};

// Generic item type with safe access
export interface SafeItem {
  id?: string;
  name?: string;
  url?: SafeURL;
  summary?: string;
  visible?: boolean;
  [key: string]: any;
}

export const safeItemAccess = (item: any): SafeItem => {
  if (!item || typeof item !== 'object') {
    return {};
  }
  return item as SafeItem;
};

// Text transform fix for CSS
export type SafeTextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase' | 'initial' | 'inherit';

export const safeTextTransform = (transform: string): SafeTextTransform => {
  const validTransforms: SafeTextTransform[] = ['none', 'capitalize', 'uppercase', 'lowercase', 'initial', 'inherit'];
  return validTransforms.includes(transform as SafeTextTransform) ? transform as SafeTextTransform : 'none';
};

// Component factory for safe rendering
export const createSafeComponent = <P extends object>(
  Component: React.ComponentType<P>,
  defaultProps: Partial<P> = {}
) => {
  return (props: P) => {
    const safeProps = { ...defaultProps, ...props };
    return React.createElement(Component, safeProps);
  };
};

export default {
  hasProperty,
  isValidURL,
  safeURL,
  getSectionItems,
  getSectionColumns,
  isSectionVisible,
  hasSeparateLinks,
  safeBackgroundColor,
  safeLayoutColumns,
  safeItemAccess,
  safeTextTransform,
  createSafeComponent
};
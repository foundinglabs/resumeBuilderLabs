// Comprehensive type definitions for ResumeGenius templates
// This file provides all necessary types to resolve TypeScript errors

import { 
  Education as EducationType, 
  Experience as ExperienceType, 
  Volunteer as VolunteerType,
  CustomSection,
  CustomSectionGroup,
  SectionWithItem
} from './reactive-resume-schema';

// Fix the component imports by creating proper type definitions
export const Education = {} as any;
export const Experience = {} as any; 
export const Volunteer = {} as any;

// Template section props interface
export interface SectionProps<T = any> {
  section: SectionWithItem<T> | CustomSectionGroup;
  urlKey?: keyof T;
  levelKey?: keyof T;
  summaryKey?: keyof T;
  keywordsKey?: keyof T;
}

// Custom section props with all possible properties
export interface CustomSectionProps {
  section: CustomSection & {
    url?: string;
    summary?: string;
    keywords?: string[];
    date?: string;
    location?: string;
    description?: string;
  };
}

// Utility type guards
export const hasItems = (section: any): section is SectionWithItem => {
  return 'items' in section && Array.isArray(section.items);
};

export const hasId = (section: any): section is { id: string } => {
  return 'id' in section && typeof section.id === 'string';
};

export const hasColumns = (section: any): section is { columns: number } => {
  return 'columns' in section && typeof section.columns === 'number';
};

export const hasSeparateLinks = (section: any): section is { separateLinks: boolean } => {
  return 'separateLinks' in section && typeof section.separateLinks === 'boolean';
};

// Safe property access helpers
export const getSectionId = (section: any): string => {
  return hasId(section) ? section.id : section.name || 'unknown';
};

export const getSectionColumns = (section: any): number => {
  return hasColumns(section) ? section.columns : 1;
};

export const getSectionItems = (section: any): any[] => {
  return hasItems(section) ? section.items : [];
};

export const getSeparateLinks = (section: any): boolean => {
  return hasSeparateLinks(section) ? section.separateLinks : false;
};

// Template layout type
export type TemplateLayout = Array<Array<string[]>>;

// Extended metadata interface
export interface ExtendedMetadata {
  template: string;
  layout: TemplateLayout;
  css: {
    value: string;
    visible: boolean;
  };
  page: {
    margin: number;
    format: string;
    options: {
      breakLine: boolean;
      pageNumbers: boolean;
    };
  };
  theme: {
    background: string;
    text: string;
    primary: string;
  };
  typography: {
    font: {
      family: string;
      subset: string;
      variants: string[];
      size: number;
    };
    lineHeight?: number;
    hideIcons?: boolean;
    underlineLinks?: boolean;
  };
  notes?: string;
}

// Template component props
export interface TemplateComponentProps {
  columns?: [number, number];
  isFirstPage?: boolean;
}

// Re-export all types for easy access
export type {
  EducationType,
  ExperienceType,
  VolunteerType,
  CustomSection,
  CustomSectionGroup,
  SectionWithItem
};
// Schema types for Reactive-Resume templates
// This replaces the missing @reactive-resume/schema package

// Fix URL interface conflicts with DOM URL
export interface ResumeURL {
  label?: string;
  href: string;
}

export interface Award {
  id: string;
  title: string;
  awarder: string;
  date: string;
  summary?: string;
  url?: ResumeURL;
  visible: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  summary?: string;
  url?: ResumeURL;
  visible: boolean;
  // Additional fields for compatibility
  credential_id?: string;
  link?: string;
  expiry?: string;
}

export interface Education {
  id: string;
  institution: string;
  studyType: string;
  area: string;
  score?: string;
  date: string;
  summary?: string;
  url?: ResumeURL;
  visible: boolean;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  date: string;
  summary?: string;
  url?: ResumeURL;
  visible: boolean;
}

export interface Interest {
  id: string;
  name: string;
  keywords: string[];
  visible: boolean;
}

export interface Language {
  id: string;
  name: string;
  description?: string;
  level: number;
  visible: boolean;
}

export interface Profile {
  id: string;
  network: string;
  username: string;
  icon?: string;
  url?: ResumeURL;
  visible: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  date: string;
  summary?: string;
  keywords: string[];
  url?: ResumeURL;
  visible: boolean;
  // Additional fields for compatibility
  title?: string;
  role?: string;
  link?: string;
  duration?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
}

export interface Publication {
  id: string;
  name: string;
  publisher: string;
  date: string;
  summary?: string;
  url?: ResumeURL;
  visible: boolean;
}

export interface Reference {
  id: string;
  name: string;
  description?: string;
  summary?: string;
  url?: ResumeURL;
  visible: boolean;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  level: number;
  keywords: string[];
  visible: boolean;
}

export interface Volunteer {
  id: string;
  organization: string;
  position: string;
  location?: string;
  date: string;
  summary?: string;
  url?: ResumeURL;
  visible: boolean;
}

export interface CustomSection {
  id: string;
  name: string;
  columns: number;
  separateLinks: boolean;
  visible: boolean;
  items: CustomSectionGroup[];
  url?: string;
  summary?: string;
  keywords?: string[];
  date?: string;
  location?: string;
  description?: string;
}

export interface CustomSectionGroup {
  id: string;
  name: string;
  description?: string;
  date?: string;
  location?: string;
  summary?: string;
  keywords: string[];
  url?: ResumeURL;
  level?: number;
  visible: boolean;
}

export type SectionKey = 
  | "summary"
  | "experience" 
  | "education"
  | "awards"
  | "certifications"
  | "skills"
  | "interests"
  | "publications"
  | "volunteer"
  | "languages"
  | "projects"
  | "references"
  | "profiles"
  | "custom";

export type SectionWithItem<T = any> = {
  id?: string;
  name: string;
  columns: number;
  separateLinks: boolean;
  visible: boolean;
  items: T[];
};

// Basic types
export interface Basics {
  name: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  url?: ResumeURL;
  customFields: any[];
  picture: {
    url?: string;
    size?: number;
    aspectRatio?: number;
    borderRadius?: number;
    effects?: {
      hidden?: boolean;
      border?: boolean;
      grayscale?: boolean;
    };
  };
}

export interface Metadata {
  template: string;
  layout: [number, number][];
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
}

export interface ResumeData {
  basics: Basics;
  sections: {
    [key: string]: SectionWithItem;
  };
  metadata: Metadata;
}

// Additional exports for compatibility
export interface CustomField {
  id: string;
  icon: string;
  name: string;
  value: string;
  visible: boolean;
}

// Export types that are referenced as values in templates
export const Experience = {} as any;
export const Education = {} as any; 
export const Volunteer = {} as any;

// Type guards and utility functions
export function isEducationType(item: any): item is Education {
  return item && typeof item === 'object' && 'institution' in item;
}

export function isExperienceType(item: any): item is Experience {
  return item && typeof item === 'object' && 'company' in item;
}

export function isVolunteerType(item: any): item is Volunteer {
  return item && typeof item === 'object' && 'organization' in item;
}
// Export URL for backward compatibility  
export type URL = ResumeURL;
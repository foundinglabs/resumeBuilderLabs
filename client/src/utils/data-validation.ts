// Data validation utilities for template rendering
import type { ResumeData as ReactiveResumeData } from './reactive-resume-schema';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates Reactive-Resume data structure
 */
export function validateReactiveResumeData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data exists
  if (!data) {
    errors.push('Data is null or undefined');
    return { isValid: false, errors, warnings };
  }

  // Check basics
  if (!data.basics) {
    errors.push('Missing basics object');
  } else {
    if (!data.basics.name) {
      warnings.push('Missing name in basics');
    }
    if (!data.basics.email) {
      warnings.push('Missing email in basics');
    }
  }

  // Check sections
  if (!data.sections) {
    errors.push('Missing sections object');
  } else {
    // Validate each section
    Object.entries(data.sections).forEach(([key, section]: [string, any]) => {
      if (!section) {
        warnings.push(`Section ${key} is null or undefined`);
        return;
      }

      if (typeof section !== 'object') {
        errors.push(`Section ${key} is not an object`);
        return;
      }

      // Check required section properties
      if (typeof section.visible !== 'boolean') {
        warnings.push(`Section ${key} missing visible property`);
      }

      if (section.items && !Array.isArray(section.items)) {
        errors.push(`Section ${key} items is not an array`);
      }
    });
  }

  // Check metadata
  if (!data.metadata) {
    errors.push('Missing metadata object');
  } else {
    if (!data.metadata.layout) {
      warnings.push('Missing layout in metadata');
    } else if (!Array.isArray(data.metadata.layout)) {
      errors.push('Layout is not an array');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitizes data to ensure it's safe for template rendering
 */
export function sanitizeReactiveResumeData(data: any): ReactiveResumeData {
  if (!data) {
    throw new Error('Data is required');
  }

  // Ensure basics exists
  const basics = data.basics || {};
  
  // Ensure sections exists
  const sections = data.sections || {};
  
  // Ensure metadata exists
  const metadata = data.metadata || {
    template: 'ditto',
    layout: [['summary', 'experience', 'education'], ['skills', 'projects', 'awards']],
    css: { value: '', visible: false },
    page: { margin: 14, format: 'a4', options: { breakLine: true, pageNumbers: false } },
    theme: { background: '#ffffff', text: '#000000', primary: '#3b82f6' },
    typography: {
      font: { family: 'Inter', subset: 'latin', variants: ['regular'], size: 12 },
      lineHeight: 1.5,
      hideIcons: false,
      underlineLinks: true
    }
  };

  return {
    basics: {
      name: basics.name || 'Your Name',
      headline: basics.headline || '',
      email: basics.email || '',
      phone: basics.phone || '',
      location: basics.location || '',
      url: basics.url || { label: '', href: '' },
      customFields: basics.customFields || [],
      picture: basics.picture || {
        url: '',
        size: 120,
        aspectRatio: 1,
        borderRadius: 0,
        effects: { hidden: false, border: false, grayscale: false }
      }
    },
    sections,
    metadata
  };
}

/**
 * Validates and sanitizes data for template rendering
 */
export function validateAndSanitizeData(data: any): { data: ReactiveResumeData; validation: ValidationResult } {
  const validation = validateReactiveResumeData(data);
  
  if (!validation.isValid) {
    console.warn('Data validation failed:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Data validation warnings:', validation.warnings);
  }

  const sanitizedData = sanitizeReactiveResumeData(data);
  
  return {
    data: sanitizedData,
    validation
  };
} 
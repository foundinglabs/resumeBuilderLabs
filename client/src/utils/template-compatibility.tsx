// Template Compatibility Layer - Fixed Version
// Fixes type mismatches between ResumeGenius and Reactive-Resume templates

import React from 'react';

// Enhanced template props with proper typing
export interface EnhancedTemplateProps {
  columns: any[];
  isFirstPage?: boolean;
  className?: string;
}

// URL type converter
export const convertToURL = (url: any): any => {
  if (!url) return undefined;
  if (typeof url === 'string') {
    try {
      return new URL(url);
    } catch {
      return undefined;
    }
  }
  return url;
};

// Safe string converter
export const safeString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

// Section item type guards
export const isSectionWithItems = (section: any): boolean => {
  return section && typeof section === 'object' && 'items' in section && Array.isArray(section.items);
};

export const getSafeItems = (section: any): any[] => {
  if (!isSectionWithItems(section)) return [];
  return section.items || [];
};

export const getSafeColumns = (section: any): number => {
  if (!section || typeof section !== 'object') return 1;
  if ('columns' in section && typeof section.columns === 'number') {
    return section.columns;
  }
  return 1;
};

export const getSafeVisible = (section: any): boolean => {
  if (!section || typeof section !== 'object') return true;
  if ('visible' in section && typeof section.visible === 'boolean') {
    return section.visible;
  }
  return true;
};

export const getSafeSeparateLinks = (section: any): boolean => {
  if (!section || typeof section !== 'object') return false;
  if ('separateLinks' in section && typeof section.separateLinks === 'boolean') {
    return section.separateLinks;
  }
  return false;
};

// Type-safe component creators
export const Experience = ({ item }: { item: any }) => {
  const safeItem = {
    company: safeString(item?.company),
    position: safeString(item?.position),
    startDate: safeString(item?.startDate),
    endDate: safeString(item?.endDate),
    summary: safeString(item?.summary),
    url: convertToURL(item?.url)
  };

  return (
    <div className="experience-item">
      <div className="font-semibold">{safeItem.position}</div>
      <div className="text-sm text-gray-600">{safeItem.company}</div>
      <div className="text-xs text-gray-500">
        {safeItem.startDate} - {safeItem.endDate}
      </div>
      {safeItem.summary && <div className="text-sm mt-1">{safeItem.summary}</div>}
    </div>
  );
};

export const Education = ({ item }: { item: any }) => {
  const safeItem = {
    institution: safeString(item?.institution),
    area: safeString(item?.area),
    studyType: safeString(item?.studyType),
    startDate: safeString(item?.startDate),
    endDate: safeString(item?.endDate),
    score: safeString(item?.score),
    url: convertToURL(item?.url)
  };

  return (
    <div className="education-item">
      <div className="font-semibold">{safeItem.studyType} in {safeItem.area}</div>
      <div className="text-sm text-gray-600">{safeItem.institution}</div>
      <div className="text-xs text-gray-500">
        {safeItem.startDate} - {safeItem.endDate}
      </div>
      {safeItem.score && <div className="text-sm mt-1">Score: {safeItem.score}</div>}
    </div>
  );
};

export const Volunteer = ({ item }: { item: any }) => {
  const safeItem = {
    organization: safeString(item?.organization),
    position: safeString(item?.position),
    startDate: safeString(item?.startDate),
    endDate: safeString(item?.endDate),
    summary: safeString(item?.summary),
    url: convertToURL(item?.url)
  };

  return (
    <div className="volunteer-item">
      <div className="font-semibold">{safeItem.position}</div>
      <div className="text-sm text-gray-600">{safeItem.organization}</div>
      <div className="text-xs text-gray-500">
        {safeItem.startDate} - {safeItem.endDate}
      </div>
      {safeItem.summary && <div className="text-sm mt-1">{safeItem.summary}</div>}
    </div>
  );
};

// Background color utilities
export interface SafeBackgroundColor {
  r: number;
  g: number;
  b: number;
}

export const createSafeBackgroundColor = (color: any): SafeBackgroundColor | undefined => {
  if (!color || typeof color !== 'object') return undefined;
  if (typeof color.r === 'number' && typeof color.g === 'number' && typeof color.b === 'number') {
    return { r: color.r, g: color.g, b: color.b };
  }
  return undefined;
};

export const hexToRgb = (hex: string): SafeBackgroundColor | undefined => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : undefined;
};

// CSS property fixes
export const safeTextTransform = (value: string): any => {
  const validValues = ['none', 'capitalize', 'uppercase', 'lowercase', 'initial', 'inherit'];
  return validValues.includes(value) ? value : 'none';
};

export default {
  convertToURL,
  safeString,
  isSectionWithItems,
  getSafeItems,
  getSafeColumns,
  getSafeVisible,
  getSafeSeparateLinks,
  Experience,
  Education,
  Volunteer,
  createSafeBackgroundColor,
  hexToRgb,
  safeTextTransform
};
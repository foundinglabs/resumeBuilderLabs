// Template Error Fixes
// This file contains patches for common template errors

// Import the compatibility layer
import { 
  convertToURL, 
  getSafeItems, 
  getSafeColumns, 
  getSafeVisible, 
  getSafeSeparateLinks,
  Experience as SafeExperience,
  Education as SafeEducation,
  Volunteer as SafeVolunteer,
  createSafeBackgroundColor,
  safeTextTransform
} from '../utils/template-compatibility';

// Type-safe URL handling
export const safeURL = (url: any): any => {
  return convertToURL(url);
};

// Type-safe section handling
export const safeSectionAccess = (section: any) => ({
  items: getSafeItems(section),
  columns: getSafeColumns(section),
  visible: getSafeVisible(section),
  separateLinks: getSafeSeparateLinks(section)
});

// Safe component exports that can replace problematic ones
export const Experience = SafeExperience;
export const Education = SafeEducation;
export const Volunteer = SafeVolunteer;

// Background color fix
export const safeBackgroundColor = (color: any, opacity?: number) => {
  const safeColor = createSafeBackgroundColor(color);
  return safeColor || undefined;
};

// Text transform fix
export const safeTextTransformValue = (value: string) => {
  return safeTextTransform(value);
};

// Picture component that handles className properly
export const Picture = (props: any) => {
  const { className, ...otherProps } = props;
  return <div className={className} {...otherProps} />;
};

// Generic item renderer with error handling
export const renderSectionItems = (section: any, renderItem: (item: any, index: number) => React.ReactNode) => {
  const { items, visible } = safeSectionAccess(section);
  
  if (!visible || !items.length) return null;
  
  return (
    <div>
      {items.map((item: any, index: number) => {
        try {
          return renderItem(item, index);
        } catch (error) {
          console.warn('Error rendering item:', error);
          return null;
        }
      })}
    </div>
  );
};

// Safe grid template columns
export const safeGridTemplateColumns = (columns: number) => {
  return `repeat(${Math.max(1, Math.min(12, columns))}, 1fr)`;
};

export default {
  safeURL,
  safeSectionAccess,
  Experience,
  Education,
  Volunteer,
  safeBackgroundColor,
  safeTextTransformValue,
  Picture,
  renderSectionItems,
  safeGridTemplateColumns
};
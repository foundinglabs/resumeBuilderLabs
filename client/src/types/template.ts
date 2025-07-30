// Template Props interface for Reactive-Resume templates
import type { SectionKey } from '../utils/reactive-resume-schema';

export interface TemplateProps {
  columns: [SectionKey[], SectionKey[]];
  isFirstPage?: boolean;
  resumeData?: any;
}

export default TemplateProps;
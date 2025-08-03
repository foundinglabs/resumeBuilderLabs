import React, { useEffect } from "react";
import type { ResumeData } from "@/pages/builder";
import { templateService } from '@/services/template-service';
import EnhancedReactiveResumeRenderer from './EnhancedReactiveResumeRenderer';
import { TemplateErrorBoundary } from './TemplateErrorBoundary';
import { Classic } from "@/templates/classic";
import { Modern } from "@/templates/modern";
import { Stylish } from "@/templates/stylish";
import { Compact } from "@/templates/compact";
import { Overleaf } from "@/templates/overleaf";
import { Elegant } from "@/templates/elegant";
import { useArtboardStore } from "@/store/artboard-store";
import { mapResumeGeniusToReactiveResume } from '@/utils/reactive-resume-mapper';

interface ResumePreviewProps {
  resumeData: ResumeData;
}

export function ResumePreview({ resumeData }: ResumePreviewProps) {
  const { personalInfo, summary, experience, education, skills, template } = resumeData;
  
  // Get the mapped data from the artboard store for Reactive-Resume templates
  const artboardResume = useArtboardStore((state) => state.resume);
  const setArtboardResume = useArtboardStore((state) => state.setResume);

  // Custom templates that need artboard store data
  const customTemplates = ['classic', 'modern', 'stylish', 'compact', 'overleaf', 'elegant'];
  
  // Ensure artboard store is populated for custom templates (needed for PDF generation)
  useEffect(() => {
    if (customTemplates.includes(template) && resumeData) {
      try {
        // Cast to the expected type - mapResumeGeniusToReactiveResume handles the mapping internally
        const mappedData = mapResumeGeniusToReactiveResume(resumeData as any, template);
        if (mappedData) {
          setArtboardResume(mappedData);
        }
      } catch (error) {
        console.error('Error mapping data for custom template:', error);
      }
    }
  }, [resumeData, template, setArtboardResume]);

  // Check if it's a Reactive-Resume template with error handling
  let isReactiveResumeTemplate = false;
  try {
    isReactiveResumeTemplate = templateService.isReactiveResumeTemplate(template);
  } catch (error) {
    console.error('Error checking template type:', error);
    // Fall back to custom template rendering
    isReactiveResumeTemplate = false;
  }

  if (isReactiveResumeTemplate) {
    // Use the mapped data from the artboard store for Reactive-Resume templates
    const mappedData = artboardResume || resumeData;
    
    // Validate that we have proper Reactive-Resume data structure
    const hasValidStructure = mappedData && 
      mappedData.basics && 
      mappedData.sections && 
      mappedData.metadata;
    
    if (!hasValidStructure) {
      console.warn('Invalid Reactive-Resume data structure, attempting to map:', mappedData);
      // The EnhancedReactiveResumeRenderer will handle the mapping if needed
    }
    
    return (
      <TemplateErrorBoundary>
        <div id="resume-preview">
          <EnhancedReactiveResumeRenderer
            resumeData={mappedData}
            templateId={template}
            className="w-full"
            onError={(error) => {
              console.error('Premium template rendering error:', error);
              // Could add toast notification or error state here
            }}
          />
        </div>
      </TemplateErrorBoundary>
    );
  }

  // Wrapper component for consistent sizing and centering
  const ResumeWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-center items-center w-full h-full">
      <div className="w-full mx-auto">
        {children}
      </div>
    </div>
  );

  // Template router for custom templates
  const renderTemplate = () => {
    switch (template) {
      case 'classic':
        return <Classic columns={[['summary','experience','education','projects','skills','languages','interests'], []]} isFirstPage={true} resumeData={resumeData} />;
      case 'modern':
        return <Modern columns={[
          [
            'summary',
            'experience',
            'projects',
            'education',
            'awards',
            'certifications',
            'publications',
            'volunteer',
            'references'
          ],
          [
            'skills',
            'languages',
            'interests'
          ]
        ]} isFirstPage={true} resumeData={resumeData} />;
      case 'stylish':
        return <Stylish columns={[['summary','experience','projects','education'], ['skills','languages','interests']]} isFirstPage={true} resumeData={resumeData} />;
      case 'compact':
        return <Compact columns={[['summary','experience','projects','education','skills','languages','interests'], []]} isFirstPage={true} resumeData={resumeData} />;
      case 'overleaf':
        return <Overleaf columns={[['summary','experience','projects','education'], ['skills','languages','interests']]} isFirstPage={true} resumeData={resumeData} />;
      case 'elegant':
        return <Elegant columns={[['summary','experience','projects','education'], ['skills','languages','interests']]} isFirstPage={true} resumeData={resumeData} />;
      default:
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="classic" />; // Default fallback
    }
  };

  return (
    <div className="resume-preview" id="resume-preview">
      <ResumeWrapper>
        <TemplateErrorBoundary>
        {renderTemplate()}
        </TemplateErrorBoundary>
      </ResumeWrapper>
    </div>
  );
}
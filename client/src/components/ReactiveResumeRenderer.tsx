// Dynamic Reactive-Resume Template Renderer
import React, { useEffect, useState, useRef } from 'react';
import { getTemplate } from '../templates';
import { mapResumeGeniusToReactiveResume } from '../utils/reactive-resume-mapper';
import { useArtboardStore } from '../store/artboard-store';
import type { Template } from "../utils/reactive-resume-utils";
import type { SectionKey } from '../utils/reactive-resume-schema';

interface ReactiveResumeRendererProps {
  resumeData: any; // ResumeGenius data structure
  templateId: string;
  className?: string;
}

export const ReactiveResumeRenderer: React.FC<ReactiveResumeRendererProps> = ({
  resumeData,
  templateId,
  className = ""
}) => {
  const [TemplateComponent, setTemplateComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<[SectionKey[], SectionKey[]]>([[], []]);
  const containerRef = useRef<HTMLDivElement>(null);
  const setResume = useArtboardStore((state) => state.setResume);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate input data
        if (!resumeData) {
          throw new Error('Resume data is required');
        }

        if (!templateId) {
          throw new Error('Template ID is required');
        }

        // Validate that templateId is a valid Reactive-Resume template
        const validTemplates = ['azurill', 'bronzor', 'chikorita', 'ditto', 'gengar', 'glalie', 'kakuna', 'leafish', 'nosepass', 'onyx', 'pikachu', 'rhyhorn'];
        if (!validTemplates.includes(templateId)) {
          throw new Error(`Invalid template ID: ${templateId}. Valid templates are: ${validTemplates.join(', ')}`);
        }

        // Map ResumeGenius data to Reactive-Resume format with error handling
        let mappedData;
        try {
          mappedData = mapResumeGeniusToReactiveResume(resumeData, templateId);
        } catch (mappingError) {
          console.error('Data mapping error:', mappingError);
          throw new Error(`Failed to convert resume data: ${mappingError instanceof Error ? mappingError.message : 'Unknown mapping error'}`);
        }

        // Validate mapped data structure
        if (!mappedData || !mappedData.basics || !mappedData.sections || !mappedData.metadata) {
          throw new Error('Invalid mapped data structure');
        }
        
        // Extract columns from the layout metadata with better error handling
        try {
          const layout = mappedData.metadata.layout[0]; // Get first page layout
          if (Array.isArray(layout) && layout.length >= 2) {
            const [mainSections, sidebarSections] = layout;
            setColumns([
              Array.isArray(mainSections) ? mainSections : [],
              Array.isArray(sidebarSections) ? sidebarSections : []
            ]);
          } else {
            // Fallback to default layout
            console.warn('Using fallback layout for template:', templateId);
            setColumns([
              ['summary', 'experience', 'education'],
              ['skills', 'projects', 'awards']
            ]);
          }
        } catch (layoutError) {
          console.warn('Layout extraction error, using fallback:', layoutError);
          setColumns([
            ['summary', 'experience', 'education'],
            ['skills', 'projects', 'awards']
          ]);
        }
        
        // Update the artboard store with mapped data
        try {
          setResume(mappedData);
        } catch (storeError) {
          console.warn('Store update error:', storeError);
          // Continue anyway as this might not be critical
        }

        // Get the template component with error handling
        let TemplateComp;
        try {
          TemplateComp = getTemplate(templateId as Template);
          if (!TemplateComp) {
            throw new Error(`Template component not found for: ${templateId}`);
          }
        } catch (templateError) {
          console.error('Template loading error:', templateError);
          throw new Error(`Failed to load template component: ${templateError instanceof Error ? templateError.message : 'Unknown template error'}`);
        }

        setTemplateComponent(() => TemplateComp);

      } catch (err) {
        console.error('Error loading Reactive-Resume template:', err);
        setError(`Failed to load template: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId && resumeData) {
      loadTemplate();
    }
  }, [templateId, resumeData, setResume]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[600px] ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {templateId} template...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[600px] ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-medium">Template Loading Error</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!TemplateComponent) {
    return (
      <div className={`flex items-center justify-center min-h-[600px] ${className}`}>
        <div className="text-center text-gray-600">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium">Template Not Found</p>
          <p className="text-sm mt-2">The requested template "{templateId}" could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`reactive-resume-template ${className}`}
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '12px',
        lineHeight: '1.5',
        color: '#000000',
        backgroundColor: '#ffffff',
      }}
    >
      <div className="template-container" style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        margin: '0 auto',
        padding: '14mm',
        backgroundColor: '#ffffff',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        position: 'relative',
      }}>
        <TemplateComponent 
          columns={columns} 
          isFirstPage={true}
        />
      </div>
    </div>
  );
};

export default ReactiveResumeRenderer;
// Enhanced Reactive-Resume Template Renderer with Comprehensive Error Handling
import React, { useEffect, useState, useRef } from 'react';
import { getTemplate } from '../templates';
import { useArtboardStore } from '../store/artboard-store';
import type { Template } from "../utils/reactive-resume-utils";
import type { SectionKey } from '../utils/reactive-resume-schema';
import { mapResumeGeniusToReactiveResume } from '../utils/reactive-resume-mapper';

interface ReactiveResumeRendererProps {
  resumeData: any; // ResumeGenius data structure
  templateId: string;
  className?: string;
  onError?: (error: any) => void;
}

export const EnhancedReactiveResumeRenderer: React.FC<ReactiveResumeRendererProps> = ({
  resumeData,
  templateId,
  className = "",
  onError
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

        if (!resumeData) throw new Error('Resume data is required');
        if (!templateId) throw new Error('Template ID is required');

        const validTemplates = ['azurill', 'bronzor', 'chikorita', 'ditto', 'gengar', 'glalie', 'kakuna', 'leafish', 'nosepass', 'onyx', 'pikachu', 'rhyhorn'];
        if (!validTemplates.includes(templateId)) {
          throw new Error(`Invalid template ID: ${templateId}. Valid templates are: ${validTemplates.join(', ')}`);
        }

        let mappedData = resumeData;
        const isRR = mappedData && mappedData.basics && mappedData.sections && mappedData.metadata;
        if (!isRR) {
          try {
            mappedData = mapResumeGeniusToReactiveResume(resumeData, templateId);
          } catch (e) {
            console.error('Mapping error, using raw data:', e);
          }
        }

        if (!mappedData || !mappedData.basics || !mappedData.sections || !mappedData.metadata) {
          throw new Error('Invalid Reactive-Resume data structure.');
        }

        // Extract layout columns
        const layout = Array.isArray(mappedData.metadata?.layout) ? mappedData.metadata.layout[0] : null;
        if (Array.isArray(layout) && layout.length >= 2) {
          const [main, sidebar] = layout as [SectionKey[], SectionKey[]];
          setColumns([main || [], sidebar || []]);
        } else {
          setColumns([
            ['summary', 'experience', 'education'],
            ['skills', 'projects', 'awards']
          ]);
        }

        // Ensure reactive templates that read from store get fresh data
        try { setResume(mappedData); } catch {}

        // Load template component
        const TemplateComp = getTemplate(templateId as Template);
        if (!TemplateComp) throw new Error(`Template component not found for: ${templateId}`);
        setTemplateComponent(() => TemplateComp);
      } catch (err) {
        console.error('Error loading Reactive-Resume template:', err);
        const msg = `Failed to load template: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(msg);
        onError?.(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId && resumeData) loadTemplate();
    else { setError('Missing template ID or resume data'); setIsLoading(false); }
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
        <div className="text-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-medium">Template Loading Error</p>
          <p className="text-sm mt-2 max-w-md">{error}</p>
          <button onClick={() => { setError(null); setIsLoading(true); }} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Retry</button>
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

  const SafeTemplateComponent = () => {
    try {
      return (
        <TemplateComponent columns={columns} isFirstPage={true} />
      );
    } catch (renderError) {
      console.error('Template render error:', renderError);
      onError?.(renderError);
      return (
        <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="font-medium">Template Render Error</p>
          <p className="text-sm mt-1">Failed to render {templateId} template</p>
        </div>
      );
    }
  };

  return (
    <div ref={containerRef} className={`reactive-resume-template ${className}`} style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '12px', lineHeight: '1.5', color: '#000000', backgroundColor: '#ffffff' }}>
      <div className="template-container" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '14mm', backgroundColor: '#ffffff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', position: 'relative' }}>
        <SafeTemplateComponent />
      </div>
    </div>
  );
};

export default EnhancedReactiveResumeRenderer;
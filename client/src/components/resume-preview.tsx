import React, { useEffect, useMemo, useState } from "react";
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
import type { SectionKey } from '@/utils/reactive-resume-schema';

interface ResumePreviewProps {
  resumeData: ResumeData;
}

export function ResumePreview({ resumeData }: ResumePreviewProps) {
  const { template } = resumeData;
  
  // Debug logging
  console.log('ResumePreview - Template:', template, 'ResumeData:', resumeData);
  
  const artboardResume = useArtboardStore((state) => state.resume);
  const setArtboardResume = useArtboardStore((state) => state.setResume);

  // const customTemplates = ['classic', 'modern', 'stylish', 'compact', 'overleaf', 'elegant']
  const customTemplates = ['classic', 'stylish', 'compact', 'overleaf'];

  // Remount key to force full refresh on template changes only
  const [remountId, setRemountId] = useState(0);
  useEffect(() => {
    setRemountId((id) => id + 1);
  }, [template]); // Only remount when template changes, not on every resumeData change
  
  // Compute mapped data for custom templates
  const mappedCustomData = useMemo(() => {
    if (!customTemplates.includes(template)) return null;
    try {
      return mapResumeGeniusToReactiveResume(resumeData as any, template);
    } catch (e) {
      console.error('Mapping failed, falling back to raw data for custom template:', e);
      return null;
    }
  }, [resumeData, template]);

  // For custom templates, store mapped on every change
  useEffect(() => {
    if (mappedCustomData) setArtboardResume(mappedCustomData);
  }, [mappedCustomData, setArtboardResume]);

  // For reactive templates, ensure store does not cause stale data
  // useEffect(() => {
  //   if (!customTemplates.includes(template)) {
  //     setArtboardResume(null as any);
  //   }
  // }, [template, setArtboardResume]);
  // useEffect(() => {
  //   if (!customTemplates.includes(template)) {
  //     setArtboardResume(null as any);
  //   }
  // }, [resumeData, template, setArtboardResume]);

  const isReactiveResumeTemplate = useMemo(() => {
    try {
      return templateService.isReactiveResumeTemplate(template);
    } catch (e) {
      console.error('Error checking template type:', e);
      return false;
    }
  }, [template]);

  // Memoize the latest data to prevent unnecessary re-renders
  const latestData = useMemo(() => resumeData, [resumeData]);

  if (isReactiveResumeTemplate) {
    return (
      <TemplateErrorBoundary>
        <div id="resume-preview" className="w-full h-full p-0 m-0" key={`reactive-${template}-${remountId}`}>
          <EnhancedReactiveResumeRenderer
            resumeData={latestData}
            templateId={template}
            className="w-full"
            onError={(error) => {
              console.error('Premium template rendering error:', error);
            }}
          />
        </div>
      </TemplateErrorBoundary>
    );
  }

  const ResumeWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full h-full">
      <div className="w-full h-full mx-0">
        {children}
      </div>
    </div>
  );

  const deriveColumnsFromMetadata = (): [SectionKey[], SectionKey[]] => {
    const data = artboardResume || mappedCustomData;
    try {
      const layout = data?.metadata?.layout?.[0];
      if (Array.isArray(layout) && layout.length >= 2) {
        const [main, sidebar] = layout as [SectionKey[], SectionKey[]];
        return [main || [], sidebar || []];
      }
    } catch {}
    return [
      ['summary','experience','education','projects','skills','languages','interests'] as SectionKey[],
      [] as SectionKey[]
    ];
  };

  const dataForCustom = artboardResume || mappedCustomData; // ensure RR shape

  const renderTemplate = () => {
    switch (template) {
      case 'classic': {
        const columns = deriveColumnsFromMetadata();
        return <Classic columns={columns} isFirstPage={true} resumeData={dataForCustom} />;
      }
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
        ]} isFirstPage={true} resumeData={dataForCustom} />;
      case 'stylish': {
        const columns = deriveColumnsFromMetadata();
        return <Stylish columns={columns} isFirstPage={true} resumeData={dataForCustom} />;
      }
      case 'compact': {
        const columns = deriveColumnsFromMetadata();
        return <Compact columns={columns} isFirstPage={true} resumeData={dataForCustom} />;
      }
      case 'overleaf': {
        const columns = deriveColumnsFromMetadata();
        return <Overleaf columns={columns} isFirstPage={true} resumeData={dataForCustom} />;
      }
      case 'elegant': {
        const columns = deriveColumnsFromMetadata();
        return <Elegant columns={columns} isFirstPage={true} resumeData={dataForCustom} />;
      }
      default:
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="azurill" />;
    }
  };

  return (
    <div className="resume-preview w-full h-full p-0 m-0" id="resume-preview" key={`custom-${template}-${remountId}`}>
      <ResumeWrapper>
        <TemplateErrorBoundary>
        {renderTemplate()}
        </TemplateErrorBoundary>
      </ResumeWrapper>
    </div>
  );
}
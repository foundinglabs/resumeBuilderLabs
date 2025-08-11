import React, { Fragment } from "react";
import { useArtboardStore } from "../store/artboard-store";
import type { TemplateProps } from "../types/template";
import type {
  SectionKey,
  SectionWithItem,
  CustomSectionGroup,
} from "../utils/reactive-resume-schema";
import { cn, isEmptyString, isUrl, sanitize } from "../utils/reactive-resume-utils";
import { BrandIcon } from "../components/brand-icon";

const Header = ({ resumeData }: { resumeData: any }) => {
  const basics = resumeData?.basics;
  return (
    <div className="flex flex-col items-center justify-center py-8 bg-pink-600 text-white font-serif">
      <div className="text-2xl md:text-3xl font-bold mb-1 text-center">{basics?.name || "Jane Doe"}</div>
      <div className="flex flex-wrap justify-center gap-x-4 mt-2 text-sm">
        {basics?.email && <span className="flex items-center gap-1"><i className="ph ph-at" /> {basics.email}</span>}
        {basics?.phone && <span className="flex items-center gap-1"><i className="ph ph-phone" /> {basics.phone}</span>}
        {basics?.location && <span className="flex items-center gap-1"><i className="ph ph-map-pin" /> {basics.location}</span>}
      </div>
    </div>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="uppercase text-pink-700 font-bold tracking-wide text-xs md:text-sm mb-3 mt-6 md:mt-8">{children}</h2>
);

const TimelineItem = ({ children }: { children: React.ReactNode }) => (
  <div className="relative pl-6 pb-6">
    <span className="absolute left-0 top-2 w-3 h-3 bg-pink-500 rounded-full border-2 border-white"></span>
    {children}
  </div>
);

const Section = <T extends { visible?: boolean; id?: string }>(
  {
    section,
    children,
    className,
  }: {
    section: SectionWithItem<T> | CustomSectionGroup;
    children?: (item: T) => React.ReactNode;
    className?: string;
  }
) => {
  if (!section?.visible || !('items' in section) || section.items.length === 0) return null;
  
  const visibleItems = section.items.filter((item) => 
    typeof item.visible === 'undefined' ? true : item.visible
  );
  
  if (visibleItems.length === 0) return null;

  return (
    <section id={'id' in section ? section.id : section.name} className="grid">
      <div className="mb-2 font-bold text-pink-700">
        <h4 className="text-lg">{section.name}</h4>
      </div>
      <div className={cn("grid gap-x-4 md:gap-x-6 gap-y-3", className)} style={{ gridTemplateColumns: `repeat(${"columns" in section ? section.columns : 1}, 1fr)` }}>
        {visibleItems.map((item) => (
          <div key={item.id || Math.random()} className="relative space-y-2 border-pink-200 border-l-2 pl-4">
            <div>{children?.(item as T)}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

const mapSectionToComponent = (section: string, resumeData: any) => {
  const sec = resumeData?.sections?.[section];
  if (!sec) return null;
  
  switch (section) {
    case "summary": {
      if (!sec?.visible || isEmptyString(sec?.content)) return null;
      return (
        <section id={sec.id} className="mb-6">
          <div className="mb-2 font-bold text-pink-700">
            <h4 className="text-lg">{sec.name}</h4>
          </div>
          <div 
            className="prose prose-pink max-w-none text-gray-700" 
            dangerouslySetInnerHTML={{ __html: sanitize(sec.content) }} 
          />
        </section>
      );
    }
    case "experience": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800">{item.position || item.title}</div>
              <div className="text-pink-700">{item.company}{item.location && ` (${item.location})`}</div>
              <div className="text-xs text-pink-400">{item.date || [item.startDate, item.endDate].filter(Boolean).join(' - ')}</div>
              {item.summary && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-pink prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary) }} 
                />
              )}
            </TimelineItem>
          )}
        </Section>
      );
    }
    case "projects": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800">{item.name}</div>
              {item.description && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-pink prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} 
                />
              )}
              {item.summary && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-pink prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary) }} 
                />
              )}
              {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                <div className="text-xs text-pink-500 mt-1">
                  Technologies: {item.technologies.join(', ')}
                </div>
              )}
              <div className="text-xs text-pink-400">{item.date}</div>
              {item.url && (
                <a 
                  href={typeof item.url === 'string' ? item.url : item.url.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-pink-600 underline hover:text-pink-800 break-all"
                >
                  {typeof item.url === 'string' ? item.url : (item.url.label || item.url.href)}
                </a>
              )}
            </TimelineItem>
          )}
        </Section>
      );
    }
    case "education": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800">
                {item.studyType || item.degree}{(item.area || item.field_of_study) && `, ${item.area || item.field_of_study}`}
              </div>
              <div className="text-pink-700">{item.institution || item.school}</div>
              <div className="text-xs text-pink-400">{item.date || item.graduationYear}</div>
              {item.score && <div className="text-xs text-gray-600">Score: {item.score}</div>}
              {item.location && <div className="text-xs text-gray-600">{item.location}</div>}
            </TimelineItem>
          )}
        </Section>
      );
    }
    case "skills": {
      return (
        <div className="mb-6">
          <div className="mb-2 font-bold text-pink-700">
            <h4 className="text-lg">{sec.name}</h4>
          </div>
          <div className="flex flex-col gap-2">
            {sec.items
              .filter((item: any) => item.visible !== false)
              .map((item: any) => (
                <div key={item.id || Math.random()} className="flex flex-wrap items-baseline gap-2">
                  <span 
                    className="inline-block bg-pink-100 text-pink-800 text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {item.name}
                  </span>
                  {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <span className="text-xs text-gray-600">
                      {item.keywords.join(', ')}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      );
    }
    case "languages": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800">{item.name}</div>
              {item.description && <div className="text-pink-700">{item.description}</div>}
            </TimelineItem>
          )}
        </Section>
      );
    }
    case "interests": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800">{item.name}</div>
              {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                <div className="text-sm text-gray-600">
                  {item.keywords.join(', ')}
                </div>
              )}
            </TimelineItem>
          )}
        </Section>
      );
    }
    case "awards": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800">{item.title}</div>
              <div className="text-pink-700">{item.awarder}</div>
              <div className="text-xs text-pink-400">{item.date}</div>
              {(item.summary || item.description) && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-pink prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </TimelineItem>
          )}
        </Section>
      );
    }
    case "certifications": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800">{item.name}</div>
              <div className="text-pink-700">{item.issuer}</div>
              <div className="text-xs text-pink-400">{item.date}</div>
              {(item.summary || item.description) && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-pink prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </TimelineItem>
          )}
        </Section>
      );
    }
    case "publications": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800">{item.name || item.title}</div>
              <div className="text-pink-700">{item.publisher}</div>
              <div className="text-xs text-pink-400">{item.date}</div>
              {item.url && (
                <a 
                  href={typeof item.url === 'string' ? item.url : item.url.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-pink-600 underline hover:text-pink-800 break-all"
                >
                  {typeof item.url === 'string' ? item.url : (item.url.label || item.url.href)}
                </a>
              )}
              {(item.summary || item.description) && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-pink prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </TimelineItem>
          )}
        </Section>
      );
    }
    case "volunteer": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800">{item.position || item.role}</div>
              <div className="text-pink-700">{item.organization}</div>
              <div className="text-xs text-pink-400">{item.date}</div>
              {(item.summary || item.description) && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-pink prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </TimelineItem>
          )}
        </Section>
      );
    }
    case "references": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800">{item.name}</div>
              {(item.summary || item.description) && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-pink prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </TimelineItem>
          )}
        </Section>
      );
    }
    default: {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div className="mb-6 text-base text-gray-700">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <strong className="text-gray-800">{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          )}
        </Section>
      );
    }
  }
};

export const Stylish = ({ columns, isFirstPage = false, resumeData: resumeDataProp }: TemplateProps) => {
  const resumeDataFromStore = useArtboardStore((state) => state.resume);
  const resumeData = resumeDataProp ?? resumeDataFromStore;
  const [main, sidebar] = columns;
  return (
    <div className="bg-white text-gray-700 w-full max-w-5xl mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-0 shadow-lg rounded-2xl overflow-hidden">
      {/* Sidebar */}
      <aside className="lg:col-span-1 bg-gradient-to-b from-pink-600 to-pink-400 p-6 md:p-8 flex flex-col gap-6 md:gap-8 text-white">
        {isFirstPage && <Header resumeData={resumeData} />}
        {sidebar.map((section: string) => (
          <Fragment key={section}>
            <SectionTitle>{section.charAt(0).toUpperCase() + section.slice(1)}</SectionTitle>
            {mapSectionToComponent(section, resumeData)}
          </Fragment>
        ))}
      </aside>
      {/* Main Content */}
      <main className="lg:col-span-2 p-6 md:p-10">
        {main.map((section: string) => (
          <Fragment key={section}>
            <SectionTitle>{section.charAt(0).toUpperCase() + section.slice(1)}</SectionTitle>
            {mapSectionToComponent(section, resumeData)}
          </Fragment>
        ))}
      </main>
    </div>
  );
};
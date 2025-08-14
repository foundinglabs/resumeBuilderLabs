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
import { Github, ExternalLink } from "lucide-react";

const Header = ({ resumeData }: { resumeData: any }) => {
  const basics = resumeData?.basics;
  return (
    <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-white/20">
      <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 text-center text-white">{basics?.name || "Jane Doe"}</div>
      <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
        {basics?.email && (
          <div className="flex items-center gap-1 sm:gap-2 text-pink-100">
            <span className="w-3 h-3 sm:w-4 sm:h-4 bg-white/20 rounded-full flex items-center justify-center text-xs flex-shrink-0">✉</span>
            <span className="truncate min-w-0">{basics.email}</span>
          </div>
        )}
        {basics?.phone && (
          <div className="flex items-center gap-1 sm:gap-2 text-pink-100">
            <span className="w-3 h-3 sm:w-4 sm:h-4 bg-white/20 rounded-full flex items-center justify-center text-xs flex-shrink-0">📞</span>
            <span className="truncate min-w-0">{basics.phone}</span>
          </div>
        )}
        {basics?.location && (
          <div className="flex items-center gap-1 sm:gap-2 text-pink-100">
            <span className="w-3 h-3 sm:w-4 sm:h-4 bg-white/20 rounded-full flex items-center justify-center text-xs flex-shrink-0">📍</span>
            <span className="truncate min-w-0">{basics.location}</span>
          </div>
        )}
      
      </div>
    </div>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="uppercase text-pink-700 font-bold tracking-wide text-xs sm:text-sm mb-1 sm:mb-2 mt-3 sm:mt-4 md:mt-5">{children}</h2>
);

const TimelineItem = ({ children }: { children: React.ReactNode }) => (
  <div className="relative pl-3 sm:pl-4 pb-2 sm:pb-3">
    <span className="absolute left-0 top-1.5 sm:top-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-white"></span>
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
      <div className="mb-1 font-bold text-pink-700">
        <h4 className="text-sm sm:text-base">{section.name}</h4>
      </div>
      <div className={cn("grid gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-1 sm:gap-y-2", className)} style={{ gridTemplateColumns: `repeat(${"columns" in section ? section.columns : 1}, 1fr)` }}>
        {visibleItems.map((item) => (
          <div key={item.id || Math.random()} className="relative space-y-1 border-pink-200 border-l-2 pl-2 sm:pl-3">
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
        <section id={sec.id} className="mb-2 sm:mb-3">
          <div className="mb-1 font-bold text-pink-700">
            <h4 className="text-sm sm:text-base">{sec.name}</h4>
          </div>
          <div 
            className="prose prose-pink max-w-none text-gray-700 text-xs sm:text-sm leading-relaxed" 
            dangerouslySetInnerHTML={{ __html: sanitize(sec.content) }} 
          />
        </section>
      );
    }
    case "experience": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <section key="experience" className="mb-2 sm:mb-3">
          <div className="mb-1 sm:mb-2 font-bold text-pink-700">
            <h4 className="text-sm sm:text-base">{sec.name}</h4>
          </div>
          <div className="space-y-1 sm:space-y-2">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 text-xs sm:text-sm truncate">{item.position || item.title}</div>
                      <div className="text-pink-700 font-medium text-xs truncate">{item.company}</div>
                      {item.location && <div className="text-gray-500 text-xs truncate">{item.location}</div>}
                    </div>
                    <div className="text-xs text-pink-400 font-medium bg-pink-50 px-1.5 sm:px-2 py-0.5 rounded flex-shrink-0">
                      {item.date || [item.startDate, item.endDate].filter(Boolean).join(' - ')}
                    </div>
                  </div>
                  {item.summary && (
                    <div 
                      className="text-xs text-gray-600 mt-1 sm:mt-2 prose prose-pink prose-sm max-w-none leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary) }} 
                    />
                  )}
                </div>
              ))}
          </div>
        </section>
      );
    }
    case "projects": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <section key="projects" className="mb-2 sm:mb-3">
          <div className="mb-1 sm:mb-2 font-bold text-pink-700">
            <h4 className="text-sm sm:text-base">{sec.name}</h4>
          </div>
          <div className="space-y-1 sm:space-y-2">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <div className="font-bold text-gray-800 text-xs sm:text-sm truncate flex-1">{item.name}</div>
                    {item.url && (
                      <a 
                        href={typeof item.url === 'string' ? item.url : item.url.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-800 transition-colors flex-shrink-0"
                        title="View project"
                      >
                        {(typeof item.url === 'string' ? item.url : item.url?.href)?.includes?.('github') ? 
                          <Github className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        }
                      </a>
                    )}
                  </div>
                  {item.description && (
                    <div 
                      className="text-xs text-gray-600 mb-1 sm:mb-2 prose prose-pink prose-sm max-w-none leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: sanitize(item.description.replace(/\b(20\d{2}|19\d{2})\b/g, '')) }} 
                    />
                  )}
                  {item.summary && (
                    <div 
                      className="text-xs text-gray-600 mb-1 sm:mb-2 prose prose-pink prose-sm max-w-none leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary.replace(/\b(20\d{2}|19\d{2})\b/g, '')) }} 
                    />
                  )}
                  {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {item.technologies.map((tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-pink-100 text-pink-700 text-xs px-1 py-0.5 sm:px-1.5 rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.keywords && Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.keywords.map((keyword: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-pink-50 text-pink-600 text-xs px-1 py-0.5 sm:px-1.5 rounded border border-pink-200"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>
      );
    }
    case "education": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-xs">
                    {item.studyType || item.degree}{(item.area || item.field_of_study) && `, ${item.area || item.field_of_study}`}
                  </div>
                  <div className="text-pink-700 font-medium text-xs">{item.institution || item.school}</div>
                  {item.location && <div className="text-gray-500 text-xs">{item.location}</div>}
                </div>
                <div className="text-xs text-pink-400 font-medium bg-pink-50 px-2 py-0.5 rounded">
                  {item.date || item.graduationYear}
                </div>
              </div>
              {item.score && <div className="text-xs text-gray-600 mt-1 font-medium">GPA: {item.score}</div>}
            </TimelineItem>
          )}
        </Section>
      );
    }
          case "skills": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <div className="mb-1 sm:mb-2">
          <div className="mb-1 font-bold text-white">
            <h4 className="text-xs sm:text-sm">{sec.name}</h4>
          </div>
          <div className="space-y-1">
            {sec.items
              .filter((item: any) => item.visible !== false)
              .map((item: any) => (
                <div key={item.id || Math.random()} className="bg-white/10 backdrop-blur rounded-lg p-1.5 sm:p-2">
                  <div className="font-medium text-white text-xs mb-1">{item.name}</div>
                  {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.keywords.map((keyword: string, idx: number) => (
                        <span 
                          key={idx}
                          className="text-xs text-pink-100 bg-white/10 px-1 py-0.5 sm:px-1.5 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      );
    }
    case "languages": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <div className="mb-2">
          <div className="mb-1 font-bold text-white">
            <h4 className="text-sm">{sec.name}</h4>
          </div>
          <div className="space-y-1">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white/10 backdrop-blur rounded-lg p-2">
                  <div className="font-medium text-white text-xs">{item.name}</div>
                  {item.description && <div className="text-pink-100 text-xs mt-0.5">{item.description}</div>}
                </div>
              ))}
          </div>
        </div>
      );
    }
    case "interests": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <div className="mb-2">
          <div className="mb-1 font-bold text-white">
            <h4 className="text-sm">{sec.name}</h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white/10 backdrop-blur rounded-full px-2 py-1">
                  <span className="text-white text-xs font-medium">{item.name}</span>
                </div>
              ))}
          </div>
        </div>
      );
    }
    case "awards": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <div className="mb-2">
          <div className="mb-1 font-bold text-white">
            <h4 className="text-sm">{sec.name}</h4>
          </div>
          <div className="space-y-1">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white/10 backdrop-blur rounded-lg p-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-bold text-white text-xs">{item.title}</div>
                      <div className="text-pink-100 text-xs">{item.awarder}</div>
                    </div>
                    <div className="text-xs text-pink-200 bg-white/10 px-1.5 py-0.5 rounded">
                      {item.date}
                    </div>
                  </div>
                  {(item.summary || item.description) && (
                    <div 
                      className="text-xs text-pink-100 mt-1 prose prose-pink prose-sm max-w-none" 
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      );
    }
    case "certifications": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <div className="mb-3">
          <div className="mb-2 font-bold text-white">
            <h4 className="text-sm">{sec.name}</h4>
          </div>
          <div className="space-y-2">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white/10 backdrop-blur rounded-lg p-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-bold text-white text-xs">{item.name}</div>
                      <div className="text-pink-100 text-xs">{item.issuer}</div>
                    </div>
                    <div className="text-xs text-pink-200 bg-white/10 px-1.5 py-0.5 rounded">
                      {item.date}
                    </div>
                  </div>
                  {(item.summary || item.description) && (
                    <div 
                      className="text-xs text-pink-100 mt-1 prose prose-pink prose-sm max-w-none" 
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      );
    }
    case "publications": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800 text-xs">{item.name || item.title}</div>
              <div className="text-pink-700 text-xs">{item.publisher}</div>
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
                  className="text-xs text-gray-600 mt-1 prose prose-pink prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </TimelineItem>
          )}
        </Section>
      );
    }
    case "volunteer": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <section key="volunteer" className="mb-1">
          <div className="mb-0.5 font-bold text-pink-700">
            <h4 className="text-sm">{sec.name}</h4>
          </div>
          <div className="space-y-0.5">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 text-xs truncate">{item.position || item.role}</div>
                      <div className="text-pink-700 font-medium text-xs truncate">{item.organization}</div>
                      {item.location && <div className="text-gray-500 text-xs truncate">{item.location}</div>}
                    </div>
                    <div className="text-xs text-pink-400 font-medium bg-pink-50 px-1 py-0.5 rounded flex-shrink-0">
                      {item.date || [item.startDate, item.endDate].filter(Boolean).join(' - ')}
                    </div>
                  </div>
                  {(item.summary || item.description) && (
                    <div 
                      className="text-xs text-gray-600 mt-1 prose prose-pink prose-sm max-w-none leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                    />
                  )}
                </div>
              ))}
          </div>
        </section>
      );
    }
    case "references": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <TimelineItem>
              <div className="font-bold text-gray-800 text-xs">{item.name}</div>
              {(item.summary || item.description) && (
                <div 
                  className="text-xs text-gray-600 mt-1 prose prose-pink prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </TimelineItem>
          )}
        </Section>
      );
    }
    case "profiles": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <div className="mb-1">
          <div className="mb-0.5 font-bold text-white">
            <h4 className="text-xs sm:text-sm">{sec.name}</h4>
          </div>
          <div className="space-y-0.5">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur p-1 sm:p-1.5 rounded-lg">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">
                    {item.network === "LinkedIn" ? (
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    ) : item.network === "GitHub" ? (
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    ) : (
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    )}
                  </span>
                  {item.url?.href ? (
                    <a
                      href={item.url.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-xs underline hover:text-pink-100 transition-colors truncate min-w-0"
                    >
                      {item.username}
                    </a>
                  ) : (
                    <span className="text-white text-xs truncate min-w-0">{item.username}</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      );
    }
    default: {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div className="mb-3 text-sm text-gray-700">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="mb-0.5">
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
  
  // Ensure volunteer section appears in main content area
  const mainSections = main.filter(section => section !== 'volunteer');
  const sidebarSections = sidebar.filter(section => section !== 'volunteer');
  
  // Add volunteer to main sections if it exists in the data
  const hasVolunteer = resumeData?.sections?.volunteer?.visible && 
    resumeData?.sections?.volunteer?.items?.length > 0 &&
    resumeData?.sections?.volunteer?.items?.some((item: any) => item?.visible !== false);
  
  const finalMainSections = hasVolunteer ? [...mainSections, 'volunteer'] : mainSections;
  
  return (
    <div className="bg-white text-gray-700 w-full max-w-[210mm] mx-auto shadow-lg rounded-2xl overflow-hidden">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-1/3 bg-gradient-to-b from-pink-600 to-pink-400 p-2 sm:p-3 md:p-4 flex flex-col text-white">
          {isFirstPage && <Header resumeData={resumeData} />}
          <div className="flex flex-col gap-1 sm:gap-2 md:gap-3 flex-1">
            {sidebarSections.map((section: string) => (
              <Fragment key={section}>
                {mapSectionToComponent(section, resumeData)}
              </Fragment>
            ))}
          </div>
        </aside>
        {/* Main Content */}
        <main className="w-2/3 p-1 sm:p-2 md:p-3 flex flex-col">
          <div className="space-y-1 sm:space-y-2">
            {finalMainSections.map((section: string) => (
              <Fragment key={section}>
                {mapSectionToComponent(section, resumeData)}
              </Fragment>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
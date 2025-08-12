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
    <div className="mb-6 pb-6 border-b border-white/20">
      <div className="text-2xl md:text-3xl font-bold mb-3 text-center text-white">{basics?.name || "Jane Doe"}</div>
      <div className="space-y-2 text-sm">
        {basics?.email && (
          <div className="flex items-center gap-2 text-pink-100">
            <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-xs">✉</span>
            <span>{basics.email}</span>
          </div>
        )}
        {basics?.phone && (
          <div className="flex items-center gap-2 text-pink-100">
            <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-xs">📞</span>
            <span>{basics.phone}</span>
          </div>
        )}
        {basics?.location && (
          <div className="flex items-center gap-2 text-pink-100">
            <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-xs">📍</span>
            <span>{basics.location}</span>
          </div>
        )}
        {basics?.url?.href && (
          <div className="flex items-center gap-2 text-pink-100">
            <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-xs">🌐</span>
            <a href={basics.url.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              {basics.url.label || "Portfolio"}
            </a>
          </div>
        )}
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
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <section key="experience" className="mb-6">
          <div className="mb-3 font-bold text-pink-700">
            <h4 className="text-lg">{sec.name}</h4>
          </div>
          <div className="space-y-4">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-base">{item.position || item.title}</div>
                      <div className="text-pink-700 font-medium text-sm">{item.company}</div>
                      {item.location && <div className="text-gray-500 text-xs">{item.location}</div>}
                    </div>
                    <div className="text-xs text-pink-400 font-medium bg-pink-50 px-2 py-1 rounded">
                      {item.date || [item.startDate, item.endDate].filter(Boolean).join(' - ')}
                    </div>
                  </div>
                  {item.summary && (
                    <div 
                      className="text-sm text-gray-600 mt-3 prose prose-pink prose-sm max-w-none leading-relaxed" 
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
        <section key="projects" className="mb-6">
          <div className="mb-3 font-bold text-pink-700">
            <h4 className="text-lg">{sec.name}</h4>
          </div>
          <div className="space-y-4">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="font-bold text-gray-800 text-base">{item.name}</div>
                    {item.url && (
                      <a 
                        href={typeof item.url === 'string' ? item.url : item.url.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-800 transition-colors"
                        title="View project"
                      >
                        {(typeof item.url === 'string' ? item.url : item.url?.href)?.includes?.('github') ? 
                          <Github className="w-4 h-4" /> : 
                          <ExternalLink className="w-4 h-4" />
                        }
                      </a>
                    )}
                  </div>
                  {item.description && (
                    <div 
                      className="text-sm text-gray-600 mb-3 prose prose-pink prose-sm max-w-none leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: sanitize(item.description.replace(/\b(20\d{2}|19\d{2})\b/g, '')) }} 
                    />
                  )}
                  {item.summary && (
                    <div 
                      className="text-sm text-gray-600 mb-3 prose prose-pink prose-sm max-w-none leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary.replace(/\b(20\d{2}|19\d{2})\b/g, '')) }} 
                    />
                  )}
                  {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.technologies.map((tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full font-medium"
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
                          className="bg-pink-50 text-pink-600 text-xs px-2 py-1 rounded border border-pink-200"
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
                  <div className="font-bold text-gray-800 text-sm">
                    {item.studyType || item.degree}{(item.area || item.field_of_study) && `, ${item.area || item.field_of_study}`}
                  </div>
                  <div className="text-pink-700 font-medium text-sm">{item.institution || item.school}</div>
                  {item.location && <div className="text-gray-500 text-xs">{item.location}</div>}
                </div>
                <div className="text-xs text-pink-400 font-medium bg-pink-50 px-2 py-1 rounded">
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
        <div className="mb-3">
          <div className="mb-2 font-bold text-white">
            <h4 className="text-base">{sec.name}</h4>
          </div>
          <div className="grid gap-2">
            {sec.items
              .filter((item: any) => item.visible !== false)
              .map((item: any) => (
                <div key={item.id || Math.random()} className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white text-sm">{item.name}</span>
                    {item.level && (
                      <span className="text-xs text-pink-200">
                        Level {item.level}
                      </span>
                    )}
                  </div>
                  {item.level && (
                    <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-white h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${((item.level || 3) / 5) * 100}%` }}
                      />
                    </div>
                  )}
                  {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                        <span 
                          key={idx}
                          className="text-xs text-pink-100 bg-white/10 px-2 py-0.5 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                      {item.keywords.length > 3 && (
                        <span className="text-xs text-pink-200">+{item.keywords.length - 3} more</span>
                      )}
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
        <div className="mb-3">
          <div className="mb-2 font-bold text-white">
            <h4 className="text-base">{sec.name}</h4>
          </div>
          <div className="space-y-2">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <div className="font-medium text-white text-sm">{item.name}</div>
                  {item.description && <div className="text-pink-100 text-xs mt-1">{item.description}</div>}
                </div>
              ))}
          </div>
        </div>
      );
    }
    case "interests": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <div className="mb-3">
          <div className="mb-2 font-bold text-white">
            <h4 className="text-base">{sec.name}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white/10 backdrop-blur rounded-full px-3 py-2">
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
        <div className="mb-3">
          <div className="mb-2 font-bold text-white">
            <h4 className="text-base">{sec.name}</h4>
          </div>
          <div className="space-y-2">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">{item.title}</div>
                      <div className="text-pink-100 text-xs">{item.awarder}</div>
                    </div>
                    <div className="text-xs text-pink-200 bg-white/10 px-2 py-1 rounded">
                      {item.date}
                    </div>
                  </div>
                  {(item.summary || item.description) && (
                    <div 
                      className="text-sm text-pink-100 mt-2 prose prose-pink prose-sm max-w-none" 
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
        <div className="mb-8">
          <div className="mb-4 font-bold text-white">
            <h4 className="text-base">{sec.name}</h4>
          </div>
          <div className="space-y-4">
            {sec.items
              ?.filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      <div className="text-pink-100 text-xs">{item.issuer}</div>
                    </div>
                    <div className="text-xs text-pink-200 bg-white/10 px-2 py-1 rounded">
                      {item.date}
                    </div>
                  </div>
                  {(item.summary || item.description) && (
                    <div 
                      className="text-sm text-pink-100 mt-2 prose prose-pink prose-sm max-w-none" 
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
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <section key="volunteer" className="mb-6">
          <div className="mb-3 font-bold text-pink-700">
            <h4 className="text-lg">{sec.name}</h4>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-pink-500">
            <div className="grid gap-3">
              {sec.items
                ?.filter((item: any) => item?.visible !== false)
                .map((item: any) => (
                  <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 text-sm">{item.position || item.role}</div>
                        <div className="text-pink-600 font-medium text-xs">{item.organization}</div>
                      </div>
                      <div className="text-xs text-pink-400 bg-pink-50 px-2 py-1 rounded">
                        {item.date || [item.startDate, item.endDate].filter(Boolean).join(' - ')}
                      </div>
                    </div>
                    {item.location && <div className="text-gray-500 text-xs mb-2">{item.location}</div>}
                    {(item.summary || item.description) && (
                      <div 
                        className="text-xs text-gray-600 leading-relaxed prose prose-pink prose-xs max-w-none" 
                        dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </section>
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
    case "profiles": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      return (
        <div className="mb-3">
          <div className="mb-2 font-bold text-white">
            <h4 className="text-base">{sec.name}</h4>
          </div>
          <div className="space-y-2">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="flex items-center gap-2 bg-white/10 backdrop-blur p-3 rounded-lg">
                  <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">
                    {item.network === "LinkedIn"
                      ? "💼"
                      : item.network === "GitHub"
                        ? "🐙"
                        : item.network === "Twitter"
                          ? "🐦"
                          : "🌐"}
                  </span>
                  {item.url?.href ? (
                    <a
                      href={item.url.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-sm underline hover:text-pink-100 transition-colors"
                    >
                      {item.username}
                    </a>
                  ) : (
                    <span className="text-white text-sm">{item.username}</span>
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
    <div className="bg-white text-gray-700 w-full max-w-5xl mx-auto min-h-screen shadow-lg rounded-2xl overflow-hidden">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-1/3 bg-gradient-to-b from-pink-600 to-pink-400 p-6 md:p-8 flex flex-col text-white">
          {isFirstPage && <Header resumeData={resumeData} />}
          <div className="flex flex-col gap-3 md:gap-4 flex-1">
            {sidebar.map((section: string) => (
              <Fragment key={section}>
                {mapSectionToComponent(section, resumeData)}
              </Fragment>
            ))}
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 flex flex-col">
          <div className="space-y-6">
            {main.map((section: string) => (
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
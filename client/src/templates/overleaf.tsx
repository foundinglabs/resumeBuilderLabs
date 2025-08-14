import React, { Fragment } from "react";
import { useArtboardStore } from "../store/artboard-store";
import type { TemplateProps } from "../types/template";
import type {
  SectionKey,
  SectionWithItem,
  CustomSectionGroup,
} from "../utils/reactive-resume-schema";
import { cn, isEmptyString, sanitize } from "../utils/reactive-resume-utils";
import { BrandIcon } from "../components/brand-icon";
import { Github, ExternalLink, Link } from "lucide-react";

const Header = ({ resumeData }: { resumeData: any }) => {
  const basics = resumeData?.basics;
  return (
    <div className="flex flex-col items-center justify-center py-2 sm:py-3 md:py-4 border-b border-orange-200 bg-white font-serif">
      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-800 font-serif text-center px-2">{basics?.name || "Dr. Sam Lee"}</div>
      <div className="flex flex-wrap justify-center gap-x-2 sm:gap-x-4 mt-1 text-orange-600 font-serif text-xs sm:text-sm px-2">
        {basics?.email && <span className="flex items-center gap-1"><i className="ph ph-at" /> {basics.email}</span>}
        {basics?.phone && <span className="flex items-center gap-1"><i className="ph ph-phone" /> {basics.phone}</span>}
        {basics?.location && <span className="flex items-center gap-1"><i className="ph ph-map-pin" /> {basics.location}</span>}
        {basics?.url?.href && (
          <span className="flex items-center gap-1">
            <i className="ph ph-link" />
            <a href={basics.url.href} target="_blank" rel="noopener noreferrer" className="underline">
              {basics.url.label || basics.url.href}
            </a>
          </span>
        )}
      </div>
    </div>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="border-b border-orange-600 pb-1 font-bold text-orange-800 font-serif text-xs sm:text-sm md:text-base mb-2 mt-3 sm:mt-4 md:mt-5">{children}</h2>
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
    <section id={'id' in section ? section.id : section.name} className="grid mb-3">
      <div className="mb-1 font-bold text-orange-700">
        <h4 className="text-sm sm:text-base md:text-lg">{section.name}</h4>
      </div>
      <div className={cn("grid gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-1", className)} style={{ gridTemplateColumns: `repeat(${"columns" in section ? section.columns : 1}, 1fr)` }}>
        {visibleItems.map((item) => (
          <div key={item.id || Math.random()} className="relative space-y-1 border-orange-200 border-l-2 pl-2 sm:pl-3">
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
        <section id={sec.id} className="mb-2 mt-2">
          <div className="mb-1 font-bold text-orange-700">
            <h4 className="text-sm sm:text-base md:text-lg">{sec.name}</h4>
          </div>
          <div 
            className="prose prose-orange max-w-none text-slate-700 font-serif text-xs sm:text-sm leading-tight" 
            dangerouslySetInnerHTML={{ __html: sanitize(sec.content) }} 
          />
        </section>
      );
    }
    case "profiles": {
      return (
        <div className="mb-3">
          <div className="mb-1 font-bold text-orange-700">
            <h4 className="text-sm sm:text-base md:text-lg">{sec.name}</h4>
          </div>
          <ul className="flex flex-wrap gap-1 text-xs sm:text-sm">
            {sec.items
              .filter((item: any) => item.visible !== false)
              .map((item: any) => (
                <li key={item.id || Math.random()} className="flex items-center gap-1">
                  <BrandIcon slug={item.icon || "globe"} />
                  {item.url?.href ? (
                    <a href={item.url.href} target="_blank" rel="noopener noreferrer" className="underline">
                      {item.username}
                    </a>
                  ) : (
                    <span>{item.username}</span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      );
    }
    case "experience": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 text-sm sm:text-base">{item.position || item.title}</div>
              <div className="text-orange-700 mb-1 text-xs sm:text-sm">{item.company}{item.location && ` (${item.location})`}</div>
              <div className="text-xs text-orange-400 mb-1">{item.date || [item.startDate, item.endDate].filter(Boolean).join(' - ')}</div>
              {item.summary && (
                <div 
                  className="text-xs sm:text-sm text-slate-600 prose prose-orange prose-sm max-w-none font-serif" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary) }} 
                />
              )}
            </div>
          )}
        </Section>
      );
    }
    case "projects": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="font-bold text-slate-800">{item.name}</div>
                {item.url && (
                  <a 
                    href={typeof item.url === 'string' ? item.url : item.url.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-800 transition-colors"
                    title="View project"
                  >
                    {(typeof item.url === 'string' ? item.url : item.url?.href)?.includes?.('github') ? 
                      <Github className="w-4 h-4" /> : 
                      (typeof item.url === 'string' ? item.url : item.url?.href)?.includes?.('live') || 
                      (typeof item.url === 'string' ? item.url : item.url?.href)?.includes?.('demo') ||
                      (typeof item.url === 'string' ? item.url : item.url?.href)?.includes?.('vercel') ||
                      (typeof item.url === 'string' ? item.url : item.url?.href)?.includes?.('netlify') ? 
                      <Link className="w-4 h-4" /> : 
                      <ExternalLink className="w-4 h-4" />
                    }
                  </a>
                )}
              </div>
              {item.description && (
                <div 
                  className="text-sm text-slate-600 mb-2 prose prose-orange prose-sm max-w-none font-serif" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} 
                />
              )}
              {item.summary && (
                <div 
                  className="text-sm text-slate-600 mb-2 prose prose-orange prose-sm max-w-none font-serif" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary) }} 
                />
              )}
              {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.technologies.map((tech: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-block bg-orange-100 text-orange-800 text-[10px] font-medium px-2 py-0.5 rounded-full"
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
                      className="inline-block bg-orange-50 text-orange-700 text-[10px] font-medium px-2 py-0.5 rounded border border-orange-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </Section>
      );
    }
    case "education": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 mb-1 text-sm sm:text-base">
                {item.studyType || item.degree}{(item.area || item.field_of_study) && `, ${item.area || item.field_of_study}`}
              </div>
              <div className="text-orange-700 mb-1 text-xs sm:text-sm">{item.institution || item.school}</div>
              <div className="text-xs text-orange-400 mb-1">{item.date || item.graduationYear}</div>
              {(item.score || item.gpa) && <div className="text-xs text-slate-600 mb-1">GPA: {item.score || item.gpa}</div>}
              {item.location && <div className="text-xs text-slate-600 mb-1">{item.location}</div>}
              {item.honors && <div className="text-xs text-slate-600">{item.honors}</div>}
            </div>
          )}
        </Section>
      );
    }
    case "skills": {
      return (
        <div className="mb-3">
          <div className="mb-1 font-bold text-orange-700">
            <h4 className="text-sm sm:text-base md:text-lg">{sec.name}</h4>
          </div>
          <div className="flex flex-col gap-1">
            {sec.items
              .filter((item: any) => item.visible !== false)
              .map((item: any) => (
                <div key={item.id || Math.random()} className="flex items-baseline gap-1 flex-wrap">
                  <span 
                    className="inline-block bg-orange-100 text-orange-800 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full"
                  >
                    {item.name}
                  </span>
                  {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <span className="text-[10px] sm:text-xs text-slate-600">
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
            <div>
              <div className="font-bold text-slate-800 mb-1">{item.name}</div>
              {item.description && <div className="text-orange-700 text-sm">{item.description}</div>}
            </div>
          )}
        </Section>
      );
    }
    case "interests": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 mb-1">{item.name}</div>
              {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                <div className="text-sm text-slate-600">
                  {item.keywords.join(', ')}
                </div>
              )}
            </div>
          )}
        </Section>
      );
    }
    case "awards": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 mb-1">{item.title}</div>
              <div className="text-orange-700 mb-1">{item.awarder}</div>
              <div className="text-xs text-orange-400 mb-1">{item.date}</div>
              {(item.summary || item.description) && (
                <div 
                  className="text-sm text-slate-600 prose prose-orange prose-sm max-w-none font-serif" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </div>
          )}
        </Section>
      );
    }
    case "certifications": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 mb-1">{item.name}</div>
              <div className="text-orange-700 mb-1">{item.issuer}</div>
              <div className="text-xs text-orange-400 mb-1">{item.date}</div>
              {(item.summary || item.description) && (
                <div 
                  className="text-sm text-slate-600 prose prose-orange prose-sm max-w-none font-serif" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </div>
          )}
        </Section>
      );
    }
    case "publications": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 mb-1">{item.name || item.title}</div>
              <div className="text-orange-700 mb-1">{item.publisher}</div>
              <div className="text-xs text-orange-400 mb-1">{item.date}</div>
              {item.url && (
                <a 
                  href={typeof item.url === 'string' ? item.url : item.url.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-orange-600 underline hover:text-orange-800 break-all mb-1 block"
                >
                  {typeof item.url === 'string' ? item.url : (item.url.label || item.url.href)}
                </a>
              )}
              {(item.summary || item.description) && (
                <div 
                  className="text-sm text-slate-600 prose prose-orange prose-sm max-w-none font-serif" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </div>
          )}
        </Section>
      );
    }
    case "volunteer": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 mb-1">{item.position || item.role}</div>
              <div className="text-orange-700 mb-1">{item.organization}</div>
              <div className="text-xs text-orange-400 mb-1">{item.date}</div>
              {(item.summary || item.description) && (
                <div 
                  className="text-sm text-slate-600 prose prose-orange prose-sm max-w-none font-serif" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </div>
          )}
        </Section>
      );
    }
    case "references": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 mb-1">{item.name}</div>
              {(item.summary || item.description) && (
                <div 
                  className="text-sm text-slate-600 prose prose-orange prose-sm max-w-none font-serif" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }} 
                />
              )}
            </div>
          )}
        </Section>
      );
    }
    default: {
      // Fallback: render any other section with a generic Section
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div className="text-sm text-slate-700 font-serif">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <strong className="text-slate-800">{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          )}
        </Section>
      );
    }
  }
};

export const Overleaf = ({ columns, isFirstPage = false, resumeData: resumeDataProp }: TemplateProps) => {
  const resumeDataFromStore = useArtboardStore((state) => state.resume);
  const resumeData = resumeDataProp ?? resumeDataFromStore;
  const [main, sidebar] = columns;
  return (
    <div className="bg-white text-slate-900 w-full max-w-[210mm] mx-auto min-h-screen flex flex-col shadow-lg rounded-lg overflow-hidden font-serif">
      {/* Header (full width, above columns) */}
      <div className="w-full">{isFirstPage && <Header resumeData={resumeData} />}</div>
      {/* Content Container - Always side by side */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-1/3 bg-orange-50 p-2 sm:p-3 md:p-4 flex flex-col gap-2 sm:gap-3 md:gap-4 border-r border-orange-300">
          {sidebar.map((section: string) => (
            <Fragment key={section}>
              {mapSectionToComponent(section, resumeData)}
            </Fragment>
          ))}
        </aside>
        {/* Main Content */}
        <main className="w-2/3 p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-3">
          {main.map((section: string) => (
            <Fragment key={section}>
              {mapSectionToComponent(section, resumeData)}
            </Fragment>
          ))}
        </main>
      </div>
    </div>
  );
};
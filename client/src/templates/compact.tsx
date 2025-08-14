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

// Icon map for section headers
const iconMap: Record<string, string> = {
  summary: "📄",
  experience: "💼",
  projects: "🚀",
  education: "🎓",
  skills: "⭐",
  languages: "🌍",
  interests: "❤️",
  
  references: "💬",
  profiles: "🌐",
};

// Enhanced Header Component
const Header = ({ resumeData }: { resumeData: any }) => {
  const basics = resumeData?.basics;
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-2 sm:p-3 md:p-4 lg:p-5 rounded-t-lg mb-2 sm:mb-3 md:mb-4">
      <div className="flex items-start justify-between gap-2 sm:gap-3 lg:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 leading-tight break-words">{basics?.name || "Alex Smith"}</h1>
          {basics?.headline && (
            <p className="text-emerald-100 text-xs sm:text-sm md:text-base lg:text-lg font-medium leading-tight break-words">
              {basics.headline}
            </p>
          )}
        </div>
        <div className="space-y-1 sm:space-y-1.5 flex-shrink-0">
          {basics?.email && (
            <div className="flex items-center gap-1 sm:gap-2 text-emerald-100">
              <span className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0">✉</span>
              <span className="text-xs sm:text-sm truncate min-w-0 max-w-[120px] sm:max-w-[150px] md:max-w-[200px]">{basics.email}</span>
            </div>
          )}
          {basics?.phone && (
            <div className="flex items-center gap-1 sm:gap-2 text-emerald-100">
              <span className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0">📞</span>
              <span className="text-xs sm:text-sm truncate min-w-0 max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">{basics.phone}</span>
            </div>
          )}
          {basics?.location && (
            <div className="flex items-center gap-1 sm:gap-2 text-emerald-100">
              <span className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0">📍</span>
              <span className="text-xs sm:text-sm truncate min-w-0 max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">{basics.location}</span>
            </div>
          )}
          {basics?.url?.href && (
            <div className="flex items-center gap-1 sm:gap-2 text-emerald-100">
              <span className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0">🌐</span>
              <a
                href={basics.url.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm underline hover:text-white truncate min-w-0 max-w-[100px] sm:max-w-[120px] md:max-w-[150px]"
              >
                {basics.url.href}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Section Title
const SectionTitle = ({ section }: { section: string }) => (
  <div className="flex items-center gap-2 mb-1 sm:mb-2 pb-1 border-b border-emerald-200">
    <span className="w-4 h-4 sm:w-5 sm:h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs sm:text-sm">{iconMap[section] || "📄"}</span>
    <h2 className="text-emerald-700 font-bold text-xs sm:text-sm uppercase tracking-wide">
      {section.charAt(0).toUpperCase() + section.slice(1)}
    </h2>
  </div>
);

// Generic Section Component
const Section = <T extends { visible?: boolean; id?: string }>({
  section,
  children,
  className,
}: {
  section: SectionWithItem<T> | CustomSectionGroup;
  children?: (item: T) => React.ReactNode;
  className?: string;
}) => {
  if (!section?.visible || !('items' in section) || section.items.length === 0) return null;

  const visibleItems = section.items.filter((item) =>
    typeof item.visible === 'undefined' ? true : item.visible
  );

  if (visibleItems.length === 0) return null;

  return (
    <section id={'id' in section ? section.id : section.name} className="mt-1">
      <div
        className={cn("grid gap-x-1 sm:gap-x-2 gap-y-1", className)}
        style={{ gridTemplateColumns: `repeat(${"columns" in section ? section.columns || 1 : 1}, 1fr)` }}
      >
        {visibleItems.map((item) => (
          <div
            key={item.id || Math.random()}
            className="relative space-y-1 border-l-2 border-green-200 pl-2"
          >
            {children?.(item as T)}
          </div>
        ))}
      </div>
    </section>
  );
};

// Map Section to Component
const mapSectionToComponent = (section: SectionKey, resumeData: any) => {
  const sec = resumeData?.sections?.[section];
  if (!sec) return null;

  switch (section) {
    case "summary":
      if (!sec?.visible || isEmptyString(sec?.content)) return null;
      return (
        <section key="summary" id={sec.id} className="mb-2 sm:mb-3">
          <div className="bg-gray-50 p-2 sm:p-3 rounded-lg border-l-4 border-emerald-500">
            <div
              className="text-gray-700 text-xs sm:text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitize(sec.content) }}
            />
          </div>
        </section>
      );

    case "profiles":
      if (!sec?.items?.length) return null;
      return (
        <section key="profiles" className="mb-2 sm:mb-3">
          <div className="space-y-1">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="flex items-center gap-2 bg-gray-50 p-1 sm:p-1.5 rounded-lg">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-100 rounded-full flex items-center justify-center text-xs">
                    {item.network === "LinkedIn" ? (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    ) : item.network === "GitHub" ? (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    )}
                  </span>
                  {item.url?.href ? (
                    <a
                      href={item.url.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 text-xs underline hover:text-emerald-800 truncate"
                    >
                      {item.username}
                    </a>
                  ) : (
                    <span className="text-gray-700 text-xs truncate">{item.username}</span>
                  )}
                </div>
              ))}
          </div>
        </section>
      );

    case "experience":
      if (!sec?.items?.length) return null;
      return (
        <section key="experience" className="mb-2 sm:mb-3">
          <div className="space-y-1.5 sm:space-y-2">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 mb-1.5">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base">{item.position}</h3>
                      <p className="text-emerald-600 font-medium text-xs sm:text-sm">{item.company}</p>
                      {item.location && <p className="text-gray-500 text-xs">{item.location}</p>}
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium self-start sm:self-auto">
                      {item.date}
                    </span>
                  </div>
                  {item.summary && (
                    <div 
                      className="text-gray-700 text-xs sm:text-sm leading-relaxed mt-1.5"
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary) }}
                    />
                  )}
                </div>
              ))}
          </div>
        </section>
      );

    case "projects":
      if (!sec?.items?.length) return null;
      return (
        <section key="projects" className="mb-1.5 sm:mb-2">
          <div className="space-y-1 sm:space-y-1.5">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-1.5 sm:p-2 shadow-sm">
                  <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">{item.name}</h3>
                    {item.url && (
                      <a 
                        href={typeof item.url === 'string' ? item.url : item.url.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
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
                      className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-1 sm:mb-1.5"
                      dangerouslySetInnerHTML={{ __html: sanitize(item.description.replace(/\b(20\d{2}|19\d{2})\b/g, '').replace(/\b\d{4}\b/g, '')) }}
                    />
                  )}
                  {item.summary && (
                    <div 
                      className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-1 sm:mb-1.5"
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary.replace(/\b(20\d{2}|19\d{2})\b/g, '').replace(/\b\d{4}\b/g, '')) }}
                    />
                  )}
                  {item.keywords && Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {item.keywords.map((tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-emerald-100 text-emerald-700 text-xs px-1 py-0.5 rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {item.technologies.map((tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-emerald-100 text-emerald-700 text-xs px-1 py-0.5 rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              ))}
          </div>
        </section>
      );

    case "education":
      if (!sec?.items?.length) return null;
      return (
        <section key="education" className="mb-3 sm:mb-4">
          <div className="space-y-2 sm:space-y-3">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-emerald-50 p-1.5 sm:p-2 rounded-lg border-l-3 border-emerald-400">
                  <h4 className="font-bold text-gray-800 text-xs sm:text-sm">
                    {item.studyType || item.degree} {item.area || item.field_of_study}
                  </h4>
                  <p className="text-emerald-600 text-xs font-medium">{item.institution || item.school}</p>
                  <p className="text-gray-500 text-xs">{item.date || item.graduationYear}</p>
                  {(item.score || item.gpa) && <p className="text-gray-600 text-xs mt-0.5">GPA: {item.score || item.gpa}</p>}
                  {item.location && <p className="text-gray-600 text-xs">{item.location}</p>}
                  {item.honors && <p className="text-gray-600 text-xs">{item.honors}</p>}
                </div>
              ))}
          </div>
        </section>
      );

    case "skills":
      if (!sec?.items?.length) return null;
      return (
        <section key="skills" className="mb-3 sm:mb-4">
          <div className="space-y-2 sm:space-y-3">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white p-1.5 sm:p-2 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-medium text-gray-800 text-xs sm:text-sm">{item.name}</span>
                  </div>
                  <div className="w-full rounded-full">
                    <div></div>
                  </div>
                  {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1.5">{item.keywords.join(", ")}</p>
                  )}
                </div>
              ))}
          </div>
        </section>
      );

    case "languages":
      return (
        <Section<any> section={sec} key="languages">
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 text-xs">{item.name}</div>
              {item.description && <div className="text-green-700 text-xs">{item.description}</div>}
            </div>
          )}
        </Section>
      );

    case "interests":
      return (
        <Section<any> section={sec} key="interests">
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 text-xs">{item.name}</div>
              {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                <div className="text-xs text-slate-600">{item.keywords.join(', ')}</div>
              )}
            </div>
          )}
        </Section>
      );

    case "awards":
      return (
        <Section<any> section={sec} key="awards">
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 text-xs">{item.title}</div>
              <div className="text-green-700 text-xs">{item.awarder}</div>
              <div className="text-xs text-green-400">{item.date}</div>
              {(item.summary || item.description) && (
                <div
                  className="text-xs text-slate-700 mt-0.5 wysiwyg"
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
                />
              )}
            </div>
          )}
        </Section>
      );

    case "certifications":
      return (
        <Section<any> section={sec} key="certifications">
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 text-xs">{item.name}</div>
              <div className="text-green-700 text-xs">{item.issuer}</div>
              <div className="text-xs text-green-400">{item.date}</div>
              {(item.summary || item.description) && (
                <div
                  className="text-xs text-slate-700 mt-0.5 wysiwyg"
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
                />
              )}
            </div>
          )}
        </Section>
      );

    case "publications":
      return (
        <Section<any> section={sec} key="publications">
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 text-xs">{item.name || item.title}</div>
              <div className="text-green-700 text-xs">{item.publisher}</div>
              <div className="text-xs text-green-400">{item.date}</div>
              {item.url && (
                <a
                  href={typeof item.url === 'string' ? item.url : item.url.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-[10px] sm:text-[11px] text-green-600 underline hover:text-green-800"
                >
                  {typeof item.url === 'string' ? item.url : (item.url.label || item.url.href)}
                </a>
              )}
              {(item.summary || item.description) && (
                <div
                  className="text-xs text-slate-700 mt-0.5 wysiwyg"
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
                />
              )}
            </div>
          )}
        </Section>
      );

    case "volunteer":
      return (
        <Section<any> section={sec} key="volunteer">
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 text-xs">{item.position || item.role}</div>
              <div className="text-green-700 text-xs">{item.organization}</div>
              <div className="text-xs text-green-400">{item.date}</div>
              {(item.summary || item.description) && (
                <div
                  className="text-xs text-slate-700 mt-0.5 wysiwyg"
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
                />
              )}
            </div>
          )}
        </Section>
      );

    case "references":
      return (
        <Section<any> section={sec} key="references">
          {(item) => (
            <div>
              <div className="text-xs text-slate-700">
                <strong className="text-slate-800">{item.name}</strong>
              </div>
              {(item.summary || item.description) && (
                <div
                  className="text-xs text-slate-700 mt-0.5 wysiwyg"
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
                />
              )}
            </div>
          )}
        </Section>
      );

    default:
      return (
        <Section<any> section={sec} key={section}>
          {(item) => (
            <div className="text-xs text-slate-700">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="mb-0.5">
                  <strong className="text-slate-800">{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          )}
        </Section>
      );
  }
};

// Main Template - Enhanced layout with modern design
export const Compact = ({ columns, isFirstPage = false, resumeData: resumeDataProp }: TemplateProps) => {
  const resumeDataFromStore = useArtboardStore((state) => state.resume);
  const resumeData = resumeDataProp ?? resumeDataFromStore;
  const [main = [], sidebar = []] = columns;

  // Define which sections should appear in which area
  const mainSections = ["summary", "experience", "projects", "awards", "publications", "volunteer", "references"];
  const sidebarSections = ["education", "skills", "languages", "certifications", "interests", "profiles"];

  // Get all available sections from resume data
  const availableSections = Object.keys(resumeData?.sections || {}).filter(section => {
    const sectionData = resumeData?.sections?.[section];
    if (!sectionData) return false;
    
    // Check if section is visible
    if (sectionData.visible === false) return false;
    
    // For sections with items, check if there are visible items
    if ('items' in sectionData && Array.isArray(sectionData.items)) {
      const visibleItems = sectionData.items.filter((item: any) => 
        item && typeof item.visible === 'undefined' ? true : item.visible !== false
      );
      return visibleItems.length > 0;
    }
    
    // For sections with content (like summary), check if content exists
    if ('content' in sectionData && sectionData.content) {
      return sectionData.content.trim().length > 0;
    }
    
    return false;
  });

  // Filter sections based on their designated areas
  const sidebarToRender = sidebar.length > 0 ? sidebar : sidebarSections.filter(section => 
    availableSections.includes(section)
  );
  
  const mainToRender = main.length > 0 ? main : mainSections.filter(section => 
    availableSections.includes(section)
  );

  return (
    <div className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl print:shadow-none print:w-full print:min-h-0 rounded-lg overflow-hidden">
      {isFirstPage && <Header resumeData={resumeData} />}

      <div className="px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 md:pb-4">
        <div className="flex gap-2 sm:gap-3 md:gap-4">
          {/* Sidebar */}
          <aside className="w-1/3 space-y-2 sm:space-y-3">
            {sidebarToRender.map((section: string) => (
              <Fragment key={section}>
                <SectionTitle section={section} />
                {mapSectionToComponent(section as SectionKey, resumeData)}
              </Fragment>
            ))}
          </aside>

          {/* Main Content */}
          <main className="w-2/3 space-y-1.5 sm:space-y-2">
            {mainToRender.map((section: string) => (
              <Fragment key={section}>
                <SectionTitle section={section} />
                {mapSectionToComponent(section as SectionKey, resumeData)}
              </Fragment>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
};
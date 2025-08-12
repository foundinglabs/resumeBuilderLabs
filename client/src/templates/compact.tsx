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
  summary: "👤",
  experience: "💼",
  projects: "🚀",
  education: "🎓",
  skills: "⭐",
  languages: "🌍",
  interests: "❤️",
  awards: "🏆",
  certifications: "📋",
  publications: "📰",
  volunteer: "🤝",
  references: "💬",
  profiles: "🌐",
};

// Enhanced Header Component
const Header = ({ resumeData }: { resumeData: any }) => {
  const basics = resumeData?.basics;
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-lg mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{basics?.name || "Alex Smith"}</h1>
          {basics?.headline && <p className="text-emerald-100 text-lg font-medium">{basics.headline}</p>}
        </div>
        <div className="mt-4 md:mt-0 space-y-2">
          {basics?.email && (
            <div className="flex items-center gap-2 text-emerald-100">
              <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">✉</span>
              <span className="text-sm">{basics.email}</span>
            </div>
          )}
          {basics?.phone && (
            <div className="flex items-center gap-2 text-emerald-100">
              <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">📞</span>
              <span className="text-sm">{basics.phone}</span>
            </div>
          )}
          {basics?.location && (
            <div className="flex items-center gap-2 text-emerald-100">
              <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">📍</span>
              <span className="text-sm">{basics.location}</span>
            </div>
          )}
          {basics?.url?.href && (
            <div className="flex items-center gap-2 text-emerald-100">
              <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">🌐</span>
              <a
                href={basics.url.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline hover:text-white"
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
  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-emerald-200">
    <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-sm">{iconMap[section] || "📄"}</span>
    <h2 className="text-emerald-700 font-bold text-sm uppercase tracking-wide">
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
    <section id={'id' in section ? section.id : section.name} className="mt-2">
      <div className="mb-1 font-bold text-green-700">
        <h4 className="text-sm">{section.name}</h4>
      </div>
      <div
        className={cn("grid gap-x-4 gap-y-2", className)}
        style={{ gridTemplateColumns: `repeat(${"columns" in section ? section.columns || 1 : 1}, 1fr)` }}
      >
        {visibleItems.map((item) => (
          <div
            key={item.id || Math.random()}
            className="relative space-y-1 border-l-2 border-green-200 pl-3"
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
        <section key="summary" id={sec.id} className="mb-4">
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-emerald-500">
            <div
              className="text-gray-700 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitize(sec.content) }}
            />
          </div>
        </section>
      );

    case "profiles":
      if (!sec?.items?.length) return null;
      return (
        <section key="profiles" className="mb-6">
          <div className="space-y-3">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                  <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs">
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
                      className="text-emerald-600 text-xs underline hover:text-emerald-800"
                    >
                      {item.username}
                    </a>
                  ) : (
                    <span className="text-gray-700 text-xs">{item.username}</span>
                  )}
                </div>
              ))}
          </div>
        </section>
      );

    case "experience":
      if (!sec?.items?.length) return null;
      return (
        <section key="experience" className="mb-4">
          <div className="space-y-3">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-base">{item.position}</h3>
                      <p className="text-emerald-600 font-medium text-sm">{item.company}</p>
                      {item.location && <p className="text-gray-500 text-xs">{item.location}</p>}
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                      {item.date}
                    </span>
                  </div>
                  {item.summary && (
                    <div 
                      className="text-gray-700 text-sm leading-relaxed mt-2"
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
        <section key="projects" className="mb-4">
          <div className="space-y-3">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
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
                      className="text-gray-700 text-sm leading-relaxed mb-3"
                      dangerouslySetInnerHTML={{ __html: sanitize(item.description.replace(/\b(20\d{2}|19\d{2})\b/g, '').replace(/\b\d{4}\b/g, '')) }}
                    />
                  )}
                  {item.summary && (
                    <div 
                      className="text-gray-700 text-sm leading-relaxed mb-3"
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary.replace(/\b(20\d{2}|19\d{2})\b/g, '').replace(/\b\d{4}\b/g, '')) }}
                    />
                  )}
                  {item.keywords && Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.keywords.map((tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.technologies.map((tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium"
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
        <section key="education" className="mb-6">
          <div className="space-y-4">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-emerald-50 p-3 rounded-lg border-l-3 border-emerald-400">
                  <h4 className="font-bold text-gray-800 text-sm">
                    {item.studyType || item.degree} {item.area || item.field_of_study}
                  </h4>
                  <p className="text-emerald-600 text-xs font-medium">{item.institution || item.school}</p>
                  <p className="text-gray-500 text-xs">{item.date || item.graduationYear}</p>
                  {(item.score || item.gpa) && <p className="text-gray-600 text-xs mt-1">GPA: {item.score || item.gpa}</p>}
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
        <section key="skills" className="mb-6">
          <div className="space-y-4">
            {sec.items
              .filter((item: any) => item?.visible !== false)
              .map((item: any) => (
                <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                    <span className="text-xs text-gray-500">Level {item.level || 3}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((item.level || 3) / 5) * 100}%` }}
                    ></div>
                  </div>
                  {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">{item.keywords.join(", ")}</p>
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
                  className="break-all text-[11px] text-green-600 underline hover:text-green-800"
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

  const mainSections = ["summary", "experience", "projects"];
  const sidebarSections = ["education", "skills", "languages", "certifications", "interests", "profiles"];

  return (
    <div className="w-full max-w-[794px] min-h-[1123px] mx-auto bg-white shadow-xl print:shadow-none print:w-full print:min-h-0 rounded-lg overflow-hidden">
      {isFirstPage && <Header resumeData={resumeData} />}

      <div className="px-6 pb-6">
        <div className="grid gap-6 grid-cols-3">
          {/* Sidebar */}
          <aside className="col-span-1 space-y-4">
            {(sidebar.length > 0 ? sidebar : sidebarSections).map((section: string) => (
              <Fragment key={section}>
                <SectionTitle section={section} />
                {mapSectionToComponent(section as SectionKey, resumeData)}
              </Fragment>
            ))}
          </aside>

          {/* Main Content */}
          <main className="col-span-2 space-y-3">
            {(main.length > 0 ? main : mainSections).map((section: string) => (
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
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

// Icon map for section headers
const iconMap: Record<string, string> = {
  summary: "ph-user",
  experience: "ph-briefcase",
  projects: "ph-code",
  education: "ph-student",
  skills: "ph-star",
  languages: "ph-globe",
  interests: "ph-heart",
  awards: "ph-trophy",
  certifications: "ph-clipboard-text",
  publications: "ph-newspaper",
  volunteer: "ph-hand-heart",
  references: "ph-chat-circle-text",
  profiles: "ph-globe",
};

// Header Component (Reduced padding)
const Header = ({ resumeData }: { resumeData: any }) => {
  const basics = resumeData?.basics;
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 border-b border-green-200 mb-4">
      <div className="text-xl md:text-2xl font-bold text-green-800">{basics?.name || "Alex Smith"}</div>
      <div className="flex flex-wrap gap-x-3 mt-1 text-green-600 text-sm md:mt-0">
        {basics?.email && (
          <span className="flex items-center gap-1">
            <i className="ph ph-bold ph-at" />
            <span>{basics.email}</span>
          </span>
        )}
        {basics?.phone && (
          <span className="flex items-center gap-1">
            <i className="ph ph-bold ph-phone" />
            <span>{basics.phone}</span>
          </span>
        )}
        {basics?.location && (
          <span className="flex items-center gap-1">
            <i className="ph ph-bold ph-map-pin" />
            <span>{basics.location}</span>
          </span>
        )}
        {basics?.url?.href && (
          <span className="flex items-center gap-1">
            <i className="ph ph-bold ph-link" />
            <a href={basics.url.href} target="_blank" rel="noopener noreferrer" className="underline">
              {basics.url.label || basics.url.href}
            </a>
          </span>
        )}
      </div>
    </div>
  );
};

// Section Title with Icon
const SectionTitle = ({ section }: { section: string }) => (
  <h2 className="text-green-700 font-semibold text-xs md:text-sm uppercase mb-2 mt-4 flex items-center gap-1">
    {iconMap[section] && <i className={cn(`ph ph-bold ${iconMap[section]}`, "text-green-600 text-xs")} />}
    {section.charAt(0).toUpperCase() + section.slice(1)}
  </h2>
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
        <section key="summary" id={sec.id} className="mt-2">
          <div className="mb-1 font-bold text-green-700">
            <h4 className="text-sm">{sec.name}</h4>
          </div>
          <div
            className="prose prose-green max-w-none text-xs text-slate-700"
            dangerouslySetInnerHTML={{ __html: sanitize(sec.content) }}
          />
        </section>
      );

    case "profiles":
      return (
        <div key="profiles" className="mt-2">
          <div className="mb-1 font-bold text-green-700">
            <h4 className="text-sm">{sec.name}</h4>
          </div>
          <ul className="flex flex-wrap gap-2 text-xs">
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

    case "experience":
      return (
        <Section<any> section={sec} key="experience">
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 text-xs sm:text-sm">{item.position || item.title}</div>
              <div className="text-green-700 text-xs">{item.company}{item.location && ` (${item.location})`}</div>
              <div className="text-xs text-green-400">{item.date || [item.startDate, item.endDate].filter(Boolean).join(' - ')}</div>
              {item.summary && (
                <div
                  className="text-xs text-slate-700 mt-0.5 wysiwyg"
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary) }}
                />
              )}
            </div>
          )}
        </Section>
      );

    case "projects":
      return (
        <Section<any> section={sec} key="projects">
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 text-xs sm:text-sm">{item.name}</div>
              {item.description && (
                <div
                  className="text-xs text-slate-700 mt-0.5 wysiwyg"
                  dangerouslySetInnerHTML={{ __html: sanitize(item.description) }}
                />
              )}
              {item.summary && (
                <div
                  className="text-xs text-slate-700 mt-0.5 wysiwyg"
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary) }}
                />
              )}
              {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.technologies.map((tech: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-block bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-green-400 mt-0.5">{item.date}</div>
              {item.url && (
                <a
                  href={typeof item.url === 'string' ? item.url : item.url.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-[11px] text-green-600 underline hover:text-green-800"
                >
                  {typeof item.url === 'string'
                    ? item.url
                    : item.url.label || item.url.href}
                </a>
              )}
            </div>
          )}
        </Section>
      );

    case "education":
      return (
        <Section<any> section={sec} key="education">
          {(item) => (
            <div>
              <div className="font-bold text-slate-800 text-xs sm:text-sm">
                {item.studyType || item.degree}{(item.area || item.field_of_study) && `, ${item.area || item.field_of_study}`}
              </div>
              <div className="text-green-700 text-xs">{item.institution || item.school}</div>
              <div className="text-xs text-green-400">{item.date || item.graduationYear}</div>
              {(item.score || item.gpa) && <div className="text-xs text-slate-600">GPA: {item.score || item.gpa}</div>}
              {item.location && <div className="text-xs text-slate-600">{item.location}</div>}
              {item.honors && <div className="text-xs text-slate-600">{item.honors}</div>}
            </div>
          )}
        </Section>
      );

    case "skills":
      return (
        <div key="skills" className="mt-2">
          <div className="mb-1 font-bold text-green-700">
            <h4 className="text-sm">{sec.name}</h4>
          </div>
          <div className="flex flex-col gap-1.5">
            {sec.items
              .filter((item: any) => item.visible !== false)
              .map((item: any) => (
                <div key={item.id || Math.random()} className="flex flex-wrap items-baseline gap-1.5">
                  <span
                    className="inline-block bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded"
                  >
                    {item.name}
                  </span>
                  {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <span className="text-[11px] text-slate-600">
                      {item.keywords.join(', ')}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
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

// Main Template - Support two-column layout
export const Compact = ({ columns, isFirstPage = false, resumeData: resumeDataProp }: TemplateProps) => {
  const resumeDataFromStore = useArtboardStore((state) => state.resume);
  const resumeData = resumeDataProp ?? resumeDataFromStore;
  const [main = [], sidebar = []] = columns;

  return (
    <div className="bg-white text-slate-900 w-full max-w-4xl mx-auto p-3 md:p-4 print:p-3">
      {isFirstPage && <Header resumeData={resumeData} />}
      <div className={cn("grid gap-4", sidebar.length > 0 ? "grid-cols-3" : "grid-cols-1")}> 
        {sidebar.length > 0 && (
          <aside className="col-span-1">
            {sidebar.map((section: SectionKey) => (
              <Fragment key={section}>
                <SectionTitle section={section as string} />
                {mapSectionToComponent(section, resumeData)}
              </Fragment>
            ))}
          </aside>
        )}
        <main className={cn(sidebar.length > 0 ? "col-span-2" : "col-span-1", "space-y-3")}> 
          {main.map((section: SectionKey) => (
            <Fragment key={section}>
              <SectionTitle section={section as string} />
              {mapSectionToComponent(section, resumeData)}
            </Fragment>
          ))}
        </main>
      </div>
    </div>
  );
};
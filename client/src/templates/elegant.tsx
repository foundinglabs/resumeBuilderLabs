import React, { Fragment } from "react";
import { BrandIcon } from "../components/brand-icon";
import { Picture } from "../components/picture";
import { useArtboardStore } from "../store/artboard-store";
import type { TemplateProps } from "../types/template";
import type {
  Award,
  Certification,
  CustomSection,
  CustomSectionGroup,
  Interest,
  Language,
  Profile,
  Project,
  Publication,
  Reference,
  SectionKey,
  SectionWithItem,
  Skill,
  Volunteer,
  URL,
} from "../utils/reactive-resume-schema";
import { cn, isEmptyString, isUrl, linearTransform, sanitize } from "../utils/reactive-resume-utils";

const Header = () => {
  const basics = useArtboardStore((state) => state?.resume?.basics);
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-10 bg-white">
      <Picture />
      <div className="text-2xl md:text-3xl font-bold text-purple-800 mb-2 text-center">{basics?.name || "Taylor Morgan"}</div>
      <div className="flex flex-wrap justify-center gap-x-4 mt-2 text-purple-400 text-sm">
        {basics?.email && <span className="flex items-center gap-1"><i className="ph ph-at" /> {basics.email}</span>}
        {basics?.phone && <span className="flex items-center gap-1"><i className="ph ph-phone" /> {basics.phone}</span>}
        {basics?.location && <span className="flex items-center gap-1"><i className="ph ph-map-pin" /> {basics.location}</span>}
      </div>
    </div>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="tracking-widest text-xs md:text-sm font-semibold text-purple-700 mb-3 mt-6 md:mt-8">{children}</h2>
);

// Section rendering logic (similar to Azurill)
const Section = <T extends { visible?: boolean; id?: string }>(
  {
    section,
    children,
    className,
    urlKey,
    levelKey,
    summaryKey,
    keywordsKey,
  }: {
    section: SectionWithItem<T> | CustomSectionGroup;
    children?: (item: T) => React.ReactNode;
    className?: string;
    urlKey?: keyof T;
    levelKey?: keyof T;
    summaryKey?: keyof T;
    keywordsKey?: keyof T;
  }
) => {
  if (!section?.visible || !('items' in section) || section.items.length === 0) return null;
  
  const visibleItems = section.items.filter((item) => 
    typeof item.visible === 'undefined' ? true : item.visible
  );
  
  if (visibleItems.length === 0) return null;

  return (
    <section id={'id' in section ? section.id : section.name} className="grid">
      <div className="mb-2 font-bold text-purple-700">
        <h4 className="text-lg">{section.name}</h4>
      </div>
      <div className={cn("grid gap-x-4 md:gap-x-6 gap-y-3", className)} style={{ gridTemplateColumns: `repeat(${'columns' in section ? section.columns : 1}, 1fr)` }}>
        {visibleItems.map((item) => (
          <div key={item.id || Math.random()} className="relative space-y-2 border-purple-200 border-l-2 pl-4">
            <div>{children?.(item as T)}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

const mapSectionToComponent = (section: string) => {
  const resumeData = useArtboardStore((state) => state.resume);
  const sec = resumeData?.sections?.[section];
  if (!sec) return null;
  
  switch (section) {
    case "profiles": {
      return (
        <Section<Profile> section={sec}>
          {(item) => (
            <div>
              {isUrl(item.url?.href || "") ? (
                <a href={item.url?.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-purple-800">
                  <BrandIcon slug={item.icon || "globe"} /> {item.username}
                </a>
              ) : (
                <span>{item.username}</span>
              )}
              {!item.icon && <span className="text-xs text-purple-400">{item.network}</span>}
            </div>
          )}
        </Section>
      );
    }
    case "summary": {
      if (!sec?.visible || isEmptyString(sec?.content)) return null;
      return (
        <section id={sec.id} className="mb-6">
          <div className="mb-2 font-bold text-purple-700">
            <h4 className="text-lg">{sec.name}</h4>
          </div>
          <div 
            className="prose prose-purple max-w-none text-gray-700" 
            dangerouslySetInnerHTML={{ __html: sanitize(sec.content) }} 
          />
        </section>
      );
    }
    case "experience": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-gray-800">{item.position}</div>
              <div className="text-purple-700">{item.company}{item.location && ` (${item.location})`}</div>
              <div className="text-xs text-purple-400">{item.date}</div>
              {item.summary && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-purple prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary) }} 
                />
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
              <div className="font-bold text-gray-800">
                {item.degree}{item.field_of_study && `, ${item.field_of_study}`}
              </div>
              <div className="text-purple-700">{item.school}</div>
              <div className="text-xs text-purple-400">{item.graduationYear}</div>
              {item.gpa && <div className="text-xs text-gray-600">GPA: {item.gpa}</div>}
              {item.location && <div className="text-xs text-gray-600">{item.location}</div>}
              {item.honors && <div className="text-xs text-gray-600">{item.honors}</div>}
            </div>
          )}
        </Section>
      );
    }
    case "skills": {
      return (
        <div className="mb-6">
          <div className="mb-2 font-bold text-purple-700">
            <h4 className="text-lg">{sec.name}</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {sec.items
              .filter((item: any) => item.visible !== false)
              .map((item: any) => (
                <div key={item.id || Math.random()} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <div>
                    <div className="font-medium text-gray-800">{item.name}</div>
                    {item.description && <div className="text-sm text-gray-600">{item.description}</div>}
                  </div>
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
              <div className="font-bold text-gray-800">{item.name}</div>
              {item.level && <div className="text-purple-700 text-sm">{item.level}</div>}
              {item.description && <div className="text-sm text-gray-600">{item.description}</div>}
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
              <div className="font-bold text-gray-800">{item.name}</div>
              {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                <div className="text-sm text-gray-600">
                  {item.keywords.join(', ')}
                </div>
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
              <div className="font-bold text-gray-800">{item.name}</div>
              {item.description && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-purple prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} 
                />
              )}
              {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.technologies.map((tech: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-block bg-purple-100 text-purple-800 text-[10px] font-medium px-2 py-0.5 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-purple-400 mt-1">{item.date}</div>
              {item.url && (
                <a 
                  href={typeof item.url === 'string' ? item.url : item.url.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 underline hover:text-purple-800 break-all"
                >
                  {typeof item.url === 'string' ? item.url : (item.url.label || item.url.href)}
                </a>
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
              <div className="font-bold text-gray-800">{item.title}</div>
              <div className="text-purple-700">{item.awarder}</div>
              <div className="text-xs text-purple-400">{item.date}</div>
              {item.description && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-purple prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} 
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
              <div className="font-bold text-gray-800">{item.name}</div>
              <div className="text-purple-700">{item.issuer}</div>
              <div className="text-xs text-purple-400">{item.date}</div>
              {item.description && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-purple prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} 
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
              <div className="font-bold text-gray-800">{item.title}</div>
              <div className="text-purple-700">{item.publisher}</div>
              <div className="text-xs text-purple-400">{item.date}</div>
              {item.link && (
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 underline hover:text-purple-800 break-all"
                >
                  {item.link}
                </a>
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
              <div className="font-bold text-gray-800">{item.role}</div>
              <div className="text-purple-700">{item.organization}</div>
              <div className="text-xs text-purple-400">{item.date}</div>
              {item.description && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-purple prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} 
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
              <div className="font-bold text-gray-800">{item.name}</div>
              <div className="text-purple-700">{item.reference}</div>
              {item.description && (
                <div 
                  className="text-sm text-gray-600 mt-1 prose prose-purple prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} 
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
            <div className="text-sm text-gray-700">
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

export const Elegant = ({ columns, isFirstPage = false }: TemplateProps) => {
  const [main, sidebar] = columns;
  return (
    <div className="bg-white text-gray-700 w-full max-w-5xl mx-auto min-h-screen grid grid-cols-1 md:grid-cols-3 gap-0 shadow-lg rounded-2xl overflow-hidden">
      {/* Header (full width, above columns) */}
      <div className="col-span-full">{isFirstPage && <Header />}</div>
      {/* Sidebar */}
      <aside className="md:col-span-1 bg-purple-50 p-6 md:p-8 flex flex-col gap-6 md:gap-8">
        {sidebar.map((section: string) => (
          <Fragment key={section}>
            <SectionTitle>{section.charAt(0).toUpperCase() + section.slice(1)}</SectionTitle>
            {mapSectionToComponent(section)}
          </Fragment>
        ))}
      </aside>
      {/* Main Content */}
      <main className="md:col-span-2 p-6 md:p-10">
        {main.map((section: string) => (
          <Fragment key={section}>
            <SectionTitle>{section.charAt(0).toUpperCase() + section.slice(1)}</SectionTitle>
            {mapSectionToComponent(section)}
          </Fragment>
        ))}
      </main>
    </div>
  );
};
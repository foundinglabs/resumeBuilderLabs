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
  URL,
} from "../utils/reactive-resume-schema";
import {
  Education as EducationType,
  Experience as ExperienceType,
  Volunteer as VolunteerType,
} from "../utils/reactive-resume-schema";
import { cn, isEmptyString, isUrl, sanitize } from "../utils/reactive-resume-utils";
import get from "lodash.get";
import React, { Fragment } from "react";
import { BrandIcon } from "../components/brand-icon";
import { Picture } from "../components/picture";
import { useArtboardStore } from "../store/artboard-store";
import type { TemplateProps } from "../types/template";

// Header Component - Original Chikorita Design
const Header = () => {
  const basics = useArtboardStore((state) => state.resume.basics);
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 border-b border-green-200 mb-3">
      <div className="text-xl md:text-2xl font-bold text-green-800">{basics?.name || "Alex Smith"}</div>
      <div className="flex flex-wrap gap-x-3 mt-1 text-green-600 text-sm md:mt-0">
        {basics?.email && (
          <span className="flex items-center gap-1">
            <i className="ph ph-at" />
            <span>{basics.email}</span>
          </span>
        )}
        {basics?.phone && (
          <span className="flex items-center gap-1">
            <i className="ph ph-phone" />
            <span>{basics.phone}</span>
          </span>
        )}
        {basics?.location && (
          <span className="flex items-center gap-1">
            <i className="ph ph-map-pin" />
            <span>{basics.location}</span>
          </span>
        )}
        {basics.url && (
          <span className="flex items-center gap-1">
            <i className="ph ph-link" />
            <a href={basics.url.href} target="_blank" rel="noreferrer noopener nofollow">
              {basics.url.label || basics.url.href}
            </a>
          </span>
        )}
      </div>
    </div>
  );
};

// Summary Section
const Summary = () => {
  const section = useArtboardStore((state) => state.resume.sections.summary);
  if (!section?.visible || isEmptyString(section.content)) return null;
  return (
    <section id={section.id} className="scroll-mt-8">
      <h4 className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold uppercase text-green-700">
        {section.name}
      </h4>
      <div
        className="wysiwyg text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitize(section.content) }}
        style={{ columns: section.columns || 1 }}
      />
    </section>
  );
};

// Rating Component
type RatingProps = { level: number };
const Rating = ({ level }: RatingProps) => (
  <div className="flex items-center gap-x-1.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "size-2 rounded-full border border-green-500",
          level > i ? "bg-green-500" : "bg-transparent"
        )}
      />
    ))}
  </div>
);

// Link Component
type LinkProps = {
  url: URL;
  icon?: React.ReactNode;
  iconOnRight?: boolean;
  label?: string;
  className?: string;
};
const Link = ({ url, icon, iconOnRight, label, className }: LinkProps) => {
  if (!url || !isUrl(url.href)) return null;
  return (
    <div className="flex items-center gap-x-1.5">
      {!iconOnRight && (icon ?? <i className="ph ph-bold ph-link text-green-600" />)}
      <a
        href={url.href}
        target="_blank"
        rel="noreferrer noopener nofollow"
        className={cn("transition-colors hover:text-green-600", className)}
      >
        {label ?? (url.label || url.href)}
      </a>
      {iconOnRight && (icon ?? <i className="ph ph-bold ph-link text-green-600" />)}
    </div>
  );
};

// Linked Entity Component
type LinkedEntityProps = {
  name: string;
  url: URL;
  separateLinks: boolean;
  className?: string;
};
const LinkedEntity = ({ name, url, separateLinks, className }: LinkedEntityProps) => {
  if (!url || !isUrl(url.href)) return <span className={className}>{name}</span>;

  if (separateLinks) {
    return (
      <div className="flex items-center gap-x-1.5">
        <span className={className}>{name}</span>
        <Link url={url} />
      </div>
    );
  }

  return (
    <a
      href={url.href}
      target="_blank"
      rel="noreferrer noopener nofollow"
      className={cn("transition-colors hover:text-green-600", className)}
    >
      {name}
    </a>
  );
};

// Section Component - Original Chikorita Design
type SectionProps<T> = {
  section: SectionWithItem<T> | CustomSectionGroup;
  children?: (item: T) => React.ReactNode;
  className?: string;
  urlKey?: keyof T;
  levelKey?: keyof T;
  summaryKey?: keyof T;
  keywordsKey?: keyof T;
};
const Section = <T extends { id: string; visible: boolean }>({
  section,
  children,
  className,
  urlKey,
  levelKey,
  summaryKey,
  keywordsKey,
}: SectionProps<T>) => {
  if (!section.visible || !("items" in section) || section.items.length === 0) return null;

  const visibleItems = section.items.filter((item) =>
    typeof item.visible === 'undefined' ? true : item.visible
  );

  if (visibleItems.length === 0) return null;

  return (
    <section id={section.id} className="scroll-mt-8">
      <h4 className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold uppercase text-green-700">
        {section.name}
      </h4>
      <div
        className="grid gap-x-6 gap-y-4"
        style={{ gridTemplateColumns: `repeat(${section.columns || 1}, 1fr)` }}
      >
        {visibleItems.map((item) => {
          const url = urlKey ? (get(item, urlKey) as URL) : undefined;
          const level = levelKey ? (get(item, levelKey, 0) as number) : undefined;
          const summary = summaryKey ? (get(item, summaryKey, "") as string) : undefined;
          const keywords = keywordsKey ? (get(item, keywordsKey, []) as string[]) : undefined;

          return (
            <div key={item.id} className="relative space-y-2 border-l-2 border-green-200 pl-4">
              <div>{children?.(item as T)}</div>

              {summary && !isEmptyString(summary) && (
                <div
                  className="wysiwyg text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: sanitize(summary) }}
                />
              )}

              {level !== undefined && level > 0 && <Rating level={level} />}

              {Array.isArray(keywords) && keywords.length > 0 && (
                <p className="text-sm text-gray-600">{keywords.join(", ")}</p>
              )}

              {url && section.separateLinks && (
                <Link url={url} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

// Experience Section
const Experience = () => {
  const section = useArtboardStore((state) => state.resume.sections.experience);
  return (
    <Section<ExperienceType>
      section={section}
      urlKey="url"
      summaryKey="summary"
      keywordsKey="keywords"
    >
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <LinkedEntity
              name={item.company}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold"
            />
            <div>{item.position}</div>
            <div>{item.description}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-bold">{item.date}</div>
            <div>{item.location}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

// Education Section
const Education = () => {
  const section = useArtboardStore((state) => state.resume.sections.education);
  return (
    <Section<EducationType>
      section={section}
      urlKey="url"
      summaryKey="summary"
      keywordsKey="keywords"
    >
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <LinkedEntity
              name={item.institution}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold"
            />
            <div>{item.degree}</div>
            <div>{item.description}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-bold">{item.date}</div>
            <div>{item.location}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

// Profiles Section
const Profiles = () => {
  const section = useArtboardStore((state) => state.resume.sections.profiles);

  return (
    <Section<Profile> section={section}>
      {(item) => (
        <div>
          {isUrl(item.url.href) ? (
            <a 
              href={item.url.href} 
              target="_blank" 
              rel="noreferrer noopener nofollow"
              className="flex items-center gap-2 hover:underline"
            >
              <BrandIcon slug={item.network} />
              <span>{item.username}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2">
              <BrandIcon slug={item.network} />
              <span>{item.username}</span>
            </div>
          )}
          {!item.network && <p className="text-sm">{item.network}</p>}
        </div>
      )}
    </Section>
  );
};

// Skills Section
const Skills = () => {
  const section = useArtboardStore((state) => state.resume.sections.skills);
  return (
    <Section<Skill> section={section} levelKey="level" keywordsKey="keywords">
      {(item) => (
        <div>
          <div className="font-bold">{item.name}</div>
          {item.level && <Rating level={item.level} />}
        </div>
      )}
    </Section>
  );
};

// Awards Section
const Awards = () => {
  const section = useArtboardStore((state) => state.resume.sections.awards);
  return (
    <Section<Award> section={section} urlKey="url" summaryKey="summary" keywordsKey="keywords">
      {(item) => (
        <div>
          <div className="font-bold">{item.title}</div>
          <div>{item.awarder}</div>
          <div>{item.description}</div>
        </div>
      )}
    </Section>
  );
};

// Certifications Section
const Certifications = () => {
  const section = useArtboardStore((state) => state.resume.sections.certifications);
  return (
    <Section<Certification> section={section} urlKey="url" summaryKey="summary" keywordsKey="keywords">
      {(item) => (
        <div>
          <div className="font-bold">{item.name}</div>
          <div>{item.issuer}</div>
          <div>{item.description}</div>
        </div>
      )}
    </Section>
  );
};

// Publications Section
const Publications = () => {
  const section = useArtboardStore((state) => state.resume.sections.publications);
  return (
    <Section<Publication> section={section} urlKey="url" summaryKey="summary" keywordsKey="keywords">
      {(item) => (
        <div>
          <div className="font-bold">{item.name}</div>
          <div>{item.publisher}</div>
          <div>{item.description}</div>
        </div>
      )}
    </Section>
  );
};

// Volunteer Section
const Volunteer = () => {
  const section = useArtboardStore((state) => state.resume.sections.volunteer);
  return (
    <Section<VolunteerType>
      section={section}
      urlKey="url"
      summaryKey="summary"
      keywordsKey="keywords"
    >
      {(item) => (
        <div className="flex items-start justify-between">
          <div className="text-left">
            <LinkedEntity
              name={item.organization}
              url={item.url}
              separateLinks={section.separateLinks}
              className="font-bold"
            />
            <div>{item.position}</div>
            <div>{item.description}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-bold">{item.date}</div>
            <div>{item.location}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

// Languages Section
const Languages = () => {
  const section = useArtboardStore((state) => state.resume.sections.languages);
  return (
    <Section<Language> section={section} levelKey="level">
      {(item) => (
        <div>
          <div className="font-bold">{item.name}</div>
          {item.level && <Rating level={item.level} />}
        </div>
      )}
    </Section>
  );
};

const isGitHubUrl = (url: string | URL | undefined): boolean => {
  if (!url) return false;
  const urlString = typeof url === 'string' ? url : url.href;
  if (typeof urlString !== 'string') return false;
  return urlString.toLowerCase().includes('github.com');
};

const isLiveUrl = (url: string | URL | undefined): boolean => {
  if (!url) return false;
  const urlString = typeof url === 'string' ? url : url.href;
  if (typeof urlString !== 'string') return false;
  return !isGitHubUrl(urlString) && (urlString.toLowerCase().includes('http://') || urlString.toLowerCase().includes('https://'));
};

// Projects Section
const Projects = () => {
  const section = useArtboardStore((state) => state.resume.sections.projects);

  return (
    <Section<Project> section={section} urlKey="url" summaryKey="summary" keywordsKey="keywords">
      {(item) => (
        <div className="relative space-y-2 border-l-2 border-green-200 pl-4">
          <div className="font-bold text-green-800">{item.name}</div>
          <div className="text-gray-700">{item.description}</div>
          {item.url && (
            <div className="flex items-center gap-2 mt-2">
              {isGitHubUrl(item.url) ? (
                <a
                  href={item.url.href}
                  target="_blank"
                  rel="noreferrer noopener nofollow"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700"
                >
                  <BrandIcon slug="github" />
                  <span>GitHub</span>
                </a>
              ) : isLiveUrl(item.url) ? (
                <a
                  href={item.url.href}
                  target="_blank"
                  rel="noreferrer noopener nofollow"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700"
                >
                  <i className="ph ph-bold ph-globe" />
                  <span>Live</span>
                </a>
              ) : null}
            </div>
          )}
        </div>
      )}
    </Section>
  );
};

// Interests Section
const Interests = () => {
  const section = useArtboardStore((state) => state.resume.sections.interests);
  return (
    <Section<Interest> section={section} keywordsKey="keywords">
      {(item) => (
        <div>
          <div className="font-bold">{item.name}</div>
          {Array.isArray(item.keywords) && item.keywords.length > 0 && (
            <p className="text-sm text-gray-600">{item.keywords.join(", ")}</p>
          )}
        </div>
      )}
    </Section>
  );
};

// References Section
const References = () => {
  const section = useArtboardStore((state) => state.resume.sections.references);
  return (
    <Section<Reference> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div>
          <div className="font-bold">{item.name}</div>
          <div className="text-sm">{item.description}</div>
        </div>
      )}
    </Section>
  );
};

// Custom Section
const Custom = ({ id }: { id: string }) => {
  const section = useArtboardStore((state) => state.resume.sections.custom?.[id]);
  return (
    <Section<CustomSection>
      section={section}
      urlKey="url"
      summaryKey="summary"
      keywordsKey="keywords"
    >
      {(item) => (
        <div>
          <div className="font-bold">{item.name}</div>
          <div className="text-sm">{item.description}</div>
          <div className="text-xs font-bold">{item.date}</div>
          <div className="text-xs">{item.location}</div>
        </div>
      )}
    </Section>
  );
};

// Map section to component
const mapSectionToComponent = (section: SectionKey) => {
  switch (section) {
    case "profiles": return <Profiles key="profiles" />;
    case "summary": return <Summary key="summary" />;
    case "experience": return <Experience key="experience" />;
    case "education": return <Education key="education" />;
    case "awards": return <Awards key="awards" />;
    case "certifications": return <Certifications key="certifications" />;
    case "skills": return <Skills key="skills" />;
    case "interests": return <Interests key="interests" />;
    case "publications": return <Publications key="publications" />;
    case "volunteer": return <Volunteer key="volunteer" />;
    case "languages": return <Languages key="languages" />;
    case "projects": return <Projects key="projects" />;
    case "references": return <References key="references" />;
    default:
      if (section.startsWith("custom.")) {
        const id = section.split(".")[1];
        return <Custom id={id} key={id} />;
      }
      return null;
  }
};

// Main Template — Original Chikorita Design
export const Chikorita = ({ columns, isFirstPage = false }: TemplateProps) => {
  const [main, sidebar] = columns;

  return (
    <div
      className="chikorita-theme w-full"
      style={{
        fontFamily: 'Merriweather, Georgia, Arial, serif',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      {isFirstPage && <Header />}

      {/* Responsive Layout: Main (Left), Sidebar (Right) */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Main Content */}
        <main className="flex-1">
          <div className="space-y-6">
            {main.map((section) => (
              <Fragment key={section}>
                {mapSectionToComponent(section)}
              </Fragment>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        {sidebar.length > 0 && (
          <aside className="lg:w-1/3">
            <div className="space-y-6">
              {sidebar.map((section) => (
                <Fragment key={section}>{mapSectionToComponent(section)}</Fragment>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
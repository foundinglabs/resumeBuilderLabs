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
  CustomField,
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

const Header = () => {
  const basics = useArtboardStore((state) => state.resume.basics);

  // Ditto Theme: Creative Purple/Violet
  const themeColors = {
    primary: '#7c3aed', // Violet 600
    primaryLight: '#8b5cf6', // Violet 500
    primaryDark: '#6d28d9', // Violet 700
    accent: '#f5f3ff', // Violet 50
    border: '#e4d4fd', // Violet 200
    muted: '#6b7280' // Gray 500
  };

  return (
    <div 
      className="relative grid grid-cols-3 gap-6 p-8 mb-8 rounded-lg shadow-lg overflow-hidden"
      style={{ backgroundColor: themeColors.primary }}
    >
      {/* Background decoration */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          background: `linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)`
        }}
      />
      
      <div className="relative z-10">
        <Picture className="mx-auto border-4 border-white shadow-lg" />
      </div>

      <div className="relative z-10 col-span-2 text-white">
        <div className="space-y-2 mb-6">
          <h2 className="text-4xl font-bold text-white">{basics.name}</h2>
          <p className="text-xl text-white opacity-90 font-medium">{basics.headline}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {basics.location && (
            <>
              <div className="flex items-center gap-x-2">
                <i className="ph ph-bold ph-map-pin text-white" />
                <span className="text-white">{basics.location}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white opacity-60" />
            </>
          )}

          {basics.phone && (
            <>
              <div className="flex items-center gap-x-2">
                <i className="ph ph-bold ph-phone text-white" />
                <a href={`tel:${basics.phone}`} target="_blank" rel="noreferrer" className="text-white hover:text-white visited:text-white no-underline transition-opacity" style={{color: 'white !important'}}>
                  {basics.phone}
                </a>
              </div>
              <div className="w-1 h-1 rounded-full bg-white opacity-60" />
            </>
          )}
          
          {basics.email && (
            <>
              <div className="flex items-center gap-x-2">
                <i className="ph ph-bold ph-at text-white" />
                <a href={`mailto:${basics.email}`} target="_blank" rel="noreferrer" className="text-white hover:text-white visited:text-white no-underline transition-opacity" style={{color: 'white !important'}}>
                  {basics.email}
                </a>
              </div>
              <div className="w-1 h-1 rounded-full bg-white opacity-60" />
            </>
          )}
          
          {basics.url && isUrl(basics.url.href) && (
            <>
              <Link url={basics.url} />
              <div className="w-1 h-1 rounded-full bg-white opacity-60" />
            </>
          )}
          
          {basics.customFields && basics.customFields.map((item: CustomField) => (
            <Fragment key={item.id}>
              <div className="flex items-center gap-x-2">
                <i className={cn(`ph ph-bold ph-${item.icon}`, "text-white")} />
                {isUrl(item.value) ? (
                  <a href={item.value} target="_blank" rel="noreferrer noopener nofollow" className="text-white hover:opacity-80 transition-opacity">
                    {item.name || item.value}
                  </a>
                ) : (
                  <span className="text-white">{[item.name, item.value].filter(Boolean).join(": ")}</span>
                )}
              </div>
              <div className="w-1 h-1 rounded-full bg-white opacity-60" />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const Summary = () => {
  const section = useArtboardStore((state) => state.resume.sections.summary);

  if (!section.visible || isEmptyString(section.content)) return null;

  return (
    <section id={section.id} className="mb-8">
      <h4 className="section-header-modern text-primary mb-4">{section.name}</h4>

      <div
        dangerouslySetInnerHTML={{ __html: sanitize(section.content) }}
        style={{ columns: section.columns }}
        className="wysiwyg text-foreground leading-relaxed"
      />
    </section>
  );
};

type RatingProps = { level: number };

const Rating = ({ level }: RatingProps) => (
  <div className="flex items-center gap-x-1.5 mt-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className={cn(
          "h-3 w-6 border-2 border-primary rounded transition-colors",
          level > index ? "bg-primary" : "bg-transparent"
        )}
      />
    ))}
  </div>
);

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
    <div className="flex items-center gap-x-2">
      {!iconOnRight && (icon ?? <i className="ph ph-bold ph-link text-white" />)}
      <a
        href={url.href}
        target="_blank"
        rel="noreferrer noopener nofollow"
        className={cn("text-white hover:opacity-80 transition-opacity", className)}
      >
        {label ?? (url.label || url.href)}
      </a>
      {iconOnRight && (icon ?? <i className="ph ph-bold ph-link text-white" />)}
    </div>
  );
};

type LinkedEntityProps = {
  name: string;
  url: URL;
  separateLinks: boolean;
  className?: string;
};

const LinkedEntity = ({ name, url, separateLinks, className }: LinkedEntityProps) => {
  return !separateLinks && isUrl(url.href) ? (
    <a
      href={url.href}
      target="_blank"
      rel="noreferrer noopener nofollow"
      className={cn("text-primary hover:underline font-bold", className)}
    >
      {name}
      <i className="ph ph-bold ph-globe ml-1" />
    </a>
  ) : (
    <div className={cn("font-bold text-foreground", className)}>{name}</div>
  );
};

type SectionProps<T> = {
  section: SectionWithItem<T> | CustomSectionGroup;
  children?: (item: T) => React.ReactNode;
  className?: string;
  urlKey?: keyof T;
  levelKey?: keyof T;
  summaryKey?: keyof T;
  keywordsKey?: keyof T;
};

const Section = <T,>({
  section,
  children,
  className,
  urlKey,
  levelKey,
  summaryKey,
  keywordsKey,
}: SectionProps<T>) => {
  if (!section.visible || section.items.length === 0) return null;

  return (
    <section id={section.id} className="mb-8">
      <h4 className="section-header-modern text-primary mb-4">
        {section.name}
      </h4>

      <div
        className="grid gap-x-8 gap-y-6"
        style={{ gridTemplateColumns: `repeat(${section.columns}, 1fr)` }}
      >
        {section.items
          .filter((item) => item.visible)
          .map((item) => {
            const url = (urlKey && get(item, urlKey)) as URL | undefined;
            const level = (levelKey && get(item, levelKey, 0)) as number | undefined;
            const summary = (summaryKey && get(item, summaryKey, "")) as string | undefined;
            const keywords = (keywordsKey && get(item, keywordsKey, [])) as string[] | undefined;

            return (
              <div
                key={item.id}
                className={cn("relative space-y-3 pl-6", className)}
              >
                {/* Vertical accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent rounded-full" />
                
                <div className="relative">
                  {children?.(item as T)}
                  {url !== undefined && section.separateLinks && <Link url={url} />}
                </div>

                {summary !== undefined && !isEmptyString(summary) && (
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitize(summary) }}
                    className="wysiwyg text-foreground text-sm leading-relaxed"
                  />
                )}

                {level !== undefined && level > 0 && <Rating level={level} />}

                {keywords !== undefined && keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-accent text-foreground text-xs rounded-full border border-border"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </section>
  );
};

const Profiles = () => {
  const section = useArtboardStore((state) => state.resume.sections.profiles);

  return (
    <Section<Profile> section={section}>
      {(item) => (
        <div className="space-y-1">
          {isUrl(item.url.href) ? (
            <a 
              href={item.url.href} 
              target="_blank" 
              rel="noreferrer noopener nofollow"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <BrandIcon slug={item.icon} />
              <span className="font-medium">{item.username}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2">
              <BrandIcon slug={item.icon} />
              <span className="font-medium">{item.username}</span>
            </div>
          )}
          {!item.icon && <p className="text-sm text-muted">{item.network}</p>}
        </div>
      )}
    </Section>
  );
};

const Experience = () => {
  const section = useArtboardStore((state) => state.resume.sections.experience);

  return (
    <Section<ExperienceType> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <LinkedEntity
              name={item.company}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary text-lg"
            />
            <div className="text-foreground font-semibold text-base mt-1">{item.position}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-bold text-primary bg-accent px-3 py-1 rounded-full text-sm">
              {item.date}
            </div>
            <div className="text-muted text-sm mt-1">{item.location}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Education = () => {
  const section = useArtboardStore((state) => state.resume.sections.education);

  return (
    <Section<EducationType> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <LinkedEntity
              name={item.institution}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary text-lg"
            />
            <div className="text-foreground font-semibold">{item.area}</div>
            {item.score && <div className="text-sm text-muted mt-1">Score: {item.score}</div>}
          </div>

          <div className="shrink-0 text-right">
            <div className="font-bold text-primary bg-accent px-3 py-1 rounded-full text-sm">
              {item.date}
            </div>
            <div className="text-muted text-sm mt-1">{item.studyType}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Awards = () => {
  const section = useArtboardStore((state) => state.resume.sections.awards);

  return (
    <Section<Award> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="font-bold text-foreground text-base">{item.title}</div>
            <LinkedEntity
              name={item.awarder}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary"
            />
          </div>

          <div className="shrink-0 text-right">
            <div className="font-bold text-primary bg-accent px-3 py-1 rounded-full text-sm">
              {item.date}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Certifications = () => {
  const section = useArtboardStore((state) => state.resume.sections.certifications);

  return (
    <Section<Certification> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="font-bold text-foreground text-base">{item.name}</div>
            <LinkedEntity 
              name={item.issuer} 
              url={item.url} 
              separateLinks={section.separateLinks}
              className="text-primary"
            />
          </div>

          <div className="shrink-0 text-right">
            <div className="font-bold text-primary bg-accent px-3 py-1 rounded-full text-sm">
              {item.date}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Skills = () => {
  const section = useArtboardStore((state) => state.resume.sections.skills);

  return (
    <Section<Skill> section={section} levelKey="level" keywordsKey="keywords">
      {(item) => (
        <div className="space-y-2">
          <div className="font-bold text-foreground text-lg">{item.name}</div>
          {item.description && <div className="text-sm text-muted">{item.description}</div>}
        </div>
      )}
    </Section>
  );
};

const Interests = () => {
  const section = useArtboardStore((state) => state.resume.sections.interests);

  return (
    <Section<Interest> section={section} keywordsKey="keywords">
      {(item) => (
        <div className="text-center p-3 bg-accent rounded-lg border border-border">
          <div className="font-semibold text-foreground">{item.name}</div>
        </div>
      )}
    </Section>
  );
};

const Publications = () => {
  const section = useArtboardStore((state) => state.resume.sections.publications);

  return (
    <Section<Publication> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary text-base"
            />
            <div className="text-muted italic">{item.publisher}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-bold text-primary bg-accent px-3 py-1 rounded-full text-sm">
              {item.date}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Volunteer = () => {
  const section = useArtboardStore((state) => state.resume.sections.volunteer);

  return (
    <Section<VolunteerType> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <LinkedEntity
              name={item.organization}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary text-base"
            />
            <div className="text-foreground font-semibold">{item.position}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-bold text-primary bg-accent px-3 py-1 rounded-full text-sm">
              {item.date}
            </div>
            <div className="text-muted text-sm mt-1">{item.location}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Languages = () => {
  const section = useArtboardStore((state) => state.resume.sections.languages);

  return (
    <Section<Language> section={section} levelKey="level">
      {(item) => (
        <div className="space-y-1">
          <div className="font-bold text-foreground">{item.name}</div>
          {item.description && <div className="text-sm text-muted">{item.description}</div>}
        </div>
      )}
    </Section>
  );
};

const isGitHubUrl = (url: string): boolean => {
  return url.toLowerCase().includes('github.com');
};

const isLiveUrl = (url: string): boolean => {
  return !isGitHubUrl(url) && (url.toLowerCase().includes('http://') || url.toLowerCase().includes('https://'));
};

const Projects = () => {
  const section = useArtboardStore((state) => state.resume.sections.projects);

  return (
    <Section<Project> section={section} urlKey="url" summaryKey="summary" keywordsKey="keywords">
      {(item) => (
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="font-bold text-primary text-lg">{item.name}</div>
            <div className="text-foreground">{item.description}</div>
            {item.url && (
              <div className="flex items-center gap-2 mt-2">
                {isGitHubUrl(item.url.href) ? (
                  <a
                    href={item.url.href}
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <BrandIcon slug="github" />
                    <span>GitHub</span>
                  </a>
                ) : isLiveUrl(item.url.href) ? (
                  <a
                    href={item.url.href}
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <i className="ph ph-bold ph-globe" />
                    <span>Live</span>
                  </a>
                ) : null}
              </div>
            )}
          </div>

          <div className="shrink-0 text-right">
            <div className="font-bold text-primary bg-accent px-3 py-1 rounded-full text-sm">
              {item.date}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

const References = () => {
  const section = useArtboardStore((state) => state.resume.sections.references);

  return (
    <Section<Reference> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="p-4 bg-accent rounded-lg border border-border">
          <LinkedEntity
            name={item.name}
            url={item.url}
            separateLinks={section.separateLinks}
            className="text-primary text-base"
          />
          <div className="text-muted text-sm mt-2">{item.description}</div>
        </div>
      )}
    </Section>
  );
};

const Custom = ({ id }: { id: string }) => {
  const section = useArtboardStore((state) => state.resume.sections.custom[id]);

  return (
    <Section<CustomSection>
      section={section}
      urlKey="url"
      summaryKey="summary"
      keywordsKey="keywords"
    >
      {(item) => (
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary text-base"
            />
            <div className="text-muted text-sm">{item.description}</div>
          </div>

          <div className="shrink-0 text-right text-sm">
            <div className="font-bold text-primary bg-accent px-3 py-1 rounded-full">
              {item.date}
            </div>
            <div className="text-muted mt-1">{item.location}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const mapSectionToComponent = (section: SectionKey) => {
  switch (section) {
    case "profiles": {
      return <Profiles />;
    }
    case "summary": {
      return <Summary />;
    }
    case "experience": {
      return <Experience />;
    }
    case "education": {
      return <Education />;
    }
    case "awards": {
      return <Awards />;
    }
    case "certifications": {
      return <Certifications />;
    }
    case "skills": {
      return <Skills />;
    }
    case "interests": {
      return <Interests />;
    }
    case "publications": {
      return <Publications />;
    }
    case "volunteer": {
      return <Volunteer />;
    }
    case "languages": {
      return <Languages />;
    }
    case "projects": {
      return <Projects />;
    }
    case "references": {
      return <References />;
    }
    default: {
      if (section.startsWith("custom.")) return <Custom id={section.split(".")[1]} />;

      return null;
    }
  }
};

export const Ditto = ({ columns, isFirstPage = false }: TemplateProps) => {
  const [main] = columns;

  // Ditto Theme: Creative Purple/Violet
  const themeColors = {
    primary: '#7c3aed', // Violet 600
    primaryLight: '#8b5cf6', // Violet 500
    primaryDark: '#6d28d9', // Violet 700
    accent: '#f5f3ff', // Violet 50
    border: '#e4d4fd', // Violet 200
    muted: '#6b7280' // Gray 500
  };

  return (
    <div className="space-y-8">
      <style>{`
        .ditto-theme {
          --template-primary: ${themeColors.primary};
          --template-primary-light: ${themeColors.primaryLight};
          --template-primary-dark: ${themeColors.primaryDark};
          --template-accent: ${themeColors.accent};
          --template-border: ${themeColors.border};
          --template-muted: ${themeColors.muted};
        }
        
        .ditto-theme .contact-icon {
          color: white;
        }
        
        .ditto-theme .link-container {
          color: ${themeColors.primary};
        }
        
        .ditto-theme .section-header-modern {
          color: ${themeColors.primary};
        }
        
        .ditto-theme .section-header-modern::after {
          background: linear-gradient(90deg, ${themeColors.primary}, transparent);
        }
        
        .ditto-theme .border-primary {
          border-color: ${themeColors.primary};
        }
        
        .ditto-theme .text-primary {
          color: ${themeColors.primary};
        }
        
        .ditto-theme .bg-accent {
          background-color: ${themeColors.accent};
        }
        
        .ditto-theme .border-border {
          border-color: ${themeColors.border};
        }
        
        .ditto-theme .bg-gradient-to-b {
          background: linear-gradient(to bottom, ${themeColors.primary}, transparent);
        }
        
        .section-header-modern {
          position: relative;
          display: inline-block;
          font-size: 1.25rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .section-header-modern::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 60%;
          height: 3px;
          background: linear-gradient(90deg, ${themeColors.primary}, transparent);
          border-radius: 2px;
        }
      `}</style>
      
      {isFirstPage && <Header />}

      {main.map((section) => (
        <Fragment key={section}>{mapSectionToComponent(section)}</Fragment>
      ))}
    </div>
  );
};

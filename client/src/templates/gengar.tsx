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
import { Education as EducationType, Experience as ExperienceType, Volunteer as VolunteerType } from "../utils/reactive-resume-schema";
import { cn, hexToRgb, isEmptyString, isUrl, sanitize } from "../utils/reactive-resume-utils";
import get from "lodash.get";
import { Fragment } from "react";

import { BrandIcon } from "../components/brand-icon";
import { Picture } from "../components/picture";
import { useArtboardStore } from "../store/artboard-store";
import type { TemplateProps } from "../types/template";

const Header = () => {
  const basics = useArtboardStore((state) => state.resume.basics);

  return (
    <div className="flex flex-col items-center space-y-4 text-center mb-6">
      <Picture />

      <div className="space-y-4 w-full">
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">{basics.name}</div>
          <div className="text-base text-muted font-medium">{basics.headline}</div>
        </div>

        <div className="professional-border flex flex-col items-start gap-y-1.5 text-left text-sm">
          {basics.location && (
            <div className="contact-item">
              <i className="ph ph-bold ph-map-pin contact-icon" />
              <div className="text-foreground">{basics.location}</div>
            </div>
          )}
          {basics.phone && (
            <div className="contact-item">
              <i className="ph ph-bold ph-phone contact-icon" />
              <a href={`tel:${basics.phone}`} target="_blank" rel="noreferrer" className="link-container">
                {basics.phone}
              </a>
            </div>
          )}
          {basics.email && (
            <div className="contact-item">
              <i className="ph ph-bold ph-at contact-icon" />
              <a href={`mailto:${basics.email}`} target="_blank" rel="noreferrer" className="link-container">
                {basics.email}
              </a>
            </div>
          )}
          <Link url={basics.url} />
          {basics.customFields && basics.customFields.map((item) => (
            <div key={item.id} className="contact-item">
              <i className={cn(`ph ph-bold ph-${item.icon}`, "contact-icon")} />
              {isUrl(item.value) ? (
                <a href={item.value} target="_blank" rel="noreferrer noopener nofollow" className="link-container">
                  {item.name || item.value}
                </a>
              ) : (
                <span className="text-foreground">{[item.name, item.value].filter(Boolean).join(": ")}</span>
              )}
            </div>
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
    <section id={section.id} className="mb-6">
      <h4 className="section-header">{section.name}</h4>

      <div
        dangerouslySetInnerHTML={{ __html: sanitize(section.content) }}
        style={{ columns: section.columns }}
        className="wysiwyg text-foreground"
      />
    </section>
  );
};

type RatingProps = { level: number };

const Rating = ({ level }: RatingProps) => {
  return (
    <div className="rating-container">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={cn("rating-dot", level > index && "filled")}
        />
      ))}
    </div>
  );
};

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
    <div className="contact-item">
      {!iconOnRight &&
        (icon ?? <i className="ph ph-bold ph-link contact-icon" />)}
      <a
        href={url.href}
        target="_blank"
        rel="noreferrer noopener nofollow"
        className={cn("link-container", className)}
      >
        {label ?? (url.label || url.href)}
      </a>
      {iconOnRight &&
        (icon ?? <i className="ph ph-bold ph-link contact-icon" />)}
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
      className={cn("link-container font-semibold", className)}
    >
      {name}
      <i className="ph ph-bold ph-globe link-icon ml-1" />
    </a>
  ) : (
    <div className={cn("font-semibold text-foreground", className)}>{name}</div>
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
    <section id={section.id} className="mb-6">
      <h4 className="section-header sidebar">
        {section.name}
      </h4>

      <div
        className="grid gap-x-6 gap-y-4"
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
              <div key={item.id} className={cn("space-y-2", className)}>
                <div>
                  {children?.(item as T)}
                  {url !== undefined && section.separateLinks && <Link url={url} />}
                </div>

                {summary !== undefined && !isEmptyString(summary) && (
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitize(summary) }}
                    className="wysiwyg text-foreground text-sm"
                  />
                )}

                {level !== undefined && level > 0 && <Rating level={level} />}

                {keywords !== undefined && keywords.length > 0 && (
                  <p className="text-sm text-muted italic">{keywords.join(", ")}</p>
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
    <Section<Experience> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <LinkedEntity
              name={item.company}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary font-bold"
            />
            <div className="text-foreground font-medium">{item.position}</div>
          </div>

          <div className="shrink-0 text-right text-sm">
            <div className="font-semibold text-muted">{item.date}</div>
            <div className="text-muted">{item.location}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Education = () => {
  const section = useArtboardStore((state) => state.resume.sections.education);

  return (
    <Section<Education> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <LinkedEntity
              name={item.institution}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary font-bold"
            />
            <div className="text-foreground font-medium">{item.area}</div>
            {item.score && <div className="text-sm text-muted">{item.score}</div>}
          </div>

          <div className="shrink-0 text-right text-sm">
            <div className="font-semibold text-muted">{item.date}</div>
            <div className="text-muted">{item.studyType}</div>
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="font-bold text-foreground">{item.title}</div>
            <LinkedEntity
              name={item.awarder}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary"
            />
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold text-muted text-sm">{item.date}</div>
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="font-bold text-foreground">{item.name}</div>
            <LinkedEntity 
              name={item.issuer} 
              url={item.url} 
              separateLinks={section.separateLinks}
              className="text-primary"
            />
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold text-muted text-sm">{item.date}</div>
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
        <div className="space-y-1">
          <div className="font-bold text-foreground">{item.name}</div>
          {item.description && <div className="text-sm text-muted">{item.description}</div>}
        </div>
      )}
    </Section>
  );
};

const Interests = () => {
  const section = useArtboardStore((state) => state.resume.sections.interests);

  return (
    <Section<Interest> section={section} keywordsKey="keywords" className="space-y-1">
      {(item) => <div className="font-semibold text-foreground">{item.name}</div>}
    </Section>
  );
};

const Publications = () => {
  const section = useArtboardStore((state) => state.resume.sections.publications);

  return (
    <Section<Publication> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary font-bold"
            />
            <div className="text-muted">{item.publisher}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold text-muted text-sm">{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Volunteer = () => {
  const section = useArtboardStore((state) => state.resume.sections.volunteer);

  return (
    <Section<Volunteer> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <LinkedEntity
              name={item.organization}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary font-bold"
            />
            <div className="text-foreground font-medium">{item.position}</div>
          </div>

          <div className="shrink-0 text-right text-sm">
            <div className="font-semibold text-muted">{item.date}</div>
            <div className="text-muted">{item.location}</div>
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

const Projects = () => {
  const section = useArtboardStore((state) => state.resume.sections.projects);

  return (
    <Section<Project> section={section} urlKey="url" summaryKey="summary" keywordsKey="keywords">
      {(item) => (
        <div className="space-y-4 p-6 bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="space-y-2">
            <div className="font-bold text-slate-800 text-xl">{item.name}</div>
            <div className="wysiwyg text-slate-600 leading-relaxed text-base">{item.description}</div>
            {item.url && (
              <div className="flex items-center gap-2 mt-3">
                {isGitHubUrl(item.url) ? (
                  <a
                    href={item.url.href}
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <BrandIcon slug="github" />
                    <span>GitHub</span>
                  </a>
                ) : isLiveUrl(item.url) ? (
                  <a
                    href={item.url.href}
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <i className="ph ph-bold ph-globe" />
                    <span>Live</span>
                  </a>
                ) : null}
              </div>
            )}
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
        <div className="space-y-1">
          <LinkedEntity
            name={item.name}
            url={item.url}
            separateLinks={section.separateLinks}
            className="text-primary font-bold"
          />
          <div className="text-muted text-sm">{item.description}</div>
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <LinkedEntity
              name={item.name}
              url={item.url}
              separateLinks={section.separateLinks}
              className="text-primary font-bold"
            />
            <div className="text-muted text-sm">{item.description}</div>
          </div>

          <div className="shrink-0 text-right text-sm">
            <div className="font-semibold text-muted">{item.date}</div>
            <div className="text-muted">{item.location}</div>
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

export const Gengar = ({ columns, isFirstPage = false }: TemplateProps) => {
  const [main, sidebar] = columns;
  const primaryColor = useArtboardStore((state) => state.resume.metadata?.theme?.primary || '#3b82f6');

  return (
    <div className="grid min-h-full" style={{ gridTemplateColumns: sidebar.length > 0 ? '1fr 2fr' : '1fr' }}>
      {sidebar.length > 0 && (
        <div
          className="sidebar group/sidebar p-6 space-y-6"
          style={{ 
            backgroundColor: `${primaryColor}10`,
            borderRight: `2px solid ${primaryColor}20`
          }}
        >
          {isFirstPage && <Header />}

          {sidebar.map((section) => (
            <Fragment key={section}>{mapSectionToComponent(section)}</Fragment>
          ))}
        </div>
      )}

      <div className="main group/main p-6 space-y-6">
        {main.map((section) => (
          <Fragment key={section}>{mapSectionToComponent(section)}</Fragment>
        ))}
      </div>
    </div>
  );
};

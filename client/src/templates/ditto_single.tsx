import React from "react";
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
import { useArtboardStore } from "../store/artboard-store";
import { cn, isEmptyString, isUrl, sanitize } from "../utils/reactive-resume-utils";

// Simple placeholder for icons
const Icon = ({ name }: { name: string }) => (
  <span style={{ display: "inline-block", width: 16, height: 16, background: "#ccc", borderRadius: 4, textAlign: "center", fontSize: 12, marginRight: 4 }}>{name.slice(0, 2).toUpperCase()}</span>
);

// Simple placeholder for profile picture
const Picture = ({ className }: { className?: string }) => (
  <div className={cn("rounded-full bg-gray-300", className)} style={{ width: 80, height: 80, margin: "auto" }} />
);

const Header = () => {
  const basics = useArtboardStore((state) => state.resume.basics);
  return (
    <div className="p-custom relative grid grid-cols-3 space-x-4 pb-0">
      <Picture className="mx-auto" />
      <div className="relative z-10 col-span-2 text-background">
        <div className="space-y-0.5">
          <h2 className="text-3xl font-bold">{basics.name}</h2>
          <p>{basics.headline}</p>
        </div>
        <div className="col-span-2 col-start-2 mt-10 text-foreground">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            {basics.location && (
              <><div className="flex items-center gap-x-1.5"><Icon name="loc" /><div>{basics.location}</div></div><div className="bg-text size-1 rounded-full last:hidden" /></>
            )}
            {basics.phone && (
              <><div className="flex items-center gap-x-1.5"><Icon name="ph" /><a href={`tel:${basics.phone}`}>{basics.phone}</a></div><div className="bg-text size-1 rounded-full last:hidden" /></>
            )}
            {basics.email && (
              <><div className="flex items-center gap-x-1.5"><Icon name="em" /><a href={`mailto:${basics.email}`}>{basics.email}</a></div><div className="bg-text size-1 rounded-full last:hidden" /></>
            )}
            {isUrl(basics.url?.href) && (
              <><Link url={basics.url} /><div className="bg-text size-1 rounded-full last:hidden" /></>
            )}
            {basics.customFields && basics.customFields.map((item) => (
              <React.Fragment key={item.id}>
                <div className="flex items-center gap-x-1.5">
                  <Icon name={item.icon || "cf"} />
                  {isUrl(item.value) ? (
                    <a href={item.value} target="_blank" rel="noreferrer noopener nofollow">{item.name || item.value}</a>
                  ) : (
                    <span>{[item.name, item.value].filter(Boolean).join(": ")}</span>
                  )}
                </div>
                <div className="bg-text size-1 rounded-full last:hidden" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Summary = () => {
  const section = useArtboardStore((state) => state.resume.sections.summary);
  if (!section.visible || isEmptyString(section.content)) return null;
  return (
    <section id={section.id}>
      <h4 className="mb-2 text-base font-bold">{section.name}</h4>
      <div dangerouslySetInnerHTML={{ __html: sanitize(section.content) }} style={{ columns: section.columns }} className="wysiwyg" />
    </section>
  );
};

const Rating = ({ level }: { level: number }) => (
  <div className="flex items-center gap-x-1.5">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className={cn("h-2 w-4 border border-primary", level > index && "bg-primary")} />
    ))}
  </div>
);

const Link = ({ url, label }: { url: URL; label?: string }) => {
  if (!isUrl(url?.href)) return null;
  return (
    <a href={url.href} target="_blank" rel="noreferrer noopener nofollow" className="inline-block text-primary underline">{label ?? url.label ?? url.href}</a>
  );
};

const LinkedEntity = ({ name, url, separateLinks, className }: { name: string; url: URL; separateLinks: boolean; className?: string }) => {
  return !separateLinks && isUrl(url?.href) ? (
    <Link url={url} label={name} />
  ) : (
    <div className={className}>{name}</div>
  );
};

const Section = <T,>({ section, children, className, urlKey, levelKey, summaryKey, keywordsKey }: {
  section: SectionWithItem<T> | CustomSectionGroup;
  children?: (item: T) => React.ReactNode;
  className?: string;
  urlKey?: keyof T;
  levelKey?: keyof T;
  summaryKey?: keyof T;
  keywordsKey?: keyof T;
}) => {
  if (!section.visible || section.items.length === 0) return null;
  return (
    <section id={section.id} className="grid">
      <h4 className="mb-2 text-base font-bold">{section.name}</h4>
      <div className="grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: `repeat(${section.columns}, 1fr)` }}>
        {section.items.filter((item) => item.visible).map((item) => {
          const url = urlKey && (item as any)[urlKey];
          const level = levelKey && (item as any)[levelKey];
          const summary = summaryKey && (item as any)[summaryKey];
          const keywords = keywordsKey && (item as any)[keywordsKey];
          return (
            <div key={item.id} className={cn("relative space-y-2 pl-4 group-[.sidebar]:pl-0", className)}>
              <div className="relative -ml-4 group-[.sidebar]:ml-0">
                <div className="pl-4 group-[.sidebar]:pl-0">
                  {children?.(item as T)}
                  {url !== undefined && section.separateLinks && <Link url={url} />}
                </div>
                <div className="absolute inset-y-0 -left-px border-l-4 border-primary group-[.sidebar]:hidden" />
              </div>
              {summary !== undefined && summary && (
                <div dangerouslySetInnerHTML={{ __html: sanitize(summary) }} className="wysiwyg" />
              )}
              {level !== undefined && level > 0 && <Rating level={level} />}
              {keywords !== undefined && keywords.length > 0 && (
                <p className="text-sm">{keywords.join(", ")}</p>
              )}
              <div className="absolute inset-y-0 left-0 border-l border-primary group-[.sidebar]:hidden" />
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
        <div>
          {isUrl(item.url?.href) ? (
            <Link url={item.url} label={item.username} />
          ) : (
            <p>{item.username}</p>
          )}
          {!item.icon && <p className="text-sm">{item.network}</p>}
        </div>
      )}
    </Section>
  );
};

const Experience = () => {
  const section = useArtboardStore((state) => state.resume.sections.experience);
  return (
    <Section<any> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <LinkedEntity name={item.company} url={item.url} separateLinks={section.separateLinks} className="font-bold" />
            <div>{item.position}</div>
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

const Education = () => {
  const section = useArtboardStore((state) => state.resume.sections.education);
  return (
    <Section<any> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <LinkedEntity name={item.institution} url={item.url} separateLinks={section.separateLinks} className="font-bold" />
            <div>{item.area}</div>
            <div>{item.score}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-bold">{item.date}</div>
            <div>{item.studyType}</div>
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
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <div className="font-bold">{item.title}</div>
            <LinkedEntity name={item.awarder} url={item.url} separateLinks={section.separateLinks} />
          </div>
          <div className="shrink-0 text-right">
            <div className="font-bold">{item.date}</div>
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
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <div className="font-bold">{item.name}</div>
            <LinkedEntity name={item.issuer} url={item.url} separateLinks={section.separateLinks} />
          </div>
          <div className="shrink-0 text-right">
            <div className="font-bold">{item.date}</div>
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
        <div>
          <div className="font-bold">{item.name}</div>
          <div>{item.description}</div>
        </div>
      )}
    </Section>
  );
};

const Interests = () => {
  const section = useArtboardStore((state) => state.resume.sections.interests);
  return (
    <Section<Interest> section={section} className="space-y-0" keywordsKey="keywords">
      {(item) => <div className="font-bold">{item.name}</div>}
    </Section>
  );
};

const Publications = () => {
  const section = useArtboardStore((state) => state.resume.sections.publications);
  return (
    <Section<Publication> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <LinkedEntity name={item.name} url={item.url} separateLinks={section.separateLinks} className="font-bold" />
            <div>{item.publisher}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-bold">{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Volunteer = () => {
  const section = useArtboardStore((state) => state.resume.sections.volunteer);
  return (
    <Section<any> section={section} urlKey="url" summaryKey="summary">
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <LinkedEntity name={item.organization} url={item.url} separateLinks={section.separateLinks} className="font-bold" />
            <div>{item.position}</div>
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

const Languages = () => {
  const section = useArtboardStore((state) => state.resume.sections.languages);
  return (
    <Section<Language> section={section} levelKey="level">
      {(item) => (
        <div>
          <div className="font-bold">{item.name}</div>
          <div>{item.description}</div>
        </div>
      )}
    </Section>
  );
};

const Projects = () => {
  const section = useArtboardStore((state) => state.resume.sections.projects);
  return (
    <Section<Project> section={section} urlKey="url" summaryKey="summary" keywordsKey="keywords">
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <LinkedEntity name={item.name} url={item.url} separateLinks={section.separateLinks} className="font-bold" />
            <div>{item.description}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-bold">{item.date}</div>
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
        <div>
          <LinkedEntity name={item.name} url={item.url} separateLinks={section.separateLinks} className="font-bold" />
          <div>{item.description}</div>
        </div>
      )}
    </Section>
  );
};

const Custom = ({ id }: { id: string }) => {
  const section = useArtboardStore((state) => state.resume.sections.custom[id]);
  return (
    <Section<CustomSection> section={section} urlKey="url" summaryKey="summary" keywordsKey="keywords">
      {(item) => (
        <div className="flex items-start justify-between group-[.sidebar]:flex-col group-[.sidebar]:items-start">
          <div className="text-left">
            <LinkedEntity name={item.name} url={item.url} separateLinks={section.separateLinks} className="font-bold" />
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

const mapSectionToComponent = (section: SectionKey) => {
  switch (section) {
    case "profiles": return <Profiles />;
    case "summary": return <Summary />;
    case "experience": return <Experience />;
    case "education": return <Education />;
    case "awards": return <Awards />;
    case "certifications": return <Certifications />;
    case "skills": return <Skills />;
    case "interests": return <Interests />;
    case "publications": return <Publications />;
    case "volunteer": return <Volunteer />;
    case "languages": return <Languages />;
    case "projects": return <Projects />;
    case "references": return <References />;
    default:
      if (section.startsWith("custom.")) return <Custom id={section.split(".")[1]} />;
      return null;
  }
};

export const DittoSingle = ({ columns, isFirstPage = false }: { columns: [SectionKey[], SectionKey[]]; isFirstPage?: boolean }) => {
  const [main, sidebar] = columns;
  return (
    <div>
      {isFirstPage && (
        <div className="relative">
          <Header />
          <div className="absolute inset-x-0 top-0 h-[85px] w-full bg-primary" />
        </div>
      )}
      <div className="grid grid-cols-3">
        <div className="sidebar p-custom group space-y-4">
          {sidebar.map((section) => (
            <React.Fragment key={section}>{mapSectionToComponent(section)}</React.Fragment>
          ))}
        </div>
        <div className={cn("main p-custom group space-y-4", sidebar.length > 0 ? "col-span-2" : "col-span-3")}> 
          {main.map((section) => (
            <React.Fragment key={section}>{mapSectionToComponent(section)}</React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}; 

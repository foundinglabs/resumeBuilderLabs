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
  Education as EducationType,
  Experience as ExperienceType,
  Volunteer as VolunteerType,
} from "../utils/reactive-resume-schema";
import { useArtboardStore } from "../store/artboard-store";
import { cn, isEmptyString, isUrl, linearTransform, sanitize } from "../utils/reactive-resume-utils";
import get from "lodash.get";

// Tech-themed color palette
const techColors = {
  primary: "#0ff1ce",
  background: "#181a20",
  card: "#23272f",
  text: "#e6e6e6",
  accent: "#00e6a8",
};

const sectionTitleStyle = {
  color: techColors.primary,
  fontWeight: 700,
  fontSize: "1.1rem",
  letterSpacing: "0.05em",
  marginBottom: "0.5rem",
  textTransform: "uppercase",
};

const cardStyle = {
  background: techColors.card,
  borderRadius: "8px",
  padding: "1rem",
  marginBottom: "1rem",
  boxShadow: "0 2px 8px rgba(0,255,255,0.05)",
};

const labelStyle = {
  color: techColors.accent,
  fontWeight: 600,
  fontSize: "0.95rem",
};

const valueStyle = {
  color: techColors.text,
  fontWeight: 400,
  fontSize: "0.95rem",
};

const Rating = ({ level }: { level: number }) => (
  <div style={{ height: 6, width: 128, background: techColors.background, borderRadius: 3, position: "relative", margin: "0.5rem 0" }}>
    <div
      style={{
        height: 6,
        width: linearTransform(level, 0, 5, 0, 128),
        background: techColors.primary,
        borderRadius: 3,
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  </div>
);

const Link = ({ url, label }: { url: URL; label?: string }) => {
  if (!isUrl(url.href)) return null;
  return (
    <a
      href={url.href}
      target="_blank"
      rel="noreferrer noopener nofollow"
      style={{ color: techColors.accent, textDecoration: "underline", marginLeft: 4 }}
    >
      {label ?? url.label ?? url.href}
    </a>
  );
};

const Section = <T,>({
  section,
  children,
  style,
}: {
  section: SectionWithItem<T> | CustomSectionGroup;
  children: (item: T) => React.ReactNode;
  style?: React.CSSProperties;
}) => {
  if (!section.visible || section.items.length === 0) return null;
  return (
    <section id={section.id} style={{ ...cardStyle, ...style }}>
      <div style={sectionTitleStyle}>{section.name}</div>
      <div>
        {section.items.filter((item) => item.visible).map((item) => (
          <div key={item.id} style={{ marginBottom: "1.2rem" }}>{children(item as T)}</div>
        ))}
      </div>
    </section>
  );
};

const Header = () => {
  const basics = useArtboardStore((state) => state.resume.basics);
  return (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: techColors.primary }}>{basics.name}</div>
      <div style={{ fontSize: 18, color: techColors.text, marginBottom: 8 }}>{basics.headline}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", color: techColors.text }}>
        {basics.location && <span><span style={labelStyle}>Location:</span> <span style={valueStyle}>{basics.location}</span></span>}
        {basics.phone && <span><span style={labelStyle}>Phone:</span> <a href={`tel:${basics.phone}`} style={valueStyle}>{basics.phone}</a></span>}
        {basics.email && <span><span style={labelStyle}>Email:</span> <a href={`mailto:${basics.email}`} style={valueStyle}>{basics.email}</a></span>}
        {basics.url && <span><span style={labelStyle}>Website:</span> <Link url={basics.url} /></span>}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        {basics.customFields && basics.customFields.map((item) => (
          <span key={item.id} style={{ color: techColors.accent }}>
            {item.icon && <i className={`ph ph-bold ph-${item.icon}`} style={{ marginRight: 4 }} />}
            {isUrl(item.value) ? (
              <a href={item.value} target="_blank" rel="noreferrer noopener nofollow" style={{ color: techColors.accent }}>{item.name || item.value}</a>
            ) : (
              <span>{[item.name, item.value].filter(Boolean).join(": ")}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

const Summary = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptySummarySection = { visible: false, items: [], content: '', columns: 1 };
  const section = useArtboardStore((state) => state.resume.sections.summary ?? emptySummarySection);
  if (!section.visible || isEmptyString(section.content)) return null;
  return (
    <section id={section.id} style={cardStyle}>
      <div style={sectionTitleStyle}>{section.name}</div>
      <div style={{ color: techColors.text }}>
        <div
          dangerouslySetInnerHTML={{ __html: sanitize(section.content) }}
          style={{ columns: section.columns }}
        />
      </div>
    </section>
  );
};

const Awards = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.awards ?? emptyNamedSection('Awards'));
  return (
    <Section<Award> section={section}>
      {(item) => (
        <div>
          <div style={{ ...labelStyle, fontSize: "1rem" }}>{item.title}</div>
          <div style={valueStyle}>{item.awarder}</div>
          <div style={{ color: techColors.primary, fontWeight: 600 }}>{item.date}</div>
          {item.summary && <div style={{ color: techColors.text }}>{item.summary}</div>}
          {item.url && <Link url={item.url} />}
        </div>
      )}
    </Section>
  );
};

const Experience = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.experience ?? emptyNamedSection('Experience'));
  return (
    <Section<ExperienceType> section={section}>
      {(item) => (
        <div>
          <div style={labelStyle}>{item.position}</div>
          <div style={valueStyle}>{item.company} {item.location && `| ${item.location}`}</div>
          <div style={{ color: techColors.primary, fontWeight: 600 }}>{item.date}</div>
          {item.summary && <div style={{ color: techColors.text }}>{item.summary}</div>}
          {item.url && <Link url={item.url} />}
        </div>
      )}
    </Section>
  );
};

const Education = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.education ?? emptyNamedSection('Education'));
  return (
    <Section<EducationType> section={section}>
      {(item) => (
        <div>
          <div style={labelStyle}>{item.studyType} in {item.area}</div>
          <div style={valueStyle}>{item.institution} {item.score && `| Score: ${item.score}`}</div>
          <div style={{ color: techColors.primary, fontWeight: 600 }}>{item.date}</div>
          {item.summary && <div style={{ color: techColors.text }}>{item.summary}</div>}
          {item.url && <Link url={item.url} />}
        </div>
      )}
    </Section>
  );
};

const Skills = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.skills ?? emptyNamedSection('Skills'));
  return (
    <Section<Skill> section={section}>
      {(item) => (
        <div>
          <div style={labelStyle}>{item.name}</div>
          <div style={valueStyle}>{item.description}</div>
          {item.level && <Rating level={item.level} />}
          {item.keywords && item.keywords.length > 0 && (
            <div style={{ color: techColors.accent, fontSize: "0.9rem" }}>{item.keywords.join(", ")}</div>
          )}
        </div>
      )}
    </Section>
  );
};

const Certifications = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.certifications ?? emptyNamedSection('Certifications'));
  return (
    <Section<Certification> section={section}>
      {(item) => (
        <div>
          <div style={labelStyle}>{item.name}</div>
          <div style={valueStyle}>{item.issuer}</div>
          <div style={{ color: techColors.primary, fontWeight: 600 }}>{item.date}</div>
          {item.summary && <div style={{ color: techColors.text }}>{item.summary}</div>}
          {item.url && <Link url={item.url} />}
        </div>
      )}
    </Section>
  );
};

const Projects = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.projects ?? emptyNamedSection('Projects'));
  return (
    <Section<Project> section={section}>
      {(item) => (
        <div>
          <div style={labelStyle}>{item.name}</div>
          <div style={valueStyle}>{item.description}</div>
          <div style={{ color: techColors.primary, fontWeight: 600 }}>{item.date}</div>
          {item.keywords && item.keywords.length > 0 && (
            <div style={{ color: techColors.accent, fontSize: "0.9rem" }}>{item.keywords.join(", ")}</div>
          )}
          {item.url && <Link url={item.url} />}
        </div>
      )}
    </Section>
  );
};

const Languages = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.languages ?? emptyNamedSection('Languages'));
  return (
    <Section<Language> section={section}>
      {(item) => (
        <div>
          <div style={labelStyle}>{item.name}</div>
          <div style={valueStyle}>{item.description}</div>
          {item.level && <Rating level={item.level} />}
        </div>
      )}
    </Section>
  );
};

const Interests = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.interests ?? emptyNamedSection('Interests'));
  return (
    <Section<Interest> section={section}>
      {(item) => <div style={labelStyle}>{item.name}</div>}
    </Section>
  );
};

const Publications = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.publications ?? emptyNamedSection('Publications'));
  return (
    <Section<Publication> section={section}>
      {(item) => (
        <div>
          <div style={labelStyle}>{item.name}</div>
          <div style={valueStyle}>{item.publisher}</div>
          <div style={{ color: techColors.primary, fontWeight: 600 }}>{item.date}</div>
          {item.summary && <div style={{ color: techColors.text }}>{item.summary}</div>}
          {item.url && <Link url={item.url} />}
        </div>
      )}
    </Section>
  );
};

const Volunteer = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.volunteer ?? emptyNamedSection('Volunteer'));
  return (
    <Section<VolunteerType> section={section}>
      {(item) => (
        <div>
          <div style={labelStyle}>{item.position}</div>
          <div style={valueStyle}>{item.organization} {item.location && `| ${item.location}`}</div>
          <div style={{ color: techColors.primary, fontWeight: 600 }}>{item.date}</div>
          {item.summary && <div style={{ color: techColors.text }}>{item.summary}</div>}
          {item.url && <Link url={item.url} />}
        </div>
      )}
    </Section>
  );
};

const References = () => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.references ?? emptyNamedSection('References'));
  return (
    <Section<Reference> section={section}>
      {(item) => (
        <div>
          <div style={labelStyle}>{item.name}</div>
          <div style={valueStyle}>{item.description}</div>
          {item.url && <Link url={item.url} />}
        </div>
      )}
    </Section>
  );
};

const Custom = ({ id }: { id: string }) => {
  // Fallback section objects to avoid recreating them on every render
  const emptyNamedSection = (name: string) => ({ visible: false, items: [], name });
  const section = useArtboardStore((state) => state.resume.sections.custom?.[id] ?? emptyNamedSection('Custom'));
  return (
    <Section<CustomSection>
      section={section}
    >
      {(item) => (
        <div>
          <div style={labelStyle}>{item.name}</div>
          <div style={valueStyle}>{item.description}</div>
          <div style={{ color: techColors.primary, fontWeight: 600 }}>{item.date}</div>
          <div style={valueStyle}>{item.location}</div>
          {item.url && <Link url={item.url} />}
        </div>
      )}
    </Section>
  );
};

const mapSectionToComponent = (section: SectionKey) => {
  switch (section) {
    case "summary": return <Summary />;
    case "awards": return <Awards />;
    case "experience": return <Experience />;
    case "education": return <Education />;
    case "skills": return <Skills />;
    case "certifications": return <Certifications />;
    case "projects": return <Projects />;
    case "languages": return <Languages />;
    case "interests": return <Interests />;
    case "publications": return <Publications />;
    case "volunteer": return <Volunteer />;
    case "references": return <References />;
    default:
      if (section.startsWith("custom.")) return <Custom id={section.split(".")[1]} />;
      return null;
  }
};

export const Tech = ({ columns, isFirstPage = false }: { columns: [SectionKey[], SectionKey[]]; isFirstPage?: boolean }) => {
  const [main, sidebar] = columns;
  return (
    <div style={{ background: techColors.background, color: techColors.text, minHeight: "100vh", padding: 32 }}>
      {isFirstPage && <Header />}
      <div style={{ display: "grid", gridTemplateColumns: sidebar.length > 0 ? "1fr 2fr" : "1fr", gap: 32 }}>
        {sidebar.length > 0 && (
          <div>
            {sidebar.map((section) => (
              <React.Fragment key={section}>{mapSectionToComponent(section)}</React.Fragment>
            ))}
          </div>
        )}
        <div>
          {main.map((section) => (
            <React.Fragment key={section}>{mapSectionToComponent(section)}</React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}; 

import React, { Fragment } from "react";
import { useArtboardStore } from "../store/artboard-store";
import type { TemplateProps } from "../types/template";
import { BrandIcon } from "../components/brand-icon";
import type { Profile } from "../utils/reactive-resume-schema";

// Accent theme
const ACCENT = "#6366f1"; // indigo-500

const linkStyle: React.CSSProperties = {
  color: ACCENT,
  textDecoration: "underline",
};

const lightRule = "1px solid rgba(0,0,0,0.15)";
const accentRule = `1px solid ${ACCENT}20`; // subtle accent divider

// Robust URL helpers for project links
type MaybeUrl = string | { href?: string } | undefined;
function getHref(url: MaybeUrl): string {
  if (!url) return "";
  if (typeof url === "string") return url;
  return typeof url.href === "string" ? url.href : "";
}
function isGitHubUrl(url: MaybeUrl) {
  const u = getHref(url).toLowerCase();
  return u.includes("github.com");
}
function isLiveUrl(url: MaybeUrl) {
  const u = getHref(url).toLowerCase();
  return /^https?:\/\//i.test(u) && !u.includes("github.com");
}

// Date normalization helper for dynamic inputs
function normalizeDateRange(start?: string, end?: string, combined?: string): string {
  if (combined && /-|\u2013|\u2014/.test(combined)) return combined.trim();
  const clean = (s?: string) => (s || '').trim();
  const s = clean(start);
  const e = clean(end);
  if (s && e) return `${s} - ${e}`;
  if (s && !e) return `${s} - Present`;
  if (!s && e) return e;
  return (combined || '').trim();
}

// Cap long sections and show "+N more"
const MAX_ITEMS_PER_SECTION = 8;
const moreNoteStyle: React.CSSProperties = { color: '#6b7280', fontSize: '0.85em', marginTop: 4 };

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
    <h2
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontWeight: 700,
        fontSize: '0.98rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: ACCENT,
        margin: 0,
      }}
    >
      {children}
    </h2>
    <div style={{ height: 2, width: 36, background: ACCENT, borderRadius: 2, marginTop: 6 }} />
  </div>
);

function renderSummaryBullets(html: string) {
  if (!html) return null;
  const hasList = /<li[\s>]/i.test(html);
  if (hasList) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ marginTop: 6, lineHeight: 1.5 }}
      />
    );
  }
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;
  const bullets = text
    .split(/[\.\n]/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 5);
  return (
    <ul style={{ marginTop: 6, paddingLeft: '1.1em' }}>
      {bullets.map((b, i) => (
        <li key={i} style={{ marginBottom: 2 }}>{b}</li>
      ))}
    </ul>
  );
}

// Helper: does a section have visible content?
function hasSectionContent(section: string, resumeData: any): boolean {
  const sec = resumeData?.sections?.[section];
  if (!sec || sec.visible === false) return false;
  if (section === 'summary') {
    const content = (sec.content || '').toString().trim();
    return content.length > 0;
  }
  if (Array.isArray(sec.items)) {
    return sec.items.some((it: any) => it && it.visible !== false);
  }
  return false;
}

const renderSection = (section: string, resumeData: any) => {
  if (!resumeData || !resumeData.sections) return null;
  const sec = resumeData.sections[section];
  const basics = resumeData?.basics || {};

  // Summary without duplicate headline
  if (section === 'summary') {
    if (!sec?.visible) return null;
    const hasContent = Boolean(sec.content);
    const shouldShowHeadline = basics.headline && !hasContent;
    return (
      <div style={{ marginBottom: '1rem' }}>
        {shouldShowHeadline && (
          <div style={{ fontSize: '1rem', color: '#374151', fontStyle: 'italic', marginBottom: '0.35rem' }}>
            {basics.headline}
          </div>
        )}
        {hasContent && renderSummaryBullets(sec.content)}
      </div>
    );
  }

  // Profiles (limit to 3)
  if (section === 'profiles') {
    if (!sec || !sec.visible || !Array.isArray(sec.items) || sec.items.length === 0) return null;
    const visibleItems = sec.items.filter((item: any) => item.visible !== false).slice(0, 3);
    if (visibleItems.length === 0) return null;
    return (
      <ul style={{ marginBottom: '0.75rem', paddingLeft: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {visibleItems.map((item: Profile, idx: number) => (
          <li key={item.id || `profile-${idx}`}>
            {item.url?.href ? (
              <a 
                href={item.url.href} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', ...linkStyle }}
              >
                <BrandIcon slug={item.icon || ""} />
                <span>{item.username}</span>
              </a>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BrandIcon slug={item.icon || ""} />
                <span>{item.username}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (!sec || !sec.visible || !Array.isArray(sec.items) || sec.items.length === 0) return null;

  const visibleItems = sec.items.filter((item: any) => item.visible !== false);
  if (visibleItems.length === 0) return null;

  const limitedItems = visibleItems.slice(0, MAX_ITEMS_PER_SECTION);
  const moreCount = Math.max(0, visibleItems.length - limitedItems.length);

  switch (section) {
    case 'experience': {
      return (
        <>
          <ul style={{ marginBottom: '0.5rem', paddingLeft: 0, listStyle: 'none' }}>
            {limitedItems.map((item: any, idx: number) => {
              const position = item.position || item.title || '';
              const headerLeft = [position, item.company ? `— ${item.company}` : '', item.location ? `• ${item.location}` : '']
                .filter(Boolean)
                .join(' ');
              const dateText = normalizeDateRange(item.startDate, item.endDate, item.date);
              return (
                <li
                  key={item.id || idx}
                  style={{
                    marginBottom: '0.9rem',
                    paddingBottom: '0.75rem',
                    borderBottom: accentRule,
                    breakInside: 'avoid',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.75rem' }}>
                    <div style={{ minWidth: 0, fontWeight: 600 }}>{headerLeft}</div>
                    {dateText && (
                      <div style={{ color: '#6b7280', fontSize: '0.9em', whiteSpace: 'nowrap' }}>{dateText}</div>
                    )}
                  </div>
                  {item.summary && renderSummaryBullets(item.summary)}
                  {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                    <div style={{ marginTop: 6, color: '#4b5563', fontSize: '0.9em' }}>
                      <span style={{ fontWeight: 600 }}>Tech:</span> {item.technologies.join(', ')}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {moreCount > 0 && <div style={moreNoteStyle}>and {moreCount} more…</div>}
        </>
      );
    }
    case 'education': {
      return (
        <>
          <ul style={{ marginBottom: '0.5rem', paddingLeft: 0, listStyle: 'none' }}>
            {limitedItems.map((item: any, idx: number) => {
              const degree = item.studyType || item.degree || '';
              const fieldOfStudy = item.area || item.field_of_study || '';
              const institution = item.institution || item.school || '';
              const headerLeft = [degree, fieldOfStudy ? `— ${fieldOfStudy}` : '', institution ? `• ${institution}` : '']
                .filter(Boolean)
                .join(' ');
              const date = normalizeDateRange(undefined, undefined, item.date || item.graduationYear);
              return (
                <li
                  key={item.id || `edu-${idx}`}
                  style={{
                    marginBottom: '0.75rem',
                    paddingBottom: '0.6rem',
                    borderBottom: accentRule,
                    breakInside: 'avoid',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{headerLeft}</div>
                    {date && <div style={{ color: '#6b7280', fontSize: '0.9em', whiteSpace: 'nowrap' }}>{date}</div>}
                  </div>
                  {item.score && (
                    <div style={{ fontSize: '0.9em', color: '#4b5563', marginTop: 2 }}>GPA: {item.score}</div>
                  )}
                  {item.location && (
                    <div style={{ fontSize: '0.9em', color: '#4b5563', marginTop: 2 }}>{item.location}</div>
                  )}
                </li>
              );
            })}
          </ul>
          {moreCount > 0 && <div style={moreNoteStyle}>and {moreCount} more…</div>}
        </>
      );
    }
    case 'projects': {
      return (
        <>
          <ul style={{ marginBottom: '0.5rem', paddingLeft: '1.1em' }}>
            {limitedItems.map((item: any, idx: number) => (
              <li key={item.id || `proj-${idx}`} style={{ marginBottom: '0.5em', breakInside: 'avoid' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong>{item.name}</strong>
                  {item.url && (
                    <a
                      href={typeof item.url === 'string' ? item.url : item.url.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        background: `${ACCENT}12`, color: ACCENT, padding: '0.1rem 0.45rem',
                        borderRadius: 999, textDecoration: 'none', border: `1px solid ${ACCENT}33`
                      }}
                    >
                      {isGitHubUrl(item.url) ? (
                        <>
                          <BrandIcon slug="github" />
                          <span>GitHub</span>
                        </>
                      ) : isLiveUrl(item.url) ? (
                        <>
                          <i className="ph ph-bold ph-globe" />
                          <span>Live</span>
                        </>
                      ) : null}
                    </a>
                  )}
                </div>
                {item.description && (
                  <div dangerouslySetInnerHTML={{ __html: item.description }} style={{ marginTop: 4 }} />
                )}
                {item.summary && renderSummaryBullets(item.summary)}
                {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                  <div style={{ marginTop: 4 }}>Tech: {item.technologies.join(', ')}</div>
                )}
              </li>
            ))}
          </ul>
          {moreCount > 0 && <div style={moreNoteStyle}>and {moreCount} more…</div>}
        </>
      );
    }
    case 'skills': {
      return (
        <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {limitedItems.map((item: any, idx: number) => (
            <div key={item.id || `skill-${idx}`} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: `${ACCENT}12`,
                  color: '#111',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.9rem',
                  border: `1px solid ${ACCENT}33`
                }}
              >
                {item.name}
              </span>
              {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                <span style={{ color: '#4b5563' }}>{item.keywords.join(', ')}</span>
              )}
            </div>
          ))}
          {moreCount > 0 && <div style={moreNoteStyle}>and {moreCount} more…</div>}
        </div>
      );
    }
    case 'awards':
    case 'certifications':
    case 'publications':
    case 'references':
    case 'volunteer': {
      const keyPrefix = section.slice(0, 3);
      return (
        <>
          <ul style={{ marginBottom: '0.5rem', paddingLeft: '1.1em' }}>
            {limitedItems.map((item: any, idx: number) => (
              <li key={item.id || `${keyPrefix}-${idx}`} style={{ marginBottom: '0.5em' }}>
                {section === 'publications' ? (
                  <>
                    <div><strong>{item.name || item.title}</strong></div>
                    {item.publisher && <div>{item.publisher}</div>}
                  </>
                ) : section === 'references' ? (
                  <div><strong>{item.name}</strong></div>
                ) : section === 'volunteer' ? (
                  <div>
                    <strong>{item.position || item.role}</strong>
                    {item.organization && ` — ${item.organization}`}
                  </div>
                ) : (
                  <div>
                    <strong>{section === 'awards' ? item.title : item.name}</strong>
                    {section === 'awards' && item.awarder && ` — ${item.awarder}`}
                    {section === 'certifications' && item.issuer && ` — ${item.issuer}`}
                  </div>
                )}
                {item.date && <div style={{ color: '#4b5563' }}>{item.date}</div>}
                {(item.summary || item.description) && (
                  <div dangerouslySetInnerHTML={{ __html: item.summary || item.description }} style={{ marginTop: 4 }} />
                )}
              </li>
            ))}
          </ul>
          {moreCount > 0 && <div style={moreNoteStyle}>and {moreCount} more…</div>}
        </>
      );
    }
    default: {
      return (
        <ul style={{ marginBottom: '1rem', paddingLeft: '1.1em' }}>
          {limitedItems.map((item: any, idx: number) => (
            <li key={item.id || `def-${idx}`} style={{ marginBottom: '0.5em' }}>
              {item.name || item.title || item.position || item.degree || item.area || item.description || JSON.stringify(item)}
            </li>
          ))}
          {moreCount > 0 && <div style={moreNoteStyle}>and {moreCount} more…</div>}
        </ul>
      );
    }
  }
};

export const Classic = ({ columns, isFirstPage = false, resumeData: resumeDataProp }: TemplateProps) => {
  const resumeDataFromStore = useArtboardStore((state) => state.resume);
  const resumeData = resumeDataProp ?? resumeDataFromStore;
  const basics = resumeData?.basics || {};
  const [main = [], sidebar = []] = columns;
  const allSections = [...main, ...sidebar];
  const shouldShowSkillsAtEnd = !allSections.includes('skills');

  return (
    <div
      style={{
        background: '#fff',
        color: '#111',
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        fontSize: 12,
        lineHeight: 1.5,
        maxWidth: '100%',
        margin: '0 auto',
        padding: '1.25rem 1rem',
        boxSizing: 'border-box',
        minHeight: '100vh',
      }}
    >
      {isFirstPage && (
        <div style={{
          marginBottom: '1.25rem',
          borderBottom: accentRule,
          paddingBottom: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            letterSpacing: '0.01em',
            marginBottom: '0.2rem'
          }}>
            {basics.name || 'Your Name'}
          </div>
          {(basics.email || basics.phone || basics.location || basics.url?.href) && (
            <div style={{ fontSize: '0.9rem', color: '#374151', marginTop: '0.2rem' }}>
              {basics.email}
              {basics.phone && ` • ${basics.phone}`}
              {basics.location && ` • ${basics.location}`}
              {basics.url?.href && (
                <>
                  {` • `}
                  <a href={basics.url.href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    {basics.url.label || basics.url.href}
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: sidebar.length > 0 ? '1fr 2fr' : '1fr',
          gap: '1rem'
        }}
      >
        {sidebar.length > 0 && (
          <div>
            {sidebar.map((section) => (
              hasSectionContent(section, resumeData) ? (
                <Fragment key={section}>
                  <SectionTitle>{section.charAt(0).toUpperCase() + section.slice(1)}</SectionTitle>
                  {renderSection(section, resumeData)}
                </Fragment>
              ) : null
            ))}
          </div>
        )}

        <div>
          {main.map((section) => (
            hasSectionContent(section, resumeData) ? (
              <Fragment key={section}>
                <SectionTitle>{section.charAt(0).toUpperCase() + section.slice(1)}</SectionTitle>
                {renderSection(section, resumeData)}
              </Fragment>
            ) : null
          ))}

          {shouldShowSkillsAtEnd && hasSectionContent('skills', resumeData) && (
            <Fragment>
              <SectionTitle>Skills</SectionTitle>
              {renderSection('skills', resumeData)}
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};
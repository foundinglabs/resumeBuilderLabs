import React, { Fragment } from "react";
import { useArtboardStore } from "../store/artboard-store";
import type { TemplateProps } from "../types/template";
import { BrandIcon } from "../components/brand-icon";
import type { Profile } from "../utils/reactive-resume-schema";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      fontFamily: 'Times New Roman, Georgia, Arial, serif',
      fontWeight: 'bold',
      fontSize: '1.25rem', // ~20px
      borderBottom: '1px solid #222',
      marginBottom: '0.5rem', // ~8px
      marginTop: '2.0rem',   // ~32px
      letterSpacing: '0.02em',
    }}
  >
    {children}
  </h2>
);

const renderSection = (section: string, resumeData: any) => {
  if (!resumeData || !resumeData.sections) return null;
  const sec = resumeData.sections[section];
  const basics = resumeData?.basics || {};

  // Special handling for summary without duplicating headline
  if (section === 'summary') {
    if (!sec?.visible) return null;

    const hasContent = Boolean(sec.content);
    const shouldShowHeadline = basics.headline && !hasContent;

    return (
      <div style={{ marginBottom: '1.25rem' }}>
        {shouldShowHeadline && (
          <div style={{ fontSize: '1.05rem', color: '#444', fontStyle: 'italic', marginBottom: '0.35rem' }}>
            {basics.headline}
          </div>
        )}
        {hasContent && (
          <div dangerouslySetInnerHTML={{ __html: sec.content }} />
        )}
      </div>
    );
  }

  // Special handling for profiles section
  if (section === 'profiles') {
    if (!sec || !sec.visible || !Array.isArray(sec.items) || sec.items.length === 0) return null;
    
    const visibleItems = sec.items.filter((item: any) =>
      item.visible !== undefined ? item.visible : true
    );

    if (visibleItems.length === 0) return null;

    return (
      <ul style={{ marginBottom: '1.25rem', paddingLeft: '0', listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {visibleItems.map((item: Profile, idx: number) => (
          <li key={item.id || `profile-${idx}`}>
            {item.url?.href ? (
              <a 
                href={item.url.href} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#111' }}
              >
                <BrandIcon slug={item.icon || ""} />
                <span>{item.username}</span>
              </a>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

  // Filter visible items
  const visibleItems = sec.items.filter((item: any) =>
    item.visible !== undefined ? item.visible : true
  );

  if (visibleItems.length === 0) return null;

  switch (section) {
    case 'experience': {
      return (
        <ul style={{ marginBottom: '1.25rem', paddingLeft: '0', listStyle: 'none' }}>
          {visibleItems.map((item: any, idx: number) => {
            const position = item.position || item.title || '';
            const dateText = item.date || [item.startDate, item.endDate].filter(Boolean).join(' - ');
            return (
              <li key={item.id || idx} style={{ marginBottom: '1.25em', borderBottom: '1px solid #eee', paddingBottom: '0.85em' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: '1.05em' }}>{position}</strong>
                    {item.company && <span style={{ color: '#444', marginLeft: 8 }}>@ {item.company}</span>}
                    {item.location && <span style={{ color: '#888', marginLeft: 8 }}>({item.location})</span>}
                  </div>
                  {dateText && (
                    <div style={{ color: '#888', fontSize: '0.95em', whiteSpace: 'nowrap' }}>
                      {dateText}
                    </div>
                  )}
                </div>
                {item.summary && <div style={{ marginTop: 6 }} dangerouslySetInnerHTML={{ __html: item.summary }} />}
                {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                  <div style={{ marginTop: 6, color: '#555', fontSize: '0.95em' }}>
                    <span style={{ fontWeight: 500 }}>Technologies:</span> {item.technologies.join(', ')}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      );
    }
    case 'education': {
      return (
        <ul style={{ marginBottom: '1.25rem', paddingLeft: 0, listStyle: 'none' }}>
          {visibleItems.map((item: any, idx: number) => {
            const degree = item.studyType || item.degree || '';
            const fieldOfStudy = item.area || item.field_of_study || '';
            const institution = item.institution || item.school || '';
            const date = item.date || item.graduationYear || '';
            const gpa = item.score || item.gpa || '';
            const honors = item.honors || '';
            const location = item.location || '';

            return (
              <li
                key={item.id || `edu-${idx}`}
                style={{
                  marginBottom: '0.9rem',
                  paddingBottom: '0.9rem',
                  borderBottom: '1px solid #eee',
                  breakInside: 'avoid',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '0.15rem' }}>
                  {degree}
                  {fieldOfStudy && (
                    <span>
                      {degree ? `, ${fieldOfStudy}` : fieldOfStudy}
                    </span>
                  )}
                </div>
                {institution && (
                  <div style={{ color: '#333', marginBottom: '0.15rem' }}>
                    {institution}
                  </div>
                )}
                {date && (
                  <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: '0.15rem' }}>
                    {date}
                  </div>
                )}
                {gpa && (
                  <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: '0.15rem' }}>
                    GPA: {gpa}
                  </div>
                )}
                {honors && (
                  <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: '0.15rem' }}>
                    {honors}
                  </div>
                )}
                {location && (
                  <div style={{ fontSize: '0.95rem', color: '#555' }}>
                    {location}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      );
    }
    case 'projects': {
      return (
        <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.1em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `proj-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div>
                <strong>{item.name}</strong>
                {item.date && ` (${item.date})`}
              </div>
              {item.description && <div dangerouslySetInnerHTML={{ __html: item.description }} />}
              {item.summary && <div dangerouslySetInnerHTML={{ __html: item.summary }} />}
              {item.technologies && Array.isArray(item.technologies) && item.technologies.length > 0 && (
                <div>Technologies: {item.technologies.join(', ')}</div>
              )}
              {item.url && (
                <div>
                  <a 
                    href={typeof item.url === 'string' ? item.url : item.url.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {typeof item.url === 'string' ? item.url : (item.url.label || item.url.href)}
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      );
    }
    case 'skills': {
      return (
        <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {visibleItems.map((item: any, idx: number) => (
            <div key={item.id || `skill-${idx}`} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#f0f0f0',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.9rem'
                }}
              >
                {item.name}
              </span>
              {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                <span style={{ color: '#555' }}>
                  {item.keywords.join(', ')}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }
    case 'awards': {
      return (
        <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.1em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `award-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div>
                <strong>{item.title}</strong>
                {item.awarder && ` from ${item.awarder}`}
              </div>
              {item.date && <div>{item.date}</div>}
              {(item.summary || item.description) && (
                <div dangerouslySetInnerHTML={{ __html: item.summary || item.description }} />
              )}
            </li>
          ))}
        </ul>
      );
    }
    case 'certifications': {
      return (
        <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.1em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `cert-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div>
                <strong>{item.name}</strong>
                {item.issuer && ` from ${item.issuer}`}
              </div>
              {item.date && <div>{item.date}</div>}
              {(item.summary || item.description) && (
                <div dangerouslySetInnerHTML={{ __html: item.summary || item.description }} />
              )}
            </li>
          ))}
        </ul>
      );
    }
    case 'publications': {
      return (
        <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.1em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `pub-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div><strong>{item.name || item.title}</strong></div>
              {item.publisher && <div>{item.publisher}</div>}
              {item.date && <div>{item.date}</div>}
              {item.url && (
                <div>
                  <a 
                    href={typeof item.url === 'string' ? item.url : item.url.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {typeof item.url === 'string' ? item.url : (item.url.label || item.url.href)}
                  </a>
                </div>
              )}
              {(item.summary || item.description) && (
                <div dangerouslySetInnerHTML={{ __html: item.summary || item.description }} />
              )}
            </li>
          ))}
        </ul>
      );
    }
    case 'volunteer': {
      return (
        <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.1em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `vol-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div>
                <strong>{item.position || item.role}</strong>
                {item.organization && ` at ${item.organization}`}
              </div>
              {item.date && <div>{item.date}</div>}
              {(item.summary || item.description) && (
                <div dangerouslySetInnerHTML={{ __html: item.summary || item.description }} />
              )}
            </li>
          ))}
        </ul>
      );
    }
    case 'languages': {
      return (
        <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.1em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `lang-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div>
                <strong>{item.name}</strong>
                {item.description && <span style={{ marginLeft: 8, color: '#555' }}>{item.description}</span>}
              </div>
            </li>
          ))}
        </ul>
      );
    }
    case 'interests': {
      return (
        <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.1em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `interest-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div>
                <strong>{item.name}</strong>
                {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                  <span style={{ marginLeft: 8, color: '#555' }}>{item.keywords.join(', ')}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      );
    }
    case 'references': {
      return (
        <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.1em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `ref-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div>
                <strong>{item.name}</strong>
              </div>
              {(item.summary || item.description) && (
                <div dangerouslySetInnerHTML={{ __html: item.summary || item.description }} />
              )}
            </li>
          ))}
        </ul>
      );
    }
    default: {
      return (
        <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.1em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `default-${idx}`} style={{ marginBottom: '0.5em' }}>
              {item.name || item.title || item.position || item.degree || item.area || item.description || JSON.stringify(item)}
            </li>
          ))}
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
        fontFamily: 'Times New Roman, Georgia, Arial, serif',
        maxWidth: '100%',
        margin: '0 auto',
        padding: '1.5rem 1rem',
        boxSizing: 'border-box',
        minHeight: '100vh',
      }}
    >
      {isFirstPage && (
        <div style={{
          marginBottom: '1.5rem',
          borderBottom: '2px solid #222',
          paddingBottom: '0.9rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.7rem',
            fontWeight: 'bold',
            letterSpacing: '0.01em',
            marginBottom: '0.2rem'
          }}>
            {basics.name || 'Your Name'}
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: '#444',
            marginTop: '0.2rem',
            lineHeight: '1.4'
          }}>
            {basics.email}
            {basics.phone && ` | ${basics.phone}`}
            {basics.location && ` | ${basics.location}`}
          </div>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: sidebar.length > 0 ? '1fr 2fr' : '1fr',
          gap: '1.25rem'
        }}
      >
        {sidebar.length > 0 && (
          <div>
            {sidebar.map((section) => (
              <Fragment key={section}>
                <SectionTitle>{section.charAt(0).toUpperCase() + section.slice(1)}</SectionTitle>
                {renderSection(section, resumeData)}
              </Fragment>
            ))}
          </div>
        )}

        <div>
          {main.map((section) => (
            <Fragment key={section}>
              <SectionTitle>{section.charAt(0).toUpperCase() + section.slice(1)}</SectionTitle>
              {renderSection(section, resumeData)}
            </Fragment>
          ))}

          {shouldShowSkillsAtEnd && (
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
import React, { Fragment } from "react";
import { useArtboardStore } from "../store/artboard-store";
import type { TemplateProps } from "../types/template";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      fontFamily: 'Times New Roman, Georgia, Arial, serif',
      fontWeight: 'bold',
      fontSize: '1.25rem', // ~20px
      borderBottom: '1px solid #222',
      marginBottom: '0.5rem', // ~8px
      marginTop: '2.5rem',   // ~40px
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

  // Special handling for summary to include headline
  if (section === 'summary') {
    if (!sec?.visible) return null;

    return (
      <div style={{ marginBottom: '1.5rem' }}> {/* ~24px */}
        {basics.headline && (
          <div style={{ fontSize: '1.1rem', color: '#444', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            {basics.headline}
          </div>
        )}
        {/* Assuming sec.content was intended to be here based on previous versions */}
        {sec.content && (
           <div dangerouslySetInnerHTML={{ __html: sec.content }} />
        )}
      </div>
    );
  }

  // Skip interests and languages sections entirely
  if (section === 'interests' || section === 'languages') return null;

  if (!sec || !sec.visible || !Array.isArray(sec.items) || sec.items.length === 0) return null;

  // Filter visible items
  const visibleItems = sec.items.filter((item: any) =>
    item.visible !== undefined ? item.visible : true
  );

  if (visibleItems.length === 0) return null;

  switch (section) {
    case 'experience':
      return (
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '0', listStyle: 'none' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || idx} style={{ marginBottom: '1.5em', borderBottom: '1px solid #eee', paddingBottom: '1em' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <strong style={{ fontSize: '1.1em' }}>{item.title}</strong>
                  {item.company && <span style={{ color: '#444', marginLeft: 8 }}>@ {item.company}</span>}
                  {item.location && <span style={{ color: '#888', marginLeft: 8 }}>({item.location})</span>}
                </div>
                {(item.startDate || item.endDate) && (
                  <div style={{ color: '#888', fontSize: '0.95em' }}>
                    {item.startDate}{item.endDate ? ` - ${item.endDate}` : ''}
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
          ))}
        </ul>
      );
    case 'education':
      return (
        <ul style={{ marginBottom: '1.5rem', paddingLeft: 0, listStyle: 'none' }}> {/* Remove default list styling */}
          {visibleItems.map((item: any, idx: number) => {
            // Map fields from ResumeData structure to template expectations
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
                  marginBottom: '1rem', // Increased space between education entries
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #eee', // Subtle separator
                  breakInside: 'avoid', // Try to keep items together on print
                }}
              >
                {/* Degree and Field of Study */}
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  {degree}
                  {fieldOfStudy && (
                    <span>
                      {degree ? `, ${fieldOfStudy}` : fieldOfStudy}
                    </span>
                  )}
                </div>

                {/* Institution */}
                {institution && (
                  <div style={{ color: '#333', marginBottom: '0.25rem' }}>
                    {institution}
                  </div>
                )}

                {/* Date */}
                {date && (
                  <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: '0.25rem' }}>
                    {date}
                  </div>
                )}

                {/* GPA */}
                {gpa && (
                  <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: '0.25rem' }}>
                    GPA: {gpa}
                  </div>
                )}

                {/* Honors */}
                {honors && (
                  <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: '0.25rem' }}>
                    {honors}
                  </div>
                )}

                {/* Location */}
                {location && (
                  <div style={{ fontSize: '0.95rem', color: '#555' }}>
                    {location}
                  </div>
                )}
              </li>
            );
          })}
          {/* Remove the last border */}
          {visibleItems.length > 0 && (
             <style>{`ul li:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }`}</style>
          )}
        </ul>
      );
    case 'projects':
      return (
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.2em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `proj-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div>
                <strong>{item.name}</strong>
                {item.date && ` (${item.date})`}
              </div>
              {item.description && <div dangerouslySetInnerHTML={{ __html: item.description }} />}
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
    case 'skills':
      // Inline skills display
      return (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {visibleItems.map((item: any, idx: number) => (
            <span
              key={item.id || `skill-${idx}`}
              style={{
                background: '#f0f0f0',
                padding: '0.25rem 0.5rem', // ~4px 8px
                borderRadius: '0.25rem',   // ~4px
                fontSize: '0.9rem'         // ~14.4px
              }}
            >
              {item.name}
            </span>
          ))}
        </div>
      );
    case 'awards':
      return (
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.2em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `award-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div>
                <strong>{item.title}</strong>
                {item.awarder && ` from ${item.awarder}`}
              </div>
              {item.date && <div>{item.date}</div>}
              {item.description && <div dangerouslySetInnerHTML={{ __html: item.description }} />}
            </li>
          ))}
        </ul>
      );
    case 'certifications':
      return (
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.2em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `cert-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div>
                <strong>{item.name}</strong>
                {item.issuer && ` from ${item.issuer}`}
              </div>
              {item.date && <div>{item.date}</div>}
              {item.description && <div dangerouslySetInnerHTML={{ __html: item.description }} />}
            </li>
          ))}
        </ul>
      );
    case 'publications':
      return (
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.2em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `pub-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div><strong>{item.title}</strong></div>
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
            </li>
          ))}
        </ul>
      );
    case 'volunteer':
      return (
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.2em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `vol-${idx}`} style={{ marginBottom: '0.5em' }}>
              <div>
                <strong>{item.role}</strong>
                {item.organization && ` at ${item.organization}`}
              </div>
              {item.date && <div>{item.date}</div>}
              {item.description && <div dangerouslySetInnerHTML={{ __html: item.description }} />}
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.2em' }}>
          {visibleItems.map((item: any, idx: number) => (
            <li key={item.id || `default-${idx}`} style={{ marginBottom: '0.5em' }}>
              {item.name || item.title || item.position || item.degree || item.area || item.description || JSON.stringify(item)}
            </li>
          ))}
        </ul>
      );
  }
};

export const Classic = ({ columns, isFirstPage = false }: TemplateProps) => {
  const resumeData = useArtboardStore((state) => state.resume);
  const basics = resumeData?.basics || {};
  const [main] = columns;

  // Remove skills, interests, and languages from sections
  const filteredSections = main.filter(section =>
    section !== 'skills' && section !== 'interests' && section !== 'languages'
  );
  const shouldShowSkills = main.includes('skills');

  return (
    <div
      style={{
        background: '#fff',
        color: '#111',
        fontFamily: 'Times New Roman, Georgia, Arial, serif',
        maxWidth: '100%', // Allow full width on smaller screens
        margin: '0 auto',
        padding: '1.5rem 1rem', // Reduced padding for mobile
        boxSizing: 'border-box',
        minHeight: '100vh',
      }}
    >
      {isFirstPage && (
        <div style={{
          marginBottom: '2rem', // ~32px
          borderBottom: '2px solid #222',
          paddingBottom: '1rem', // ~16px
          textAlign: 'center' // Center align header content
        }}>
          <div style={{
            fontSize: '1.75rem', // ~28px, reduced from 2.25rem
            fontWeight: 'bold',
            letterSpacing: '0.01em',
            marginBottom: '0.25rem' // ~4px
          }}>
            {basics.name || 'Your Name'}
          </div>
          <div style={{
            fontSize: '0.9rem', // ~14.4px, reduced from 1rem
            color: '#444',
            marginTop: '0.25rem', // ~4px
            lineHeight: '1.4' // Improve readability
          }}>
            {basics.email}
            {basics.phone && ` | ${basics.phone}`}
            {basics.location && ` | ${basics.location}`}
          </div>
        </div>
      )}

      {/* Render all sections except skills, interests, and languages */}
      {filteredSections.map((section) => (
        <Fragment key={section}>
          <SectionTitle>{section.charAt(0).toUpperCase() + section.slice(1)}</SectionTitle>
          {renderSection(section, resumeData)}
        </Fragment>
      ))}

      {/* Render skills section at the end if it exists */}
      {shouldShowSkills && (
        <Fragment>
          <SectionTitle>Skills</SectionTitle>
          {renderSection('skills', resumeData)}
        </Fragment>
      )}
    </div>
  );
};
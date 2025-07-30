import React from "react";
import type { ResumeData } from "@/pages/builder";
import { templateService } from '@/services/template-service';
import EnhancedReactiveResumeRenderer from './EnhancedReactiveResumeRenderer';
import { TemplateErrorBoundary } from './TemplateErrorBoundary';
import { Classic } from "@/templates/classic";
import { Modern } from "@/templates/modern";
import { Stylish } from "@/templates/stylish";
import { Compact } from "@/templates/compact";
import { Overleaf } from "@/templates/overleaf";
import { Elegant } from "@/templates/elegant";
import { useArtboardStore } from "@/store/artboard-store";


interface ResumePreviewProps {
  resumeData: ResumeData;
}

export function ResumePreview({ resumeData }: ResumePreviewProps) {
  const { personalInfo, summary, experience, education, skills, template } = resumeData;
  
  // Get the mapped data from the artboard store for Reactive-Resume templates
  const artboardResume = useArtboardStore((state) => state.resume);

  // Check if it's a Reactive-Resume template with error handling
  let isReactiveResumeTemplate = false;
  try {
    isReactiveResumeTemplate = templateService.isReactiveResumeTemplate(template);
  } catch (error) {
    console.error('Error checking template type:', error);
    // Fall back to custom template rendering
    isReactiveResumeTemplate = false;
  }

  if (isReactiveResumeTemplate) {
    // Use the mapped data from the artboard store for Reactive-Resume templates
    const mappedData = artboardResume || resumeData;
    
    // Validate that we have proper Reactive-Resume data structure
    const hasValidStructure = mappedData && 
      mappedData.basics && 
      mappedData.sections && 
      mappedData.metadata;
    
    if (!hasValidStructure) {
      console.warn('Invalid Reactive-Resume data structure, attempting to map:', mappedData);
      // The EnhancedReactiveResumeRenderer will handle the mapping if needed
    }
    
    return (
      <TemplateErrorBoundary>
        <div id="resume-preview">
          <EnhancedReactiveResumeRenderer
            resumeData={mappedData}
            templateId={template}
            className="w-full"
            onError={(error) => {
              console.error('Premium template rendering error:', error);
              // Could add toast notification or error state here
            }}
          />
        </div>
      </TemplateErrorBoundary>
    );
  }

  // Wrapper component for consistent sizing and centering
  const ResumeWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-center items-center w-full h-full">
      <div className="w-full mx-auto">
        {children}
      </div>
    </div>
  );

  // Onyx Template - Formal & Executive (Updated Fancy Version)
  const renderOnyxTemplate = () => (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 w-full max-w-full md:max-w-2xl lg:max-w-3xl h-auto overflow-visible print:shadow-none print:border-0 shadow-2xl rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-slate-900 to-blue-800 text-white p-4 md:p-10 rounded-b-3xl shadow-xl flex flex-col items-center border-b-4 border-indigo-400">
        <h1 className="text-5xl font-extrabold mb-2 tracking-wide drop-shadow-lg flex items-center gap-3">
          <span className="inline-block bg-indigo-400 rounded-full w-4 h-4 mr-2"></span>
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        <div className="text-indigo-100 space-x-6 text-lg flex flex-wrap justify-center mt-2">
          <span className="flex items-center gap-1"><svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07 7.07-1.42-1.42M6.34 6.34 4.93 4.93m12.02 0-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>{personalInfo.email}</span>
          {personalInfo.phone && <span className="flex items-center gap-1"><svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm0 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2Zm12-12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V5Zm0 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2Z"/></svg>{personalInfo.phone}</span>}
          {personalInfo.address && <span className="flex items-center gap-1"><svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5Z"/></svg>{personalInfo.address}</span>}
        </div>
      </div>

      <div className="p-2 md:p-8 space-y-4 md:space-y-10 bg-gradient-to-br from-white via-slate-50 to-slate-100">
        {/* Executive Summary */}
        {summary && (
          <section className="bg-white/90 rounded-xl shadow-md p-4 md:p-6 border-l-4 border-indigo-400">
            <h2 className="text-xl md:text-2xl font-bold text-indigo-800 mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M12 4v16m0 0H3"/></svg>
              Executive Summary
            </h2>
            <p className="text-slate-700 leading-relaxed text-justify text-base md:text-lg">{summary}</p>
          </section>
        )}

        {/* Professional Experience */}
        {experience.some(exp => exp.title || exp.company) && (
          <section className="bg-white/90 rounded-xl shadow-md p-4 md:p-6 border-l-4 border-blue-400">
            <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Professional Experience
            </h2>
            <div className="space-y-4 md:space-y-6">
              {experience.map((exp, index) => (
                (exp.title || exp.company) && (
                  <div key={index} className="bg-blue-50 rounded-lg p-3 md:p-4 shadow-sm border border-blue-100">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                      <div>
                        <h3 className="font-semibold text-blue-900 text-base md:text-lg flex items-center gap-2"><svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{exp.title}</h3>
                        <p className="text-blue-700 font-medium text-sm md:text-base">{exp.company}</p>
                        {exp.location && <p className="text-blue-500 text-xs md:text-sm">{exp.location}</p>}
                      </div>
                      <div className="text-right text-blue-500 text-xs md:text-sm">
                        <p>{exp.startDate} - {exp.endDate || 'Present'}</p>
                        {exp.employment_type && <p className="text-[10px] md:text-xs">{exp.employment_type}</p>}
                      </div>
                    </div>
                    {exp.description && (
                      <div className="text-blue-800 ml-2 md:ml-4 space-y-1">
                        {exp.description.split('\n').map((line, i) => (
                          line.trim() && <p key={i}>• {line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.some(edu => edu.degree || edu.school) && (
          <section className="bg-white/90 rounded-xl shadow-md p-4 md:p-6 border-l-4 border-emerald-400">
            <h2 className="text-xl md:text-2xl font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M12 4v16m0 0H3"/></svg>
              Education
            </h2>
            <div className="space-y-2 md:space-y-3">
              {education.map((edu, index) => (
                (edu.degree || edu.school) && (
                  <div key={index} className="bg-emerald-50 rounded-lg p-3 md:p-4 shadow-sm border border-emerald-100 flex flex-col md:flex-row justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-base md:text-lg">{edu.degree}</h3>
                      <p className="text-emerald-700 text-sm md:text-base">{edu.school}</p>
                      {edu.honors && <p className="text-emerald-500 text-xs md:text-sm italic">{edu.honors}</p>}
                    </div>
                    <div className="text-right text-emerald-500 text-xs md:text-sm">
                      <p>{edu.graduationYear}</p>
                      {edu.gpa && <p>GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* Core Competencies */}
        {skills.length > 0 && (
          <section className="bg-white/90 rounded-xl shadow-md p-4 md:p-6 border-l-4 border-yellow-400">
            <h2 className="text-2xl font-bold text-yellow-800 mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>
              Core Competencies
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {skills.map((skill, index) => (
                <div key={index} className="text-yellow-900 text-sm py-1 px-2 bg-yellow-50 rounded shadow-sm border border-yellow-100 flex items-center gap-1">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>
                  {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Additional sections for extended data */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <section className="bg-white/90 rounded-xl shadow-md p-4 md:p-6 border-l-4 border-pink-400">
            <h2 className="text-2xl font-bold text-pink-800 mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 7v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7"/></svg>
              Key Projects
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((project, index) => (
                <div key={index} className="bg-pink-50 rounded-lg p-4 shadow-sm border border-pink-100">
                  <h3 className="font-semibold text-pink-900">{project.title}</h3>
                  <p className="text-pink-700 text-sm">{project.description}</p>
                  {project.technologies && (
                    <p className="text-pink-500 text-xs mt-1">
                      Technologies: {project.technologies.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  // Ditto Template - Universal ATS-Optimized
  const renderDittoTemplate = () => (
    <div className="bg-white border border-slate-200 w-full max-w-full md:max-w-2xl lg:max-w-3xl h-auto overflow-visible print:shadow-none print:border-0">
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <header className="text-center border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>
          <div className="text-slate-600 space-x-4">
            <span>{personalInfo.email}</span>
            {personalInfo.phone && <span>•</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.address && <span>•</span>}
            {personalInfo.address && <span>{personalInfo.address}</span>}
          </div>
        </header>

        {/* Summary */}
        {summary && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase">Summary</h2>
            <p className="text-slate-700 leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.some(exp => exp.title || exp.company) && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase">Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                (exp.title || exp.company) && (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-900">{exp.title}</h3>
                      <span className="text-slate-600 text-sm">{exp.startDate} - {exp.endDate || 'Present'}</span>
                    </div>
                    <p className="font-semibold text-slate-700 mb-2">{exp.company} {exp.location && `• ${exp.location}`}</p>
                    {exp.description && (
                      <ul className="text-slate-700 space-y-1 ml-4">
                        {exp.description.split('\n').map((line, i) => (
                          line.trim() && <li key={i} className="list-disc">{line}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.some(edu => edu.degree || edu.school) && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase">Education</h2>
            <div className="space-y-2">
              {education.map((edu, index) => (
                (edu.degree || edu.school) && (
                  <div key={index}>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                        <p className="text-slate-700">{edu.school}</p>
                      </div>
                      <span className="text-slate-600 text-sm">{edu.graduationYear}</span>
                    </div>
                    {edu.gpa && <p className="text-slate-600 text-sm">GPA: {edu.gpa}</p>}
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 uppercase">Skills</h2>
            <p className="text-slate-700">{skills.join(' • ')}</p>
          </section>
        )}
      </div>
    </div>
  );

  // Kakuna Template - Tech-Focused
  const renderKakunaTemplate = () => (
    <div className="bg-white border border-slate-200 w-full max-w-full md:max-w-2xl lg:max-w-3xl h-auto overflow-visible print:shadow-none print:border-0">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-green-900 text-white p-4 md:p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{personalInfo.firstName}</h1>
            <h1 className="text-2xl font-bold mb-4">{personalInfo.lastName}</h1>
            <div className="space-y-2 text-green-100 text-sm">
              <p>{personalInfo.email}</p>
              {personalInfo.phone && <p>{personalInfo.phone}</p>}
              {personalInfo.address && <p>{personalInfo.address}</p>}
            </div>
          </div>

          {/* Technical Skills */}
          {skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3 text-green-200">Technical Skills</h2>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div key={index} className="bg-green-800 px-3 py-1 rounded text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {resumeData.certifications && resumeData.certifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3 text-green-200">Certifications</h2>
              <div className="space-y-3">
                {resumeData.certifications.map((cert, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-sm">{cert.name}</h3>
                    <p className="text-green-200 text-xs">{cert.issuer}</p>
                    <p className="text-green-300 text-xs">{cert.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {resumeData.languages && resumeData.languages.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 text-green-200">Languages</h2>
              <div className="space-y-2">
                {resumeData.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm">{lang.language}</span>
                    <span className="text-green-200 text-xs">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3 p-4 md:p-8">
          {/* Summary */}
          {summary && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-green-900 mb-3 border-b-2 border-green-500 pb-1">
                Professional Summary
              </h2>
              <p className="text-slate-700 leading-relaxed">{summary}</p>
            </section>
          )}

          {/* Experience */}
          {experience.some(exp => exp.title || exp.company) && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-green-900 mb-3 border-b-2 border-green-500 pb-1">
                Experience
              </h2>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  (exp.title || exp.company) && (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900">{exp.title}</h3>
                          <p className="text-green-700 font-semibold">{exp.company}</p>
                        </div>
                        <span className="text-slate-600 text-sm bg-green-50 px-2 py-1 rounded">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </span>
                      </div>
                      {exp.description && (
                        <div className="text-slate-700 space-y-1">
                          {exp.description.split('\n').map((line, i) => (
                            line.trim() && <p key={i}>▸ {line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {resumeData.projects && resumeData.projects.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-green-900 mb-3 border-b-2 border-green-500 pb-1">
                Key Projects
              </h2>
              <div className="space-y-4">
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-slate-900">{project.title}</h3>
                    <p className="text-slate-700 text-sm mb-2">{project.description}</p>
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, i) => (
                          <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.some(edu => edu.degree || edu.school) && (
            <section>
              <h2 className="text-xl font-bold text-green-900 mb-3 border-b-2 border-green-500 pb-1">
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu, index) => (
                  (edu.degree || edu.school) && (
                    <div key={index}>
                      <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                      <p className="text-green-700">{edu.school}</p>
                      <p className="text-slate-600 text-sm">{edu.graduationYear}</p>
                    </div>
                  )
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );

  // Chikorita Template - Academic
  const renderChikoritaTemplate = () => (
    <div className="bg-white border border-slate-200 w-full max-w-full md:max-w-2xl lg:max-w-3xl h-auto overflow-visible print:shadow-none print:border-0">
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-serif text-emerald-800 mb-2">
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>
          <div className="text-slate-600 mb-4">
            {personalInfo.email} {personalInfo.phone && `• ${personalInfo.phone}`}
          </div>
          {personalInfo.address && (
            <p className="text-slate-500">{personalInfo.address}</p>
          )}
          <hr className="w-24 mx-auto border-emerald-300 mt-4" />
        </header>

        {/* Research Interests / Summary */}
        {summary && (
          <section>
            <h2 className="text-xl font-serif text-emerald-800 mb-3 border-b border-emerald-200 pb-1">
              Research Interests
            </h2>
            <p className="text-slate-700 leading-relaxed italic">{summary}</p>
          </section>
        )}

        {/* Education */}
        {education.some(edu => edu.degree || edu.school) && (
          <section>
            <h2 className="text-xl font-serif text-emerald-800 mb-3 border-b border-emerald-200 pb-1">
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu, index) => (
                (edu.degree || edu.school) && (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                        <p className="text-emerald-700 italic">{edu.school}</p>
                        {edu.field_of_study && <p className="text-slate-600 text-sm">Field: {edu.field_of_study}</p>}
                        {edu.honors && <p className="text-emerald-600 text-sm">{edu.honors}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-slate-600">{edu.graduationYear}</p>
                        {edu.gpa && <p className="text-slate-500 text-sm">GPA: {edu.gpa}</p>}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* Academic Experience */}
        {experience.some(exp => exp.title || exp.company) && (
          <section>
            <h2 className="text-xl font-serif text-emerald-800 mb-3 border-b border-emerald-200 pb-1">
              Academic & Professional Experience
            </h2>
            <div className="space-y-5">
              {experience.map((exp, index) => (
                (exp.title || exp.company) && (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                        <p className="text-emerald-700 italic">{exp.company}</p>
                        {exp.location && <p className="text-slate-600 text-sm">{exp.location}</p>}
                      </div>
                      <span className="text-slate-600 text-sm">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </span>
                    </div>
                    {exp.description && (
                      <div className="text-slate-700 ml-4">
                        {exp.description.split('\n').map((line, i) => (
                          line.trim() && <p key={i} className="mb-1">• {line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* Publications */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <section>
            <h2 className="text-xl font-serif text-emerald-800 mb-3 border-b border-emerald-200 pb-1">
              Publications & Research
            </h2>
            <div className="space-y-3">
              {resumeData.projects.map((project, index) => (
                <div key={index} className="ml-4">
                  <h3 className="font-semibold text-slate-900">{project.title}</h3>
                  <p className="text-slate-700 text-sm italic">{project.description}</p>
                  {project.link && (
                    <p className="text-emerald-600 text-sm">Available at: {project.link}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Competencies */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-xl font-serif text-emerald-800 mb-3 border-b border-emerald-200 pb-1">
              Skills & Competencies
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {skills.map((skill, index) => (
                <p key={index} className="text-slate-700">• {skill}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  // Azurill Template - Entry-Level
  const renderAzurillTemplate = () => (
    <div className="bg-white border border-slate-200 w-full max-w-full md:max-w-2xl lg:max-w-3xl h-auto overflow-visible print:shadow-none print:border-0">
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <header className="text-center bg-sky-50 p-6 rounded-lg">
          <h1 className="text-3xl font-bold text-sky-900 mb-2">
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>
          <div className="text-sky-700 space-y-1">
            <p>{personalInfo.email}</p>
            {personalInfo.phone && <p>{personalInfo.phone}</p>}
            {personalInfo.address && <p>{personalInfo.address}</p>}
          </div>
        </header>

        {/* Objective */}
        {summary && (
          <section>
            <h2 className="text-lg font-bold text-sky-900 mb-3 bg-sky-100 p-2 rounded">
              Career Objective
            </h2>
            <p className="text-slate-700 leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Education (Featured prominently) */}
        {education.some(edu => edu.degree || edu.school) && (
          <section>
            <h2 className="text-lg font-bold text-sky-900 mb-3 bg-sky-100 p-2 rounded">
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu, index) => (
                (edu.degree || edu.school) && (
                  <div key={index} className="bg-sky-25 p-4 rounded border-l-4 border-sky-400">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{edu.degree}</h3>
                        <p className="text-sky-700 font-semibold">{edu.school}</p>
                        {edu.field_of_study && <p className="text-slate-600">Major: {edu.field_of_study}</p>}
                        {edu.honors && <p className="text-sky-600 font-medium">{edu.honors}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-slate-600 font-medium">{edu.graduationYear}</p>
                        {edu.gpa && <p className="text-sky-700 font-semibold">GPA: {edu.gpa}</p>}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.some(exp => exp.title || exp.company) && (
          <section>
            <h2 className="text-lg font-bold text-sky-900 mb-3 bg-sky-100 p-2 rounded">
              Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                (exp.title || exp.company) && (
                  <div key={index} className="pl-4 border-l-2 border-sky-300">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900">{exp.title}</h3>
                        <p className="text-sky-700 font-semibold">{exp.company}</p>
                        {exp.location && <p className="text-slate-600 text-sm">{exp.location}</p>}
                      </div>
                      <span className="text-slate-600 bg-sky-50 px-2 py-1 rounded text-sm">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </span>
                    </div>
                    {exp.description && (
                      <div className="text-slate-700">
                        {exp.description.split('\n').map((line, i) => (
                          line.trim() && <p key={i} className="mb-1">• {line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-sky-900 mb-3 bg-sky-100 p-2 rounded">
              Skills
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {skills.map((skill, index) => (
                <div key={index} className="bg-sky-50 p-2 rounded text-slate-700 text-sm">
                  • {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects/Activities */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-sky-900 mb-3 bg-sky-100 p-2 rounded">
              Projects & Activities
            </h2>
            <div className="space-y-3">
              {resumeData.projects.map((project, index) => (
                <div key={index} className="pl-4 border-l-2 border-sky-300">
                  <h3 className="font-semibold text-slate-900">{project.title}</h3>
                  <p className="text-slate-700 text-sm">{project.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  // Pikachu Template - Creative
  const renderPikachuTemplate = () => (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 w-full max-w-full md:max-w-2xl lg:max-w-3xl h-auto overflow-visible print:shadow-none print:border-0">
      <div className="p-4 md:p-8">
        {/* Creative Header */}
        <header className="relative mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 rounded-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">
                {personalInfo.firstName} {personalInfo.lastName}
              </h1>
              <div className="text-yellow-100 space-y-1">
                <p className="text-lg">{personalInfo.email}</p>
                {personalInfo.phone && <p>{personalInfo.phone}</p>}
                {personalInfo.address && <p>{personalInfo.address}</p>}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column */}
          <div className="col-span-1 md:col-span-2 space-y-4 md:space-y-6">
            {/* Summary */}
            {summary && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
                <h2 className="text-xl font-bold text-yellow-800 mb-3 flex items-center">
                  <div className="w-3 h-6 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-3"></div>
                  About Me
                </h2>
                <p className="text-slate-700 leading-relaxed">{summary}</p>
              </section>
            )}

            {/* Experience */}
            {experience.some(exp => exp.title || exp.company) && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
                <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
                  <div className="w-3 h-6 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-3"></div>
                  Experience
                </h2>
                <div className="space-y-5">
                  {experience.map((exp, index) => (
                    (exp.title || exp.company) && (
                      <div key={index} className="relative pl-6">
                        <div className="absolute left-0 top-2 w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-slate-900">{exp.title}</h3>
                            <p className="text-orange-600 font-semibold">{exp.company}</p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </span>
                        </div>
                        {exp.description && (
                          <div className="text-slate-700 space-y-1">
                            {exp.description.split('\n').map((line, i) => (
                              line.trim() && <p key={i}>✨ {line}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {resumeData.projects && resumeData.projects.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
                <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
                  <div className="w-3 h-6 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-3"></div>
                  Creative Projects
                </h2>
                <div className="grid gap-4">
                  {resumeData.projects.map((project, index) => (
                    <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-bold text-slate-900 mb-2">{project.title}</h3>
                      <p className="text-slate-700 text-sm mb-2">{project.description}</p>
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech, i) => (
                            <span key={i} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Skills */}
            {skills.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
                <h2 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
                  <div className="w-3 h-5 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-3"></div>
                  Skills
                </h2>
                <div className="space-y-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="bg-gradient-to-r from-yellow-100 to-orange-100 p-2 rounded-lg">
                      <span className="text-slate-800 font-medium text-sm">{skill}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education.some(edu => edu.degree || edu.school) && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
                <h2 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
                  <div className="w-3 h-5 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-3"></div>
                  Education
                </h2>
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    (edu.degree || edu.school) && (
                      <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                        <h3 className="font-bold text-slate-900 text-sm">{edu.degree}</h3>
                        <p className="text-orange-600 font-semibold text-sm">{edu.school}</p>
                        <p className="text-slate-600 text-xs">{edu.graduationYear}</p>
                        {edu.gpa && <p className="text-yellow-700 text-xs font-medium">GPA: {edu.gpa}</p>}
                      </div>
                    )
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {resumeData.languages && resumeData.languages.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
                <h2 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
                  <div className="w-3 h-5 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-3"></div>
                  Languages
                </h2>
                <div className="space-y-2">
                  {resumeData.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center bg-gradient-to-r from-yellow-50 to-orange-50 p-2 rounded">
                      <span className="text-slate-800 font-medium text-sm">{lang.language}</span>
                      <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Template router
  const renderTemplate = () => {
    switch (template) {
      case 'onyx':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="onyx" />;
      case 'ditto':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="ditto" />;
      case 'kakuna':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="kakuna" />;
      case 'chikorita':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="chikorita" />;
      case 'azurill':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="azurill" />;
      case 'pikachu':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="pikachu" />;
      case 'bronzor':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="bronzor" />;
      case 'gengar':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="gengar" />;
      case 'glalie':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="glalie" />;
      case 'leafish':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="leafish" />;
      case 'nosepass':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="nosepass" />;
      case 'rhyhorn':
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="rhyhorn" />;
      case 'classic':
        return <Classic columns={[['summary','experience','education','projects','skills','languages','interests'], []]} isFirstPage={true} resumeData={resumeData} />;
      case 'modern':
        return <Modern columns={[
          [
            'summary',
            'experience',
            'projects',
            'education',
            'awards',
            'certifications',
            'publications',
            'volunteer',
            'references'
          ],
          [
            'skills',
            'languages',
            'interests'
          ]
        ]} isFirstPage={true} resumeData={resumeData} />;
      case 'stylish':
        return <Stylish columns={[['summary','experience','projects','education'], ['skills','languages','interests']]} isFirstPage={true} resumeData={resumeData} />;
      case 'compact':
        return <Compact columns={[['summary','experience','projects','education','skills','languages','interests'], []]} isFirstPage={true} resumeData={resumeData} />;
      case 'overleaf':
        return <Overleaf columns={[['summary','experience','projects','education'], ['skills','languages','interests']]} isFirstPage={true} resumeData={resumeData} />;
      case 'elegant':
        return <Elegant columns={[['summary','experience','projects','education'], ['skills','languages','interests']]} isFirstPage={true} resumeData={resumeData} />;
      default:
        return <EnhancedReactiveResumeRenderer resumeData={resumeData} templateId="ditto" />; // Default to Universal template
    }
  };

  return (
    <div className="resume-preview" id="resume-preview">
      <ResumeWrapper>
        {renderTemplate()}
      </ResumeWrapper>
    </div>
  );
}
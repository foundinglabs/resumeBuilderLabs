import {
  Mail,
  Phone,
  MapPin,
  Globe,
  GraduationCap,
  Building,
  Code,
  Github,
  Linkedin,
  Twitter,
  Award,
  BookOpen,
  Heart,
  Languages,
} from "lucide-react"
import type { Resume } from "@/types/resume"
import { useArtboardStore } from "../store/artboard-store"
import type { TemplateProps } from "../types/template"

interface ResumeTemplateTwoProps {
  resume: Resume
}

export function ResumeTemplateTwo({ resume }: ResumeTemplateTwoProps) {
  const basics = resume?.basics || {}
  const sections = resume?.sections || {}

  const SkillBar = ({ skill, level }: { skill: string; level: number }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-white">{skill}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full ${i < level ? "bg-white" : "bg-teal-400"}`} />
        ))}
      </div>
    </div>
  )

  const getInterestIcon = (name: string) => {
    // Use a simple text-based approach instead of importing many icons
    const iconText: Record<string, string> = {
      Photography: "📷",
      "Music Production": "🎵",
      "Open Source": "💻",
      "Cloud Computing": "☁️",
      "Machine Learning": "🤖",
      Travel: "✈️",
      Cinema: "🎬",
      Books: "📚",
      Theatre: "🎭",
      Videogames: "🎮",
    }
    return iconText[name] || "📚"
  }

  const getHref = (url: string | { href?: string } | undefined): string => {
    if (!url) return ""
    if (typeof url === "string") return url
    return url?.href ?? ""
  }

  return (
    <div className="w-full max-w-[794px] min-h-screen lg:min-h-[1123px] mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:min-h-0">
      <div className="flex flex-col lg:flex-row min-h-full">
        {/* Left Sidebar */}
        <div className="bg-blue-900 text-white p-6 space-y-6 lg:w-1/3 flex-shrink-0">
          {/* Profile Photo */}
          {basics?.picture?.effects?.hidden !== true && (
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white">
                <img
                  src={basics?.picture?.url || "/placeholder.svg?height=128&width=128&query=professional%20headshot"}
                  alt="Profile"
                  className={`w-full h-full object-cover ${basics?.picture?.effects?.grayscale ? "grayscale" : ""}`}
                />
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">CONTACT</h2>
            <div className="space-y-3">
              {basics.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">{basics.phone}</span>
                </div>
              )}
              {basics.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm break-all">{basics.email}</span>
                </div>
              )}
              {basics.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">{basics.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          {sections?.education?.visible &&
            (sections?.education?.items?.filter((i: any) => i?.visible) || []).length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">EDUCATION</h2>
                <div className="space-y-4">
                  {(sections.education.items as any[])
                    .filter((item) => item?.visible)
                    .map((edu) => (
                      <div key={edu.id}>
                        <p className="text-sm font-medium mb-1">{edu.date}</p>
                        <p className="font-bold text-sm mb-1">{edu.institution}</p>
                        <p className="text-sm uppercase">{edu.studyType} {edu.area}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* Skills */}
          {sections?.skills?.visible && (sections?.skills?.items?.filter((i: any) => i?.visible) || []).length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">AREAS OF EXPERTISE</h2>
              <ul className="space-y-1">
                {(sections.skills.items as any[])
                  .filter((item) => item?.visible)
                  .map((skill) => (
                    <li key={skill.id} className="text-sm flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-3 flex-shrink-0"></span>
                      {skill.name}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Additional Skills Section */}
          {sections?.interests?.visible && (sections?.interests?.items?.filter((i: any) => i?.visible) || []).length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">SKILLS</h2>
              <ul className="space-y-1">
                {(sections.interests.items as any[])
                  .filter((item) => item?.visible)
                  .map((interest) => (
                    <li key={interest.id} className="text-sm flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-3 flex-shrink-0"></span>
                      {interest.name}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Certifications */}
          {sections?.certifications?.visible &&
            (sections?.certifications?.items?.filter((i: any) => i?.visible) || []).length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">CERTIFICATION</h2>
                <ul className="space-y-1">
                  {(sections.certifications.items as any[])
                    .filter((item) => item?.visible)
                    .map((cert) => (
                      <li key={cert.id} className="text-sm flex items-center">
                        <span className="w-2 h-2 bg-white rounded-full mr-3 flex-shrink-0"></span>
                        {cert.name}
                      </li>
                    ))}
                </ul>
              </div>
            )}
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6 lg:w-2/3 flex-1">
          {/* Header with Name and Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 tracking-wide uppercase">{basics.name}</h1>
            <h2 className="text-xl text-gray-600 uppercase tracking-wider">{basics.headline}</h2>
          </div>

          {/* Profile */}
          {sections?.summary?.visible && sections?.summary?.content && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2 uppercase tracking-wide">PROFILE</h2>
              <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: sections.summary.content }} />
            </div>
          )}

          {/* Work Experience */}
          {sections?.experience?.visible &&
            (sections?.experience?.items?.filter((i: any) => i?.visible) || []).length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2 uppercase tracking-wide">WORK EXPERIENCE</h2>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                  <div className="space-y-6">
                    {(sections.experience.items as any[])
                      .filter((item) => item?.visible)
                      .map((exp, index) => (
                        <div key={exp.id} className="relative pl-12">
                          <div className="absolute left-4 top-1 w-4 h-4 bg-blue-900 rounded-full border-2 border-white"></div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg">{exp.position}</h3>
                              <p className="text-gray-600 font-medium">{exp.company}</p>
                            </div>
                            <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{exp.date}</span>
                          </div>
                          {exp.summary && (
                            <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.summary }} />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

          {/* References */}
          {sections?.references?.visible &&
            (sections?.references?.items?.filter((i: any) => i?.visible) || []).length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2 uppercase tracking-wide">REFERENCE</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(sections.references.items as any[])
                    .filter((item) => item?.visible)
                    .map((ref) => (
                      <div key={ref.id} className="text-sm">
                        <p className="font-bold text-gray-800 mb-1">{ref.name}</p>
                        <p className="text-gray-600 mb-2">{ref.description}</p>
                        {getHref(ref.url) && (
                          <p className="text-gray-500">
                            Phone: {ref.url?.label || getHref(ref.url)}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

// Reactive-Resume expects a named export 'Azurill'. Wrap the above template and feed data from the store.
export const Azurill = ({ columns }: TemplateProps) => {
  const resume = useArtboardStore((s: any) => s.resume) || {} as unknown as Resume;
  return <ResumeTemplateTwo resume={resume} />;
};

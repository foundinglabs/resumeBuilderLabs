import type React from "react"
import { Fragment, memo, useMemo } from "react"
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Calendar,
  AwardIcon,
  Users,
  Briefcase,
  ExternalLink,
  GraduationCap,
  BookOpen,
  Star,
  Target,
} from "lucide-react"
import { useArtboardStore } from "../store/artboard-store"
import { sanitize, isEmptyString } from "../utils/reactive-resume-utils"
import type { TemplateProps } from "../types/template"
import type { SectionWithItem, CustomSectionGroup } from "../utils/reactive-resume-schema"
import { cn } from "../utils/reactive-resume-utils"

// Safe helpers (following Ditto's pattern)
function getHref(url: string | any | undefined): string {
  if (!url) return ""
  if (typeof url === "string") return url
  return url?.href ?? ""
}

function isGitHubUrl(url: string | any | undefined): boolean {
  const u = getHref(url)?.toLowerCase?.() || ""
  return u.includes("github.com")
}

function isLinkedInUrl(url: string | any | undefined): boolean {
  const u = getHref(url)?.toLowerCase?.() || ""
  return u.includes("linkedin.com")
}

function getInitials(name?: string): string {
  if (!name) return ""
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

function hasContent(html?: string): boolean {
  if (!html) return false
  const text = html.replace(/<[^>]*>/g, "").trim()
  return text.length > 0
}

function levelToLabel(level?: number, description?: string): string {
  if (description && description.trim()) return description
  if (typeof level !== "number") return ""
  if (level >= 5) return "Native"
  if (level === 4) return "Fluent"
  if (level === 3) return "Professional"
  if (level === 2) return "Conversational"
  if (level === 1) return "Basic"
  return ""
}

function capArray<T>(arr: T[] = [], max: number): { items: T[]; more: number } {
  if (!Array.isArray(arr)) return { items: [], more: 0 }
  const items = arr.slice(0, Math.max(0, max))
  const more = Math.max(0, arr.length - items.length)
  return { items, more }
}

// Bullet extraction for summaries (following Ditto's pattern)
function extractBulletLines(summaryHtml: string): string[] {
  const safe = sanitize(summaryHtml || "")
  const liMatches = Array.from(safe.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((m) => m[1] || "")
  const base = liMatches.length > 0 ? liMatches : safe.split(/<br\s*\/?>|<\/p>|\n/gi)
  return base
    .map((s) => s.replace(/<[^>]*>/g, "").replace(/^\s*[•\-\u2022]?\s*/, "").trim())
    .filter(Boolean)
}

const formatLocation = (location: any): string => {
  if (!location) return ""
  if (typeof location === "string") return location

  const parts = []
  if (location.city) parts.push(location.city)
  if (location.region) parts.push(location.region)
  if (location.countryCode) parts.push(location.countryCode)

  return parts.join(", ")
}

// Updated content limits (following Ditto's more generous approach)
const MAX_EXPERIENCE = 3
const MAX_PROJECTS = 2
const MAX_SKILL_GROUPS = 3
const MAX_KEYWORDS_PER_SKILL = 6
const MAX_EDUCATION = 2
const MAX_ACHIEVEMENTS_TOTAL = 4
const MAX_LANGUAGES = 3

// Enhanced Header (following Ditto's structure)
const Header = memo(({ resumeData }: { resumeData: any }) => {
  const basics = resumeData?.basics
  const profiles = resumeData?.sections?.profiles?.items?.filter((i: any) => i?.visible) ?? []

  const portfolioHref = getHref(basics?.url)
  const linkedInProfile = profiles.find((p: any) => isLinkedInUrl(p?.url))
  const githubProfile = profiles.find((p: any) => isGitHubUrl(p?.url))

  // Social Chip component (following Ditto's pattern)
  const SocialChip = ({
    href,
    icon,
    label,
  }: {
    href?: string
    icon: React.ReactNode
    label: string
  }) => {
    const hasHref = !!href
    const baseClass = "flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300 hover:scale-105"
    const enabledClass = "bg-white/20 hover:bg-white/30 print:hover:bg-white/20 shadow-lg hover:shadow-xl"
    const disabledClass = "bg-white/10 opacity-60 cursor-default"
    
    if (hasHref) {
      return (
        <a href={href} target="_blank" rel="noreferrer noopener" className={`${baseClass} ${enabledClass}`}>
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </a>
      )
    }
    return (
      <div className={`${baseClass} ${disabledClass}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
    )
  }

  return (
    <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white p-2 md:p-3 overflow-hidden">
      {/* Animated gradient cursor effect (following Ditto's pattern) */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex flex-row flex-wrap items-start gap-2 md:gap-3">
          {/* Profile Picture - Enhanced (following Ditto's pattern) */}
          <div 
            className="overflow-hidden border border-white/20 shadow-lg backdrop-blur-sm relative"
            style={{
              width: `${basics?.picture?.size || 60}px`,
              height: `${basics?.picture?.size || 60}px`,
              borderRadius: `${basics?.picture?.borderRadius || 50}%`,
              border: basics?.picture?.effects?.border ? '2px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {basics?.picture && 
             !basics?.picture?.effects?.hidden &&
             (typeof basics.picture === 'string' ? basics.picture.trim() !== "" : basics.picture.url?.trim() !== "") ? (
              <img 
                src={typeof basics.picture === 'string' ? basics.picture : basics.picture.url} 
                alt={basics?.name || "Profile"} 
                className="w-full h-full object-cover"
                style={{
                  filter: basics?.picture?.effects?.grayscale ? 'grayscale(100%)' : 'none'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.parentElement?.querySelector('.fallback-initials')
                  if (fallback) {
                    fallback.classList.remove('hidden')
                  }
                }}
              />
            ) : (
              <img
                src="/templates/jpg/image.png"
                alt="Default Profile"
                className="w-full h-full object-cover"
                style={{
                  filter: basics?.picture?.effects?.grayscale ? 'grayscale(100%)' : 'none'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.parentElement?.querySelector('.fallback-initials')
                  if (fallback) {
                    fallback.classList.remove('hidden')
                  }
                }}
              />
            )}
            <div className="fallback-initials hidden absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 flex items-center justify-center text-lg md:text-xl font-serif font-bold"
                 style={{
                   borderRadius: `${basics?.picture?.borderRadius || 50}%`
                 }}>
              {getInitials(basics?.name) || ""}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl lg:text-2xl font-serif font-bold mb-0.5 md:mb-1 text-white drop-shadow-sm">
              {basics?.name || ""}
            </h1>
            <p className="text-xs md:text-sm lg:text-base text-emerald-100 mb-1 md:mb-2 font-medium">
              {basics?.headline || basics?.label || ""}
            </p>
            <div className="flex flex-row items-center gap-2 md:gap-3 text-xs md:text-sm flex-nowrap overflow-x-auto">
              {basics?.email && (
                <div className="flex items-center gap-1 md:gap-1.5">
                  <Mail className="w-3 h-3 md:w-4 md:h-4" />
                  <a href={`mailto:${basics.email}`} className="text-white hover:text-emerald-200 transition-colors" target="_blank" rel="noreferrer noopener">
                    {basics.email}
                  </a>
                </div>
              )}
              {basics?.phone && (
                <div className="flex items-center gap-1 md:gap-1.5">
                  <Phone className="w-3 h-3 md:w-4 md:h-4" />
                  <a href={`tel:${basics.phone}`} className="text-white hover:text-emerald-200 transition-colors" target="_blank" rel="noreferrer noopener">
                    {basics.phone}
                  </a>
                </div>
              )}
              {basics?.location && (
                <div className="flex items-center gap-1 md:gap-1.5">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-white">{formatLocation(basics.location)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links (following Ditto's pattern) */}
        <div className="flex flex-wrap gap-1 md:gap-2 mt-2 md:mt-3">
          <SocialChip href={portfolioHref || undefined} icon={<Globe className="w-3 h-3 md:w-4 md:h-4" />} label="Portfolio" />
          <SocialChip href={getHref(linkedInProfile?.url) || undefined} icon={<Linkedin className="w-3 h-3 md:w-4 md:h-4" />} label="LinkedIn" />
          <SocialChip href={getHref(githubProfile?.url) || undefined} icon={<Github className="w-3 h-3 md:w-4 md:h-4" />} label="GitHub" />
        </div>
      </div>
    </div>
  )
})

Header.displayName = 'Header'

// Enhanced Section Title (following Ditto's pattern)
const SectionTitle = ({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) => (
  <h2 className="text-sm sm:text-base font-serif font-bold text-gray-800 mb-1 flex items-center gap-1 print:text-sm print:mb-1">
    {icon && <div className="text-emerald-600">{icon}</div>}
    {children}
  </h2>
)

// Enhanced Section component (following Ditto's pattern)
const Section = <T extends { visible?: boolean; id?: string }>(
  {
    section,
    children,
    className,
  }: {
    section: SectionWithItem<T> | CustomSectionGroup
    children?: (item: T) => React.ReactNode
    className?: string
  }
) => {
  if (!section?.visible || !('items' in section) || section.items.length === 0) return null
  
  const visibleItems = section.items.filter((item) => 
    typeof item.visible === 'undefined' ? true : item.visible
  )
  
  if (visibleItems.length === 0) return null

  return (
    <section id={'id' in section ? section.id : section.name} className="grid">
      <div className="mb-1 font-bold text-gray-700">
        <h4 className="text-sm">{section.name}</h4>
      </div>
      <div className={cn("grid gap-x-2 md:gap-x-3 gap-y-1", className)} style={{ gridTemplateColumns: `repeat(${"columns" in section ? section.columns : 1}, 1fr)` }}>
        {visibleItems.map((item) => (
          <div key={item.id || Math.random()} className="relative space-y-1 border-gray-200 border-l-2 pl-2">
            <div>{children?.(item as T)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// Enhanced mapSectionToComponent (following Ditto's structure)
const mapSectionToComponent = (section: string, resumeData: any) => {
  const sec = resumeData?.sections?.[section]
  if (!sec) return null
  
  switch (section) {
    case "summary": {
      if (!sec?.visible || isEmptyString(sec?.content)) return null
      return (
        <section id={sec.id} className="mb-2">
          <SectionTitle icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}>
            About Me
          </SectionTitle>
          <div
            className="text-gray-600 leading-relaxed text-xs sm:text-sm print:text-xs print:leading-normal wysiwyg"
            dangerouslySetInnerHTML={{ __html: sanitize(sec.content) }} 
          />
        </section>
      )
    }
    case "experience": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null
      const { items: experienceItems, more: experienceMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), MAX_EXPERIENCE)
      
      return (
        <section key="experience" className="mb-2">
          <SectionTitle icon={<Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />}>
            Experience
          </SectionTitle>
          <div className="space-y-1">
            {experienceItems.map((item: any, idx: number) => {
              const expAccentColors = ["#10b981", "#059669", "#047857"] // Emerald shades
              return (
                <div key={item.id || idx} className="relative pl-3 sm:pl-4 border-l-2 border-emerald-200 print:pl-3">
                  <div
                    className="absolute -left-1 sm:-left-1.5 top-0 w-2 h-2 sm:w-3 sm:h-3 rounded-full print:w-2 print:h-2 print:-left-1"
                    style={{ backgroundColor: expAccentColors[idx % 3] }}
                  />
                  <div className="flex items-center justify-between gap-1 mb-1 print:mb-0.5">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 print:text-xs flex-shrink-0">{item.position}</h3>
                    <p className="font-medium text-xs print:text-xs" style={{ color: expAccentColors[idx % 3] }}>
                      {item.company}
                      {item.location && ` • ${formatLocation(item.location)}`}
                    </p>
                    <span className="text-xs text-gray-500 flex items-center gap-1 print:text-xs flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>
                  {item.summary && (
                    <ul className="text-gray-600 space-y-0.5 text-xs print:text-xs print:space-y-0 list-disc pl-3">
                      {extractBulletLines(item.summary).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
          {experienceMore > 0 && <div className="text-xs text-gray-500"></div>}
        </section>
      )
    }
    case "projects": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null
      const { items: projectItems, more: projectMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), MAX_PROJECTS)
      
      return (
        <section key="projects" className="mb-2">
          <SectionTitle icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />}>
            Featured Projects
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:gap-1">
            {projectItems.map((proj: any, idx: number) => (
              <div
                key={proj.id || idx}
                className={`p-2 rounded-lg border print:p-1 ${idx % 2 === 0 ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100" : "bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100"}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1 print:text-xs print:mb-0.5">{proj.name}</h3>
                  {getHref(proj.url) && (
                    <a
                      href={getHref(proj.url)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded-full"
                    >
                      {isGitHubUrl(proj.url) ? <Github className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                      <span>{isGitHubUrl(proj.url) ? "GitHub" : "Live"}</span>
                    </a>
                  )}
                </div>
                {proj.summary && (
                  <div className="text-gray-600 text-xs mb-1 print:text-xs print:mb-0.5 wysiwyg" dangerouslySetInnerHTML={{ __html: sanitize(proj.summary) }} />
                )}
                {!proj.summary && proj.description && (
                  <p className="text-gray-600 text-xs mb-1 print:text-xs print:mb-0.5">{proj.description}</p>
                )}
                {Array.isArray(proj.keywords) && proj.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {proj.keywords.slice(0, MAX_KEYWORDS_PER_SKILL).map((k: string, i: number) => (
                      <span
                        key={i}
                        className="px-1 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded"
                      >
                        {k}
                      </span>
                    ))}
                    {proj.keywords.length > MAX_KEYWORDS_PER_SKILL && (
                      <span className="px-1 py-0.5 text-xs rounded bg-cyan-100 text-cyan-700"></span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {projectMore > 0 && <div className="text-xs text-gray-500 mt-1"></div>}
        </section>
      )
    }
    case "education": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null
      const { items: educationItems, more: educationMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), MAX_EDUCATION)
      
      return (
        <section key="education" className="mb-2">
          <SectionTitle icon={<GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />}>
            Education
          </SectionTitle>
          <div className="space-y-1">
            {educationItems.map((ed: any, idx: number) => (
              <div key={ed.id || idx}>
                <h3 className="font-semibold text-gray-800 text-xs print:text-xs">{ed.area || ed.studyType || ed.degree}</h3>
                <p className={`${idx % 2 === 0 ? "text-emerald-600" : "text-teal-600"} font-medium text-xs print:text-xs`}>{ed.institution || ed.school}</p>
                <p className="text-gray-500 text-xs">{ed.date || ed.graduationYear}</p>
                {(ed.score || ed.gpa) && <p className="text-gray-600 text-xs mt-0.5">GPA: {ed.score || ed.gpa}</p>}
                {ed.location && <p className="text-gray-600 text-xs">{formatLocation(ed.location)}</p>}
                {ed.honors && <p className="text-gray-600 text-xs">{ed.honors}</p>}
              </div>
            ))}
          </div>
          {educationMore > 0 && <div className="text-xs text-gray-500 mt-1"></div>}
        </section>
      )
    }
    case "skills": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null
      const { items: skillGroups, more: skillsMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), MAX_SKILL_GROUPS)
      
      return (
        <section key="skills" className="mb-2">
          <SectionTitle icon={<AwardIcon className="w-4 h-4 sm:w-5 sm:h-5" />}>
            Skills
          </SectionTitle>
          <div className="space-y-1">
            {skillGroups.map((skill: any, idx: number) => (
              <div key={skill.id || idx}>
                <h3 className="font-semibold text-gray-700 mb-1 text-xs print:text-xs print:mb-0.5">{skill.name}</h3>
                {Array.isArray(skill.keywords) && skill.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {skill.keywords.slice(0, MAX_KEYWORDS_PER_SKILL).map((kw: string, i: number) => (
                      <span key={i} className={`px-1 py-0.5 text-xs rounded-full ${idx % 2 === 0 ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-700"}`}>{kw}</span>
                    ))}
                    {skill.keywords.length > MAX_KEYWORDS_PER_SKILL && (
                      <span className={`px-1 py-0.5 text-xs rounded-full ${idx % 2 === 0 ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-700"}`}></span>
                    )}
                  </div>
                )}
                {skill.description && <p className="text-xs text-gray-600 mt-0.5">{skill.description}</p>}
              </div>
            ))}
            {skillsMore > 0 && <div className="text-xs text-gray-500"></div>}
          </div>
        </section>
      )
    }
    case "languages": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null
      const { items: languageItems, more: languageMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), MAX_LANGUAGES)
      
      return (
        <section key="languages" className="mb-2">
          <SectionTitle>Languages</SectionTitle>
          <div className="space-y-1">
            {languageItems.map((lng: any, idx: number) => (
              <div key={lng.id || idx} className="flex justify-between items-center">
                <span className="text-gray-700 text-xs print:text-xs">{lng.name}</span>
                <span className="text-xs text-gray-500">{levelToLabel((lng as any).level, lng.description)}</span>
              </div>
            ))}
            {languageMore > 0 && <div className="text-xs text-gray-500"></div>}
          </div>
        </section>
      )
    }
    case "interests": {
      // Add proper visibility and content checks
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null
      const { items: interestItems, more: interestMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), 5)
      
      return (
        <section key="interests" className="mb-2">
          <SectionTitle icon={<Star className="w-4 h-4 sm:w-5 sm:h-5" />}>
            Interests
          </SectionTitle>
          <div className="flex flex-wrap gap-1">
            {interestItems.map((item: any, idx: number) => (
              <span
                key={item.id || idx}
                className="px-1 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs"
              >
                {item.name}
                {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                  <span className="text-gray-600">: {item.keywords.join(', ')}</span>
                )}
              </span>
            ))}
            {interestMore > 0 && <div className="text-xs text-gray-500"></div>}
          </div>
        </section>
      )
    }
    case "awards": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null
      const awardsAll = sec.items.filter((item: any) => item?.visible !== false)
      const certsAll = resumeData?.sections?.certifications?.items?.filter((item: any) => item?.visible !== false) ?? []
      const combinedAch = [
        ...awardsAll.map((a: any) => ({ type: "award" as const, value: a })),
        ...certsAll.map((c: any) => ({ type: "cert" as const, value: c })),
      ]
      
      // Check if there are actually any achievements to display
      if (combinedAch.length === 0) return null
      
      const { items: achievementsItems, more: achievementsMore } = capArray(combinedAch, MAX_ACHIEVEMENTS_TOTAL)
      
      return (
        <section key="achievements" className="mb-2">
          <SectionTitle icon={<Star className="w-4 h-4 sm:w-5 sm:h-5" />}>
            Achievements
          </SectionTitle>
          <div className="space-y-1">
            {achievementsItems.map((entry: any, idx: number) => (
              <div key={(entry.value as any).id || idx} className="flex items-start gap-1">
                <div className={`w-1 h-1 rounded-full mt-1 flex-shrink-0 ${idx % 4 === 0 ? "bg-emerald-500" : idx % 4 === 1 ? "bg-teal-500" : idx % 4 === 2 ? "bg-cyan-500" : "bg-blue-500"}`} />
                {entry.type === "award" ? (
                  <p className="text-gray-600 text-xs">{[entry.value.title, entry.value.awarder, entry.value.date].filter(Boolean).join(" • ")}</p>
                ) : (
                  <p className="text-gray-600 text-xs">{[entry.value.name, entry.value.issuer, entry.value.date].filter(Boolean).join(" • ")}</p>
                )}
              </div>
            ))}
            {achievementsMore > 0 && <div className="text-xs text-gray-500"></div>}
          </div>
        </section>
      )
    }
    case "certifications": {
      // Add proper visibility and content checks (following the pattern of other sections)
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null
      const { items: certItems, more: certMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), MAX_ACHIEVEMENTS_TOTAL)
      
      return (
        <section key="certifications" className="mb-2">
          <SectionTitle icon={<AwardIcon className="w-4 h-4 sm:w-5 sm:h-5" />}>
            Certifications
          </SectionTitle>
          <div className="space-y-1">
            {certItems.map((item: any, idx: number) => (
              <div key={item.id || idx} className="flex items-start gap-1">
                <div className={`w-1 h-1 rounded-full mt-1 flex-shrink-0 ${idx % 4 === 0 ? "bg-emerald-500" : idx % 4 === 1 ? "bg-teal-500" : idx % 4 === 2 ? "bg-cyan-500" : "bg-blue-500"}`} />
                <div>
                  <p className="text-gray-700 text-xs font-medium">{item.name}</p>
                  <p className="text-gray-600 text-xs">
                    {[item.issuer, item.date].filter(Boolean).join(" • ")}
                  </p>
                  {(item.summary || item.description) && (
                    <div
                      className="text-xs text-gray-600 mt-0.5 wysiwyg"
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
                    />
                  )}
                </div>
              </div>
            ))}
            {certMore > 0 && <div className="text-xs text-gray-500"></div>}
          </div>
        </section>
      )
    }
    case "publications": {
      // Add proper visibility and content checks
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null
      const { items: pubItems, more: pubMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), 3)
      
      return (
        <section key="publications" className="mb-2">
          <SectionTitle icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />}>
            Publications
          </SectionTitle>
          <div className="space-y-1">
            {pubItems.map((item: any, idx: number) => (
              <div key={item.id || idx} className="flex items-start gap-1">
                <div className={`w-1 h-1 rounded-full mt-1 flex-shrink-0 ${idx % 4 === 0 ? "bg-emerald-500" : idx % 4 === 1 ? "bg-teal-500" : idx % 4 === 2 ? "bg-cyan-500" : "bg-blue-500"}`} />
                <div>
                  <p className="text-gray-700 text-xs font-medium">{item.name || item.title}</p>
                  <p className="text-gray-600 text-xs">
                    {[item.publisher, item.date].filter(Boolean).join(" • ")}
                  </p>
                  {item.url && (
                    <a
                      href={typeof item.url === 'string' ? item.url : item.url.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-[11px] text-emerald-600 underline hover:text-emerald-800"
                    >
                      {typeof item.url === 'string' ? item.url : (item.url.label || item.url.href)}
                    </a>
                  )}
                  {(item.summary || item.description) && (
                    <div
                      className="text-xs text-gray-600 mt-0.5 wysiwyg"
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
                    />
                  )}
                </div>
              </div>
            ))}
            {pubMore > 0 && <div className="text-xs text-gray-500"></div>}
          </div>
        </section>
      )
    }
    case "references": {
      // Add proper visibility and content checks
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null
      const { items: refItems, more: refMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), 3)
      
      return (
        <section key="references" className="mb-2">
          <SectionTitle icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}>
            References
          </SectionTitle>
          <div className="space-y-1">
            {refItems.map((item: any, idx: number) => (
              <div key={item.id || idx} className="flex items-start gap-1">
                <div className={`w-1 h-1 rounded-full mt-1 flex-shrink-0 ${idx % 4 === 0 ? "bg-emerald-500" : idx % 4 === 1 ? "bg-teal-500" : idx % 4 === 2 ? "bg-cyan-500" : "bg-blue-500"}`} />
                <div>
                  <p className="text-gray-700 text-xs font-medium">{item.name}</p>
                  {(item.summary || item.description) && (
                    <div
                      className="text-xs text-gray-600 mt-0.5 wysiwyg"
                      dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
                    />
                  )}
                </div>
              </div>
            ))}
            {refMore > 0 && <div className="text-xs text-gray-500"></div>}
          </div>
        </section>
      )
    }
    case "profiles": {
      // Don't render profiles section in body since they're already in header
      return null
    }
  }
}

export const Azurill = memo(({ columns, isFirstPage = false, resumeData: resumeDataProp }: TemplateProps) => {
  const resumeDataFromStore = useArtboardStore((state) => state.resume)
  const resumeData = resumeDataProp ?? resumeDataFromStore
  const [main = [], sidebar = []] = columns

  return (
    <div className="w-full max-w-6xl mx-auto bg-white shadow-xl print:shadow-none print:w-full print:max-w-none rounded-lg overflow-hidden min-h-screen">
      {isFirstPage && <Header resumeData={resumeData} />}

      <div className="p-2 md:p-3 print:p-2">
        {/* About Me Section - Right below header */}
        {mapSectionToComponent("summary", resumeData)}
        
        {/* Experience Section - Right after About Me */}
        {mapSectionToComponent("experience", resumeData)}
        
        {/* Education Section - Right after Experience */}
        {mapSectionToComponent("education", resumeData)}

        {/* Skills and other sections */}
        {mapSectionToComponent("skills", resumeData)}
        {mapSectionToComponent("projects", resumeData)}
        {mapSectionToComponent("languages", resumeData)}
        {mapSectionToComponent("awards", resumeData)}
        {mapSectionToComponent("interests", resumeData)}
        {mapSectionToComponent("certifications", resumeData)}
        {mapSectionToComponent("publications", resumeData)}
        {mapSectionToComponent("references", resumeData)}
      </div>
    </div>
  )
})

Azurill.displayName = 'Azurill'
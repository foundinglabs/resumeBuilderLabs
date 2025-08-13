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
import { resumes } from "@shared/schema"

// Safe helpers
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

// Bullet extraction for summaries
function extractBulletLines(summaryHtml: string): string[] {
  const safe = sanitize(summaryHtml || "")
  const liMatches = Array.from(safe.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((m) => m[1] || "")
  const base = liMatches.length > 0 ? liMatches : safe.split(/<br\s*\/?>|<\/p>|\n/gi)
  return base
    .map((s) =>
      s
        .replace(/<[^>]*>/g, "")
        .replace(/^\s*[•\-\u2022]?\s*/, "")
        .trim(),
    )
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

// Ultra-compact limits for single A4 page
const MAX_EXPERIENCE = 2
const MAX_PROJECTS = 1
const MAX_SKILL_GROUPS = 2
const MAX_KEYWORDS_PER_SKILL = 3
const MAX_EDUCATION = 1
const MAX_ACHIEVEMENTS_TOTAL = 2
const MAX_LANGUAGES = 2

// Compact Header for A4
const Header = memo(({ resumeData }: { resumeData: any }) => {
  const basics = resumeData?.basics
  const profiles = resumeData?.sections?.profiles?.items?.filter((i: any) => i?.visible) ?? []

  const portfolioHref = getHref(basics?.url)
  const linkedInProfile = profiles.find((p: any) => isLinkedInUrl(p?.url))
  const githubProfile = profiles.find((p: any) => isGitHubUrl(p?.url))

  return (
    <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white p-4">
      <div className="flex items-start gap-4">
        {/* Profile Picture - Show default photo by default, or user's photo if uploaded */}
        <div 
          className="overflow-hidden border-3 border-white/30 shadow-lg flex-shrink-0"
          style={{
            width: `${basics?.picture?.size || 80}px`,
            height: `${basics?.picture?.size || 80}px`,
            borderRadius: `${basics?.picture?.borderRadius || 50}%`,
            border: basics?.picture?.effects?.border ? '2px solid rgba(255,255,255,0.5)' : 'none'
          }}
        >
          {basics?.picture && 
           !basics?.picture?.effects?.hidden &&
           (typeof basics.picture === "string" ? basics.picture.trim() !== "" : basics.picture.url?.trim() !== "") ? (
            <img
              src={typeof basics.picture === "string" ? basics.picture : basics.picture.url}
              alt={basics?.name || "Profile"}
              className="w-full h-full object-cover"
              style={{
                filter: basics?.picture?.effects?.grayscale ? 'grayscale(100%)' : 'none'
              }}
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-initials');
                if (fallback) {
                  fallback.classList.remove('hidden');
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
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-initials');
                if (fallback) {
                  fallback.classList.remove('hidden');
                }
              }}
            />
          )}
          <div className="fallback-initials hidden absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 flex items-center justify-center text-xl font-bold"
               style={{
                 borderRadius: `${basics?.picture?.borderRadius || 50}%`
               }}>
            {getInitials(basics?.name) || ""}
          </div>
        </div>

        {/* Main Info - Name and Title */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-white">
            {basics?.name || ""}
          </h1>
          <p className="text-base md:text-lg text-emerald-100 mb-3 font-medium">
            {basics?.headline || basics?.label || "Recent Graduate"}
          </p>
        </div>

        {/* Contact Info & Social Links - Right Side */}
        <div className="flex flex-col gap-2 text-sm min-w-0">
          {/* Contact Info */}
          <div className="space-y-1">
            {basics?.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <a
                  href={`mailto:${basics.email}`}
                  className="text-white hover:text-emerald-200 transition-colors truncate"
                >
                  {basics.email}
                </a>
              </div>
            )}
            {basics?.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <a
                  href={`tel:${basics.phone}`}
                  className="text-white hover:text-emerald-200 transition-colors"
                >
                  {basics.phone}
                </a>
              </div>
            )}
            {basics?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="text-white truncate">{formatLocation(basics.location)}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap gap-1">
            {portfolioHref && (
              <a
                href={portfolioHref}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
              >
                <Globe className="w-3 h-3" />
                Portfolio
              </a>
            )}
            {getHref(linkedInProfile?.url) && (
              <a
                href={getHref(linkedInProfile?.url)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
              >
                <Linkedin className="w-3 h-3" />
                LinkedIn
              </a>
            )}
            {getHref(githubProfile?.url) && (
              <a
                href={getHref(githubProfile?.url)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
              >
                <Github className="w-3 h-3" />
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

Header.displayName = 'Header';

const SectionTitle = ({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) => (
  <h2 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2 border-b border-emerald-200 pb-0.5">
    {icon && <div className="text-emerald-600">{icon}</div>}
    {children}
  </h2>
)

const mapSectionToComponent = (section: string, resumeData: any) => {
  const sec = resumeData?.sections?.[section]
  if (!sec) return null

  switch (section) {
    case "summary": {
      if (!sec?.visible || isEmptyString(sec?.content)) return null
      return (
        <section id={sec.id} className="mb-2">
          <SectionTitle icon={<Target className="w-4 h-4" />}>
            Career Objective
          </SectionTitle>
          <div
            className="text-gray-700 leading-relaxed text-sm bg-emerald-50 p-3 rounded border-l-3 border-emerald-400"
            dangerouslySetInnerHTML={{ __html: sanitize(sec.content) }}
          />
        </section>
      )
    }
    case "education": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length)
        return null
      const { items: educationItems, more: educationMore } = capArray(
        sec.items.filter((item: any) => item?.visible !== false),
        MAX_EDUCATION,
      )

              return (
          <section key="education" className="mb-2">
          <SectionTitle icon={<GraduationCap className="w-4 h-4" />}>
            Education
          </SectionTitle>
                    <div className="space-y-2">
            {educationItems.map((ed: any, idx: number) => (
              <div
                key={ed.id || idx}
                className="bg-white border border-emerald-200 rounded p-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-800">
                      {ed.area || ed.studyType || ed.degree}
                      <span className="text-sm text-emerald-600 font-medium ml-2">
                        • {ed.date || ed.graduationYear}
                      </span>
                    </h3>
                    <p className="text-gray-700 font-semibold text-sm">{ed.institution || ed.school}</p>
                  </div>
                </div>
                {ed.location && <p className="text-gray-600 text-xs mb-1">{formatLocation(ed.location)}</p>}
                <div className="flex flex-wrap gap-1">
                  {(ed.score || ed.gpa) && (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                      <Star className="w-2.5 h-2.5" />
                      GPA: {ed.score || ed.gpa}
                    </span>
                  )}
                  {ed.honors && (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      <AwardIcon className="w-2.5 h-2.5" />
                      {ed.honors}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {educationMore > 0 && <div className="text-xs text-gray-500 mt-1">+{educationMore} more</div>}
        </section>
      )
    }
    case "experience": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length)
        return null
      const { items: experienceItems, more: experienceMore } = capArray(
        sec.items.filter((item: any) => item?.visible !== false),
        MAX_EXPERIENCE,
      )

              return (
          <section key="experience" className="mb-2">
          <SectionTitle icon={<Briefcase className="w-4 h-4" />}>
            Experience
          </SectionTitle>
          <div className="space-y-2">
            {experienceItems.map((item: any, idx: number) => (
              <div key={item.id || idx} className="border-l-3 border-emerald-400 pl-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-800">{item.position}</h3>
                  <span className="text-xs text-emerald-600 font-medium whitespace-nowrap">
                    {item.date}
                  </span>
                </div>
                <p className="text-gray-700 font-medium text-sm mb-1">
                  {item.company}
                  {item.location && ` • ${formatLocation(item.location)}`}
                </p>
                {item.summary && (
                  <ul className="text-gray-600 space-y-0.5 text-xs list-disc pl-4">
                    {extractBulletLines(item.summary).slice(0, 1).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          {experienceMore > 0 && <div className="text-xs text-gray-500 mt-1">+{experienceMore} more</div>}
        </section>
      )
    }
    case "projects": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length)
        return null
      const { items: projectItems, more: projectMore } = capArray(
        sec.items.filter((item: any) => item?.visible !== false),
        MAX_PROJECTS,
      )

      return (
        <section key="projects" className="mb-3">
          <SectionTitle icon={<BookOpen className="w-4 h-4" />}>
            Projects
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectItems.map((proj: any, idx: number) => (
              <div
                key={proj.id || idx}
                className="bg-white border border-gray-200 rounded p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{proj.name}</h3>
                  {getHref(proj.url) && (
                    <a
                      href={getHref(proj.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"
                    >
                      {isGitHubUrl(proj.url) ? (
                        <Github className="w-2.5 h-2.5" />
                      ) : (
                        <ExternalLink className="w-2.5 h-2.5" />
                      )}
                      {isGitHubUrl(proj.url) ? "GitHub" : "Live"}
                    </a>
                  )}
                </div>
                                  {proj.summary && (
                    <p className="text-gray-600 text-xs mb-2">
                      {proj.summary.replace(/<[^>]*>/g, '').substring(0, 50)}...
                    </p>
                  )}
                {Array.isArray(proj.keywords) && proj.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {proj.keywords.slice(0, 4).map((k: string, i: number) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {projectMore > 0 && <div className="text-xs text-gray-500 mt-1">+{projectMore} more</div>}
        </section>
      )
    }
    case "skills": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length)
        return null
      const { items: skillGroups, more: skillsMore } = capArray(
        sec.items.filter((item: any) => item?.visible !== false),
        MAX_SKILL_GROUPS,
      )

      // Get languages data for combined section
      const languagesSec = resumeData?.sections?.languages
      const languageItems = languagesSec?.visible && languagesSec?.items?.length 
        ? capArray(languagesSec.items.filter((item: any) => item?.visible !== false), MAX_LANGUAGES).items
        : []

      return (
        <section key="skills" className="mb-3">
          <SectionTitle icon={<AwardIcon className="w-4 h-4" />}>
            Skills & Technologies
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Technical Skills */}
            <div className="space-y-2">
              {skillGroups.map((skill: any, idx: number) => (
                <div key={skill.id || idx} className="bg-gray-50 p-2 rounded">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{skill.name}</h3>
                  {Array.isArray(skill.keywords) && skill.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skill.keywords.slice(0, MAX_KEYWORDS_PER_SKILL).map((kw: string, i: number) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                  {skill.description && <p className="text-xs text-gray-600 mt-1">{skill.description}</p>}
                </div>
              ))}
              {skillsMore > 0 && <div className="text-xs text-gray-500">+{skillsMore} more</div>}
            </div>

            {/* Languages */}
            {languageItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 text-sm border-b border-emerald-200 pb-1">Languages</h3>
                <div className="space-y-1">
                  {languageItems.map((lng: any, idx: number) => (
                    <div key={lng.id || idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-gray-700 font-medium text-sm">{lng.name}</span>
                      <span className="text-xs text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {levelToLabel((lng as any).level, lng.description)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )
    }
    case "languages": {
      // Skip languages section since it's now combined with skills
      return null
    }
    case "interests": {
      return (
        <section className="mb-3">
          <SectionTitle>Interests</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {sec.items?.filter((item: any) => item?.visible !== false).map((item: any, idx: number) => (
              <span
                key={item.id || idx}
                className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs"
              >
                {item.name}
              </span>
            ))}
          </div>
        </section>
      )
    }
    case "awards": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length)
        return null
      const awardsAll = sec.items.filter((item: any) => item?.visible !== false)
      const certsAll = resumeData?.sections?.certifications?.items?.filter((item: any) => item?.visible !== false) ?? []
      const combinedAch = [
        ...awardsAll.map((a: any) => ({ type: "award" as const, value: a })),
        ...certsAll.map((c: any) => ({ type: "cert" as const, value: c })),
      ]
      const { items: achievementsItems, more: achievementsMore } = capArray(combinedAch, MAX_ACHIEVEMENTS_TOTAL)

      return (
        <section key="achievements" className="mb-3">
          <SectionTitle icon={<Star className="w-4 h-4" />}>
            Achievements & Certifications
          </SectionTitle>
          <div className="space-y-1.5">
            {achievementsItems.map((entry: any, idx: number) => (
              <div key={(entry.value as any).id || idx} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  {entry.type === "award" ? (
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">{entry.value.title}</span>
                      {entry.value.awarder && ` • ${entry.value.awarder}`}
                      {entry.value.date && ` • ${entry.value.date}`}
                    </p>
                  ) : (
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">{entry.value.name}</span>
                      {entry.value.issuer && ` • ${entry.value.issuer}`}
                      {entry.value.date && ` • ${entry.value.date}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {achievementsMore > 0 && <div className="text-xs text-gray-500 mt-1">+{achievementsMore} more</div>}
        </section>
      )
    }
    case "certifications": {
      // Skip certifications section since it's now combined with awards
      return null
    }
    case "profiles": {
      // Don't render profiles section in body since they're already in header
      return null
    }
  }
}

export const Azurill = memo(({ columns, isFirstPage = false, resumeData: resumeDataProp }: TemplateProps) => {
  // Only subscribe to resume data, not the entire store
  const resumeDataFromStore = useArtboardStore((state) => state.resume)
  
  // Memoize the final resume data to prevent unnecessary re-renders
  const resumeData = useMemo(() => {
    return resumeDataProp ?? resumeDataFromStore;
  }, [resumeDataProp, resumeDataFromStore]);

  // Memoize columns to prevent re-renders
  const [main = [], sidebar = []] = useMemo(() => columns, [columns]);

  // Entry-level focused layout: Education first, then experience, then skills
  const mainSections = useMemo(() => ["summary", "education", "experience", "projects"], []);
  const sidebarSections = useMemo(() => ["skills", "awards", "interests"], []);

  // Memoize the final sections to render
  const finalMainSections = useMemo(() => 
    main.length > 0 ? main : mainSections, 
    [main, mainSections]
  );
  
  const finalSidebarSections = useMemo(() => 
    sidebar.length > 0 ? sidebar : sidebarSections, 
    [sidebar, sidebarSections]
  );

  return (
    <div className="w-full max-w-[794px] min-h-[1123px] mx-auto bg-white shadow-xl print:shadow-none print:w-full print:min-h-0 print:max-w-none rounded-lg overflow-hidden">
      {isFirstPage && <Header resumeData={resumeData} />}

      <div className="p-3 print:p-1">
        <div className="grid gap-3 print:gap-1 grid-cols-1 lg:grid-cols-3">
          {/* Main Content - Education First for Entry-Level */}
          <main className="lg:col-span-2 space-y-2 print:space-y-1">
            {finalMainSections.map((section: string) => (
              <Fragment key={section}>{mapSectionToComponent(section, resumeData)}</Fragment>
            ))}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-2 print:space-y-1">
            {finalSidebarSections.map((section: string) => (
              <Fragment key={section}>{mapSectionToComponent(section, resumeData)}</Fragment>
            ))}
          </aside>
        </div>
      </div>
    </div>
  )
})

Azurill.displayName = 'Azurill';

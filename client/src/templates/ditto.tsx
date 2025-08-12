import React, { Fragment } from "react";
import { Mail, Phone, MapPin, Globe, Github, Linkedin, Calendar, Award as AwardIcon, Users, Briefcase, ExternalLink } from "lucide-react";
import { useArtboardStore } from "../store/artboard-store";
import { sanitize, isEmptyString } from "../utils/reactive-resume-utils";
import type { TemplateProps } from "../types/template";
import type {
  SectionKey,
  SectionWithItem,
  CustomSectionGroup,
} from "../utils/reactive-resume-schema";
import { cn } from "../utils/reactive-resume-utils";

// Safe helpers
function getHref(url: string | any | undefined): string {
  if (!url) return "";
  if (typeof url === "string") return url;
  return url?.href ?? "";
}

function isGitHubUrl(url: string | any | undefined): boolean {
  const u = getHref(url)?.toLowerCase?.() || "";
  return u.includes("github.com");
}

function isLinkedInUrl(url: string | any | undefined): boolean {
  const u = getHref(url)?.toLowerCase?.() || "";
  return u.includes("linkedin.com");
}

function getInitials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function hasContent(html?: string): boolean {
  if (!html) return false;
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length > 0;
}

function levelToLabel(level?: number, description?: string): string {
  if (description && description.trim()) return description;
  if (typeof level !== "number") return "";
  if (level >= 5) return "Native";
  if (level === 4) return "Fluent";
  if (level === 3) return "Professional";
  if (level === 2) return "Conversational";
  if (level === 1) return "Basic";
  return "";
}

function capArray<T>(arr: T[] = [], max: number): { items: T[]; more: number } {
  if (!Array.isArray(arr)) return { items: [], more: 0 };
  const items = arr.slice(0, Math.max(0, max));
  const more = Math.max(0, arr.length - items.length);
  return { items, more };
}

// Bullet extraction for summaries: prefer list items if present; otherwise split paragraphs/lines
function extractBulletLines(summaryHtml: string): string[] {
  const safe = sanitize(summaryHtml || "");
  const liMatches = Array.from(safe.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((m) => m[1] || "");
  const base = liMatches.length > 0 ? liMatches : safe.split(/<br\s*\/?>|<\/p>|\n/gi);
  return base
    .map((s) => s.replace(/<[^>]*>/g, "").replace(/^\s*[•\-\u2022]?\s*/, "").trim())
    .filter(Boolean);
}

const MAX_EXPERIENCE = 3;
const MAX_PROJECTS = 2;
const MAX_SKILL_GROUPS = 3;
const MAX_KEYWORDS_PER_SKILL = 6;
const MAX_EDUCATION = 2;
const MAX_ACHIEVEMENTS_TOTAL = 4; // awards + certs combined
const MAX_LANGUAGES = 3;

const Header = ({ resumeData }: { resumeData: any }) => {
  const basics = resumeData?.basics;
  const profiles = resumeData?.sections?.profiles?.items?.filter((i: any) => i?.visible) ?? [];
  
  // Debug: Log the basics data to see if picture is present
  console.log('Header basics data:', basics);
  console.log('Picture URL:', basics?.picture);

  const portfolioHref = getHref(basics?.url);
  const linkedInProfile = profiles.find((p: any) => isLinkedInUrl(p?.url));
  const githubProfile = profiles.find((p: any) => isGitHubUrl(p?.url));

  const SocialChip = ({
    href,
    icon,
    label,
  }: {
    href?: string;
    icon: React.ReactNode;
    label: string;
  }) => {
    const hasHref = !!href;
    const baseClass = "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105";
    const enabledClass = "bg-white/20 hover:bg-white/30 print:hover:bg-white/20 shadow-lg hover:shadow-xl";
    const disabledClass = "bg-white/10 opacity-60 cursor-default";
    if (hasHref) {
      return (
        <a href={href} target="_blank" rel="noreferrer noopener" className={`${baseClass} ${enabledClass}`}>
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </a>
      );
    }
    return (
      <div className={`${baseClass} ${disabledClass}`}>
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  };

  return (
    <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white p-4 md:p-6 overflow-hidden">
      {/* Animated gradient cursor effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-indigo-400/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 animate-pulse"></div>
      
      <div className="relative z-10">
                 <div className="flex flex-row flex-wrap items-start gap-3 md:gap-4">
           {/* Profile Picture - Show default photo by default, or user's photo if uploaded */}
           <div 
             className="overflow-hidden border border-white/20 shadow-lg backdrop-blur-sm relative"
             style={{
               width: `${basics?.picture?.size || 80}px`,
               height: `${basics?.picture?.size || 80}px`,
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
             <div className="fallback-initials hidden absolute inset-0 w-full h-full bg-gradient-to-br from-purple-400/30 to-indigo-400/30 flex items-center justify-center text-xl md:text-2xl font-serif font-bold"
                  style={{
                    borderRadius: `${basics?.picture?.borderRadius || 50}%`
                  }}>
               {getInitials(basics?.name) || ""}
             </div>
           </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold mb-1 md:mb-2 text-white drop-shadow-sm">{basics?.name || ""}</h1>
            <p className="text-sm md:text-base lg:text-lg text-purple-100 mb-2 md:mb-3 font-medium">{basics?.headline || basics?.label || ""}</p>
            <div className="flex flex-row items-center gap-3 md:gap-4 text-xs md:text-sm flex-nowrap overflow-x-auto">
              {basics?.email && (
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Mail className="w-3 h-3 md:w-4 md:h-4" />
                  <a href={`mailto:${basics.email}`} className="text-white hover:text-purple-200 transition-colors" target="_blank" rel="noreferrer noopener">{basics.email}</a>
                </div>
              )}
              {basics?.phone && (
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Phone className="w-3 h-3 md:w-4 md:h-4" />
                  <a href={`tel:${basics.phone}`} className="text-white hover:text-purple-200 transition-colors" target="_blank" rel="noreferrer noopener">{basics.phone}</a>
                </div>
              )}
              {basics?.location && (
                <div className="flex items-center gap-1.5 md:gap-2">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-white">{basics.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap gap-2 md:gap-3 mt-3 md:mt-4">
          <SocialChip href={portfolioHref || undefined} icon={<Globe className="w-3 h-3 md:w-4 md:h-4" />} label="Portfolio" />
          <SocialChip href={getHref(linkedInProfile?.url) || undefined} icon={<Linkedin className="w-3 h-3 md:w-4 md:h-4" />} label="LinkedIn" />
          <SocialChip href={getHref(githubProfile?.url) || undefined} icon={<Github className="w-3 h-3 md:w-4 md:h-4" />} label="GitHub" />
        </div>
        </div>
      </div>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-base sm:text-lg font-serif font-bold text-gray-800 mb-3 flex items-center gap-2 print:text-base print:mb-2">
    {children}
  </h2>
);

const Section = <T extends { visible?: boolean; id?: string }>(
  {
    section,
    children,
    className,
  }: {
    section: SectionWithItem<T> | CustomSectionGroup;
    children?: (item: T) => React.ReactNode;
    className?: string;
  }
) => {
  if (!section?.visible || !('items' in section) || section.items.length === 0) return null;
  
  const visibleItems = section.items.filter((item) => 
    typeof item.visible === 'undefined' ? true : item.visible
  );
  
  if (visibleItems.length === 0) return null;

  return (
    <section id={'id' in section ? section.id : section.name} className="grid">
      <div className="mb-2 font-bold text-gray-700">
        <h4 className="text-lg">{section.name}</h4>
      </div>
      <div className={cn("grid gap-x-4 md:gap-x-6 gap-y-3", className)} style={{ gridTemplateColumns: `repeat(${"columns" in section ? section.columns : 1}, 1fr)` }}>
        {visibleItems.map((item) => (
          <div key={item.id || Math.random()} className="relative space-y-2 border-gray-200 border-l-2 pl-4">
            <div>{children?.(item as T)}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

const mapSectionToComponent = (section: string, resumeData: any) => {
  const sec = resumeData?.sections?.[section];
  if (!sec) return null;
  
  switch (section) {
    case "summary": {
      if (!sec?.visible || isEmptyString(sec?.content)) return null;
      return (
        <section id={sec.id} className="mb-4 md:mb-6 print:mb-3">
          <SectionTitle>
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full print:w-4 print:h-4"></div>
                About Me
          </SectionTitle>
              <div
                className="text-gray-600 leading-relaxed text-sm sm:text-base print:text-xs print:leading-normal wysiwyg"
            dangerouslySetInnerHTML={{ __html: sanitize(sec.content) }} 
              />
            </section>
      );
    }
    case "experience": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      const { items: experienceItems, more: experienceMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), MAX_EXPERIENCE);
      
      return (
        <section key="experience" className="mb-7 md:mb-6 print:mb-3">
          <SectionTitle>
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full print:w-4 print:h-4"></div>
                Experience
          </SectionTitle>
                             <div className="space-y-2 print:space-y-1">
            {experienceItems.map((item: any, idx: number) => {
              const expAccentColors = ["#3b82f6", "#a855f7", "#10b981"];
              return (
                  <div key={item.id || idx} className="relative pl-4 sm:pl-5 border-l-2 border-blue-200 print:pl-4">
                    <div
                      className="absolute -left-1.5 sm:-left-2 top-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full print:w-3 print:h-3 print:-left-1.5"
                      style={{ backgroundColor: expAccentColors[idx % 3] }}
                    />
                                         <div className="flex items-center justify-between gap-2 mb-5 print:mb-0.5">
                       <h3 className="text-sm sm:text-base font-semibold text-gray-800 print:text-sm flex-shrink-0">{item.position}</h3>
                       <p className="font-medium text-xs print:text-xs" style={{ color: expAccentColors[idx % 3] }}>
                         {item.company}
                         {item.location && ` • ${item.location}`}
                       </p>
                       <span className="text-xs text-gray-500 flex items-center gap-1 print:text-xs flex-shrink-0">
                         <Calendar className="w-3 h-3" />
                         {item.date}
                       </span>
                     </div>
                                         {item.summary && (
                       <ul className="text-gray-600 space-y-0.5 text-xs print:text-xs print:space-y-0 list-disc pl-4">
                         {extractBulletLines(item.summary).map((b, i) => (
                           <li key={i}>{b}</li>
                         ))}
                       </ul>
                     )}
                  </div>
              );
            })}
                {experienceMore > 0 && <div className="text-xs text-gray-500">+{experienceMore} more</div>}
              </div>
            </section>
      );
    }
    case "projects": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      const { items: projectItems, more: projectMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), MAX_PROJECTS);
      
      return (
        <section key="projects" className="mb-4 md:mb-6 print:mb-3">
          <SectionTitle>
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full print:w-4 print:h-4"></div>
                Featured Projects
          </SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-3">
            {projectItems.map((proj: any, idx: number) => (
                  <div
                    key={proj.id || idx}
                    className={`p-4 rounded-lg border print:p-3 ${idx % 2 === 0 ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100" : "bg-gradient-to-br from-green-50 to-teal-50 border-green-100"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-gray-800 mb-2 print:text-sm print:mb-1">{proj.name}</h3>
                      {getHref(proj.url) && (
                        <a
                          href={getHref(proj.url)}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full"
                        >
                      {isGitHubUrl(proj.url) ? <Github className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                          <span>{isGitHubUrl(proj.url) ? "GitHub" : "Live"}</span>
                        </a>
                      )}
                    </div>
                    {proj.summary && (
                      <div className="text-gray-600 text-sm mb-3 print:text-xs print:mb-2 wysiwyg" dangerouslySetInnerHTML={{ __html: sanitize(proj.summary) }} />
                    )}
                    {!proj.summary && proj.description && (
                      <p className="text-gray-600 text-sm mb-3 print:text-xs print:mb-2">{proj.description}</p>
                    )}
                    {Array.isArray(proj.keywords) && proj.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                    {proj.keywords.slice(0, MAX_KEYWORDS_PER_SKILL).map((k: string, i: number) => (
                          <span key={i} className={`px-2 py-1 text-xs rounded-full ${idx % 2 === 0 ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                            {k}
                          </span>
                        ))}
                        {proj.keywords.length > MAX_KEYWORDS_PER_SKILL && (
                          <span className={`px-2 py-1 text-xs rounded-full ${idx % 2 === 0 ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>+{proj.keywords.length - MAX_KEYWORDS_PER_SKILL} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {projectMore > 0 && <div className="text-xs text-gray-500 mt-2">+{projectMore} more</div>}
            </section>
      );
    }
    case "education": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      const { items: educationItems, more: educationMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), MAX_EDUCATION);
      
      return (
        <section key="education" className="mb-4 md:mb-6 print:mb-3">
          <SectionTitle>
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 print:w-4 print:h-4" />
            Education
          </SectionTitle>
          <div className="space-y-3 print:space-y-2">
            {educationItems.map((ed: any, idx: number) => (
              <div key={ed.id || idx}>
                <h3 className="font-semibold text-gray-800 text-sm print:text-xs">{ed.area || ed.studyType || ed.degree}</h3>
                <p className={`${idx % 2 === 0 ? "text-blue-600" : "text-green-600"} font-medium text-sm print:text-xs`}>{ed.institution || ed.school}</p>
                <p className="text-gray-500 text-xs">{ed.date || ed.graduationYear}</p>
                {(ed.score || ed.gpa) && <p className="text-gray-600 text-xs mt-1">GPA: {ed.score || ed.gpa}</p>}
                {ed.location && <p className="text-gray-600 text-xs">{ed.location}</p>}
                {ed.honors && <p className="text-gray-600 text-xs">{ed.honors}</p>}
              </div>
            ))}
        </div>
          {educationMore > 0 && <div className="text-xs text-gray-500 mt-2">+{educationMore} more</div>}
        </section>
      );
    }
    case "skills": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      const { items: skillGroups, more: skillsMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), MAX_SKILL_GROUPS);
      
      return (
        <section key="skills" className="mb-4 md:mb-6 print:mb-3">
          <SectionTitle>
            <AwardIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 print:w-4 print:h-4" />
                Skills
          </SectionTitle>
              <div className="space-y-3 print:space-y-2">
            {skillGroups.map((skill: any, idx: number) => (
                  <div key={skill.id || idx}>
                    <h3 className="font-semibold text-gray-700 mb-2 text-sm print:text-xs print:mb-1">{skill.name}</h3>
                    {Array.isArray(skill.keywords) && skill.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                    {skill.keywords.slice(0, MAX_KEYWORDS_PER_SKILL).map((kw: string, i: number) => (
                          <span key={i} className={`px-2 py-1 text-xs rounded-full ${idx % 2 === 0 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{kw}</span>
                        ))}
                        {skill.keywords.length > MAX_KEYWORDS_PER_SKILL && (
                          <span className={`px-2 py-1 text-xs rounded-full ${idx % 2 === 0 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>+{skill.keywords.length - MAX_KEYWORDS_PER_SKILL} more</span>
                        )}
                      </div>
                    )}
                    {skill.description && <p className="text-xs text-gray-600 mt-1">{skill.description}</p>}
                  </div>
                ))}
                {skillsMore > 0 && <div className="text-xs text-gray-500">+{skillsMore} more</div>}
              </div>
            </section>
      );
    }
    case "languages": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      const { items: languageItems, more: languageMore } = capArray(sec.items.filter((item: any) => item?.visible !== false), MAX_LANGUAGES);
      
      return (
        <section key="languages" className="mb-4 md:mb-6 print:mb-3">
          <SectionTitle>Languages</SectionTitle>
          <div className="space-y-2 print:space-y-1">
            {languageItems.map((lng: any, idx: number) => (
              <div key={lng.id || idx} className="flex justify-between items-center">
                <span className="text-gray-700 text-sm print:text-xs">{lng.name}</span>
                <span className="text-xs text-gray-500">{levelToLabel((lng as any).level, lng.description)}</span>
                  </div>
                ))}
            {languageMore > 0 && <div className="text-xs text-gray-500">+{languageMore} more</div>}
              </div>
            </section>
      );
    }
    case "interests": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-gray-800 text-sm">{item.name}</div>
              {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                <div className="text-sm text-gray-600">{item.keywords.join(', ')}</div>
              )}
            </div>
          )}
        </Section>
      );
    }
    case "awards": {
      if (!sec?.visible || !sec?.items?.length || !sec.items.filter((item: any) => item?.visible !== false).length) return null;
      const awardsAll = sec.items.filter((item: any) => item?.visible !== false);
      const certsAll = resumeData?.sections?.certifications?.items?.filter((item: any) => item?.visible !== false) ?? [];
      const combinedAch = [
        ...awardsAll.map((a: any) => ({ type: "award" as const, value: a })),
        ...certsAll.map((c: any) => ({ type: "cert" as const, value: c })),
      ];
      const { items: achievementsItems, more: achievementsMore } = capArray(combinedAch, MAX_ACHIEVEMENTS_TOTAL);
      
      return (
        <section key="achievements" className="mb-4 md:mb-6 print:mb-3">
          <SectionTitle>
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 print:w-4 print:h-4" />
                Achievements
          </SectionTitle>
              <div className="space-y-2 print:space-y-1">
            {achievementsItems.map((entry: any, idx: number) => (
                  <div key={(entry.value as any).id || idx} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${idx % 4 === 0 ? "bg-orange-500" : idx % 4 === 1 ? "bg-blue-500" : idx % 4 === 2 ? "bg-purple-500" : "bg-green-500"}`} />
                    {entry.type === "award" ? (
                      <p className="text-gray-600 text-xs">{[entry.value.title, entry.value.awarder, entry.value.date].filter(Boolean).join(" • ")}</p>
                    ) : (
                      <p className="text-gray-600 text-xs">{[entry.value.name, entry.value.issuer, entry.value.date].filter(Boolean).join(" • ")}</p>
                    )}
                  </div>
                ))}
                {achievementsMore > 0 && <div className="text-xs text-gray-500">+{achievementsMore} more</div>}
              </div>
            </section>
      );
    }
    case "certifications": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-gray-800 text-sm">{item.name}</div>
              <div className="text-blue-700 text-xs">{item.issuer}</div>
              <div className="text-xs text-blue-400">{item.date}</div>
              {(item.summary || item.description) && (
                <div
                  className="text-xs text-gray-700 mt-0.5 wysiwyg"
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
                />
              )}
            </div>
          )}
        </Section>
      );
    }
    case "publications": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="font-bold text-gray-800 text-sm">{item.name || item.title}</div>
              <div className="text-blue-700 text-xs">{item.publisher}</div>
              <div className="text-xs text-blue-400">{item.date}</div>
              {item.url && (
                <a
                  href={typeof item.url === 'string' ? item.url : item.url.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-[11px] text-blue-600 underline hover:text-blue-800"
                >
                  {typeof item.url === 'string' ? item.url : (item.url.label || item.url.href)}
                </a>
              )}
              {(item.summary || item.description) && (
                <div
                  className="text-xs text-gray-700 mt-0.5 wysiwyg"
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
                />
              )}
            </div>
          )}
        </Section>
      );
    }
    // case "volunteer": {
    //   return (
    //     <Section<any> section={sec}>
    //       {(item) => (
    //         <div>
    //           <div className="font-bold text-gray-800 text-sm">{item.position || item.role}</div>
    //           <div className="text-blue-700 text-xs">{item.organization}</div>
    //           <div className="text-xs text-blue-400">{item.date}</div>
    //           {(item.summary || item.description) && (
    //             <div
    //               className="text-xs text-gray-700 mt-0.5 wysiwyg"
    //               dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
    //             />
    //           )}
    //         </div>
    //       )}
    //     </Section>
    //   );
    // }
    case "references": {
      return (
        <Section<any> section={sec}>
          {(item) => (
            <div>
              <div className="text-xs text-gray-700">
                <strong className="text-gray-800">{item.name}</strong>
              </div>
              {(item.summary || item.description) && (
                <div
                  className="text-xs text-gray-700 mt-0.5 wysiwyg"
                  dangerouslySetInnerHTML={{ __html: sanitize(item.summary || item.description) }}
                />
              )}
            </div>
          )}
        </Section>
      );
    }
    case "profiles": {
      // Don't render profiles section in body since they're already in header
      return null;
    }

    // default: {
    //   return (
    //     <Section<any> section={sec}>
    //       {(item) => (
    //         <div className="text-sm text-gray-700">
    //           {Object.entries(item).map(([key, value]) => (
    //             <div key={key} className="mb-1">
    //               <strong className="text-gray-800">{key}:</strong> {String(value)}
    //               </div>
    //             ))}
    //           </div>
    //       )}
    //     </Section>
    //   );
    // }
  }
};

export const Ditto = ({ columns, isFirstPage = false, resumeData: resumeDataProp }: TemplateProps) => {
  const resumeDataFromStore = useArtboardStore((state) => state.resume);
  const resumeData = resumeDataProp ?? resumeDataFromStore;
  const [main = [], sidebar = []] = columns;

  const mainSections = ["projects"];
  const sidebarSections = ["skills", "languages", "certifications", "interests"];

  return (
    <div className="w-full max-w-6xl mx-auto bg-white shadow-xl print:shadow-none print:w-full print:max-w-none rounded-lg overflow-hidden min-h-screen">
      {isFirstPage && <Header resumeData={resumeData} />}

             <div className="p-4 md:p-6 print:p-4">
         {/* About Me Section - Right below header */}
         {mapSectionToComponent("summary", resumeData)}
         
                   {/* Experience Section - Right after About Me */}
          {mapSectionToComponent("experience", resumeData)}
          
          {/* Education Section - Right after Experience */}
          {mapSectionToComponent("education", resumeData)}

          {mapSectionToComponent("skills", resumeData)}
          {mapSectionToComponent("projects", resumeData)}
          <div className="grid gap-4 md:gap-6 print:gap-3 grid-cols-1 lg:grid-cols-3">
        </div>
      </div>
    </div>
  );
};

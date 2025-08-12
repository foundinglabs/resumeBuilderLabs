import React from "react";
import { Mail, Phone, MapPin, Globe, Github, Linkedin, Calendar, Award as AwardIcon, Users, Briefcase } from "lucide-react";
import { useArtboardStore } from "../store/artboard-store";
import { sanitize } from "../utils/reactive-resume-utils";
import type { TemplateProps } from "../types/template";
import type {
  URL as ResumeURL,
  Experience,
  Education,
  Project,
  Skill,
  Award,
  Certification,
  Language,
  Profile,
} from "../utils/reactive-resume-schema";

// Safe helpers
function getHref(url: string | ResumeURL | undefined): string {
  if (!url) return "";
  if (typeof url === "string") return url;
  return url?.href ?? "";
}

function isGitHubUrl(url: string | ResumeURL | undefined): boolean {
  const u = getHref(url)?.toLowerCase?.() || "";
  return u.includes("github.com");
}

function isLinkedInUrl(url: string | ResumeURL | undefined): boolean {
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

export const Ditto = ({ columns, isFirstPage = false }: TemplateProps) => {
  const resume = useArtboardStore((s) => s.resume) || {};
  const basics = resume?.basics || {};
  const sections = resume?.sections || {};

  const profiles: Profile[] = sections?.profiles?.items?.filter((i: any) => i?.visible) ?? [];
  const summaryHtml: string | undefined = sections?.summary?.content;

  const experienceAll: Experience[] = sections?.experience?.items?.filter((i: any) => i?.visible) ?? [];
  const projectsAll: Project[] = sections?.projects?.items?.filter((i: any) => i?.visible) ?? [];
  const skillsAll: Skill[] = sections?.skills?.items?.filter((i: any) => i?.visible) ?? [];
  const educationAll: Education[] = sections?.education?.items?.filter((i: any) => i?.visible) ?? [];
  const awardsAll: Award[] = sections?.awards?.items?.filter((i: any) => i?.visible) ?? [];
  const certsAll: Certification[] = sections?.certifications?.items?.filter((i: any) => i?.visible) ?? [];
  const languagesAll: Language[] = sections?.languages?.items?.filter((i: any) => i?.visible) ?? [];

  // Caps per section to keep one page
  const { items: experienceItems, more: experienceMore } = capArray(experienceAll, MAX_EXPERIENCE);
  const { items: projectItems, more: projectMore } = capArray(projectsAll, MAX_PROJECTS);
  const { items: skillGroups, more: skillsMore } = capArray(skillsAll, MAX_SKILL_GROUPS);
  const { items: educationItems, more: educationMore } = capArray(educationAll, MAX_EDUCATION);
  const combinedAch = [
    ...awardsAll.map((a) => ({ type: "award" as const, value: a })),
    ...certsAll.map((c) => ({ type: "cert" as const, value: c })),
  ];
  const { items: achievementsItems, more: achievementsMore } = capArray(combinedAch, MAX_ACHIEVEMENTS_TOTAL);
  const { items: languageItems, more: languageMore } = capArray(languagesAll, MAX_LANGUAGES);

  const portfolioHref = getHref(basics?.url);
  const linkedInProfile = profiles.find((p) => isLinkedInUrl(p?.url));
  const githubProfile = profiles.find((p) => isGitHubUrl(p?.url));

  const expAccentColors = ["#3b82f6", "#a855f7", "#10b981"]; // blue, purple, green

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
    const baseClass = "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors";
    const enabledClass = "bg-white/20 hover:bg-white/30 print:hover:bg-white/20";
    const disabledClass = "bg-white/10 opacity-60 cursor-default";
    if (hasHref) {
      return (
        <a href={href} target="_blank" rel="noreferrer noopener" className={`${baseClass} ${enabledClass}`}>
          {icon}
          <span className="text-sm">{label}</span>
        </a>
      );
    }
    return (
      <div className={`${baseClass} ${disabledClass}`}>
        {icon}
        <span className="text-sm">{label}</span>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-white print:shadow-none print:w-full print:h-full">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white p-0">
        <div className="flex flex-row flex-wrap items-start gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-serif font-bold backdrop-blur-sm">
            {getInitials(basics?.name) || ""}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-2">{basics?.name || ""}</h1>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-3">{basics?.headline || basics?.label || ""}</p>
            <div className="flex flex-row items-center gap-4 text-sm flex-nowrap overflow-x-auto">
              {basics?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${basics.email}`} className="text-white hover:underline" target="_blank" rel="noreferrer noopener">{basics.email}</a>
                </div>
              )}
              {basics?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${basics.phone}`} className="text-white hover:underline" target="_blank" rel="noreferrer noopener">{basics.phone}</a>
                </div>
              )}
              {basics?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{basics.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
          <SocialChip href={portfolioHref || undefined} icon={<Globe className="w-4 h-4" />} label="Portfolio" />
          <SocialChip href={getHref(linkedInProfile?.url) || undefined} icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" />
          <SocialChip href={getHref(githubProfile?.url) || undefined} icon={<Github className="w-4 h-4" />} label="GitHub" />
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 sm:gap-4 p-0 print:p-0 print:gap-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 print:space-y-3">
          {/* About Section */}
          {hasContent(summaryHtml) && (
            <section>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-800 mb-3 flex items-center gap-3 print:text-lg print:mb-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full print:w-5 print:h-5"></div>
                About Me
              </h2>
              <div
                className="text-gray-600 leading-relaxed text-sm sm:text-base print:text-xs print:leading-normal wysiwyg"
                dangerouslySetInnerHTML={{ __html: sanitize(summaryHtml!) }}
              />
            </section>
          )}

          {/* Experience Section */}
          {experienceItems.length > 0 && (
            <section>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-800 mb-4 flex items-center gap-3 print:text-lg print:mb-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-full print:w-5 print:h-5"></div>
                Experience
              </h2>
              <div className="space-y-4 print:space-y-3">
                {experienceItems.map((item, idx) => (
                  <div key={item.id || idx} className="relative pl-4 sm:pl-5 border-l-2 border-blue-200 print:pl-4">
                    <div
                      className="absolute -left-1.5 sm:-left-2 top-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full print:w-3 print:h-3 print:-left-1.5"
                      style={{ backgroundColor: expAccentColors[idx % 3] }}
                    />
                    <div className="flex flex-col gap-1 sm:gap-2 mb-2 print:mb-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 print:text-base">{item.position}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium text-sm print:text-xs" style={{ color: expAccentColors[idx % 3] }}>
                          {[item.company, item.location].filter(Boolean).join(" • ")}
                        </p>
                        <span className="text-xs text-gray-500 flex items-center gap-1 print:text-xs">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                    {item.summary && (
                      <ul className="text-gray-600 space-y-1 text-sm print:text-xs print:space-y-0.5 list-disc pl-5">
                        {extractBulletLines(item.summary).map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {experienceMore > 0 && <div className="text-xs text-gray-500">+{experienceMore} more</div>}
              </div>
            </section>
          )}

          {/* Projects Section */}
          {projectItems.length > 0 && (
            <section>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-800 mb-4 flex items-center gap-3 print:text-lg print:mb-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full print:w-5 print:h-5"></div>
                Featured Projects
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-3">
                {projectItems.map((proj, idx) => (
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
                          {isGitHubUrl(proj.url) ? <Github className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
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
                        {proj.keywords.slice(0, MAX_KEYWORDS_PER_SKILL).map((k, i) => (
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
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6 print:space-y-4">
          {/* Skills Section */}
          {skillGroups.length > 0 && (
            <section>
              <h2 className="text-base sm:text-lg font-serif font-bold text-gray-800 mb-3 flex items-center gap-2 print:text-base print:mb-2">
                <AwardIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 print:w-4 print:h-4" />
                Skills
              </h2>
              <div className="space-y-3 print:space-y-2">
                {skillGroups.map((skill, idx) => (
                  <div key={skill.id || idx}>
                    <h3 className="font-semibold text-gray-700 mb-2 text-sm print:text-xs print:mb-1">{skill.name}</h3>
                    {Array.isArray(skill.keywords) && skill.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {skill.keywords.slice(0, MAX_KEYWORDS_PER_SKILL).map((kw, i) => (
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
          )}

          {/* Education Section */}
          {educationItems.length > 0 && (
            <section>
              <h2 className="text-base sm:text-lg font-serif font-bold text-gray-800 mb-3 flex items-center gap-2 print:text-base print:mb-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 print:w-4 print:h-4" />
                Education
              </h2>
              <div className="space-y-3 print:space-y-2">
                {educationItems.map((ed, idx) => (
                  <div key={ed.id || idx} className={`bg-gradient-to-r p-3 rounded-lg border print:p-2 ${idx % 2 === 0 ? "from-blue-50 to-purple-50 border-blue-100" : "from-green-50 to-teal-50 border-green-100"}`}>
                    <h3 className="font-semibold text-gray-800 text-sm print:text-xs">{ed.area}</h3>
                    <p className={`${idx % 2 === 0 ? "text-blue-600" : "text-green-600"} font-medium text-sm print:text-xs`}>{ed.institution}</p>
                    <p className="text-gray-500 text-xs">{ed.date}</p>
                  </div>
                ))}
              </div>
              {educationMore > 0 && <div className="text-xs text-gray-500 mt-2">+{educationMore} more</div>}
            </section>
          )}

          {/* Achievements Section */}
          {achievementsItems.length > 0 && (
            <section>
              <h2 className="text-base sm:text-lg font-serif font-bold text-gray-800 mb-3 flex items-center gap-2 print:text-base print:mb-2">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 print:w-4 print:h-4" />
                Achievements
              </h2>
              <div className="space-y-2 print:space-y-1">
                {achievementsItems.map((entry, idx) => (
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
          )}

          {/* Languages Section */}
          {languageItems.length > 0 && (
            <section>
              <h2 className="text-base sm:text-lg font-serif font-bold text-gray-800 mb-3 print:text-base print:mb-2">Languages</h2>
              <div className="space-y-2 print:space-y-1">
                {languageItems.map((lng, idx) => (
                  <div key={lng.id || idx} className="flex justify-between items-center">
                    <span className="text-gray-700 text-sm print:text-xs">{lng.name}</span>
                    <span className="text-xs text-gray-500">{levelToLabel((lng as any).level, lng.description)}</span>
                  </div>
                ))}
                {languageMore > 0 && <div className="text-xs text-gray-500">+{languageMore} more</div>}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

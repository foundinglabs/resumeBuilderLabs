// Data Mapper: ResumeGenius to Reactive-Resume Format
import type { ResumeData as ReactiveResumeData, SectionWithItem } from "./reactive-resume-schema";

// ResumeGenius data types (simplified interface)
interface ResumeGeniusData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  summary: string;
  careerObjective?: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    location?: string;
    employment_type?: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    graduationYear: string;
    gpa?: string;
    field_of_study?: string;
    location?: string;
    honors?: string;
  }>;
  skills: string[];
  template: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
  };
  projects?: Array<{
    title: string;
    description: string;
    technologies?: string[];
    link?: string;
    duration?: string;
  }>;
  awards?: Array<{
    title: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
  publications?: Array<{
    title: string;
    publisher: string;
    date: string;
    link?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expiry?: string;
    credential_id?: string;
  }>;
  volunteerWork?: Array<{
    role: string;
    organization: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
}

export const mapResumeGeniusToReactiveResume = (
  resumeData: ResumeGeniusData,
  templateId: string
): ReactiveResumeData => {
  const { personalInfo, summary, experience, education, skills, socialLinks, projects, awards, publications, languages, certifications, volunteerWork } = resumeData;

  // Helper function to generate unique IDs
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Helper function to format dates
  const formatDate = (startDate: string, endDate: string) => {
    if (!startDate) return "";
    if (endDate && endDate.toLowerCase() !== "present") {
      return `${startDate} to ${endDate}`;
    }
    return `${startDate} to Present`;
  };

  // Map social links to profiles
  const profiles = [];
  if (socialLinks?.linkedin) {
    profiles.push({
      id: generateId(),
      visible: true,
      network: "LinkedIn",
      username: socialLinks.linkedin.split('/').pop() || "linkedin",
      icon: "linkedin",
      url: {
        label: "",
        href: socialLinks.linkedin,
      },
    });
  }
  if (socialLinks?.github) {
    profiles.push({
      id: generateId(),
      visible: true,
      network: "GitHub",
      username: socialLinks.github.split('/').pop() || "github",
      icon: "github",
      url: {
        label: "",
        href: socialLinks.github,
      },
    });
  }
  if (socialLinks?.portfolio || socialLinks?.website) {
    profiles.push({
      id: generateId(),
      visible: true,
      network: "Portfolio",
      username: "portfolio",
      icon: "globe",
      url: {
        label: "",
        href: socialLinks.portfolio || socialLinks.website || "",
      },
    });
  }

  // Map experience
  const mappedExperience = (Array.isArray(experience) ? experience : []).map(exp => ({
    id: generateId(),
    visible: true,
    company: exp.company || "",
    position: exp.title || "",
    location: exp.location || "",
    date: formatDate(exp.startDate || "", exp.endDate || ""),
    summary: `<p>${(exp.description || "").replace(/\n/g, '</p><p>')}</p>`,
    url: {
      label: "",
      href: "",
    },
  }));

  // Map education
  const mappedEducation = (Array.isArray(education) ? education : []).map(edu => ({
    id: generateId(),
    visible: true,
    institution: edu.school || "",
    studyType: edu.degree || "",
    area: edu.field_of_study || "",
    score: edu.gpa || "",
    date: edu.graduationYear || "",
    summary: edu.honors ? `<p>${edu.honors}</p>` : "",
    url: {
      label: "",
      href: "",
    },
  }));

  // Map skills - group them logically
  const mappedSkills = [{
    id: generateId(),
    visible: true,
    name: "Technical Skills",
    description: "Proficient",
    level: 0,
    keywords: Array.isArray(skills) ? skills : [],
  }];

  // Map projects
  const mappedProjects = (Array.isArray(projects) ? projects : []).map(project => ({
    id: generateId(),
    visible: true,
    name: project.title || "",
    description: project.duration || "",
    date: project.duration || "",
    summary: `<p>${project.description || ""}</p>`,
    keywords: Array.isArray(project.technologies) ? project.technologies : [],
    url: {
      label: "",
      href: project.link || "",
    },
  }));

  // Map awards
  const mappedAwards = (awards || []).map(award => ({
    id: generateId(),
    visible: true,
    title: award.title,
    awarder: award.issuer,
    date: award.date,
    summary: award.description ? `<p>${award.description}</p>` : "",
    url: {
      label: "",
      href: "",
    },
  }));

  // Map certifications
  const mappedCertifications = (certifications || []).map(cert => ({
    id: generateId(),
    visible: true,
    name: cert.name,
    issuer: cert.issuer,
    date: cert.date,
    summary: cert.credential_id ? `<p>Credential ID: ${cert.credential_id}</p>` : "",
    url: {
      label: "",
      href: "",
    },
  }));

  // Map languages
  const mappedLanguages = (languages || []).map(lang => ({
    id: generateId(),
    visible: true,
    name: lang.language,
    description: lang.proficiency,
    level: 0,
    keywords: [],
  }));

  // Map volunteer work
  const mappedVolunteer = (volunteerWork || []).map(vol => ({
    id: generateId(),
    visible: true,
    organization: vol.organization,
    position: vol.role,
    location: "",
    date: formatDate(vol.startDate, vol.endDate),
    summary: `<p>${vol.description}</p>`,
    url: {
      label: "",
      href: "",
    },
  }));

  // Map publications
  const mappedPublications = (publications || []).map(pub => ({
    id: generateId(),
    visible: true,
    name: pub.title,
    publisher: pub.publisher,
    date: pub.date,
    summary: "",
    url: {
      label: "",
      href: pub.link || "",
    },
  }));

  return {
    basics: {
      name: `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() || "Your Name",
      headline: (summary || "").split('.')[0] + '.' || "", // Use first sentence as headline
      email: personalInfo.email || "",
      phone: personalInfo.phone || "",
      location: personalInfo.address || "",
      url: {
        label: "",
        href: socialLinks?.website || socialLinks?.portfolio || "",
      },
      customFields: [],
      picture: {
        url: "",
        size: 120,
        aspectRatio: 1,
        borderRadius: 0,
        effects: {
          hidden: false,
          border: false,
          grayscale: false,
        },
      },
    },
    sections: {
      summary: {
        name: "Summary",
        columns: 1,
        separateLinks: true,
        visible: true,
        id: "summary",
        items: [],
        content: `<p>${summary || ""}</p>`,
      } as SectionWithItem<any> & { content: string },
      experience: {
        name: "Experience",
        columns: 1,
        separateLinks: true,
        visible: mappedExperience.length > 0,
        id: "experience",
        items: mappedExperience,
      },
      education: {
        name: "Education",
        columns: 1,
        separateLinks: true,
        visible: mappedEducation.length > 0,
        id: "education",
        items: mappedEducation,
      },
      skills: {
        name: "Skills",
        columns: 1,
        separateLinks: true,
        visible: mappedSkills.length > 0,
        id: "skills",
        items: mappedSkills,
      },
      projects: {
        name: "Projects",
        columns: 1,
        separateLinks: true,
        visible: mappedProjects.length > 0,
        id: "projects",
        items: mappedProjects,
      },
      awards: {
        name: "Awards",
        columns: 1,
        separateLinks: true,
        visible: mappedAwards.length > 0,
        id: "awards",
        items: mappedAwards,
      },
      certifications: {
        name: "Certifications",
        columns: 1,
        separateLinks: true,
        visible: mappedCertifications.length > 0,
        id: "certifications",
        items: mappedCertifications,
      },
      languages: {
        name: "Languages",
        columns: 1,
        separateLinks: true,
        visible: mappedLanguages.length > 0,
        id: "languages",
        items: mappedLanguages,
      },
      volunteer: {
        name: "Volunteering",
        columns: 1,
        separateLinks: true,
        visible: mappedVolunteer.length > 0,
        id: "volunteer",
        items: mappedVolunteer,
      },
      publications: {
        name: "Publications",
        columns: 1,
        separateLinks: true,
        visible: mappedPublications.length > 0,
        id: "publications",
        items: mappedPublications,
      },
      profiles: {
        name: "Profiles",
        columns: 1,
        separateLinks: true,
        visible: profiles.length > 0,
        id: "profiles",
        items: profiles,
      },
      interests: {
        name: "Interests",
        columns: 1,
        separateLinks: true,
        visible: false,
        id: "interests",
        items: [],
      },
      references: {
        name: "References",
        columns: 1,
        separateLinks: true,
        visible: false,
        id: "references",
        items: [],
      },
      custom: {
        name: "Custom",
        columns: 1,
        separateLinks: true,
        visible: false,
        items: [],
      } as SectionWithItem<any>,
    },
    metadata: {
      template: templateId as any,
      layout: [
        [
          ["summary", "experience", "education", "projects"],
          ["profiles", "skills", "certifications", "awards", "languages", "volunteer", "publications"],
        ],
      ] as any,
      css: {
        value: "",
        visible: false,
      },
      page: {
        margin: 14,
        format: "a4",
        options: {
          breakLine: true,
          pageNumbers: false,
        },
      },
      theme: {
        background: "#ffffff",
        text: "#000000",
        primary: "#3b82f6", // Blue primary color
      },
      typography: {
        font: {
          family: "Inter",
          subset: "latin",
          variants: ["regular"],
          size: 12,
        },
        lineHeight: 1.5,
        hideIcons: false,
        underlineLinks: true,
      },
    },
  };
};

export default mapResumeGeniusToReactiveResume;
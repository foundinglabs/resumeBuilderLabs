export interface ResumeSection<T = any> {
  visible: boolean;
  items: T[];
  [key: string]: any;
}

export interface Resume {
  basics: {
    name: string;
    email: string;
    phone: string;
    location: string;
    url: { href: string };
    customFields: Array<{
      id: string;
      name: string;
      value: string;
      icon: string;
    }>;
    picture: {
      url: string;
      size: number;
      aspectRatio: number;
      borderRadius: number;
      effects: {
        hidden: boolean;
        border: boolean;
        grayscale: boolean;
      };
    };
    headline?: string;
  };
  metadata: {
    theme: {
      primary: string;
      background: string;
      text: string;
    };
    layout: {
      page: {
        margin: string;
        format: string;
      };
    };
  };
  sections: {
    projects: ResumeSection;
    experience: ResumeSection;
    education: ResumeSection;
    awards: ResumeSection;
    certifications: ResumeSection;
    skills: ResumeSection;
    interests: ResumeSection;
    publications: ResumeSection;
    volunteer: ResumeSection;
    languages: ResumeSection;
    references: ResumeSection;
    summary: ResumeSection;
    profiles: ResumeSection;
    custom: Record<string, ResumeSection>;
  };
} 
import { Resume } from '@/types/resume';

export const defaultResume: Resume = {
  basics: {
    name: '',
    email: '',
    phone: '',
    location: '',
    url: { href: '' },
    customFields: [],
    picture: {
      url: '',
      size: 120,
      aspectRatio: 1,
      borderRadius: 50,
      effects: {
        hidden: false,
        border: false,
        grayscale: false,
      },
    },
  },
  metadata: {
    theme: {
      primary: '#3b82f6',
      background: '#ffffff',
      text: '#000000',
    },
    layout: {
      page: {
        margin: '0.75in',
        format: 'a4',
      },
    },
  },
  sections: {
    projects: { visible: true, items: [] },
    experience: { visible: true, items: [] },
    education: { visible: true, items: [] },
    awards: { visible: true, items: [] },
    certifications: { visible: true, items: [] },
    skills: { visible: true, items: [] },
    interests: { visible: true, items: [] },
    publications: { visible: true, items: [] },
    volunteer: { visible: true, items: [] },
    languages: { visible: true, items: [] },
    references: { visible: true, items: [] },
    summary: { visible: true, items: [] },
    profiles: { visible: true, items: [] },
    custom: {},
  },
}; 
import { Resume } from '@/types/resume';

export const defaultResume: Resume = {
  basics: {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 555-123-4567',
    location: 'San Francisco, CA',
    url: { href: 'https://alexjohnson.dev', label: 'alexjohnson.dev' },
    customFields: [
      { id: 'linkedin', name: 'LinkedIn', value: 'https://linkedin.com/in/alexjohnson', icon: 'linkedin' },
      { id: 'github', name: 'GitHub', value: 'https://github.com/alexjohnson', icon: 'github' }
    ],
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
    headline: 'Full Stack Engineer | React, Node.js, AWS | Building scalable web apps',
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
    summary: {
      visible: true,
      content: 'Experienced Full Stack Engineer with 7+ years in designing, developing, and deploying modern web applications. Passionate about building scalable, maintainable, and user-centric solutions using React, Node.js, and AWS. Strong advocate for clean code, DevOps, and continuous learning.',
      columns: 1,
      id: 'summary',
      name: 'Summary',
    },
    experience: {
      visible: true,
      items: [
        {
          id: 'exp1',
          company: 'Google',
          position: 'Senior Software Engineer',
          location: 'Mountain View, CA',
          date: '2021 - Present',
          summary: 'Lead engineer for Google Cloud Console. Architected and delivered a micro-frontend platform using React, TypeScript, and GraphQL. Mentored 5+ junior engineers and drove adoption of CI/CD best practices.',
          url: { href: 'https://google.com', label: 'google.com' },
          visible: true,
        },
        {
          id: 'exp2',
          company: 'Stripe',
          position: 'Software Engineer',
          location: 'San Francisco, CA',
          date: '2018 - 2021',
          summary: 'Built and maintained payment APIs and dashboards. Improved system reliability and reduced latency by 30% through service refactoring and observability enhancements.',
          url: { href: 'https://stripe.com', label: 'stripe.com' },
          visible: true,
        },
        {
          id: 'exp3',
          company: 'Acme Corp',
          position: 'Frontend Developer',
          location: 'Remote',
          date: '2016 - 2018',
          summary: 'Developed responsive UIs with React and Redux. Collaborated with designers and backend teams to deliver seamless user experiences.',
          url: { href: 'https://acmecorp.com', label: 'acmecorp.com' },
          visible: true,
        },
      ],
      separateLinks: false,
      name: 'Experience',
      id: 'experience',
    },
    education: {
      visible: true,
      items: [
        {
          id: 'edu1',
          institution: 'Stanford University',
          area: 'Computer Science',
          studyType: 'B.Sc.',
          score: '3.9/4.0',
          date: '2012 - 2016',
          url: { href: 'https://stanford.edu', label: 'stanford.edu' },
          visible: true,
        },
      ],
      separateLinks: false,
      name: 'Education',
      id: 'education',
    },
    skills: {
      visible: true,
      items: [
        { id: 'skill1', name: 'React', level: 5, description: 'Advanced in building SPAs, hooks, context, and performance optimization.', keywords: ['Hooks', 'Redux', 'Context API'], visible: true },
        { id: 'skill2', name: 'Node.js', level: 5, description: 'REST APIs, Express, async patterns, and microservices.', keywords: ['Express', 'API', 'Microservices'], visible: true },
        { id: 'skill3', name: 'TypeScript', level: 4, description: 'Type-safe JavaScript, interfaces, generics, and large codebases.', keywords: ['Types', 'Generics', 'OOP'], visible: true },
        { id: 'skill4', name: 'AWS', level: 4, description: 'Deploying and scaling apps with Lambda, S3, EC2, and CloudFormation.', keywords: ['Lambda', 'S3', 'EC2'], visible: true },
        { id: 'skill5', name: 'Python', level: 4, description: 'Scripting, automation, and data analysis with Pandas and NumPy.', keywords: ['Pandas', 'NumPy', 'Automation'], visible: true },
        { id: 'skill6', name: 'Docker', level: 4, description: 'Containerization, Docker Compose, and CI/CD pipelines.', keywords: ['Containers', 'CI/CD'], visible: true },
      ],
      name: 'Skills',
      id: 'skills',
    },
    projects: {
      visible: true,
      items: [
        {
          id: 'proj1',
          name: 'Realtime Chat App',
          description: 'Built a scalable chat application using React, Node.js, and Socket.io. Supports real-time messaging, notifications, and user presence.',
          date: '2022',
          url: { href: 'https://github.com/alexjohnson/realtime-chat', label: 'GitHub' },
          keywords: ['React', 'Node.js', 'Socket.io'],
          visible: true,
        },
        {
          id: 'proj2',
          name: 'Serverless Image Processor',
          description: 'Developed an AWS Lambda-based image processing pipeline. Automated resizing, optimization, and S3 storage.',
          date: '2021',
          url: { href: 'https://alexjohnson.dev/image-processor', label: 'Live' },
          keywords: ['AWS Lambda', 'S3', 'Serverless'],
          visible: true,
        },
        {
          id: 'proj3',
          name: 'Personal Portfolio',
          description: 'Designed and deployed a personal portfolio using Next.js and Vercel. Showcases projects, blog, and contact form.',
          date: '2020',
          url: { href: 'https://alexjohnson.dev', label: 'Portfolio' },
          keywords: ['Next.js', 'Vercel', 'Portfolio'],
          visible: true,
        },
      ],
      name: 'Projects',
      id: 'projects',
    },
    certifications: {
      visible: true,
      items: [
        { id: 'cert1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon', date: '2022', url: { href: 'https://aws.amazon.com/certification/', label: 'AWS' }, visible: true },
        { id: 'cert2', name: 'Certified Kubernetes Administrator', issuer: 'CNCF', date: '2021', url: { href: 'https://www.cncf.io/certification/cka/', label: 'CKA' }, visible: true },
      ],
      separateLinks: false,
      name: 'Certifications',
      id: 'certifications',
    },
    awards: {
      visible: true,
      items: [
        { id: 'award1', title: 'Best Developer Award', awarder: 'Google', date: '2022', description: 'Recognized for outstanding contributions to the Google Cloud Console project.', url: { href: 'https://google.com', label: 'google.com' }, visible: true },
        { id: 'award2', title: 'Hackathon Winner', awarder: 'Stripe', date: '2020', description: 'Led a team to victory in Stripe’s annual hackathon with a fintech innovation.', url: { href: 'https://stripe.com', label: 'stripe.com' }, visible: true },
      ],
      separateLinks: false,
      name: 'Awards',
      id: 'awards',
    },
    interests: {
      visible: true,
      items: [
        { id: 'int1', name: 'Open Source', keywords: ['GitHub', 'Contributions'], visible: true },
        { id: 'int2', name: 'Cloud Computing', keywords: ['AWS', 'Azure', 'GCP'], visible: true },
        { id: 'int3', name: 'Machine Learning', keywords: ['Python', 'TensorFlow'], visible: true },
      ],
      name: 'Interests',
      id: 'interests',
    },
    publications: {
      visible: true,
      items: [
        { id: 'pub1', title: 'Scaling React Apps', publisher: 'Smashing Magazine', date: '2021', url: { href: 'https://smashingmagazine.com', label: 'smashingmagazine.com' }, visible: true },
        { id: 'pub2', title: 'Serverless Architectures', publisher: 'Medium', date: '2020', url: { href: 'https://medium.com', label: 'medium.com' }, visible: true },
      ],
      name: 'Publications',
      id: 'publications',
    },
    volunteer: {
      visible: true,
      items: [
        { id: 'vol1', organization: 'Code for Good', position: 'Mentor', location: 'Remote', date: '2021', summary: 'Mentored students in open source and web development.', url: { href: 'https://codeforgood.org', label: 'codeforgood.org' }, visible: true },
        { id: 'vol2', organization: 'Tech Outreach', position: 'Workshop Speaker', location: 'San Francisco, CA', date: '2020', summary: 'Conducted workshops on React and cloud technologies.', url: { href: 'https://techoutreach.org', label: 'techoutreach.org' }, visible: true },
      ],
      separateLinks: false,
      name: 'Volunteer',
      id: 'volunteer',
    },
    languages: {
      visible: true,
      items: [
        { id: 'lang1', name: 'English', level: 5, description: 'Native proficiency', visible: true },
        { id: 'lang2', name: 'Spanish', level: 3, description: 'Professional working proficiency', visible: true },
        { id: 'lang3', name: 'German', level: 2, description: 'Conversational', visible: true },
      ],
      name: 'Languages',
      id: 'languages',
    },
    references: {
      visible: true,
      items: [
        { id: 'ref1', name: 'Jane Smith', description: 'Engineering Manager at Google', url: { href: 'mailto:jane.smith@google.com', label: 'jane.smith@google.com' }, visible: true },
        { id: 'ref2', name: 'Bob Lee', description: 'CTO at Stripe', url: { href: 'mailto:bob.lee@stripe.com', label: 'bob.lee@stripe.com' }, visible: true },
      ],
      name: 'References',
      id: 'references',
    },
    profiles: {
      visible: true,
      items: [
        { id: 'profile1', network: 'LinkedIn', username: 'alexjohnson', url: { href: 'https://linkedin.com/in/alexjohnson', label: 'linkedin.com/in/alexjohnson' }, icon: 'linkedin', visible: true },
        { id: 'profile2', network: 'GitHub', username: 'alexjohnson', url: { href: 'https://github.com/alexjohnson', label: 'github.com/alexjohnson' }, icon: 'github', visible: true },
        { id: 'profile3', network: 'Twitter', username: 'alex_codes', url: { href: 'https://twitter.com/alex_codes', label: 'twitter.com/alex_codes' }, icon: 'twitter', visible: true },
      ],
      name: 'Profiles',
      id: 'profiles',
    },
    custom: {},
  },
}; 
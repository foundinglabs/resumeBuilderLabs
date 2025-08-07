// Test Integration Component
import React, { useState } from 'react';
import ReactiveResumeRenderer from './ReactiveResumeRenderer';
import { templateService } from '../services/template-service';

const TestIntegration: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('azurill');
  
  // Sample ResumeGenius data
  const sampleResumeData = {
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@email.com",
      phone: "(555) 123-4567",
      address: "San Francisco, CA"
    },
    summary: "Experienced software engineer with over 5 years of expertise in full-stack web development, specializing in building scalable and maintainable systems. Adept at working in Agile environments, mentoring junior developers, and integrating cutting-edge technologies to improve application performance and user experience. Proven track record in leading cross-functional teams, driving architecture decisions, and delivering high-quality products under tight deadlines. Strong believer in clean code, continuous learning, and team collaboration.",
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Solutions Inc.",
        startDate: "2022",
        endDate: "Present",
        description: "Led the migration to microservices architecture for legacy systems.\nManaged a team of 4 junior developers and conducted regular code reviews.\nImproved application performance by 40% using caching and query optimization.\nIntegrated CI/CD pipelines using GitHub Actions and Docker.\nCollaborated with cross-functional teams including designers and product managers.",
        location: "San Francisco, CA",
        employment_type: "Full-time"
      },
      {
        title: "Full-Stack Developer",
        company: "InnovateX Labs",
        startDate: "2019",
        endDate: "2022",
        description: "Built and maintained web applications using MERN stack.\nDeveloped RESTful APIs and implemented secure user authentication.\nReduced page load time by 35% through code splitting and lazy loading.\nWorked closely with QA to implement test-driven development.\nDeployed applications on AWS using EC2 and S3.",
        location: "San Jose, CA",
        employment_type: "Full-time"
      }
    ],
    education: [
      {
        degree: "Master of Science in Software Engineering",
        school: "Stanford University",
        graduationYear: "2021",
        gpa: "3.9",
        field_of_study: "Software Engineering",
        location: "Stanford, CA",
        honors: "With Distinction"
      },
      {
        degree: "Bachelor of Science in Computer Science",
        school: "University of California, Berkeley",
        graduationYear: "2019",
        gpa: "3.8",
        field_of_study: "Computer Science",
        location: "Berkeley, CA",
        honors: "Magna Cum Laude"
      }
    ],
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "AWS", "Docker", "Git"],
    template: selectedTemplate,
    socialLinks: {
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
      portfolio: "https://johndoe.dev"
    },
    projects: [
      {
        title: "E-Commerce Platform",
        description: "Built a scalable, secure full-stack e-commerce application using React, Node.js, and MongoDB. Integrated Stripe for payment processing and implemented user authentication with JWT. Optimized database queries and implemented lazy loading to improve page speed. Features included cart management, order tracking, and admin dashboard.",
        technologies: ["React", "Node.js", "MongoDB", "Stripe"],
        link: "https://github.com/johndoe/ecommerce",
        duration: "3 months"
      },
      {
        title: "Real-Time Chat App",
        description: "Developed a real-time chat application with WebSocket and Socket.io. Implemented user login, private messaging, and chat room functionality. Deployed the app on Heroku with persistent sessions using Redis and MongoDB.",
        technologies: ["Socket.io", "Node.js", "React", "Redis", "MongoDB"],
        link: "https://github.com/johndoe/chat-app",
        duration: "2 months"
      }
    ]
  };
  
  const reactiveResumeTemplates = [
    'azurill', 'bronzor', 'chikorita', 'ditto', 'gengar', 
    'glalie', 'kakuna', 'leafish', 'nosepass', 'onyx', 
    'pikachu', 'rhyhorn'
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reactive-Resume Template Integration Test</h1>
      
      {/* Template Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Template:
        </label>
        <select 
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {reactiveResumeTemplates.map(template => (
            <option key={template} value={template}>
              {template.charAt(0).toUpperCase() + template.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Template Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900">Template Info:</h3>
        <p className="text-blue-700">
          Template: {selectedTemplate} | 
          Is Reactive-Resume: {templateService.isReactiveResumeTemplate(selectedTemplate) ? 'Yes' : 'No'}
        </p>
      </div>

      {/* Template Renderer */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <ReactiveResumeRenderer
          resumeData={sampleResumeData}
          templateId={selectedTemplate}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default TestIntegration;
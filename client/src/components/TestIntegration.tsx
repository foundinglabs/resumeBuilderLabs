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
      address: "San Francisco, CA",
    },
    summary: "Experienced software engineer with 5+ years of expertise in full-stack development. Passionate about creating scalable solutions and leading technical teams to deliver high-quality products.",
    experience: [{
      title: "Senior Software Engineer",
      company: "Tech Solutions Inc.",
      startDate: "2022",
      endDate: "Present",
      description: "Led development of microservices architecture\nManaged team of 4 junior developers\nImproved application performance by 40%",
      location: "San Francisco, CA",
      employment_type: "Full-time",
    }],
    education: [{
      degree: "Bachelor of Science in Computer Science",
      school: "University of California, Berkeley",
      graduationYear: "2019",
      gpa: "3.8",
      field_of_study: "Computer Science",
      location: "Berkeley, CA",
      honors: "Magna Cum Laude",
    }],
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "AWS", "Docker", "Git"],
    template: selectedTemplate,
    socialLinks: {
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
      portfolio: "https://johndoe.dev",
    },
    projects: [{
      title: "E-Commerce Platform",
      description: "Built a full-stack e-commerce platform using React and Node.js",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      link: "https://github.com/johndoe/ecommerce",
      duration: "3 months",
    }],
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
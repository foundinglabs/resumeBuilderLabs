import React from 'react';
import { ReactiveResumeRenderer } from '../components/ReactiveResumeRenderer';

// Sample resume data for testing
const sampleResumeData = {
  personalInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "https://johndoe.dev"
  },
  summary: "Experienced software engineer with 5+ years of experience in full-stack development. Passionate about creating scalable web applications and leading development teams.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      startDate: "2021",
      endDate: "Present",
      description: "Led development of microservices architecture serving 1M+ users. Mentored junior developers and implemented CI/CD pipelines."
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      startDate: "2019",
      endDate: "2021",
      description: "Built full-stack web applications using React, Node.js, and PostgreSQL. Collaborated with product team to deliver features."
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of California, Berkeley",
      graduationYear: "2019"
    }
  ],
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "PostgreSQL", "AWS", "Docker"]
};

const TemplateTestPage: React.FC = () => {
  const templates = [
    "azurill", "bronzor", "chikorita", "ditto", "gengar", 
    "glalie", "kakuna", "leafish", "nosepass", "onyx", 
    "pikachu", "rhyhorn"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Template Visual Test
          </h1>
          <p className="text-xl text-gray-600">
            Testing Reactive-Resume template rendering with proper styling
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {templates.map((templateId) => (
            <div key={templateId} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {templateId} Template
                </h3>
              </div>
              
              <div className="p-4">
                <div className="transform scale-50 origin-top-left" style={{ width: '200%', height: '200%' }}>
                  <ReactiveResumeRenderer
                    resumeData={sampleResumeData}
                    templateId={templateId}
                    className="border border-gray-200"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateTestPage;
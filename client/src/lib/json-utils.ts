import { saveAs } from 'file-saver';
import { ResumeData } from '@/pages/builder';

export async function generateJSON(resumeData: ResumeData, fileName: string = 'Resume') {
  try {
    // Create a clean, structured JSON object
    const cleanResumeData = {
      metadata: {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        format: 'resume-builder-pro',
      },
      personalInfo: {
        firstName: resumeData.personalInfo.firstName,
        lastName: resumeData.personalInfo.lastName,
        fullName: `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`,
        email: resumeData.personalInfo.email,
        phone: resumeData.personalInfo.phone,
      },
      summary: resumeData.summary || '',
      experience: resumeData.experience.map(exp => ({
        title: exp.title,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
        duration: calculateDuration(exp.startDate, exp.endDate),
      })),
      education: resumeData.education.map(edu => ({
        degree: edu.degree,
        school: edu.school,
        graduationYear: edu.graduationYear,
        gpa: edu.gpa || null,
      })),
      skills: resumeData.skills || [],
      template: resumeData.template || 'modern',
      stats: {
        totalExperience: resumeData.experience.length,
        totalEducation: resumeData.education.length,
        totalSkills: resumeData.skills.length,
        completionPercentage: calculateCompletionPercentage(resumeData),
      },
    };

    // Convert to formatted JSON string
    const jsonString = JSON.stringify(cleanResumeData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `${fileName}.json`);
    
    console.log('JSON generated successfully');
  } catch (error) {
    console.error('Error generating JSON:', error);
    throw new Error('Failed to generate JSON file');
  }
}

function calculateDuration(startDate: string, endDate: string): string {
  if (!startDate) return '';
  
  const start = new Date(startDate);
  const end = endDate === 'Present' ? new Date() : new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return '';
  }
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);
  
  if (diffYears > 0) {
    const remainingMonths = diffMonths % 12;
    if (remainingMonths > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
    return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  } else {
    return 'Less than a month';
  }
}

function calculateCompletionPercentage(resumeData: ResumeData): number {
  let completed = 0;
  let total = 5; // Total sections: personal info, summary, experience, education, skills
  
  // Personal info (required fields)
  if (resumeData.personalInfo.firstName && resumeData.personalInfo.lastName && 
      resumeData.personalInfo.email && resumeData.personalInfo.phone) {
    completed++;
  }
  
  // Summary
  if (resumeData.summary && resumeData.summary.trim().length > 0) {
    completed++;
  }
  
  // Experience
  if (resumeData.experience.length > 0) {
    completed++;
  }
  
  // Education
  if (resumeData.education.length > 0) {
    completed++;
  }
  
  // Skills
  if (resumeData.skills.length > 0) {
    completed++;
  }
  
  return Math.round((completed / total) * 100);
}
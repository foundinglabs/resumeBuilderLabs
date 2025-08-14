import { apiRequest } from './queryClient';

export interface RefinedResumeData {
  metadata: {
    parser_version: string;
    parsed_at: string;
    confidence_score: number;
    layout_type: string;
    is_ats_compatible: boolean;
    language: string;
    word_count: number;
    employment_gaps: string[];
    pii_types: string[];
  };
  personal_information: {
    full_name: string;
    contact: {
      email: string;
      phone?: string;
      address?: string;
      social_links: {
        linkedin?: string;
        github?: string;
        portfolio?: string;
      };
    };
    demographics: {
      dob: null;
      gender: null;
      nationality: null;
    };
  };
  professional_profile: {
    summary: string;
    career_objective?: string;
  };
  employment_history: {
    full_time: Array<{
      jobTitle: string;
      company: string;
      location?: string;
      startDate: string;
      endDate: string;
      description: string[];
      employment_type: string;
    }>;
    internships: any[];
    freelance_work: any[];
  };
  education: {
    academics: Array<{
      institution: string;
      degree: string;
      field_of_study?: string;
      location?: string;
      startYear: string;
      endYear: string;
      cgpa?: string;
      honors?: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      expiry?: string;
      credential_id?: string;
    }>;
    courses: any[];
  };
  skills: {
    technical: string[];
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
    soft_skills: string[];
  };
  achievements: {
    awards: any[];
    publications: any[];
    projects: Array<{
      title: string;
      description: string;
      technologies?: string[];
      link?: string;
      duration?: string;
    }>;
  };
  volunteer_work: any[];
  raw_data: {
    original_text: string;
    sections_detected: string[];
  };
  ats_analysis: {
    score: number;
    reason: string;
  };
}

export interface GeminiApiResponse {
  success: boolean;
  data?: RefinedResumeData;
  error?: string;
}

// Gemini-powered resume refinement
export async function refineResumeWithGemini(rawText: string, field?: string): Promise<RefinedResumeData> {
  if (!rawText || rawText.trim().length < 50) {
    throw new Error('Resume text must be at least 50 characters long');
  }

  console.log('Sending resume text to Gemini AI for refinement. Text length:', rawText.length);

  // Use the Gemini-powered backend endpoint
  const response = await apiRequest('POST', '/api/resume/refine', { text: rawText, field });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  const result: GeminiApiResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to refine resume text');
  }

  console.log('Successfully refined resume text with Gemini AI');
  return result.data;
}

// Map Gemini-refined data to the resume form structure
export function mapRefinedDataToResumeForm(refinedData: RefinedResumeData) {
  // Split the name into first and last name
  const nameParts = refinedData.personal_information.full_name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Map work experience from the comprehensive structure
  const mappedExperience = (refinedData.employment_history.full_time || []).map(exp => ({
    title: exp.jobTitle || '',
    company: exp.company || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    description: Array.isArray(exp.description) ? exp.description.join('\n') : (exp.description || ''),
    location: exp.location || '',
    employment_type: exp.employment_type || 'Full-time',
  }));

  // Map education from the comprehensive structure
  const mappedEducation = (refinedData.education.academics || []).map(edu => ({
    degree: edu.degree || '',
    school: edu.institution || '',
    graduationYear: edu.endYear || '',
    gpa: edu.cgpa || '',
    field_of_study: edu.field_of_study || '',
    location: edu.location || '',
    honors: edu.honors || '',
  }));

  // Map internships
  const mappedInternships = (refinedData.employment_history.internships || []).map(intern => ({
    title: intern.jobTitle || '',
    company: intern.company || '',
    startDate: intern.startDate || '',
    endDate: intern.endDate || '',
    description: Array.isArray(intern.description) ? intern.description.join('\n') : (intern.description || ''),
    location: intern.location || '',
  }));

  // Map freelance work
  const mappedFreelance = (refinedData.employment_history.freelance_work || []).map(work => ({
    title: work.jobTitle || '',
    client: work.company || '',
    startDate: work.startDate || '',
    endDate: work.endDate || '',
    description: Array.isArray(work.description) ? work.description.join('\n') : (work.description || ''),
    technologies: work.technologies || [],
  }));

  // Map volunteer work
  const mappedVolunteer = (refinedData.volunteer_work || []).map(vol => ({
    role: vol.role || '',
    organization: vol.organization || '',
    startDate: vol.startDate || '',
    endDate: vol.endDate || '',
    description: vol.description || '',
  }));

  return {
    personalInfo: {
      firstName,
      lastName,
      email: refinedData.personal_information.contact.email || '',
      phone: refinedData.personal_information.contact.phone || '',
      address: refinedData.personal_information.contact.address || '',
    },
    summary: refinedData.professional_profile.summary || '',
    careerObjective: refinedData.professional_profile.career_objective || '',
    experience: mappedExperience.length > 0 ? mappedExperience : [{
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
      location: '',
      employment_type: 'Full-time',
    }],
    education: mappedEducation.length > 0 ? mappedEducation : [{
      degree: '',
      school: '',
      graduationYear: '',
      gpa: '',
      field_of_study: '',
      location: '',
      honors: '',
    }],
    skills: refinedData.skills.technical || [],
    template: 'azurill',
    field: '',
    
    // Comprehensive data mapping
    metadata: refinedData.metadata,
    socialLinks: refinedData.personal_information.contact.social_links || {
      linkedin: '',
      github: '',
      portfolio: '',
      website: '',
    },
    projects: refinedData.achievements.projects || [],
    awards: refinedData.achievements.awards || [],
    publications: refinedData.achievements.publications || [],
    languages: refinedData.skills.languages || [],
    certifications: refinedData.education.certifications || [],
    courses: refinedData.education.courses || [],
    internships: mappedInternships,
    freelanceWork: mappedFreelance,
    volunteerWork: mappedVolunteer,
    softSkills: refinedData.skills.soft_skills || [],
    technicalSkills: {
      programming_languages: refinedData.skills.technical?.filter(skill => 
        ['javascript', 'python', 'java', 'typescript', 'c++', 'c#', 'go', 'rust', 'php', 'ruby'].some(lang => 
          skill.toLowerCase().includes(lang)
        )
      ) || [],
      frameworks: refinedData.skills.technical?.filter(skill => 
        ['react', 'angular', 'vue', 'express', 'django', 'spring', 'laravel', 'rails'].some(framework => 
          skill.toLowerCase().includes(framework)
        )
      ) || [],
      tools: refinedData.skills.technical?.filter(skill => 
        ['git', 'docker', 'kubernetes', 'jenkins', 'webpack', 'babel'].some(tool => 
          skill.toLowerCase().includes(tool)
        )
      ) || [],
      databases: refinedData.skills.technical?.filter(skill => 
        ['mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'dynamodb'].some(db => 
          skill.toLowerCase().includes(db)
        )
      ) || [],
      cloud_platforms: refinedData.skills.technical?.filter(skill => 
        ['aws', 'azure', 'gcp', 'google cloud', 'firebase', 'heroku'].some(cloud => 
          skill.toLowerCase().includes(cloud)
        )
      ) || [],
    },
    atsScore: refinedData.ats_analysis.score,
  };
}
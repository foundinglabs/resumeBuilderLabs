import mammoth from 'mammoth';
import type { ResumeData } from '@/pages/builder';

// For PDF processing, we'll use a different approach that doesn't require workers
// This is more reliable in browser environments like Replit

export interface ParsedResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    graduationYear: string;
    gpa?: string;
  }>;
  skills: string[];
  projects?: Array<{
    title: string;
    description: string;
    technologies?: string[];
    link?: string;
    duration?: string;
  }>;
  rawText?: string; // Original extracted text for AI processing
}

// Regular expressions for extracting data
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_REGEX = /(\+?1?\s*)?(\([0-9]{3}\)|[0-9]{3})[\s.-]*[0-9]{3}[\s.-]*[0-9]{4}/g;
const NAME_REGEX = /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m;

// Server-side PDF processing for reliable text extraction
export async function extractTextFromPDF(file: File): Promise<string> {
  console.log('Starting server-side PDF text extraction for file:', file.name);
  
  try {
    // Create FormData to send file to server
    const formData = new FormData();
    formData.append('pdf', file);
    
    console.log('Sending PDF to server for processing...');
    
    // Send to server-side PDF processing endpoint
    const response = await fetch('/api/pdf/extract', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Server-side PDF processing failed');
    }
    
    if (!result.success) {
      throw new Error(result.error || 'PDF processing was unsuccessful');
    }
    
    if (!result.text || result.text.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }
    
    console.log(`Successfully extracted ${result.text.length} characters from PDF via server`);
    
    // Optional: Log metadata if available
    if (result.metadata) {
      console.log('PDF metadata:', {
        pages: result.metadata.pages,
        title: result.metadata.title,
        author: result.metadata.author
      });
    }
    
    return result.text;
    
  } catch (error) {
    console.error('Server-side PDF processing error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Provide specific error messages based on error type
    if (errorMessage.includes('fetch')) {
      throw new Error('Unable to connect to PDF processing service. Please check your internet connection and try again.');
    } else if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
      throw new Error('This PDF is password-protected. Please remove the password protection and try again.');
    } else if (errorMessage.includes('corrupted') || errorMessage.includes('invalid')) {
      throw new Error('The PDF file appears to be corrupted or invalid. Please try a different file.');
    } else if (errorMessage.includes('size')) {
      throw new Error('PDF file is too large. Please ensure the file is under 10MB.');
    } else if (errorMessage.includes('very little text')) {
      throw new Error('This PDF contains very little readable text. It may be image-based or scanned. Please try a text-based PDF or convert to DOCX format.');
    } else {
      throw new Error(`PDF processing failed: ${errorMessage}. As an alternative, you can convert your PDF to DOCX format, which processes more reliably.`);
    }
  }
}

// Extract text from DOCX file
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX file');
  }
}

// Extract email from text
function extractEmail(text: string): string {
  const emails = text.match(EMAIL_REGEX);
  return emails ? emails[0] : '';
}

// Extract phone number from text
function extractPhone(text: string): string {
  const phones = text.match(PHONE_REGEX);
  return phones ? phones[0].replace(/[\s.-]/g, '') : '';
}

// Extract name from text (assumes name is at the beginning)
function extractName(text: string): { firstName: string; lastName: string } {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  for (const line of lines.slice(0, 5)) { // Check first 5 lines
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 50) {
      const words = trimmed.split(/\s+/);
      if (words.length >= 2 && words.every(word => /^[A-Za-z]+$/.test(word))) {
        return {
          firstName: words[0],
          lastName: words.slice(1).join(' ')
        };
      }
    }
  }
  
  return { firstName: '', lastName: '' };
}

// Extract summary/objective section
function extractSummary(text: string): string {
  const summaryKeywords = [
    'summary', 'objective', 'profile', 'about', 'overview',
    'professional summary', 'career objective', 'personal statement'
  ];
  
  const lines = text.split('\n');
  let summaryStartIndex = -1;
  let summaryEndIndex = -1;
  
  // Find the start of summary section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      summaryStartIndex = i;
      break;
    }
  }
  
  if (summaryStartIndex === -1) return '';
  
  // Find the end of summary section (next section or empty line)
  const sectionKeywords = [
    'experience', 'work', 'employment', 'education', 'skills',
    'projects', 'certifications', 'awards'
  ];
  
  for (let i = summaryStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (line === '' || sectionKeywords.some(keyword => line.includes(keyword))) {
      summaryEndIndex = i;
      break;
    }
  }
  
  if (summaryEndIndex === -1) summaryEndIndex = Math.min(summaryStartIndex + 5, lines.length);
  
  return lines
    .slice(summaryStartIndex + 1, summaryEndIndex)
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ');
}

// Extract work experience
function extractExperience(text: string): Array<{
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}> {
  const experienceKeywords = ['experience', 'work', 'employment', 'career', 'professional'];
  const lines = text.split('\n');
  let experienceStartIndex = -1;
  
  // Find the start of experience section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      experienceStartIndex = i;
      break;
    }
  }
  
  if (experienceStartIndex === -1) return [];
  
  const experienceLines = lines.slice(experienceStartIndex + 1);
  const experiences: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }> = [];
  
  let currentExperience: any = null;
  let descriptionLines: string[] = [];
  
  for (const line of experienceLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check if this might be a new job entry (contains dates)
    const datePattern = /\b(20\d{2}|19\d{2})\b/;
    const isNewEntry = datePattern.test(trimmed) && trimmed.length < 100;
    
    if (isNewEntry && currentExperience) {
      // Save previous experience
      currentExperience.description = descriptionLines.join(' ').trim();
      experiences.push(currentExperience);
      descriptionLines = [];
    }
    
    if (isNewEntry) {
      // Parse job title, company, and dates
      const parts = trimmed.split(/[-–|]/);
      if (parts.length >= 2) {
        currentExperience = {
          title: parts[0].trim(),
          company: parts[1].replace(/\b(20\d{2}|19\d{2})\b.*/, '').trim(),
          startDate: '',
          endDate: '',
          description: ''
        };
        
        // Extract dates
        const dates = trimmed.match(/\b(20\d{2}|19\d{2})\b/g);
        if (dates && dates.length >= 1) {
          currentExperience.startDate = dates[0];
          currentExperience.endDate = dates[1] || 'Present';
        }
      }
    } else if (currentExperience) {
      // Add to description
      descriptionLines.push(trimmed);
    }
    
    // Stop if we hit another section
    const sectionKeywords = ['education', 'skills', 'projects', 'certifications'];
    if (sectionKeywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
      break;
    }
  }
  
  // Don't forget the last experience
  if (currentExperience) {
    currentExperience.description = descriptionLines.join(' ').trim();
    experiences.push(currentExperience);
  }
  
  return experiences.slice(0, 5); // Limit to 5 experiences
}

// Extract education
function extractEducation(text: string): Array<{
  degree: string;
  school: string;
  graduationYear: string;
  gpa?: string;
}> {
  const educationKeywords = ['education', 'academic', 'university', 'college', 'school'];
  const lines = text.split('\n');
  let educationStartIndex = -1;
  
  // Find the start of education section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (educationKeywords.some(keyword => line.includes(keyword))) {
      educationStartIndex = i;
      break;
    }
  }
  
  if (educationStartIndex === -1) return [];
  
  const educationLines = lines.slice(educationStartIndex + 1);
  const educations: Array<{
    degree: string;
    school: string;
    graduationYear: string;
    gpa?: string;
  }> = [];
  
  for (const line of educationLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Look for year pattern
    const yearMatch = trimmed.match(/\b(20\d{2}|19\d{2})\b/);
    if (yearMatch && trimmed.length < 150) {
      const year = yearMatch[0];
      const beforeYear = trimmed.split(year)[0].trim();
      
      // Try to separate degree and school
      const parts = beforeYear.split(/[-–|,]/);
      let degree = '';
      let school = '';
      
      if (parts.length >= 2) {
        degree = parts[0].trim();
        school = parts[1].trim();
      } else {
        // Assume the whole thing is degree + school
        const words = beforeYear.split(/\s+/);
        if (words.length > 3) {
          degree = words.slice(0, Math.ceil(words.length / 2)).join(' ');
          school = words.slice(Math.ceil(words.length / 2)).join(' ');
        } else {
          degree = beforeYear;
          school = '';
        }
      }
      
      // Extract GPA if present
      const gpaMatch = trimmed.match(/gpa:?\s*(\d+\.?\d*)/i);
      
      educations.push({
        degree,
        school,
        graduationYear: year,
        gpa: gpaMatch ? gpaMatch[1] : undefined
      });
    }
    
    // Stop if we hit another section
    const sectionKeywords = ['skills', 'projects', 'certifications', 'awards'];
    if (sectionKeywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
      break;
    }
  }
  
  return educations.slice(0, 3); // Limit to 3 education entries
}

// Extract skills
function extractSkills(text: string): string[] {
  const skillsKeywords = ['skills', 'technologies', 'technical', 'competencies', 'expertise'];
  const lines = text.split('\n');
  let skillsStartIndex = -1;
  
  // Find the start of skills section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (skillsKeywords.some(keyword => line.includes(keyword))) {
      skillsStartIndex = i;
      break;
    }
  }
  
  if (skillsStartIndex === -1) return [];
  
  const skillsLines = lines.slice(skillsStartIndex + 1);
  const skills: string[] = [];
  
  for (const line of skillsLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Stop if we hit another section
    const sectionKeywords = ['projects', 'certifications', 'awards', 'references'];
    if (sectionKeywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
      break;
    }
    
    // Split by common delimiters
    const skillsInLine = trimmed
      .split(/[,•|·\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 30);
    
    skills.push(...skillsInLine);
    
    if (skills.length >= 15) break; // Limit skills
  }
  
  return skills.slice(0, 15);
}

// Extract projects
function extractProjects(text: string): Array<{
  title: string;
  description: string;
  technologies?: string[];
  link?: string;
  duration?: string;
}> {
  const projectsKeywords = ['projects', 'portfolio', 'achievements', 'personal projects'];
  const lines = text.split('\n');
  let projectsStartIndex = -1;
  
  // Find the start of projects section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (projectsKeywords.some(keyword => line.includes(keyword))) {
      projectsStartIndex = i;
      break;
    }
  }
  
  if (projectsStartIndex === -1) return [];
  
  const projectsLines = lines.slice(projectsStartIndex + 1);
  const projects: Array<{
    title: string;
    description: string;
    technologies?: string[];
    link?: string;
    duration?: string;
  }> = [];
  
  let currentProject: any = null;
  
  for (const line of projectsLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Stop if we hit another section
    const sectionKeywords = ['skills', 'certifications', 'awards', 'references', 'education', 'experience'];
    if (sectionKeywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
      break;
    }
    
    // Look for project title patterns (usually starts with capital letters and ends with colon or dash)
    const titleMatch = trimmed.match(/^([A-Z][A-Za-z\s]+?)[:|\-]/);
    if (titleMatch) {
      // Save previous project if exists
      if (currentProject && currentProject.title) {
        projects.push(currentProject);
      }
      
      // Start new project
      currentProject = {
        title: titleMatch[1].trim(),
        description: '',
        technologies: [],
        link: '',
        duration: ''
      };
    } else if (currentProject) {
      // Add to current project description
      if (currentProject.description) {
        currentProject.description += ' ' + trimmed;
      } else {
        currentProject.description = trimmed;
      }
      
      // Look for technologies in the line
      const techKeywords = ['javascript', 'python', 'react', 'node', 'html', 'css', 'java', 'c++', 'sql', 'mongodb', 'aws', 'docker'];
      const foundTechs = techKeywords.filter(tech => trimmed.toLowerCase().includes(tech));
      if (foundTechs.length > 0) {
        currentProject.technologies = [...(currentProject.technologies || []), ...foundTechs];
      }
      
      // Look for links
      const linkMatch = trimmed.match(/(https?:\/\/[^\s]+)/);
      if (linkMatch && !currentProject.link) {
        currentProject.link = linkMatch[1];
      }
    }
  }
  
  // Add the last project if exists
  if (currentProject && currentProject.title) {
    projects.push(currentProject);
  }
  
  return projects.slice(0, 5); // Limit to 5 projects
}

// Main parsing function
export async function parseResumeFile(file: File): Promise<ParsedResumeData> {
  let text = '';
  
  if (file.type === 'application/pdf') {
    text = await extractTextFromPDF(file);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    text = await extractTextFromDOCX(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }
  
  if (!text.trim()) {
    throw new Error('No text could be extracted from the file.');
  }
  
  // Extract all data
  const { firstName, lastName } = extractName(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const summary = extractSummary(text);
  const experience = extractExperience(text);
  const education = extractEducation(text);
  const skills = extractSkills(text);
  const projects = extractProjects(text);
  
  return {
    personalInfo: {
      firstName,
      lastName,
      email,
      phone
    },
    summary,
    experience,
    education,
    skills,
    projects,
    rawText: text // Include raw text for AI processing
  };
}
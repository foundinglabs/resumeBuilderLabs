import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Save, Upload, Briefcase } from "lucide-react";
import { ResumeForm } from "@/components/resume-form";
import { ResumePreview } from "@/components/resume-preview";
import { ResumeUpload } from "@/components/resume-upload";
import { PhotoUpload } from "@/components/photo-upload";
import { DownloadModal } from "@/components/download-modal";
import { LoginSignupButton } from "@/components/LoginSignupButton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { allTemplates, getTemplateById, getTemplateJsonData } from "@/utils/template-integration";
import { useArtboardStore } from "@/store/artboard-store";
import type { Resume } from "@shared/schema";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { defaultResume } from '@/lib/default-resume';
import { mapResumeGeniusToReactiveResume } from '@/utils/reactive-resume-mapper';
import Footer from "@/components/Footer";

export interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
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
  projectSkills?: string[];
  template: string;
  field?: string; // Industry/field of work
  
  // Comprehensive fields from Gemini API structure
  metadata?: {
    parser_version?: string;
    confidence_score?: number;
    is_ats_compatible?: boolean;
    word_count?: number;
    language?: string;
    layout_type?: string;
  };
  
  // Professional links and online presence
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
  };
  
  // Projects and achievements
  projects?: Array<{
    title: string;
    description: string;
    technologies?: string[];
    link?: string;
    duration?: string;
  }>;
  
  // Awards and recognition
  awards?: Array<{
    title: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
  
  // Languages spoken
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  
  // Certifications and licenses
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expiry?: string;
    credential_id?: string;
  }>;
  
  // Additional courses and training
  courses?: Array<{
    title: string;
    provider: string;
    date: string;
    duration?: string;
  }>;
  
  // Internships (separate from full-time experience)
  internships?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    location?: string;
  }>;
  
  // Freelance work
  freelanceWork?: Array<{
    title: string;
    client: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies?: string[];
  }>;
  
  // Volunteer experience
  volunteerWork?: Array<{
    role: string;
    organization: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  
  // Soft skills (separate from technical skills)
  softSkills?: string[];
  
  // Technical skills breakdown
  technicalSkills?: {
    programming_languages?: string[];
    frameworks?: string[];
    tools?: string[];
    databases?: string[];
    cloud_platforms?: string[];
  };
  
  atsScore?: number;
}

function mapDefaultResumeToResumeData(defaultResume: any): ResumeData {
  // Map the defaultResume structure to ResumeData structure for the builder
  return {
  personalInfo: {
      firstName: defaultResume.basics?.name?.split(' ')[0] || '',
      lastName: defaultResume.basics?.name?.split(' ').slice(1).join(' ') || '',
      email: defaultResume.basics?.email || '',
      phone: defaultResume.basics?.phone || '',
      address: defaultResume.basics?.location || '',
    },
    summary: defaultResume.sections?.summary?.content || '',
    experience: (defaultResume.sections?.experience?.items || []).map((item: any) => ({
      title: item.position,
      company: item.company,
      startDate: item.date?.split(' - ')[0] || '',
      endDate: item.date?.split(' - ')[1] || '',
      description: item.summary || '',
      location: item.location || '',
      employment_type: '',
    })),
    education: (defaultResume.sections?.education?.items || []).map((item: any) => ({
      degree: item.studyType,
      school: item.institution,
      graduationYear: item.date,
      gpa: item.score,
      field_of_study: item.area,
      location: item.location,
      honors: '',
    })),
    skills: (defaultResume.sections?.skills?.items || []).map((item: any) => item.name),
    projectSkills: [],
    template: 'azurill',
    field: '',
  socialLinks: {
      linkedin: defaultResume.basics?.customFields?.find((f: any) => f.name === 'LinkedIn')?.value || '',
      github: defaultResume.basics?.customFields?.find((f: any) => f.name === 'GitHub')?.value || '',
      portfolio: defaultResume.basics?.url?.href || '',
      website: defaultResume.basics?.url?.href || '',
    },
    projects: (defaultResume.sections?.projects?.items || []).map((item: any) => ({
      title: item.name,
      description: item.description,
      technologies: item.keywords,
      link: item.url?.href,
      duration: item.date,
    })),
    awards: (defaultResume.sections?.awards?.items || []).map((item: any) => ({
      title: item.title,
      issuer: item.awarder,
      date: item.date,
      description: item.description,
    })),
    languages: (defaultResume.sections?.languages?.items || []).map((item: any) => ({
      language: item.name,
      proficiency: item.description,
    })),
    certifications: (defaultResume.sections?.certifications?.items || []).map((item: any) => ({
      name: item.name,
      issuer: item.issuer,
      date: item.date,
      credential_id: item.credential_id,
    })),
    courses: [],
    internships: [],
    freelanceWork: [],
    volunteerWork: (defaultResume.sections?.volunteer?.items || []).map((item: any) => ({
      role: item.position,
      organization: item.organization,
      startDate: item.date,
      endDate: '',
      description: item.summary,
    })),
    softSkills: [],
  technicalSkills: {
      programming_languages: [],
      frameworks: [],
      tools: [],
      databases: [],
      cloud_platforms: [],
    },
  };
}

const initialResumeData: ResumeData = mapDefaultResumeToResumeData(defaultResume);

// Industry/Field options for targeted resume generation
const INDUSTRY_OPTIONS = [
  { value: "software-engineering", label: "Software Engineering", icon: "💻" },
  { value: "data-science", label: "Data Science & Analytics", icon: "📊" },
  { value: "marketing", label: "Marketing & Digital Marketing", icon: "📢" },
  { value: "finance", label: "Finance & Banking", icon: "💰" },
  { value: "healthcare", label: "Healthcare & Medical", icon: "🏥" },
  { value: "education", label: "Education & Teaching", icon: "📚" },
  { value: "sales", label: "Sales & Business Development", icon: "🤝" },
  { value: "design", label: "Design & Creative", icon: "🎨" },
  { value: "engineering", label: "Engineering (Non-Software)", icon: "⚙️" },
  { value: "hr", label: "Human Resources", icon: "👥" },
  { value: "consulting", label: "Consulting", icon: "💼" },
  { value: "operations", label: "Operations & Project Management", icon: "📋" },
  { value: "legal", label: "Legal & Law", icon: "⚖️" },
  { value: "research", label: "Research & Development", icon: "🔬" },
  { value: "customer-service", label: "Customer Service & Support", icon: "🎧" },
  { value: "other", label: "Other", icon: "🌟" }
];

// Helper function to check if template supports photos
const templateSupportsPhoto = (templateId: string): boolean => {
  // Templates that support photos based on the search results
  const photoSupportedTemplates = [
    'bronzor', 'glalie', 'rhyhorn', 'pikachu', 'nosepass', 
    'chikorita', 'ditto', 'kakuna', 'onyx', 'gengar', 
    'azurill', 'leafish'
  ];
  return photoSupportedTemplates.includes(templateId);
};

// Ensures basics object is always present
function ensureBasics(resumeData: any) {
  if (resumeData.basics) return resumeData;
  return {
    ...resumeData,
    basics: {
      name: resumeData.personalInfo?.firstName && resumeData.personalInfo?.lastName
        ? `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`
        : '',
      email: resumeData.personalInfo?.email || '',
      phone: resumeData.personalInfo?.phone || '',
      headline: resumeData.summary || '',
      location: resumeData.personalInfo?.address || '',
    }
  };
}

// Ensures sections object is always present and normalized
function mapTopLevelToSections(resumeData: any) {
  console.log('mapTopLevelToSections input:', resumeData);
  const sections = resumeData.sections || {};
  const result = {
    ...resumeData,
    sections: {
      ...sections,
      experience: {
        ...(sections.experience || {}),
        items: sections.experience?.items || resumeData.experience || [],
        visible: sections.experience?.visible !== false,
      },
      education: {
        ...(sections.education || {}),
        items: sections.education?.items || (resumeData.education || []).map((edu: any) => typeof edu === 'string' ? { degree: edu } : edu),
        visible: sections.education?.visible !== false,
      },
      skills: {
        ...(sections.skills || {}),
        items: sections.skills?.items || (resumeData.skills || []).map((name: any) => typeof name === 'string' ? { name } : name),
        visible: sections.skills?.visible !== false,
      },
      projects: {
        ...(sections.projects || {}),
        items: sections.projects?.items || resumeData.projects || [],
        visible: sections.projects?.visible !== false,
      },
      languages: {
        ...(sections.languages || {}),
        items: sections.languages?.items || (resumeData.languages || []).map((lang: any) => typeof lang === 'string' ? { name: lang } : lang),
        visible: sections.languages?.visible !== false,
      },
      interests: {
        ...(sections.interests || {}),
        items: sections.interests?.items || (resumeData.interests || []).map((interest: any) => typeof interest === 'string' ? { name: interest } : interest),
        visible: sections.interests?.visible !== false,
      },
      summary: {
        ...(sections.summary || {}),
        content: sections.summary?.content || resumeData.summary || '',
        visible: sections.summary?.visible !== false,
      },
      awards: {
        ...(sections.awards || {}),
        items: sections.awards?.items || resumeData.awards || [],
        visible: sections.awards?.visible !== false,
      },
      certifications: {
        ...(sections.certifications || {}),
        items: sections.certifications?.items || resumeData.certifications || [],
        visible: sections.certifications?.visible !== false,
      },
      volunteer: {
        ...(sections.volunteer || {}),
        items: sections.volunteer?.items || resumeData.volunteerWork || [],
        visible: sections.volunteer?.visible !== false,
      },
      references: {
        ...(sections.references || {}),
        items: sections.references?.items || resumeData.references || [],
        visible: sections.references?.visible !== false,
      },
      // Add more sections as needed
    },
  };
  console.log('mapTopLevelToSections output:', result);
  return result;
}

export default function Builder() {
  const { id } = useParams<{ id: string }>();
  const [location] = useLocation();
  
  // Parse URL search parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const templateParam = urlParams.get('template');
  const sourceParam = urlParams.get('source');
  
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('resume_builder_data');
   
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
                 // If URL has template parameter, use that template
         if (templateParam) {
           return { ...parsedData, template: templateParam };
         }
         // If no template, default to azurill
         return { ...parsedData, template: parsedData.template || 'azurill' };
       } catch {
         return { ...initialResumeData, template: templateParam || 'azurill' };
       }
     }
     return { ...initialResumeData, template: templateParam || 'azurill' };
  });
  
  const [title, setTitle] = useState(() => {
    const savedTitle = localStorage.getItem('resume_builder_title');
    return savedTitle || 'My Resume';
  });
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const setArtboardResume = useArtboardStore((state) => state.setResume);

  // Reset scroll position on component mount
  useEffect(() => {
    // Clear any URL hash and scroll to top
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo(0, 0);
  }, []);
  // Sync to store disabled for preview; templates consume props directly
  useEffect(() => {}, [resumeData]);

  // Load template data when template parameter changes
  useEffect(() => {
    if (templateParam && sourceParam) {
      const selectedTemplate = getTemplateById(templateParam);
      if (selectedTemplate) {
        // Show notification about template selection
        toast({
          title: "Template Selected",
          description: `${selectedTemplate.name} template loaded successfully!`,
        });
        
        // If it's a reactive-resume template, try to load template data
        if (selectedTemplate.isReactiveResume) {
          getTemplateJsonData(selectedTemplate).then(templateData => {
            if (templateData) {
              console.log('Template data loaded:', templateData);
              // You can process template data here if needed
            }
          }).catch(error => {
            console.warn('Could not load template data:', error);
          });
        }
      }
    }
  }, [templateParam, sourceParam, toast]);

  // Fetch existing resume if editing
  const { data: existingResume, isLoading } = useQuery<Resume>({
    queryKey: ["/api/resumes", id],
    enabled: !!id,
  });

  // Check for and restore pending resume data after login
  useEffect(() => {
    const pendingResumeData = localStorage.getItem('pending_resume_data');
    if (pendingResumeData) {
      try {
        const parsedData = JSON.parse(pendingResumeData);
        setResumeData(parsedData);
        // Clear the pending data after restoring
        localStorage.removeItem('pending_resume_data');
      } catch (error) {
        console.error('Error restoring pending resume data:', error);
      }
    }
  }, []);

  // Load existing resume data
  useEffect(() => {
    if (existingResume) {
      setTitle(existingResume.title);
      setResumeData({
        personalInfo: existingResume.personalInfo as any,
        summary: existingResume.summary || "",
        experience: existingResume.experience as any,
        education: existingResume.education as any,
        skills: existingResume.skills as any,
        template: existingResume.template,
        field: (existingResume as any).field || "",
      });
    }
  }, [existingResume]);

  // Save resume mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; resumeData: ResumeData }) => {
      const payload = {
        title: data.title,
        template: data.resumeData.template,
        personalInfo: data.resumeData.personalInfo,
        summary: data.resumeData.summary,
        experience: data.resumeData.experience,
        education: data.resumeData.education,
        skills: data.resumeData.skills,
        field: data.resumeData.field,
      };

      if (id) {
        return await apiRequest("PUT", `/api/resumes/${id}`, payload);
      } else {
        return await apiRequest("POST", "/api/resumes", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resume saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    localStorage.setItem('resume_builder_data', JSON.stringify(resumeData));
    localStorage.setItem('resume_builder_title', title);
    toast({
      title: "Success",
      description: "Resume saved!",
    });
  };

  // Handle uploaded resume parsing
  const handleParseComplete = (parsedData: Partial<ResumeData>) => {
    setResumeData(prev => ({
      ...prev,
      ...parsedData,
      // Merge experience and education arrays properly
      experience: parsedData.experience?.length ? parsedData.experience : prev.experience,
      education: parsedData.education?.length ? parsedData.education : prev.education,
      skills: parsedData.skills?.length ? parsedData.skills : prev.skills,
    }));
    setShowUpload(false);
    toast({
      title: "Success",
      description: "Resume data extracted and filled automatically!",
    });
  };

  const handleParseError = (error: string) => {
    toast({
      title: "Upload Error",
      description: error,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading resume...</p>
        </div>
      </div>
    );
  }

     return (
     <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-16 overflow-x-hidden">
       {/* Navigation */}
       <nav className="fixed top-0 w-full bg-white dark:bg-slate-800 z-50 border-b border-slate-200 dark:border-slate-700 shadow-sm">
         <div className="w-[95vw] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-center h-16">
             <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm sm:text-base">
               <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
               <span className="font-medium hidden sm:inline">Back to Home</span>
               <span className="font-medium sm:hidden">Back</span>
             </Link>
             <div className="flex items-center space-x-2 sm:space-x-4">
               <Button
                 onClick={handleSave}
                 disabled={saveMutation.isPending}
                 variant="outline"
                 className="font-medium text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
               >
                 <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                 <span className="hidden sm:inline">{saveMutation.isPending ? "Saving..." : "Save"}</span>
                 <span className="sm:hidden">{saveMutation.isPending ? "..." : "Save"}</span>
               </Button>
               <DownloadModal resumeData={resumeData}>
                 <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 font-medium text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2">
                   <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                   <span className="hidden sm:inline">Download Resume</span>
                   <span className="sm:hidden">Download</span>
                 </Button>
               </DownloadModal>
               <LoginSignupButton />
             </div>
           </div>
         </div>
       </nav>

             <div className="w-[98vw] mx-auto px-2 sm:px-3 lg:px-4 py-8">
         <div className="mb-8">
           <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Resume Builder</h1>
           <p className="text-slate-600 dark:text-slate-300 mt-2">Create your professional resume with live preview</p>
         </div>

        {/* Stacked layout: Form on top, Preview full width below */}
        <div className="flex flex-col lg:flex-row gap-2 overflow-x-hidden">
                     {/* Form Panel */}
           <div className="w-full lg:w-1/2 overflow-x-hidden mb-4 lg:mb-0">
             <Card className="shadow-xl border-0 bg-background/80 backdrop-blur-sm dark:bg-slate-800/90 dark:border-slate-700">
               <CardContent className="p-4">
                 <div className="mb-6">
                   <label htmlFor="title" className="block text-sm font-medium text-foreground dark:text-white mb-2">
                     Resume Title
                   </label>
                   <input
                     id="title"
                     type="text"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     className="w-full px-4 py-2 border border-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-background dark:bg-slate-700 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                     placeholder="My Resume"
                   />
                 </div>

                                 {/* Industry/Field Selection */}
                 <div className="mb-6">
                   <Label htmlFor="field" className="block text-sm font-medium text-foreground dark:text-white mb-2">
                     <Briefcase className="inline h-4 w-4 mr-1" />
                     Professional Field
                   </Label>
                   <Select
                     value={resumeData.field ? resumeData.field : undefined}
                     onValueChange={(value) => setResumeData(prev => ({ ...prev, field: value }))}
                   >
                     <SelectTrigger className="w-full text-foreground dark:text-white bg-background dark:bg-slate-700 border-border dark:border-slate-600">
                       <SelectValue placeholder="Select your professional field for targeted content" />
                     </SelectTrigger>
                     <SelectContent className="bg-background dark:bg-slate-800 border-border dark:border-slate-600">
                       {INDUSTRY_OPTIONS.map((option) => (
                         <SelectItem key={option.value} value={option.value} className="text-foreground dark:text-white dark:hover:bg-slate-700">
                           <span className="flex items-center">
                             <span className="mr-2">{option.icon}</span>
                             {option.label}
                           </span>
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
                     This helps generate relevant content and skills for your industry
                   </p>
                 </div>

                                 {/* Upload Section */}
                 <div className="mb-6">
                   <div className="flex items-center justify-between mb-3">
                     <h3 className="text-lg font-medium text-foreground dark:text-white">Quick Start</h3>
                     {!showUpload && (
                       <Button
                         onClick={() => setShowUpload(true)}
                         variant="outline"
                         size="sm"
                         className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-slate-700"
                       >
                         <Upload className="mr-2 h-4 w-4" />
                         Upload Resume
                       </Button>
                     )}
                   </div>
                  
                  {showUpload && (
                    <div className="mb-4">
                      <ResumeUpload
                        onParseComplete={handleParseComplete}
                        onError={handleParseError}
                      />
                    </div>
                  )}
                </div>
                
                {/* Photo Upload Section - Only show for templates with photo support */}
                {templateSupportsPhoto(resumeData.template) && (
                  <div className="mb-6">
                    <PhotoUpload />
                  </div>
                )}
                
                
                <ResumeForm 
                  resumeData={resumeData}
                  onChange={setResumeData}
                />
              </CardContent>
            </Card>
          </div>

                                {/* Live Preview Panel - Full Width */}
           <div className="w-full lg:w-3/5 overflow-x-hidden">
             <Card className="shadow-xl border-0 bg-background/80 backdrop-blur-sm dark:bg-slate-800/90 dark:border-slate-700 h-fit flex flex-col items-center">
               <CardContent className="p-4 md:p-6 w-full">
                 <div className="mb-4 flex items-center justify-between w-full max-w-3xl mx-auto">
                   <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-foreground dark:text-white">Live Preview</h2>
                   <div className="flex items-center space-x-2">
                     <span className="text-xs sm:text-sm text-muted-foreground dark:text-slate-400">Template:</span>
                     <Select
                       value={resumeData.template}
                       onValueChange={(value) => {
                         try {
                           console.log('Template selection changed to:', value);
                           setResumeData(prev => ({ ...prev, template: value }));
                         } catch (error) {
                           console.error('Error changing template:', error);
                           toast({
                             title: "Template Error",
                             description: "Failed to change template. Please try again.",
                             variant: "destructive",
                           });
                         }
                       }}
                     >
                       <SelectTrigger className="w-32 sm:w-48 md:w-56 max-w-full text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background/50 text-foreground hover:border-border transition-all duration-200">
                         <SelectValue placeholder="Choose a template" />
                       </SelectTrigger>
                       <SelectContent className="w-32 sm:w-48 md:w-56 max-w-full rounded-xl shadow-xl bg-background ring-1 ring-border/50 focus:outline-none overflow-auto max-h-[40vh] sm:max-h-[50vh] text-xs sm:text-sm">
                         <div className="px-2 sm:px-3 py-1 sm:py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                           Custom Templates
                         </div>
                         {allTemplates.filter(t => !t.isReactiveResume).map((template) => (
                           <SelectItem key={template.id} value={template.id} className="w-full truncate px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm">
                             <span className="flex items-center truncate">
                               <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0" style={{
                                 backgroundColor: template.color?.includes('slate') ? '#64748b' : 
                                                template.color?.includes('blue') ? '#3b82f6' :
                                                template.color?.includes('pink') ? '#ec4899' :
                                                template.color?.includes('emerald') ? '#10b981' :
                                                template.color?.includes('yellow') ? '#f59e0b' :
                                                '#8b5cf6'
                               }}></span>
                               <span className="truncate">{template.name}</span>
                             </span>
                           </SelectItem>
                         ))}

                         {allTemplates.filter(t => t.isReactiveResume).map((template) => (
                           <SelectItem key={template.id} value={template.id} className="w-full truncate px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm">
                             <span className="flex items-center truncate">
                               <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0" style={{
                                 backgroundColor: template.color?.includes('blue') ? '#3b82f6' :
                                                template.color?.includes('gray') ? '#6b7280' :
                                                template.color?.includes('green') ? '#10b981' :
                                                template.color?.includes('purple') ? '#8b5cf6' :
                                                template.color?.includes('indigo') ? '#6366f1' :
                                                template.color?.includes('cyan') ? '#06b6d4' :
                                                template.color?.includes('yellow') ? '#f59e0b' :
                                                template.color?.includes('emerald') ? '#10b981' :
                                                template.color?.includes('stone') ? '#78716c' :
                                                template.color?.includes('slate') ? '#64748b' :
                                                template.color?.includes('amber') ? '#f59e0b' :
                                                '#fb7185'
                               }}></span>
                               <span className="truncate">⭐ {template.name}</span>
                             </span>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
                 <div className="w-full flex justify-center">
                   <div className="rounded-2xl border border-border/30 bg-muted/30 backdrop-blur-sm p-4 md:px-2 md:py-8 shadow-lg w-full max-w-none overflow-auto">
                     <ErrorBoundary fallback={<div className="text-red-500 p-4">Preview error - Template may have issues</div>}>
                       <ResumePreview resumeData={resumeData} />
                     </ErrorBoundary>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

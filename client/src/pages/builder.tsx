import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Save, Upload, Briefcase, Menu, X } from "lucide-react";
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
import Split from "react-split"

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
  const [templateParam, setTemplateParam]  = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);






useEffect(()=>{
  const fullUrl = window.location.href;
console.log("Full URL:", fullUrl);

// Get query params
const params = new URLSearchParams(window.location.search);
const templateParamdev = params.get("template");
  setTemplateParam(templateParamdev || "")
console.log("templateParam:", templateParam);
},[window.location.href])
  
  // Debug logging
  
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    // If URL has template parameter, it takes precedence
    console.log(templateParam, "template")
    if (templateParam) {
      console.log('Template parameter found, using:', templateParam);
      const saved = localStorage.getItem('resume_builder_data');
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          return { ...parsedData, template: templateParam };
        } catch {
          console.log('Error parsing saved data, using initial data with template param');
          return { ...initialResumeData, template: templateParam };
        }
      }
      console.log('No saved data, using initial data with template param');
      return { ...initialResumeData, template: templateParam };
    }
    
    // Load from localStorage if available (no template parameter)
    const saved = localStorage.getItem('resume_builder_data');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        console.log('Using existing template from localStorage:', parsedData.template || 'azurill');
        return { ...parsedData, template: parsedData.template || 'azurill' };
      } catch {
        console.log('Error parsing saved data, using default template');
        return { ...initialResumeData, template: 'azurill' };
      }
    }
    console.log('No saved data, using default template');
    return { ...initialResumeData, template: 'azurill' };
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
    console.log('Template effect triggered:', { templateParam });
    if (templateParam ) {
      const selectedTemplate = getTemplateById(templateParam);
      console.log('Selected template:', selectedTemplate);
      if (selectedTemplate) {
        // Show notification about template selection
        toast({
          title: "Template Selected",
          description: `${selectedTemplate.name} template loaded successfully! You can now start building your resume.`,
        });
        
        // Update the resume data to ensure template is set
        setResumeData(prev => ({ ...prev, template: templateParam }));
        
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
      } else {
        console.warn('Template not found:', templateParam);
        toast({
          title: "Template Not Found",
          description: `Template "${templateParam}" not found. Using default template.`,
          variant: "destructive",
        });
      }
    }
  }, [templateParam, toast, setResumeData]);

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
      // Merge projects array properly
      projects: parsedData.projects?.length ? parsedData.projects : prev.projects,
      // Merge other arrays properly
      awards: parsedData.awards?.length ? parsedData.awards : prev.awards,
      certifications: parsedData.certifications?.length ? parsedData.certifications : prev.certifications,
      languages: parsedData.languages?.length ? parsedData.languages : prev.languages,
      volunteerWork: parsedData.volunteerWork?.length ? parsedData.volunteerWork : prev.volunteerWork,
      internships: parsedData.internships?.length ? parsedData.internships : prev.internships,
      freelanceWork: parsedData.freelanceWork?.length ? parsedData.freelanceWork : prev.freelanceWork,
      courses: parsedData.courses?.length ? parsedData.courses : prev.courses,
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
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#4B5563]">Loading resume...</p>
        </div>
      </div>
    );
  }

     return (
     <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-900 pt-14 sm:pt-16 overflow-x-hidden">
       {/* Mobile Menu Overlay */}
       {mobileMenuOpen && (
         <div 
           className="fixed inset-0 bg-black/20 z-40 md:hidden"
           onClick={() => setMobileMenuOpen(false)}
         />
       )}
       {/* Navigation */}
       <nav className="fixed top-0 w-full bg-white dark:bg-slate-800 z-50 border-b border-[#E5E7EB] dark:border-slate-700 shadow-sm">
         <div className="w-full max-w-[98vw] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
           <div className="flex justify-between items-center h-14 sm:h-16">
             {/* Left Section - Back Button */}
             <div className="flex items-center">
               <Link href="/" className="flex items-center text-[#2563EB] hover:text-[#1D4ED8] dark:text-blue-400 dark:hover:text-blue-300 text-sm sm:text-base transition-colors duration-200">
                 <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                 <span className="font-medium hidden sm:inline">Back to Home</span>
                 <span className="font-medium sm:hidden">Back</span>
               </Link>
             </div>
             
             {/* Center Section - Page Title (hidden on mobile) */}
             
             
             {/* Right Section - Action Buttons */}
             <div className="flex items-center gap-1 sm:gap-2">
               {/* Desktop Menu - Visible on md and above */}
               <div className="hidden md:flex items-center gap-2">
                 {/* Save Button */}
                 <Button
                   onClick={handleSave}
                   disabled={saveMutation.isPending}
                   variant="outline"
                   size="sm"
                   className="font-medium text-sm px-3 py-2 border-[#2563EB] text-[#2563EB] hover:bg-[#F3F4F6] dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-transparent transition-all duration-200"
                 >
                   <Save className="mr-2 h-4 w-4 flex-shrink-0" />
                   {saveMutation.isPending ? "Saving..." : "Save"}
                 </Button>
                 
                 {/* Download Button */}
                 <DownloadModal resumeData={resumeData}>
                   <Button 
                     size="sm"
                     className="bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-blue-600 dark:hover:bg-blue-700 font-medium text-sm px-3 py-2 text-white transition-all duration-200"
                   >
                     <Download className="mr-2 h-4 w-4 flex-shrink-0" />
                     Download Resume
                   </Button>
                 </DownloadModal>
                 
                 {/* Login Button */}
                 <LoginSignupButton />
               </div>
               
               {/* Mobile Menu Button */}
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                 className="md:hidden p-2 text-[#111827] dark:text-white hover:bg-[#F3F4F6] dark:hover:bg-slate-700"
               >
                 {mobileMenuOpen ? (
                   <X className="h-5 w-5" />
                 ) : (
                   <Menu className="h-5 w-5" />
                 )}
               </Button>
             </div>
           </div>
           
           {/* Mobile Menu Dropdown */}
           {mobileMenuOpen && (
             <div className="md:hidden border-t border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 py-4 px-2">
               <div className="space-y-3">
                 {/* Mobile Save Button */}
                 <Button
                   onClick={handleSave}
                   disabled={saveMutation.isPending}
                   variant="outline"
                   className="w-full justify-start font-medium text-sm py-3 border-[#2563EB] text-[#2563EB] hover:bg-[#F3F4F6] dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-transparent transition-all duration-200"
                 >
                   <Save className="mr-3 h-4 w-4 flex-shrink-0" />
                   {saveMutation.isPending ? "Saving..." : "Save Resume"}
                 </Button>
                 
                 {/* Mobile Download Button */}
                 <DownloadModal resumeData={resumeData}>
                   <Button 
                     className="w-full justify-start bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-blue-600 dark:hover:bg-blue-700 font-medium text-sm py-3 text-white transition-all duration-200"
                   >
                     <Download className="mr-3 h-4 w-4 flex-shrink-0" />
                     Download Resume
                   </Button>
                 </DownloadModal>
                 
                 {/* Mobile Login Button */}
                 <div className="pt-2">
                   <LoginSignupButton />
                 </div>
               </div>
             </div>
           )}
         </div>
       </nav>

             <div className="w-full max-w-[98vw] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
         <div className="mb-6 sm:mb-8">
           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] dark:text-white md:hidden">Resume Builder</h1>
           <p className="text-sm sm:text-base text-[#4B5563] dark:text-slate-300 mt-2 md:hidden">Create your professional resume with live preview</p>
         </div>

        {/* Responsive layout: Stacked on mobile, side-by-side on larger screens */}
        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 overflow-x-hidden" >
                     {/* Form Panel */}

                     {/* Split component only on xl screens and above */}
                     <div className="hidden xl:block w-full">
                       <Split
                         className="flex flex-row h-full"
                         sizes={[40, 60]} // initial percentage widths
                         minSize={300} // minimum px width for each panel
                         gutterSize={8} // width of the handle
                         gutterStyle={() => ({
                           backgroundColor: "rgb(71 85 105)", // slate-600 for dark mode compatibility
                           cursor: "col-resize",
                           width: "8px",
                         })}
                       >
           {/* Form Panel - For Split component (xl screens and above) */}
           <div className="w-full overflow-x-hidden" style={{border:"1px solid rgb(71 85 105)"}} >
             <Card className="shadow-xl border-0 bg-white dark:bg-slate-800/90 dark:border-slate-700">
               <CardContent className="p-3 sm:p-4 lg:p-6">
                 <div className="mb-4 sm:mb-6">
                   <label htmlFor="title" className="block text-sm font-medium text-[#111827] dark:text-white mb-2">
                     Resume Title
                   </label>
                   <input
                     id="title"
                     type="text"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     className="w-full px-3 sm:px-4 py-2 border border-[#E5E7EB] dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-slate-700 text-[#111827] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-slate-400"
                     placeholder="My Resume"
                   />
                 </div>

                                 {/* Industry/Field Selection */}
                 <div className="mb-4 sm:mb-6">
                   <Label htmlFor="field" className="block text-sm font-medium text-[#111827] dark:text-white mb-2">
                     <Briefcase className="inline h-4 w-4 mr-1" />
                     Professional Field
                   </Label>
                   <Select
                     value={resumeData.field ? resumeData.field : undefined}
                     onValueChange={(value) => setResumeData(prev => ({ ...prev, field: value }))}
                   >
                     <SelectTrigger className="w-full text-[#111827] dark:text-white bg-white dark:bg-slate-700 border-[#E5E7EB] dark:border-slate-600">
                       <SelectValue placeholder="Select your professional field for targeted content" />
                     </SelectTrigger>
                     <SelectContent className="bg-white dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-600">
                       {INDUSTRY_OPTIONS.map((option) => (
                         <SelectItem key={option.value} value={option.value} className="text-[#111827] dark:text-white dark:hover:bg-slate-700">
                           <span className="flex items-center">
                             <span className="mr-2">{option.icon}</span>
                             {option.label}
                           </span>
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <p className="text-xs text-[#9CA3AF] dark:text-slate-400 mt-1">
                     This helps generate relevant content and skills for your industry
                   </p>
                 </div>

                                 {/* Upload Section */}
                 <div className="mb-4 sm:mb-6">
                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                     <h3 className="text-base sm:text-lg font-medium text-[#111827] dark:text-white">Quick Start</h3>
                     {!showUpload && (
                       <Button
                         onClick={() => setShowUpload(true)}
                         variant="outline"
                         size="sm"
                         className="text-[#2563EB] border-[#2563EB] hover:bg-[#F3F4F6] dark:text-blue-400 dark:border-blue-400 dark:hover:bg-slate-700 dark:bg-transparent w-full sm:w-auto"
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
                  <div className="mb-4 sm:mb-6">
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

                                {/* Live Preview Panel - For Split component (xl screens and above) */}
           <div className="w-full overflow-x-hidden" style={{border: "1px solid rgb(71 85 105)"}}>
             <Card className="shadow-xl border-0 bg-white dark:bg-slate-800/90 dark:border-slate-700 h-fit flex flex-col items-center">
               <CardContent className="p-3 sm:p-4 md:p-6 w-full">
                 <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 w-full max-w-3xl mx-auto">
                   <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[#111827] dark:text-white">Live Preview</h2>
                   <div className="flex items-center space-x-2">
                     <span className="text-xs sm:text-sm text-[#9CA3AF] dark:text-slate-400">Template:</span>
                    
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
                       <SelectTrigger className="w-32 sm:w-48 md:w-56 max-w-full text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 rounded-xl border border-[#E5E7EB]/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white/50 dark:bg-slate-700/50 text-[#111827] dark:text-white hover:border-[#E5E7EB] dark:hover:border-slate-600 transition-all duration-200">
                         <SelectValue placeholder="Choose a template" />
                       </SelectTrigger>
                       <SelectContent className="w-32 sm:w-48 md:w-56 max-w-full rounded-xl shadow-xl bg-white dark:bg-slate-800 ring-1 ring-[#E5E7EB]/50 dark:ring-slate-600/50 focus:outline-none overflow-auto max-h-[40vh] sm:max-h-[50vh] text-xs sm:text-sm">
                         <div className="px-2 sm:px-3 py-1 sm:py-2 text-xs font-medium text-[#9CA3AF] dark:text-slate-400 uppercase tracking-wide">
                           Custom Templates
                         </div>
                         {allTemplates.filter(t => !t.isReactiveResume).map((template) => (
                           <SelectItem key={template.id} value={template.id} className="w-full truncate px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-[#111827] dark:text-white dark:hover:bg-slate-700">
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
                           <SelectItem key={template.id} value={template.id} className="w-full truncate px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-[#111827] dark:text-white dark:hover:bg-slate-700">
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
                   <div className="rounded-none border-0 bg-transparent p-0 shadow-none w-full max-w-none overflow-auto">
                     <ErrorBoundary fallback={<div className="text-[#EF4444] dark:text-red-400">Preview error - Template may have issues</div>}>
                       <ResumePreview resumeData={resumeData} />
                     </ErrorBoundary>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
                       </Split>
                     </div>

                     {/* Mobile/Tablet Layout (below xl screens) */}
                     <div className="xl:hidden w-full space-y-4 lg:space-y-6">
                       {/* Form Panel for Mobile/Tablet */}
                       <div className="w-full">
                         <Card className="shadow-xl border-0 bg-white dark:bg-slate-800/90 dark:border-slate-700">
                           <CardContent className="p-3 sm:p-4 lg:p-6">
                             <div className="mb-4 sm:mb-6">
                               <label htmlFor="title-mobile" className="block text-sm font-medium text-[#111827] dark:text-white mb-2">
                                 Resume Title
                               </label>
                               <input
                                 id="title-mobile"
                                 type="text"
                                 value={title}
                                 onChange={(e) => setTitle(e.target.value)}
                                 className="w-full px-3 sm:px-4 py-2 border border-[#E5E7EB] dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-slate-700 text-[#111827] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-slate-400"
                                 placeholder="My Resume"
                               />
                             </div>

                             {/* Industry/Field Selection */}
                             <div className="mb-4 sm:mb-6">
                               <Label htmlFor="field-mobile" className="block text-sm font-medium text-[#111827] dark:text-white mb-2">
                                 <Briefcase className="inline h-4 w-4 mr-1" />
                                 Professional Field
                               </Label>
                               <Select
                                 value={resumeData.field ? resumeData.field : undefined}
                                 onValueChange={(value) => setResumeData(prev => ({ ...prev, field: value }))}
                               >
                                 <SelectTrigger className="w-full text-[#111827] dark:text-white bg-white dark:bg-slate-700 border-[#E5E7EB] dark:border-slate-600">
                                   <SelectValue placeholder="Select your professional field for targeted content" />
                                 </SelectTrigger>
                                 <SelectContent className="bg-white dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-600">
                                   {INDUSTRY_OPTIONS.map((option) => (
                                     <SelectItem key={option.value} value={option.value} className="text-[#111827] dark:text-white dark:hover:bg-slate-700">
                                       <span className="flex items-center">
                                         <span className="mr-2">{option.icon}</span>
                                         {option.label}
                                       </span>
                                     </SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                               <p className="text-xs text-[#9CA3AF] dark:text-slate-400 mt-1">
                                 This helps generate relevant content and skills for your industry
                               </p>
                             </div>

                             {/* Upload Section */}
                             <div className="mb-4 sm:mb-6">
                               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                                 <h3 className="text-base sm:text-lg font-medium text-[#111827] dark:text-white">Quick Start</h3>
                                 {!showUpload && (
                                   <Button
                                     onClick={() => setShowUpload(true)}
                                     variant="outline"
                                     size="sm"
                                     className="text-[#2563EB] border-[#2563EB] hover:bg-[#F3F4F6] dark:text-blue-400 dark:border-blue-400 dark:hover:bg-slate-700 dark:bg-transparent w-full sm:w-auto"
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
                              <div className="mb-4 sm:mb-6">
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

                       {/* Preview Panel for Mobile/Tablet */}
                       <div className="w-full">
                         <Card className="shadow-xl border-0 bg-white dark:bg-slate-800/90 dark:border-slate-700 h-fit flex flex-col items-center">
                           <CardContent className="p-3 sm:p-4 md:p-6 w-full">
                             <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 w-full max-w-3xl mx-auto">
                               <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[#111827] dark:text-white">Live Preview</h2>
                               <div className="flex items-center space-x-2">
                                 <span className="text-xs sm:text-sm text-[#9CA3AF] dark:text-slate-400">Template:</span>
                                
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
                                   <SelectTrigger className="w-32 sm:w-48 md:w-56 max-w-full text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 rounded-xl border border-[#E5E7EB]/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white/50 dark:bg-slate-700/50 text-[#111827] dark:text-white hover:border-[#E5E7EB] dark:hover:border-slate-600 transition-all duration-200">
                                     <SelectValue placeholder="Choose a template" />
                                   </SelectTrigger>
                                   <SelectContent className="w-32 sm:w-48 md:w-56 max-w-full rounded-xl shadow-xl bg-white dark:bg-slate-800 ring-1 ring-[#E5E7EB]/50 dark:ring-slate-600/50 focus:outline-none overflow-auto max-h-[40vh] sm:max-h-[50vh] text-xs sm:text-sm">
                                     <div className="px-2 sm:px-3 py-1 sm:py-2 text-xs font-medium text-[#9CA3AF] dark:text-slate-400 uppercase tracking-wide">
                                       Custom Templates
                                     </div>
                                     {allTemplates.filter(t => !t.isReactiveResume).map((template) => (
                                       <SelectItem key={template.id} value={template.id} className="w-full truncate px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-[#111827] dark:text-white dark:hover:bg-slate-700">
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
                                       <SelectItem key={template.id} value={template.id} className="w-full truncate px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-[#111827] dark:text-white dark:hover:bg-slate-700">
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
                               <div className="rounded-none border-0 bg-transparent p-0 shadow-none w-full max-w-none overflow-auto">
                                 <ErrorBoundary fallback={<div className="text-[#EF4444] dark:text-red-400">Preview error - Template may have issues</div>}>
                                   <ResumePreview resumeData={resumeData} />
                                 </ErrorBoundary>
                               </div>
                             </div>
                           </CardContent>
                         </Card>
                       </div>
                     </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

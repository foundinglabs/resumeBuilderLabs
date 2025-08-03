// Template Integration Utility
// Bridges ResumeGenius custom templates with Reactive-Resume templates
import { TemplateConfigManager } from '../../../shared/template-config';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  color: string;
  hoverColor: string;
  isReactiveResume?: boolean;
  previewImage?: string;
  jsonPath?: string;
}

// ResumeGenius custom templates
export const customTemplates: TemplateInfo[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional, clean, and ATS-friendly layout.",
    color: "bg-slate-600",
    hoverColor: "hover:bg-slate-700",
    isReactiveResume: false
  },
  {
    id: "modern",
    name: "Modern", 
    description: "Sleek two-column layout with bold headings and color accents.",
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
    isReactiveResume: false
  },
  {
    id: "stylish",
    name: "Stylish",
    description: "Creative design with strong visual hierarchy and sidebar.",
    color: "bg-pink-600",
    hoverColor: "hover:bg-pink-700",
    isReactiveResume: false
  },
  {
    id: "compact",
    name: "Compact",
    description: "Space-efficient, single-column layout for concise resumes.",
    color: "bg-emerald-600",
    hoverColor: "hover:bg-emerald-700",
    isReactiveResume: false
  },
  {
    id: "overleaf",
    name: "Overleaf",
    description: "Inspired by academic CVs, great for research and teaching roles.",
    color: "bg-yellow-500",
    hoverColor: "hover:bg-yellow-600",
    isReactiveResume: false
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Minimalist, refined, and highly readable for any profession.",
    color: "bg-purple-600",
    hoverColor: "hover:bg-purple-700",
    isReactiveResume: false
  }
];

// Reactive-Resume templates with enhanced descriptions
export const reactiveResumeTemplates: TemplateInfo[] = [
  {
    id: "azurill",
    name: "Azurill",
    description: "Professional two-column layout with elegant typography and clean sections.",
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    isReactiveResume: true,
    previewImage: "/templates/jpg/azurill.jpg",
    jsonPath: "/reactive-resume/templates/json/azurill.json"
  },
  {
    id: "bronzor",
    name: "Bronzor",
    description: "Minimalist design with strong visual hierarchy and modern typography.",
    color: "bg-gray-600",
    hoverColor: "hover:bg-gray-700",
    isReactiveResume: true,
    previewImage: "/templates/jpg/bronzor.jpg",
    jsonPath: "/reactive-resume/templates/json/bronzor.json"
  },
  {
    id: "chikorita",
    name: "Chikorita",
    description: "Fresh, vibrant design perfect for creative professionals.",
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    isReactiveResume: true,
    previewImage: "/templates/jpg/chikorita.jpg",
    jsonPath: "/reactive-resume/templates/json/chikorita.json"
  },
  {
    id: "ditto",
    name: "Ditto",
    description: "Versatile layout that adapts to any profession with clean styling.",
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    isReactiveResume: true,
    previewImage: "/templates/jpg/ditto.jpg",
    jsonPath: "/reactive-resume/templates/json/ditto.json"
  },
  {
    id: "gengar",
    name: "Gengar",
    description: "Bold, modern design with striking visual elements.",
    color: "bg-indigo-600",
    hoverColor: "hover:bg-indigo-700",
    isReactiveResume: true,
    previewImage: "/templates/jpg/gengar.jpg",
    jsonPath: "/reactive-resume/templates/json/gengar.json"
  },
  {
    id: "glalie",
    name: "Glalie",
    description: "Cool, professional template with excellent readability.",
    color: "bg-cyan-500",
    hoverColor: "hover:bg-cyan-600",
    isReactiveResume: true,
    previewImage: "/templates/jpg/glalie.jpg",
    jsonPath: "/reactive-resume/templates/json/glalie.json"
  },
  {
    id: "kakuna",
    name: "Kakuna",
    description: "Structured, organized layout ideal for technical roles.",
    color: "bg-yellow-600",
    hoverColor: "hover:bg-yellow-700",
    isReactiveResume: true,
    previewImage: "/templates/jpg/kakuna.jpg",
    jsonPath: "/reactive-resume/templates/json/kakuna.json"
  },
  {
    id: "leafish",
    name: "Leafish",
    description: "Nature-inspired design with organic flow and clean sections.",
    color: "bg-emerald-500",
    hoverColor: "hover:bg-emerald-600",
    isReactiveResume: true,
    previewImage: "/templates/jpg/leafish.jpg",
    jsonPath: "/reactive-resume/templates/json/leafish.json"
  },
  {
    id: "nosepass",
    name: "Nosepass",
    description: "Directional, focused layout that guides the reader's attention.",
    color: "bg-stone-600",
    hoverColor: "hover:bg-stone-700",
    isReactiveResume: true,
    previewImage: "/templates/jpg/nosepass.jpg",
    jsonPath: "/reactive-resume/templates/json/nosepass.json"
  },
  {
    id: "onyx",
    name: "Onyx",
    description: "Sophisticated, dark-themed template with premium feel.",
    color: "bg-slate-800",
    hoverColor: "hover:bg-slate-900",
    isReactiveResume: true,
    previewImage: "/templates/jpg/onyx.jpg",
    jsonPath: "/reactive-resume/templates/json/onyx.json"
  },
  {
    id: "pikachu",
    name: "Pikachu",
    description: "Energetic, bright design that stands out from the crowd.",
    color: "bg-amber-500",
    hoverColor: "hover:bg-amber-600",
    isReactiveResume: true,
    previewImage: "/templates/jpg/pikachu.jpg",
    jsonPath: "/reactive-resume/templates/json/pikachu.json"
  },
  {
    id: "rhyhorn",
    name: "Rhyhorn",
    description: "Strong, robust layout perfect for executive and senior roles.",
    color: "bg-orange-600",
    hoverColor: "hover:bg-orange-700",
    isReactiveResume: true,
    previewImage: "/templates/jpg/rhyhorn.jpg",
    jsonPath: "/reactive-resume/templates/json/rhyhorn.json"
  }
];

// Combined templates list - filtered by centralized config
export const allTemplates: TemplateInfo[] = [
  ...customTemplates.filter(template => TemplateConfigManager.isTemplateEnabled(template.id)),
  ...reactiveResumeTemplates.filter(template => TemplateConfigManager.isTemplateEnabled(template.id))
];

// Helper functions
export const getTemplateById = (id: string): TemplateInfo | undefined => {
  const template = [...customTemplates, ...reactiveResumeTemplates].find(template => template.id === id);
  // Only return if template is enabled in centralized config
  return template && TemplateConfigManager.isTemplateEnabled(id) ? template : undefined;
};

export const getCustomTemplates = (): TemplateInfo[] => {
  // Filter templates based on centralized config
  return customTemplates.filter(template => 
    TemplateConfigManager.isTemplateEnabled(template.id)
  );
};

export const getReactiveResumeTemplates = (): TemplateInfo[] => {
  // Filter templates based on centralized config
  return reactiveResumeTemplates.filter(template => 
    TemplateConfigManager.isTemplateEnabled(template.id)
  );
};

export const getTemplatePreviewUrl = (template: TemplateInfo): string => {
  if (template.isReactiveResume && template.previewImage) {
    return template.previewImage;
  }
  // For custom templates, return a placeholder or generate preview
  return `/templates/previews/${template.id}.jpg`;
};

export const getTemplateJsonData = async (template: TemplateInfo): Promise<any> => {
  if (template.isReactiveResume && template.jsonPath) {
    try {
      const response = await fetch(template.jsonPath);
      return await response.json();
    } catch (error) {
      console.error(`Failed to load template data for ${template.id}:`, error);
      return null;
    }
  }
  return null;
};
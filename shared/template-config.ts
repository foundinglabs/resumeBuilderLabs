// Centralized Template Configuration
// Simply edit the 'enabled' field below to show/hide templates in the UI

export interface TemplateConfig {
  id: string;
  name: string;
  enabled: boolean;
  category: 'reactive-resume' | 'custom';
  description?: string;
}

// Central configuration for all templates
export const TEMPLATE_CONFIG: TemplateConfig[] = [
  // Reactive-Resume Templates
  {
    id: "azurill",
    name: "Azurill",
    enabled: true,
    category: 'reactive-resume',
    description: "Professional two-column layout with elegant typography"
  },
  {
    id: "bronzor",
    name: "Bronzor",
    enabled: false,
    category: 'reactive-resume',
    description: "Minimalist design with strong visual hierarchy"
  },
  {
    id: "chikorita",
    name: "Chikorita",
    enabled: false,
    category: 'reactive-resume',
    description: "Fresh, vibrant design perfect for creative professionals"
  },
  {
    id: "ditto",
    name: "Ditto",
    enabled: true,
    category: 'reactive-resume',
    description: "Versatile layout that adapts to any profession"
  },
  {
    id: "gengar",
    name: "Gengar",
    enabled: false, // Example: Disabled template
    category: 'reactive-resume',
    description: "Bold, modern design with striking visual elements"
  },
  {
    id: "glalie",
    name: "Glalie",
    enabled: true,
    category: 'reactive-resume',
    description: "Sophisticated layout with refined typography"
  },
  {
    id: "kakuna",
    name: "Kakuna",
    enabled: true,
    category: 'reactive-resume',
    description: "Tech-focused with modular project layout"
  },
  {
    id: "leafish",
    name: "Leafish",
    enabled: false,
    category: 'reactive-resume',
    description: "Modern and clean with excellent readability"
  },
  {
    id: "nosepass",
    name: "Nosepass",
    enabled: false, // Example: Disabled template
    category: 'reactive-resume',
    description: "Unique design with strong visual impact"
  },
  {
    id: "onyx",
    name: "Onyx",
    enabled: true,
    category: 'reactive-resume',
    description: "Formal & Executive minimalist design"
  },
  {
    id: "pikachu",
    name: "Pikachu",
    enabled: true,
    category: 'reactive-resume',
    description: "Creative and visually appealing design"
  },
  {
    id: "rhyhorn",
    name: "Rhyhorn",
    enabled: false,
    category: 'reactive-resume',
    description: "Bold and structured professional layout"
  },
  // Custom Templates
  {
    id: "classic",
    name: "Classic",
    enabled: true,
    category: 'custom',
    description: "Traditional, clean, and ATS-friendly layout"
  },
  {
    id: "modern",
    name: "Modern",
    enabled: false,
    category: 'custom',
    description: "Sleek two-column layout with bold headings"
  },
  {
    id: "stylish",
    name: "Stylish",
    enabled: true,
    category: 'custom',
    description: "Creative design with strong visual hierarchy"
  },
  {
    id: "compact",
    name: "Compact",
    enabled: true,
    category: 'custom',
    description: "Space-efficient, single-column layout"
  },
  {
    id: "overleaf",
    name: "Overleaf",
    enabled: true,
    category: 'custom',
    description: "Academic CV style for research roles"
  },
  {
    id: "elegant",
    name: "Elegant",
    enabled: false,
    category: 'custom',
    description: "Minimalist, refined, and highly readable"
  }
];

// Helper functions for template management
export class TemplateConfigManager {
  static getEnabledTemplates(): TemplateConfig[] {
    return TEMPLATE_CONFIG.filter(template => template.enabled);
  }

  static isTemplateEnabled(templateId: string): boolean {
    const config = TEMPLATE_CONFIG.find(template => template.id === templateId);
    return config?.enabled ?? false;
  }

  static getEnabledTemplateIds(): string[] {
    return TEMPLATE_CONFIG.filter(template => template.enabled).map(template => template.id);
  }
} 
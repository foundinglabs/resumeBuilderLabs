// Enhanced Template Service for Dynamic Reactive-Resume Integration
import { TemplateInfo, getReactiveResumeTemplates, getTemplateJsonData } from '@/utils/template-integration';
import { mapResumeGeniusToReactiveResume } from '@/utils/reactive-resume-mapper';
import { getTemplate } from '@/templates';
import type { Template } from "../utils/reactive-resume-utils";

export class TemplateService {
  private static instance: TemplateService;
  private templateCache: Map<string, any> = new Map();
  private componentCache: Map<string, React.ComponentType<any>> = new Map();

  static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  async loadReactiveResumeTemplate(templateId: string): Promise<any> {
    // Check cache first
    if (this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId);
    }

    // Find template info
    const templates = getReactiveResumeTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    try {
      // Load template data
      const templateData = await getTemplateJsonData(template);
      
      if (templateData) {
        // Cache the data
        this.templateCache.set(templateId, templateData);
        return templateData;
      } else {
        throw new Error(`Failed to load template data for ${templateId}`);
      }
    } catch (error) {
      console.error(`Error loading template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Load Reactive-Resume template component dynamically
   */
  async loadReactiveResumeComponent(templateId: string): Promise<React.ComponentType<any>> {
    // Check cache first
    if (this.componentCache.has(templateId)) {
      const cached = this.componentCache.get(templateId);
      if (cached) {
        return cached;
      }
    }

    try {
      // Get the template component from Reactive-Resume
      const TemplateComponent = getTemplate(templateId as Template);
      
      if (!TemplateComponent) {
        throw new Error(`Template component ${templateId} not found`);
      }

      // Cache the component
      this.componentCache.set(templateId, TemplateComponent);
      return TemplateComponent;
    } catch (error) {
      console.error(`Error loading template component ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Convert ResumeGenius data to Reactive-Resume format
   */
  convertToReactiveResumeFormat(resumeData: any, templateId: string): any {
    return mapResumeGeniusToReactiveResume(resumeData, templateId);
  }

  /**
   * Render Reactive-Resume template with ResumeGenius data
   */
  async renderReactiveResumeTemplate(resumeData: any, templateId: string): Promise<{
    component: React.ComponentType<any>;
    data: any;
  }> {
    try {
      // Load the template component
      const component = await this.loadReactiveResumeComponent(templateId);
      
      // Convert data to Reactive-Resume format
      const data = this.convertToReactiveResumeFormat(resumeData, templateId);
      
      return { component, data };
    } catch (error) {
      console.error(`Error rendering Reactive-Resume template ${templateId}:`, error);
      throw error;
    }
  }

  async getTemplatePreview(templateId: string): Promise<string | null> {
    const templates = getReactiveResumeTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      return null;
    }

    // Return preview image path
    return template.previewImage || null;
  }

  isReactiveResumeTemplate(templateId: string): boolean {
    try {
      if (!templateId || typeof templateId !== 'string') {
        return false;
      }
      
      const templates = getReactiveResumeTemplates();
      return templates.some(t => t.id === templateId);
    } catch (error) {
      console.warn('Error checking if template is Reactive-Resume:', error);
      return false;
    }
  }

  getAllTemplateIds(): string[] {
    const templates = getReactiveResumeTemplates();
    return templates.map(t => t.id);
  }

  getTemplateInfo(templateId: string): TemplateInfo | null {
    const templates = getReactiveResumeTemplates();
    return templates.find(t => t.id === templateId) || null;
  }

  /**
   * Clear template caches
   */
  clearCache(): void {
    this.templateCache.clear();
    this.componentCache.clear();
  }

  /**
   * Preload commonly used templates
   */
  async preloadTemplates(templateIds: string[]): Promise<void> {
    const loadPromises = templateIds.map(async (templateId) => {
      try {
        await this.loadReactiveResumeComponent(templateId);
      } catch (error) {
        console.warn(`Failed to preload template ${templateId}:`, error);
      }
    });

    await Promise.all(loadPromises);
  }
}

export const templateService = TemplateService.getInstance();
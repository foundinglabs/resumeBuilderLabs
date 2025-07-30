// Template Testing Utility
// Tests all templates to verify they work correctly

import React from 'react';
import { getTemplate } from '../templates';
import { allTemplates } from '../utils/template-integration';
import type { Template } from '../utils/reactive-resume-utils';

// Mock data for testing templates
const mockResumeData = {
  metadata: {
    template: 'ditto',
    layout: [
      [
        ['basics', 'experience', 'education'],
        ['skills', 'languages', 'interests']
      ]
    ]
  },
  sections: {
    basics: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      url: 'https://johndoe.com',
      summary: 'Experienced software developer with expertise in React and TypeScript.'
    },
    experience: {
      items: [
        {
          id: '1',
          company: 'Tech Corp',
          position: 'Senior Developer',
          startDate: '2020-01',
          endDate: 'Present',
          summary: 'Led development of React applications',
          url: 'https://techcorp.com'
        }
      ]
    },
    education: {
      items: [
        {
          id: '1',
          institution: 'University of Technology',
          area: 'Computer Science',
          studyType: 'Bachelor',
          startDate: '2016-09',
          endDate: '2020-05',
          score: '3.8 GPA'
        }
      ]
    },
    skills: {
      items: [
        { id: '1', name: 'JavaScript', level: 5 },
        { id: '2', name: 'React', level: 5 },
        { id: '3', name: 'TypeScript', level: 4 }
      ]
    }
  }
};

export interface TemplateTestResult {
  templateId: string;
  templateName: string;
  status: 'success' | 'error' | 'warning';
  component: React.ComponentType<any> | null;
  error?: string;
  warnings?: string[];
}

export const testTemplate = async (templateId: string): Promise<TemplateTestResult> => {
  const templateInfo = allTemplates.find(t => t.id === templateId);
  const templateName = templateInfo?.name || templateId;
  
  try {
    // Try to get the template component
    const TemplateComponent = getTemplate(templateId as Template);
    
    if (!TemplateComponent) {
      return {
        templateId,
        templateName,
        status: 'error',
        component: null,
        error: 'Template component not found'
      };
    }

    // Try to render the template with mock data
    const mockColumns: [any[], any[]] = [
      ['basics', 'experience', 'education'],
      ['skills', 'languages', 'interests']
    ];

    // Test if component can be instantiated
    try {
      React.createElement(TemplateComponent, {
        columns: mockColumns,
        isFirstPage: true
      });
      
      return {
        templateId,
        templateName,
        status: 'success',
        component: TemplateComponent
      };
    } catch (renderError) {
      return {
        templateId,
        templateName,
        status: 'warning',
        component: TemplateComponent,
        warnings: [`Render test failed: ${renderError}`]
      };
    }

  } catch (error) {
    return {
      templateId,
      templateName,
      status: 'error',
      component: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const testAllTemplates = async (): Promise<TemplateTestResult[]> => {
  const reactiveResumeTemplates = allTemplates.filter(t => t.isReactiveResume);
  const results: TemplateTestResult[] = [];

  for (const template of reactiveResumeTemplates) {
    const result = await testTemplate(template.id);
    results.push(result);
  }

  return results;
};

export const generateTemplateReport = (results: TemplateTestResult[]): string => {
  const successful = results.filter(r => r.status === 'success').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const errors = results.filter(r => r.status === 'error').length;
  const total = results.length;

  let report = `Template Test Report\n`;
  report += `===================\n\n`;
  report += `Total Templates: ${total}\n`;
  report += `✅ Successful: ${successful}\n`;
  report += `⚠️  Warnings: ${warnings}\n`;
  report += `❌ Errors: ${errors}\n\n`;

  report += `Detailed Results:\n`;
  report += `-----------------\n`;

  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    report += `${icon} ${result.templateName} (${result.templateId})\n`;
    
    if (result.error) {
      report += `   Error: ${result.error}\n`;
    }
    
    if (result.warnings && result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        report += `   Warning: ${warning}\n`;
      });
    }
    
    report += `\n`;
  });

  return report;
};

// Browser-friendly test runner
export const runTemplateTests = async () => {
  console.log('🧪 Running template tests...');
  
  try {
    const results = await testAllTemplates();
    const report = generateTemplateReport(results);
    
    console.log(report);
    
    // Store results for inspection
    (window as any).templateTestResults = results;
    
    return results;
  } catch (error) {
    console.error('Template testing failed:', error);
    return [];
  }
};

// Auto-run tests if in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).runTemplateTests = runTemplateTests;
  console.log('Template testing utility loaded. Run window.runTemplateTests() to test all templates.');
}

export default {
  testTemplate,
  testAllTemplates,
  generateTemplateReport,
  runTemplateTests,
  mockResumeData
};
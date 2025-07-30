// Template Image Loading Test
// This file tests if template images are accessible and loading correctly

import { getReactiveResumeTemplates } from '@/utils/template-integration';

export const testTemplateImages = async (): Promise<{
  success: boolean;
  results: Array<{ templateId: string; imagePath: string; status: 'success' | 'error'; error?: string }>;
}> => {
  const templates = getReactiveResumeTemplates();
  const results: Array<{ templateId: string; imagePath: string; status: 'success' | 'error'; error?: string }> = [];

  for (const template of templates) {
    if (template.previewImage) {
      try {
        // Test if image can be loaded
        const img = new Image();
        const loadPromise = new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image failed to load'));
        });
        
        img.src = template.previewImage;
        await loadPromise;
        
        results.push({
          templateId: template.id,
          imagePath: template.previewImage,
          status: 'success'
        });
      } catch (error) {
        results.push({
          templateId: template.id,
          imagePath: template.previewImage,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      results.push({
        templateId: template.id,
        imagePath: 'No image path defined',
        status: 'error',
        error: 'No preview image path defined'
      });
    }
  }

  const successCount = results.filter(r => r.status === 'success').length;
  const success = successCount === templates.length;

  return { success, results };
};

// Console test function for debugging
export const runTemplateImageTest = async () => {
  console.log('🧪 Testing template image loading...');
  
  const { success, results } = await testTemplateImages();
  
  console.log(`📊 Test Results: ${success ? '✅ All images loaded successfully' : '❌ Some images failed to load'}`);
  console.log(`📈 Success Rate: ${results.filter(r => r.status === 'success').length}/${results.length}`);
  
  results.forEach(result => {
    if (result.status === 'success') {
      console.log(`✅ ${result.templateId}: ${result.imagePath}`);
    } else {
      console.log(`❌ ${result.templateId}: ${result.error} (${result.imagePath})`);
    }
  });
  
  return { success, results };
};

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).testTemplateImages = runTemplateImageTest;
}
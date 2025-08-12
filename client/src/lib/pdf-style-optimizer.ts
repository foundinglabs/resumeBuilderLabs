// PDF Style Optimizer - Convert Tailwind classes to inline styles for better PDF rendering

export interface TailwindToInlineStylesMap {
  [key: string]: string;
}

// Common Tailwind to inline style mappings for resume templates
export const tailwindToInlineStyles: TailwindToInlineStylesMap = {
  // Layout
  'flex': 'display: flex',
  'flex-col': 'flex-direction: column',
  'flex-row': 'flex-direction: row',
  'grid': 'display: grid',
  'block': 'display: block',
  'inline': 'display: inline',
  'inline-block': 'display: inline-block',
  'hidden': 'display: none',
  
  // Grid
  'grid-cols-1': 'grid-template-columns: repeat(1, minmax(0, 1fr))',
  'grid-cols-2': 'grid-template-columns: repeat(2, minmax(0, 1fr))',
  'grid-cols-3': 'grid-template-columns: repeat(3, minmax(0, 1fr))',
  'col-span-1': 'grid-column: span 1 / span 1',
  'col-span-2': 'grid-column: span 2 / span 2',
  'col-span-3': 'grid-column: span 3 / span 3',
  
  // Spacing - Margin
  'm-0': 'margin: 0',
  'm-1': 'margin: 0.25rem',
  'm-2': 'margin: 0.5rem',
  'm-4': 'margin: 1rem',
  'm-6': 'margin: 1.5rem',
  'm-8': 'margin: 2rem',
  'mx-auto': 'margin-left: auto; margin-right: auto',
  'mb-2': 'margin-bottom: 0.5rem',
  'mb-4': 'margin-bottom: 1rem',
  'mb-6': 'margin-bottom: 1.5rem',
  'mb-8': 'margin-bottom: 2rem',
  'mt-2': 'margin-top: 0.5rem',
  'mt-4': 'margin-top: 1rem',
  'mt-6': 'margin-top: 1.5rem',
  'mt-8': 'margin-top: 2rem',
  
  // Spacing - Padding
  'p-0': 'padding: 0',
  'p-2': 'padding: 0.5rem',
  'p-4': 'padding: 1rem',
  'p-6': 'padding: 1.5rem',
  'p-8': 'padding: 2rem',
  'px-4': 'padding-left: 1rem; padding-right: 1rem',
  'py-2': 'padding-top: 0.5rem; padding-bottom: 0.5rem',
  'py-4': 'padding-top: 1rem; padding-bottom: 1rem',
  
  // Typography
  'text-xs': 'font-size: 0.75rem; line-height: 1rem',
  'text-sm': 'font-size: 0.875rem; line-height: 1.25rem',
  'text-base': 'font-size: 1rem; line-height: 1.5rem',
  'text-lg': 'font-size: 1.125rem; line-height: 1.75rem',
  'text-xl': 'font-size: 1.25rem; line-height: 1.75rem',
  'text-2xl': 'font-size: 1.5rem; line-height: 2rem',
  'text-3xl': 'font-size: 1.875rem; line-height: 2.25rem',
  'font-normal': 'font-weight: 400',
  'font-medium': 'font-weight: 500',
  'font-semibold': 'font-weight: 600',
  'font-bold': 'font-weight: 700',
  'text-left': 'text-align: left',
  'text-center': 'text-align: center',
  'text-right': 'text-align: right',
  
  // Colors
  'text-black': 'color: #000000',
  'text-white': 'color: #ffffff',
  'text-gray-600': 'color: #4b5563',
  'text-gray-700': 'color: #374151',
  'text-gray-800': 'color: #1f2937',
  'text-blue-600': 'color: #2563eb',
  'bg-white': 'background-color: #ffffff',
  'bg-gray-50': 'background-color: #f9fafb',
  'bg-blue-50': 'background-color: #eff6ff',
  
  // Width/Height
  'w-full': 'width: 100%',
  'w-auto': 'width: auto',
  'h-full': 'height: 100%',
  'h-auto': 'height: auto',
  'max-w-full': 'max-width: 100%',
  'min-h-screen': 'min-height: 100vh',
  
  // Borders
  'border': 'border-width: 1px',
  'border-b': 'border-bottom-width: 1px',
  'border-gray-200': 'border-color: #e5e7eb',
  'rounded': 'border-radius: 0.25rem',
  'rounded-lg': 'border-radius: 0.5rem',
  
  // Position & Layout
  'relative': 'position: relative',
  'absolute': 'position: absolute',
  'static': 'position: static',
  'overflow-hidden': 'overflow: hidden',
  'overflow-visible': 'overflow: visible',
  
  // Alignment
  'items-center': 'align-items: center',
  'items-start': 'align-items: flex-start',
  'items-end': 'align-items: flex-end',
  'justify-center': 'justify-content: center',
  'justify-between': 'justify-content: space-between',
  'justify-start': 'justify-content: flex-start',
  
  // Gap
  'gap-2': 'gap: 0.5rem',
  'gap-4': 'gap: 1rem',
  'gap-6': 'gap: 1.5rem',
  'gap-8': 'gap: 2rem',
};

/**
 * Converts Tailwind CSS classes to inline styles for better PDF rendering
 */
export function convertTailwindToInlineStyles(element: HTMLElement): void {
  // Get all elements with classes
  const elementsWithClasses = element.querySelectorAll('[class]');
  
  elementsWithClasses.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const classes = htmlEl.className.split(' ').filter(Boolean);
    const inlineStyles: string[] = [];
    
    classes.forEach((className) => {
      if (tailwindToInlineStyles[className]) {
        inlineStyles.push(tailwindToInlineStyles[className]);
      }
    });
    
    if (inlineStyles.length > 0) {
      const existingStyle = htmlEl.style.cssText;
      const newStyles = inlineStyles.join('; ');
      htmlEl.style.cssText = existingStyle ? `${existingStyle}; ${newStyles}` : newStyles;
    }
  });
}

/**
 * Optimizes an element for PDF generation by converting styles and applying print-safe classes
 */
export function optimizeElementForPDF(element: HTMLElement): void {
  // Convert Tailwind classes to inline styles
  convertTailwindToInlineStyles(element);
  
  // Apply print-safe font stacks
  const textElements = element.querySelectorAll('*');
  textElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);
    
    // Ensure print-safe fonts
    if (!htmlEl.style.fontFamily) {
      htmlEl.style.fontFamily = '"Times New Roman", Times, serif';
    }
    
    // Ensure proper line height
    if (!htmlEl.style.lineHeight) {
      htmlEl.style.lineHeight = '1.4';
    }
    
    // Force color to black for text elements if not specified
    if (htmlEl.tagName.match(/^(P|DIV|SPAN|H[1-6]|LI)$/i) && !htmlEl.style.color) {
      htmlEl.style.color = '#000000';
    }
  });
  
  // Remove problematic CSS properties
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    
    // Remove animations and transitions
    htmlEl.style.animation = 'none';
    htmlEl.style.transition = 'none';
    htmlEl.style.transform = 'none';
    
    // Remove shadows and filters
    htmlEl.style.boxShadow = 'none';
    htmlEl.style.textShadow = 'none';
    htmlEl.style.filter = 'none';
    
    // Ensure visible overflow for content
    if (htmlEl.style.overflow === 'hidden') {
      htmlEl.style.overflow = 'visible';
    }
  });
}

/**
 * Creates a print-optimized clone of an element
 */
export function createPrintOptimizedClone(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Remove interactive elements
  const interactiveElements = clone.querySelectorAll('button, input, textarea, select, [role="button"]');
  interactiveElements.forEach(el => el.remove());
  
  // Remove elements with 'no-print' or similar classes
  const noPrintElements = clone.querySelectorAll('.no-print, .print-hidden, .screen-only');
  noPrintElements.forEach(el => el.remove());
  
  // Optimize for PDF
  optimizeElementForPDF(clone);
  
  return clone;
} 
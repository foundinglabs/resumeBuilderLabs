import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Eye, EyeOff, Menu, X } from 'lucide-react';

interface MobileNavigationProps {
  showPreview: boolean;
  onTogglePreview: () => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  completion: number;
}

export function MobileNavigation({ 
  showPreview, 
  onTogglePreview, 
  currentTab, 
  onTabChange, 
  completion 
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: 'setup', label: 'Setup', icon: '⚙️' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'review', label: 'Review', icon: '👁️' },
  ];

  return (
    <>
      {/* Mobile Preview Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <Button
          onClick={onTogglePreview}
          size="lg"
          className={`rounded-full shadow-lg ${
            showPreview 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
        <div className="grid grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              variant={currentTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 z-30">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Progress:</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900">{completion}%</span>
          </div>
        </div>
      </div>
    </>
  );
}

interface FloatingActionsProps {
  onSave: () => void;
  onDownload: () => void;
  isSaving: boolean;
}

export function FloatingActions({ onSave, onDownload, isSaving }: FloatingActionsProps) {
  return (
    <div className="fixed bottom-20 left-4 z-40 lg:hidden">
      <div className="flex flex-col gap-2">
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="lg"
          variant="outline"
          className="rounded-full shadow-lg bg-white"
        >
          💾
        </Button>
        <Button
          onClick={onDownload}
          size="lg"
          className="rounded-full shadow-lg bg-green-600 hover:bg-green-700"
        >
          📥
        </Button>
      </div>
    </div>
  );
}

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function ProgressSteps({ currentStep, totalSteps, stepLabels }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {stepLabels.map((label, index) => (
        <div key={index} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${index + 1 <= currentStep 
              ? 'bg-blue-600 text-white' 
              : index + 1 === currentStep + 1
                ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                : 'bg-gray-200 text-gray-500'
            }
          `}>
            {index + 1 <= currentStep ? '✓' : index + 1}
          </div>
          {index < stepLabels.length - 1 && (
            <div className={`
              h-1 w-12 mx-2
              ${index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  );
}

interface SmartTipsProps {
  currentSection: string;
}

export function SmartTips({ currentSection }: SmartTipsProps) {
  const tips = {
    personal: [
      "Use a professional email address",
      "Include your city and state, but not full address",
      "Add your LinkedIn profile for better networking"
    ],
    experience: [
      "Start each bullet point with an action verb",
      "Include quantifiable achievements when possible",
      "Focus on results and impact, not just responsibilities"
    ],
    skills: [
      "List skills relevant to the job you're applying for",
      "Include both technical and soft skills",
      "Consider industry-specific skills and certifications"
    ],
    education: [
      "List your highest degree first",
      "Include relevant coursework for recent graduates",
      "Add honors, GPA (if 3.5+), and relevant projects"
    ]
  };

  const currentTips = tips[currentSection as keyof typeof tips] || [];

  if (currentTips.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
        💡 Pro Tips
      </h4>
      <ul className="space-y-1">
        {currentTips.map((tip, index) => (
          <li key={index} className="text-sm text-yellow-700">
            • {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface AutoSaveIndicatorProps {
  lastSaved: Date | null;
  isSaving: boolean;
}

export function AutoSaveIndicator({ lastSaved, isSaving }: AutoSaveIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isSaving || lastSaved) {
      setShowIndicator(true);
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  if (!showIndicator) return null;

  return (
    <div className="fixed top-20 right-4 z-30 lg:top-4 lg:right-4">
      <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-200 flex items-center gap-2">
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-700">Saving...</span>
          </>
        ) : (
          <>
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm text-gray-700">
              Saved {lastSaved ? lastSaved.toLocaleTimeString() : 'just now'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

interface KeyboardShortcutsProps {
  onSave: () => void;
  onDownload: () => void;
  onNextTab: () => void;
  onPrevTab: () => void;
}

export function useKeyboardShortcuts({ 
  onSave, 
  onDownload, 
  onNextTab, 
  onPrevTab 
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
      
      // Ctrl/Cmd + D = Download
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        onDownload();
      }
      
      // Ctrl/Cmd + → = Next tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        onNextTab();
      }
      
      // Ctrl/Cmd + ← = Previous tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevTab();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onDownload, onNextTab, onPrevTab]);
}
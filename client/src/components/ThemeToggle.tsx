import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  const themes = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: Sun,
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: Moon,
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: Monitor,
    },
  ];

  const currentTheme = themes.find(t => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`w-9 h-9 p-0 transition-all duration-200 ${
            isDarkMode 
              ? 'bg-transparent border-white/20 text-[#60A5FA] hover:bg-white/8 hover:border-white/30' 
              : 'bg-transparent border-gray-300 text-[#FACC15] hover:bg-black/5 hover:border-gray-400'
          }`}
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={`w-40 ${
          isDarkMode 
            ? 'bg-[#1E293B] border-white/10' 
            : 'bg-white border-gray-200'
        }`}
      >
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`flex items-center justify-between transition-colors ${
                isDarkMode 
                  ? 'text-[#CBD5E1] hover:bg-[#334155] hover:text-white' 
                  : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{themeOption.label}</span>
              </div>
              {theme === themeOption.value && (
                <Check className={`h-4 w-4 ${isDarkMode ? 'text-white' : 'text-[#0F172A]'}`} />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle; 
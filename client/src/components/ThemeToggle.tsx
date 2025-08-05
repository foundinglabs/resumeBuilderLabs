import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

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
        <Button variant="outline" size="sm" className="w-9 h-9 p-0">
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{themeOption.label}</span>
              </div>
              {theme === themeOption.value && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle; 
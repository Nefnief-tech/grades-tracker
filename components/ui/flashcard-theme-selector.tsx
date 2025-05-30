'use client';

import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type FlashcardTheme = 'default' | 'minimal' | 'colorful' | 'gradient';

interface FlashcardThemeOption {
  id: FlashcardTheme;
  name: string;
  description: string;
  previewClass: string;
}

interface FlashcardThemeSelectorProps {
  onThemeChange?: (theme: FlashcardTheme) => void;
  defaultTheme?: FlashcardTheme;
}

const THEME_OPTIONS: FlashcardThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Clean, standard design',
    previewClass: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, distraction-free',
    previewClass: 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800'
  },
  {
    id: 'colorful',
    name: 'Colorful',
    description: 'Distinct colors for Q&A',
    previewClass: 'bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950 dark:to-violet-950 border border-blue-200'
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Modern gradient style',
    previewClass: 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 border-0'
  }
];

export function FlashcardThemeSelector({ 
  onThemeChange, 
  defaultTheme = 'default' 
}: FlashcardThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<FlashcardTheme>(defaultTheme);
  
  // Handle theme selection
  const handleThemeChange = (theme: FlashcardTheme) => {
    setSelectedTheme(theme);
    
    if (onThemeChange) {
      onThemeChange(theme);
    }
    
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_flashcard_theme', theme);
    }
  };
  
  // Load saved preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('preferred_flashcard_theme') as FlashcardTheme;
      if (savedTheme && THEME_OPTIONS.some(theme => theme.id === savedTheme)) {
        setSelectedTheme(savedTheme);
        if (onThemeChange) {
          onThemeChange(savedTheme);
        }
      }
    }
  }, [onThemeChange]);
  
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Flashcard Theme</Label>
      
      <RadioGroup 
        value={selectedTheme}
        onValueChange={(value) => handleThemeChange(value as FlashcardTheme)}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        {THEME_OPTIONS.map((theme) => (
          <div key={theme.id} className="space-y-2">
            <RadioGroupItem
              value={theme.id}
              id={`theme-${theme.id}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`theme-${theme.id}`}
              className={cn(
                "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2",
                "hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary",
                "cursor-pointer transition-all"
              )}
            >
              <div 
                className={cn(
                  "h-8 w-16 mb-1 rounded",
                  theme.previewClass
                )}
              />
              <span className="text-xs font-medium">{theme.name}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
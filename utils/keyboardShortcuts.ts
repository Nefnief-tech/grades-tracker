import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/contexts/SettingsContext';

// List of keyboard shortcuts
const SHORTCUTS = {
  'Alt+h': { description: 'Go to Home', path: '/' },
  'Alt+a': { description: 'Go to Analytics', path: '/analytics' },
  'Alt+p': { description: 'Go to Profile', path: '/profile' },
  'Alt+s': { description: 'Go to Settings', path: '/settings' },
  'Alt+n': { description: 'Add new subject', action: 'newSubject' },
  'Alt+g': { description: 'Add new grade', action: 'newGrade' },
  'Alt+,': { description: 'Toggle theme', action: 'toggleTheme' },
};

/**
 * Hook for handling keyboard shortcuts
 * @param callbacks Optional object with callback functions for custom actions
 */
export function useKeyboardShortcuts(callbacks?: {
  newSubject?: () => void;
  newGrade?: () => void;
  toggleTheme?: () => void;
}) {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    // Skip if keyboard shortcuts are disabled
    if (settings.enableKeyboardShortcuts === false) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = `${e.altKey ? 'Alt+' : ''}${e.key.toLowerCase()}`;
      
      const shortcut = SHORTCUTS[key as keyof typeof SHORTCUTS];
      if (!shortcut) return;

      e.preventDefault();
      
      if (shortcut.path) {
        router.push(shortcut.path);
      } else if (shortcut.action === 'newSubject' && callbacks?.newSubject) {
        callbacks.newSubject();
      } else if (shortcut.action === 'newGrade' && callbacks?.newGrade) {
        callbacks.newGrade();
      } else if (shortcut.action === 'toggleTheme') {
        const currentTheme = settings.theme || 'system';
        const newTheme = currentTheme === 'dark' ? 'light' : 
                          currentTheme === 'light' ? 'system' : 'dark';
        updateSettings({ theme: newTheme });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, settings.enableKeyboardShortcuts, callbacks, updateSettings, settings.theme]);

  // Return the list of available shortcuts
  return SHORTCUTS;
}

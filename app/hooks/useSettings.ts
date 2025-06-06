import { useState, useEffect } from 'react';

interface Settings {
  demoMode: boolean;
  forceRealApi: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  demoMode: false,
  forceRealApi: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('vocabularyExtractorSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      setLoaded(true);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setLoaded(true);
    }
  }, []);

  // Update a specific setting
  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      try {
        localStorage.setItem('vocabularyExtractorSettings', JSON.stringify(newSettings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
      return newSettings;
    });
  };

  // Toggle a boolean setting
  const toggleSetting = (key: keyof Settings) => {
    updateSetting(key, !settings[key]);
  };

  return { settings, updateSetting, toggleSetting, loaded };
}
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Settings {
  dateFormat: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
  showGradeColors: boolean;
  colorTheme: "default" | "blue" | "green" | "purple" | "orange" | "pink";
  textSize: "small" | "medium" | "large" | "x-large";
  highContrast: boolean;
  reduceMotion: boolean;
}

const defaultSettings: Settings = {
  dateFormat: "YYYY-MM-DD",
  showGradeColors: true,
  colorTheme: "default",
  textSize: "medium",
  highContrast: false,
  reduceMotion: false,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem("userSettings");
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({
          ...defaultSettings,
          ...parsedSettings,
        });
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Apply settings to document/body when they change
  useEffect(() => {
    if (!isLoaded) return;

    // Apply settings to the document body as classes
    document.body.classList.toggle("text-small", settings.textSize === "small");
    document.body.classList.toggle(
      "text-medium",
      settings.textSize === "medium"
    );
    document.body.classList.toggle("text-large", settings.textSize === "large");
    document.body.classList.toggle(
      "text-x-large",
      settings.textSize === "x-large"
    );
    document.body.classList.toggle("high-contrast", settings.highContrast);
    document.body.classList.toggle("reduce-motion", settings.reduceMotion);
    document.body.classList.toggle(
      "grade-colors-enabled",
      settings.showGradeColors
    );

    // Set data attribute for accent color theme
    if (settings.colorTheme !== "default") {
      document.documentElement.setAttribute(
        "data-accent-color",
        settings.colorTheme
      );
    } else {
      document.documentElement.removeAttribute("data-accent-color");
    }

    // Save settings to localStorage
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }, [settings, isLoaded]);

  // Update settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

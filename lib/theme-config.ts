// Theme configuration system for Grade Tracker

// Using localStorage directly instead of Zustand until dependencies are installed

export type ColorScheme = 
  | 'blue' 
  | 'green' 
  | 'purple' 
  | 'orange' 
  | 'red' 
  | 'pink' 
  | 'teal'
  | 'indigo'
  | 'yellow'
  | 'gray';

export type ThemePreset =
  | 'default'
  | 'wiki'
  | 'minimal'
  | 'neumorphic'
  | 'glassmorphic'
  | 'dark'
  | 'light'
  | 'custom';

export interface ThemeConfig {
  preset: ThemePreset;
  colorScheme: ColorScheme;
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  font: 'system' | 'inter' | 'roboto' | 'poppins' | 'nunito';
  animations: boolean;
  customColors?: {
    primary: string;
    background: string;
    card: string;
    accent: string;
    text: string;
  }
}

export const defaultThemeConfig: ThemeConfig = {
  preset: 'default',
  colorScheme: 'blue',
  radius: 'md',
  font: 'inter',
  animations: true,
};

export const presetThemes: Record<ThemePreset, Partial<ThemeConfig>> = {
  default: {
    colorScheme: 'blue',
    radius: 'md',
    font: 'inter',
    animations: true,
  },
  wiki: {
    colorScheme: 'blue',
    radius: 'sm',
    font: 'system',
    animations: false,
  },
  minimal: {
    colorScheme: 'gray',
    radius: 'sm',
    font: 'inter',
    animations: false,
  },
  neumorphic: {
    colorScheme: 'gray',
    radius: 'lg',
    font: 'poppins',
    animations: true,
  },
  glassmorphic: {
    colorScheme: 'blue',
    radius: 'lg',
    font: 'roboto',
    animations: true,
  },
  dark: {
    colorScheme: 'blue',
    radius: 'md',
    font: 'inter',
    animations: true,
  },
  light: {
    colorScheme: 'blue',
    radius: 'md',
    font: 'inter',
    animations: true,
  },
  custom: {
    radius: 'md',
    font: 'inter',
    animations: true,
  }
};

export const colorSchemes: Record<ColorScheme, { 
  primary: string;
  hover: string;
  background?: string;
  border?: string;
}> = {
  blue: {
    primary: '#3b82f6',
    hover: '#2563eb',
  },
  green: {
    primary: '#10b981',
    hover: '#059669',
  },
  purple: {
    primary: '#8b5cf6',
    hover: '#7c3aed',
  },
  orange: {
    primary: '#f97316',
    hover: '#ea580c',
  },
  red: {
    primary: '#ef4444',
    hover: '#dc2626',
  },
  pink: {
    primary: '#ec4899',
    hover: '#db2777',
  },
  teal: {
    primary: '#14b8a6',
    hover: '#0d9488',
  },
  indigo: {
    primary: '#6366f1',
    hover: '#4f46e5',
  },
  yellow: {
    primary: '#eab308',
    hover: '#ca8a04',
  },
  gray: {
    primary: '#6b7280',
    hover: '#4b5563',
  }
};

// Radius values in pixels
export const radiusValues = {
  'none': '0px',
  'sm': '0.25rem',
  'md': '0.5rem',
  'lg': '1rem',
  'full': '9999px'
};

// Font family definitions
export const fontFamilies = {
  'system': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  'inter': 'Inter, system-ui, sans-serif',
  'roboto': 'Roboto, system-ui, sans-serif',
  'poppins': 'Poppins, system-ui, sans-serif',
  'nunito': 'Nunito, system-ui, sans-serif'
};

// Utility function to generate CSS variables based on theme config
export function generateThemeVariables(config: ThemeConfig): Record<string, string> {
  // Make sure we have a valid config
  config = config || defaultThemeConfig;
  
  const { preset, radius, font, animations, customColors } = config;
  // Make sure colorScheme is valid
  const colorScheme = config.colorScheme || 'blue';
  
  const variables: Record<string, string> = {};
  
  // Define default colors inline
  const defaultColors = {
    primary: '#3b82f6',
    hover: '#2563eb'
  };
  
  // Determine primary and hover colors from selected scheme with fallback
  const scheme = (colorSchemes as any)[colorScheme] as { primary: string; hover: string } | undefined;
  const primaryColor = scheme?.primary ?? defaultColors.primary;
  const hoverColor = scheme?.hover ?? defaultColors.hover;

  if (preset === 'custom' && customColors) {
    variables['--primary'] = customColors.primary;
    variables['--primary-hover'] = adjustColorBrightness(customColors.primary, -10);
    variables['--background'] = customColors.background;
    variables['--card'] = customColors.card;
    variables['--accent'] = customColors.accent;
    variables['--text'] = customColors.text;
    variables['--border'] = adjustColorBrightness(customColors.card, -10);
  } else {
    variables['--primary'] = primaryColor;
    variables['--primary-hover'] = hoverColor;
    
    // Set suitable background color based on preset
    if (preset === 'light' || preset === 'default' || preset === 'minimal' || preset === 'wiki') {
      variables['--background'] = '#ffffff';
      variables['--card'] = '#ffffff';
      variables['--text'] = '#1f2937';
      variables['--border'] = '#e5e7eb';
      variables['--accent'] = '#f3f4f6';
    } else if (preset === 'dark') {
      variables['--background'] = '#1f2937';
      variables['--card'] = '#374151';
      variables['--text'] = '#f3f4f6';
      variables['--border'] = '#4b5563';
      variables['--accent'] = '#374151';
    } else if (preset === 'neumorphic') {
      variables['--background'] = '#e0e5ec';
      variables['--card'] = '#e0e5ec';
      variables['--text'] = '#1f2937';
      variables['--border'] = '#d1d5db';
      variables['--accent'] = '#d1d5db';
    } else if (preset === 'glassmorphic') {
      variables['--background'] = '#f9fafb';
      variables['--card'] = 'rgba(255, 255, 255, 0.7)';
      variables['--text'] = '#1f2937';
      variables['--border'] = 'rgba(255, 255, 255, 0.5)';
      variables['--accent'] = 'rgba(255, 255, 255, 0.3)';
    }
  }
  
  // Border radius
  variables['--radius'] = radiusValues[radius];
  
  // Font family
  variables['--font-family'] = fontFamilies[font];
  
  // Animations
  variables['--transition-duration'] = animations ? '0.2s' : '0s';
  
  return variables;
}

// Helper function to adjust color brightness
function adjustColorBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}
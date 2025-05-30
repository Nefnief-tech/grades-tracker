// Portal configuration management utilities

export interface SchoolPortalConfig {
  username: string;
  password: string;
  baseUrl: string;
  vertretungsplanUrl: string;
  timetableUrl?: string;
  savedAt?: string;
}

const STORAGE_KEY = 'schoolPortalConfig';

/**
 * Save portal configuration to localStorage
 */
export function savePortalConfig(config: Omit<SchoolPortalConfig, 'savedAt'>): SchoolPortalConfig {
  const configWithTimestamp: SchoolPortalConfig = {
    ...config,
    savedAt: new Date().toISOString()
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configWithTimestamp));
  }
  
  return configWithTimestamp;
}

/**
 * Load portal configuration from localStorage
 */
export function loadPortalConfig(): SchoolPortalConfig | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const config = JSON.parse(saved);
      // Validate that all required fields are present
    if (!config.username || !config.password || !config.baseUrl || !config.vertretungsplanUrl) {
      console.warn('Incomplete portal configuration found, ignoring');
      return null;
    }
    
    return config;
  } catch (error) {
    console.error('Failed to load portal configuration:', error);
    return null;
  }
}

/**
 * Clear portal configuration
 */
export function clearPortalConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Check if portal is configured
 */
export function isPortalConfigured(): boolean {
  return loadPortalConfig() !== null;
}

/**
 * Test portal configuration
 */
export async function testPortalConnection(config: Omit<SchoolPortalConfig, 'savedAt'>): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const response = await fetch('/api/vertretungsplan/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: config.username,
        password: config.password,
        baseUrl: config.baseUrl,
        vertretungsplanUrl: config.vertretungsplanUrl
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: 'Connection successful!',
        details: data
      };
    } else {
      return {
        success: false,
        message: data.error || 'Connection failed',
        details: data
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred',
      details: error
    };
  }
}

/**
 * Auto-generate timetable URL from base URL
 */
export function generateTimetableUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl);
    // Remove trailing slash and add the service path
    const cleanBase = url.origin + url.pathname.replace(/\/$/, '');
    return `${cleanBase}/service/stundenplan`;
  } catch (error) {
    // If URL parsing fails, just append to the base URL
    const cleanBase = baseUrl.replace(/\/$/, '');
    return `${cleanBase}/service/stundenplan`;
  }
}

/**
 * Auto-generate vertretungsplan URL from base URL
 */
export function generateVertretungsplanUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl);
    // Remove trailing slash and add the service path
    const cleanBase = url.origin + url.pathname.replace(/\/$/, '');
    return `${cleanBase}/service/vertretungsplan`;
  } catch (error) {
    // If URL parsing fails, just append to the base URL
    const cleanBase = baseUrl.replace(/\/$/, '');
    return `${cleanBase}/service/vertretungsplan`;
  }
}

/**
 * Validate portal configuration
 */
export function validatePortalConfig(config: Partial<SchoolPortalConfig>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!config.username) {
    errors.push('Username is required');
  }
  
  if (!config.password) {
    errors.push('Password is required');
  }
  
  if (!config.baseUrl) {
    errors.push('Base URL is required');
  } else {
    try {
      new URL(config.baseUrl);
    } catch {
      errors.push('Base URL must be a valid URL');
    }
  }
    if (!config.vertretungsplanUrl) {
    errors.push('Vertretungsplan URL is required');
  } else {
    try {
      new URL(config.vertretungsplanUrl);
    } catch {
      errors.push('Vertretungsplan URL must be a valid URL');
    }
  }
  
  // Timetable URL is optional
  if (config.timetableUrl) {
    try {
      new URL(config.timetableUrl);
    } catch {
      errors.push('Timetable URL must be a valid URL if provided');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
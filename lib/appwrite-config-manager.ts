/**
 * AppwriteConfigManager
 * Centralized place to manage Appwrite configuration, with support for debugging overrides
 */

interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
}

class AppwriteConfigManager {
  // Default from .env or environment
  private defaultConfig: AppwriteConfig = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  };
  
  // Debug overrides from localStorage
  private debugConfig: Partial<AppwriteConfig> = {};
  
  constructor() {
    this.loadDebugConfig();
  }
  
  private loadDebugConfig() {
    if (typeof window !== 'undefined') {
      // Check for debug mode
      const debugMode = 
        new URLSearchParams(window.location.search).has('debug') ||
        localStorage.getItem('appwrite_debug_mode') === 'true';
      
      if (debugMode) {
        try {
          const debugEndpoint = localStorage.getItem('debug_appwrite_endpoint');
          const debugProjectId = localStorage.getItem('debug_appwrite_project_id');
          const debugDatabaseId = localStorage.getItem('debug_appwrite_database_id');
          
          if (debugEndpoint) this.debugConfig.endpoint = debugEndpoint;
          if (debugProjectId) this.debugConfig.projectId = debugProjectId;
          if (debugDatabaseId) this.debugConfig.databaseId = debugDatabaseId;
          
          console.log('[AppwriteConfigManager] Debug mode active with overrides:', this.debugConfig);
        } catch (e) {
          console.error('[AppwriteConfigManager] Error loading debug config:', e);
        }
      }
    }
  }
  
  /**
   * Get the current configuration with debug overrides applied
   */
  public getConfig(): AppwriteConfig {
    return {
      ...this.defaultConfig,
      ...this.debugConfig
    };
  }
  
  /**
   * Set a configuration override (stores in localStorage)
   */
  public setOverride(key: keyof AppwriteConfig, value: string): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`debug_appwrite_${key}`, value);
        this.debugConfig[key] = value;
        localStorage.setItem('appwrite_debug_mode', 'true');
      } catch (e) {
        console.error('[AppwriteConfigManager] Error saving override:', e);
      }
    }
  }
  
  /**
   * Clear all debug overrides
   */
  public clearOverrides(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('debug_appwrite_endpoint');
        localStorage.removeItem('debug_appwrite_project_id');
        localStorage.removeItem('debug_appwrite_database_id');
        localStorage.removeItem('appwrite_debug_mode');
        this.debugConfig = {};
      } catch (e) {
        console.error('[AppwriteConfigManager] Error clearing overrides:', e);
      }
    }
  }
  
  /**
   * Check if debug mode is active
   */
  public isDebugMode(): boolean {
    return Object.keys(this.debugConfig).length > 0;
  }
}

// Export a singleton instance
export const appwriteConfig = new AppwriteConfigManager();

// Convenience exports
export const getAppwriteConfig = () => appwriteConfig.getConfig();
import { Client, Databases, ID, Query } from 'appwrite';

/**
 * Service for managing user preferences including 2FA settings
 */
export class UserPreferencesService {
  private client: Client;
  private databases: Databases;
  private readonly databaseId: string;
  private readonly collectionId: string = 'user_preferences';
  
  constructor() {
    this.client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
    
    this.databases = new Databases(this.client);
    this.databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
  }
  
  /**
   * Get user preferences
   * @param userId User ID
   * @returns User preferences object
   */
  async getUserPreferences(userId: string): Promise<any> {
    try {
      // Try to get existing preferences
      const preferences = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [Query.equal('userId', userId)]
      );
      
      if (preferences.documents.length > 0) {
        return preferences.documents[0];
      } else {
        // Create default preferences if none exist
        const defaultPrefs = {
          userId,
          twoFactorEnabled: false,
          theme: 'system',
          notifications: true,
          // Add other default preferences as needed
        };
        
        const result = await this.databases.createDocument(
          this.databaseId,
          this.collectionId,
          ID.unique(),
          defaultPrefs
        );
        
        return result;
      }
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }
  
  /**
   * Update a specific user preference
   * @param userId User ID
   * @param key Preference key
   * @param value Preference value
   * @returns Updated preferences
   */
  async updateUserPreference(userId: string, key: string, value: any): Promise<any> {
    try {
      // Find existing preferences doc
      const preferences = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [Query.equal('userId', userId)]
      );
      
      if (preferences.documents.length > 0) {
        // Update existing doc
        const prefDoc = preferences.documents[0];
        const updatedPrefs = {
          ...prefDoc,
          [key]: value
        };
        
        return await this.databases.updateDocument(
          this.databaseId,
          this.collectionId,
          prefDoc.$id,
          { [key]: value }
        );
      } else {
        // Create new preferences doc with this setting
        const defaultPrefs = {
          userId,
          [key]: value
        };
        
        return await this.databases.createDocument(
          this.databaseId,
          this.collectionId,
          ID.unique(),
          defaultPrefs
        );
      }
    } catch (error) {
      console.error(`Error updating user preference ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Get 2FA setting for a user
   * @param userId User ID
   * @returns Boolean indicating if 2FA is enabled
   */
  async getTwoFactorEnabled(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      return !!preferences.twoFactorEnabled;
    } catch (error) {
      console.error('Error getting 2FA setting:', error);
      return false; // Default to disabled if error
    }
  }
  
  /**
   * Enable or disable 2FA for a user
   * @param userId User ID
   * @param enabled Boolean to enable or disable
   * @returns Success status
   */
  async setTwoFactorEnabled(userId: string, enabled: boolean): Promise<boolean> {
    try {
      await this.updateUserPreference(userId, 'twoFactorEnabled', enabled);
      return true;
    } catch (error) {
      console.error('Error updating 2FA setting:', error);
      return false;
    }
  }
}
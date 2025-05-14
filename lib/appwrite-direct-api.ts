/**
 * Direct Appwrite API client
 * 
 * This implementation bypasses SDK issues by making direct fetch requests
 * with the correct headers.
 */

// Configuration with hardcoded values
const config = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68235ffb0033b3172656',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
};

// Helper function to create headers for Appwrite requests
const createHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': config.projectId,
    'X-SDK-Version': '17.0.2',
  };
};

// Direct API wrapper functions
export const directApi = {
  /**
   * Test connection to Appwrite
   */
  testConnection: async () => {
    console.log('[DirectAPI] Testing connection with Project ID:', config.projectId);
    try {
      const response = await fetch(`${config.endpoint}/health/time`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('[DirectAPI] Connection test failed:', error);
        return {
          success: false,
          error: error.message || 'Failed to connect to Appwrite',
        };
      }
      
      const data = await response.json();
      console.log('[DirectAPI] Connection test successful:', data);
      return {
        success: true,
        timestamp: data,
      };
    } catch (error) {
      console.error('[DirectAPI] Test connection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
  
  /**
   * Create a login session using email and password
   */
  login: async (email: string, password: string) => {
    try {
      console.log('[DirectAPI] Attempting login with email:', email);
      
      const response = await fetch(`${config.endpoint}/account/sessions/email`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('[DirectAPI] Login error:', error);
      throw error;
    }
  },
  
  /**
   * Get the current user's information
   */
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${config.endpoint}/account`, {
        method: 'GET',
        headers: createHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to get current user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('[DirectAPI] Get current user error:', error);
      return null;
    }
  },
  
  /**
   * Logout (delete current session)
   */
  logout: async () => {
    try {
      const response = await fetch(`${config.endpoint}/account/sessions/current`, {
        method: 'DELETE',
        headers: createHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok && response.status !== 401) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to logout');
      }
      
      return true;
    } catch (error) {
      console.error('[DirectAPI] Logout error:', error);
      return false;
    }
  },
};

export default directApi;
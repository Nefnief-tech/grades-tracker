import { Client } from 'appwrite';

/**
 * Creates and configures an Appwrite client for server-side API usage
 * This handles the different methods of authentication based on SDK version
 */
export async function createServerClient() {
  try {
    // Initialize client
    const client = new Client();
    
    // Set endpoint
    client.setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1');
    
    // Set project
    client.setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
    
    // Apply API key authentication if available
    if (process.env.APPWRITE_API_KEY) {
      try {
        // Handle different SDK versions
        if (typeof (client as any).setKey === 'function') {
          (client as any).setKey(process.env.APPWRITE_API_KEY);
        } else if (typeof client.setJWT === 'function') {
          client.setJWT(process.env.APPWRITE_API_KEY);
        } else {
          console.warn('Unable to set API key - no compatible method found');
        }
      } catch (err) {
        console.error('Error setting API key:', err);
      }
    }
    
    return { client, error: null };
  } catch (error) {
    return {
      client: null,
      error: error instanceof Error ? error.message : 'Failed to create server client'
    };
  }
}
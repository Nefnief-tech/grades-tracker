/**
 * Appwrite Debug Utilities
 * 
 * This file contains utilities to help debug Appwrite connection issues.
 */

// Try different endpoints and project IDs to see which one works
export const testEndpointAndProjectID = async () => {
  const endpoints = [
    'https://appwrite.nief.tech/v1',
    'https://cloud.appwrite.io/v1',
    'https://appwrite.io/v1'
  ];
  
  const projectIDs = [
    '67d6ea990025fa097964',
    // Try with and without quotes
    '"67d6ea990025fa097964"',
    // Try with all characters
    '6', '67', '67d', '67d6', '67d6e', '67d6ea', '67d6ea9', '67d6ea99', 
    '67d6ea990', '67d6ea9900', '67d6ea99002', '67d6ea990025', '67d6ea990025f',
    '67d6ea990025fa', '67d6ea990025fa0', '67d6ea990025fa09', '67d6ea990025fa097',
    '67d6ea990025fa0979', '67d6ea990025fa09796', '67d6ea990025fa097964',
    // Try your environment variable directly
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    for (const projectID of projectIDs) {
      try {
        const result = await testConnection(endpoint, projectID);
        results.push({
          endpoint,
          projectID,
          status: result.success ? 'SUCCESS' : 'FAILED',
          details: result
        });
        
        // If successful, we can stop testing
        if (result.success) {
          console.log(`[Debug] SUCCESS with endpoint=${endpoint} and projectID=${projectID}`);
          break;
        }
      } catch (error) {
        results.push({
          endpoint,
          projectID,
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
  
  return results;
};

const testConnection = async (endpoint: string, projectID: string) => {
  console.log(`[Debug] Testing connection to ${endpoint} with project ID ${projectID}`);
  
  try {
    const headers: Record<string, string> = {
      'X-Appwrite-Project': projectID
    };
    
    const response = await fetch(`${endpoint}/health`, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      return {
        success: true,
        status: response.status,
        data: await response.json()
      };
    } else {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: errorData.message || 'Unknown error'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Inspect env variables
export const inspectEnvironment = () => {
  return {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'Not set',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'Not set',
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'Not set',
    environment: process.env.NODE_ENV || 'Not set'
  };
};

// Fetch the Appwrite client headers
export const inspectClientHeaders = (client: any) => {
  try {
    if (client && client.headers) {
      return client.headers;
    } else {
      return 'Client headers not available';
    }
  } catch (error) {
    return `Error inspecting client: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export default {
  testEndpointAndProjectID,
  inspectEnvironment,
  inspectClientHeaders
};
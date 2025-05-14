/**
 * Direct Appwrite API Client using fetch
 * 
 * This implementation completely bypasses the Appwrite SDK to avoid any compatibility issues.
 * It uses direct fetch requests to interact with the Appwrite API.
 */

// Constants
export const ENDPOINT = 'https://appwrite.nief.tech/v1';
export const PROJECT_ID = '67d6ea990025fa097964';

// Helper: Create headers for Appwrite requests
const createHeaders = (includeContentType = true) => {
  const headers: Record<string, string> = {
    'X-Appwrite-Project': PROJECT_ID,
  };
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// Helper: Handle API response
const handleResponse = async (response: Response) => {
  // If response is not ok, handle error
  if (!response.ok) {
    // Try to parse error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    } catch (e) {
      // If can't parse JSON, use status text
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  }
  
  // Try to parse as JSON, if it fails return raw response
  try {
    return await response.json();
  } catch (e) {
    return response;
  }
};

/**
 * Direct Appwrite API Client
 */
export const directApi = {
  // Test connection to Appwrite
  testConnection: async () => {
    console.log('[DirectFetch] Testing connection to Appwrite');
    try {
      const response = await fetch(`${ENDPOINT}/health`, {
        method: 'GET',
        headers: createHeaders(false)
      });
      
      return {
        success: response.ok,
        status: response.status,
        data: response.ok ? await response.json() : null
      };
    } catch (error) {
      console.error('[DirectFetch] Connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  // Account operations
  account: {
    // Create email session (login)
    createSession: async (email: string, password: string) => {
      console.log('[DirectFetch] Creating email session for:', email);
      
      const response = await fetch(`${ENDPOINT}/account/sessions/email`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          email,
          password
        }),
        credentials: 'include'
      });
      
      return handleResponse(response);
    },
    
    // Get current account
    get: async () => {
      console.log('[DirectFetch] Getting current account');
      
      try {
        const response = await fetch(`${ENDPOINT}/account`, {
          method: 'GET',
          headers: createHeaders(),
          credentials: 'include'
        });
        
        // If not authenticated, return null
        if (response.status === 401) {
          return null;
        }
        
        return await handleResponse(response);
      } catch (error) {
        console.error('[DirectFetch] Error getting account:', error);
        // Return null on error instead of throwing
        return null;
      }
    },
    
    // Create account
    create: async (email: string, password: string, name: string) => {
      console.log('[DirectFetch] Creating account for:', email);
      
      const response = await fetch(`${ENDPOINT}/account`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          userId: 'unique()',
          email,
          password,
          name
        })
      });
      
      return handleResponse(response);
    },
    
    // Delete current session (logout)
    deleteSession: async () => {
      console.log('[DirectFetch] Deleting current session (logout)');
      
      try {
        const response = await fetch(`${ENDPOINT}/account/sessions/current`, {
          method: 'DELETE',
          headers: createHeaders(),
          credentials: 'include'
        });
        
        return response.ok;
      } catch (error) {
        console.error('[DirectFetch] Error logging out:', error);
        return false;
      }
    },
    
    // Get current session
    getSession: async () => {
      console.log('[DirectFetch] Getting current session');
      
      try {
        const response = await fetch(`${ENDPOINT}/account/sessions/current`, {
          method: 'GET',
          headers: createHeaders(),
          credentials: 'include'
        });
        
        // If not authenticated, return null
        if (response.status === 401) {
          return null;
        }
        
        return await handleResponse(response);
      } catch (error) {
        console.error('[DirectFetch] Error getting session:', error);
        return null;
      }
    }
  },
  
  // Database operations
  database: {
    // List documents
    listDocuments: async (databaseId: string, collectionId: string, queries: string[] = []) => {
      console.log(`[DirectFetch] Listing documents from ${collectionId}`);
      
      let url = `${ENDPOINT}/databases/${databaseId}/collections/${collectionId}/documents`;
      
      // Add queries if provided
      if (queries && queries.length > 0) {
        const queryParams = new URLSearchParams();
        queries.forEach(query => {
          // Parse the query string and add to params
          // Example query: "equal("userId", "123")" => { key: "equal", value: "userId,123" }
          const match = query.match(/(\w+)\(["']?(.+?)["']?,\s*["']?(.+?)["']?\)/);
          if (match) {
            const [, operation, field, value] = match;
            queryParams.append(operation, `${field},${value}`);
          }
        });
        url += `?${queryParams.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders(),
        credentials: 'include'
      });
      
      return handleResponse(response);
    },
    
    // Create document
    createDocument: async (databaseId: string, collectionId: string, data: any) => {
      console.log(`[DirectFetch] Creating document in ${collectionId}`);
      
      const response = await fetch(`${ENDPOINT}/databases/${databaseId}/collections/${collectionId}/documents`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          ...data,
          documentId: 'unique()'
        }),
        credentials: 'include'
      });
      
      return handleResponse(response);
    },
    
    // Update document
    updateDocument: async (databaseId: string, collectionId: string, documentId: string, data: any) => {
      console.log(`[DirectFetch] Updating document ${documentId} in ${collectionId}`);
      
      const response = await fetch(`${ENDPOINT}/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, {
        method: 'PATCH',
        headers: createHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      return handleResponse(response);
    },
    
    // Delete document
    deleteDocument: async (databaseId: string, collectionId: string, documentId: string) => {
      console.log(`[DirectFetch] Deleting document ${documentId} from ${collectionId}`);
      
      const response = await fetch(`${ENDPOINT}/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, {
        method: 'DELETE',
        headers: createHeaders(),
        credentials: 'include'
      });
      
      return response.ok;
    }
  }
};

export default directApi;
import { cookies } from 'next/headers';
import { Client, Account, Databases, Query } from 'appwrite';
import jwt from 'jsonwebtoken';

// Define user type for server-side auth
type User = {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
};

// Initialize client for server-side operations
const getServerClient = () => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '');
  
  return client;
};

/**
 * Get the current user from the server request
 * Uses cookies to determine if the user is logged in
 */
export async function getCurrentUserWithServerAuth() {
  try {
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('appwrite_session')?.value;
    
    // Try to get admin status from cookie
    const isAdminFromCookie = cookieStore.get('admin-status')?.value === 'true';
    
    if (!sessionCookie) {
      return { user: null, isAuthenticated: false };
    }

    // Initialize client
    const client = getServerClient();
    
    try {
      // Verify the session using server SDK
      const account = new Account(client);
      const session = await account.getSession('current');
      
      if (!session) {
        return { user: null, isAuthenticated: false };
      }
      
      // Get user details
      const userAccount = await account.get();
      
      if (!userAccount) {
        return { user: null, isAuthenticated: false };
      }
      
      // Try to get user's admin status from database if we have API key
      let isAdmin = isAdminFromCookie;
      
      if (process.env.APPWRITE_API_KEY) {
        try {
          const adminClient = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_PROJECT_ID || '');
          
          // Use API key instead of session for admin verification
          adminClient.setKey(process.env.APPWRITE_API_KEY);
          
          const databases = new Databases(adminClient);
          const databaseId = process.env.APPWRITE_DATABASE_ID || '';
          const userCollectionId = process.env.APPWRITE_USER_COLLECTION_ID || '';
          
          if (databaseId && userCollectionId) {
            const usersResponse = await databases.listDocuments(
              databaseId,
              userCollectionId,
              [Query.equal('userId', userAccount.$id), Query.limit(1)]
            );
            
            if (usersResponse.documents.length > 0) {
              const userDoc = usersResponse.documents[0];
              isAdmin = !!userDoc.isAdmin;
            }
          }
        } catch (adminError) {
          console.error('Error verifying admin status:', adminError);
        }
      }
      
      const user: User = {
        id: userAccount.$id,
        email: userAccount.email,
        name: userAccount.name,
        isAdmin: isAdmin
      };
      
      return { user, isAuthenticated: true };
    } catch (error) {
      console.error('Session verification error:', error);
      return { user: null, isAuthenticated: false };
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return { user: null, isAuthenticated: false };
  }
}
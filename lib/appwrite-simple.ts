import { Client, Account, Databases, ID, Query } from "appwrite";

// Feature flag to enable/disable cloud features
export const ENABLE_CLOUD_FEATURES = true;

// Feature flag to enable/disable encryption
export const ENABLE_ENCRYPTION = true;

// Hardcoded Appwrite configuration for reliability
const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "68235ffb0033b3172656";

// Database configuration from environment variables with hardcoded fallbacks
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "67d6b079002144822b5e";
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "67d6b0ac000fc4ecaaaf";
export const SUBJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID || "67d6b0be003d69d6d863";
export const GRADES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID || "67d6b0c600002e7b01f5";
export const TIMETABLE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID || "67e0595c001fb247cd57";
export const TESTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID || "67e2f62c000e8723bd8d";

// Client singletons
let appwriteClient: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;

// Initialize client with hardcoded values for reliability
export const getClient = () => {
  if (!appwriteClient) {
    console.log("[Appwrite] Initializing client with hardcoded values");
    appwriteClient = new Client();
    
    try {
      appwriteClient.setEndpoint(ENDPOINT);
      console.log("[Appwrite] Endpoint set:", ENDPOINT);
      
      appwriteClient.setProject(PROJECT_ID);
      console.log("[Appwrite] Project ID set:", PROJECT_ID);
    } catch (error) {
      console.error("[Appwrite] Error initializing client:", error);
    }
  }
  return appwriteClient;
};

// Get account service
export const getAccount = () => {
  if (!account) {
    account = new Account(getClient());
  }
  return account;
};

// Get databases service
export const getDatabases = () => {
  if (!databases) {
    databases = new Databases(getClient());
  }
  return databases;
};

// Initialize on import if we're in a browser
if (typeof window !== "undefined") {
  getClient();
}

// Login function
export const login = async (email: string, password: string) => {
  try {
    const accountService = getAccount();
    return await accountService.createEmailPasswordSession(email, password);
  } catch (error) {
    console.error("[Appwrite] Login error:", error);
    throw error;
  }
};

// Logout function
export const logout = async () => {
  try {
    const accountService = getAccount();
    return await accountService.deleteSession("current");
  } catch (error) {
    console.error("[Appwrite] Logout error:", error);
    throw error;
  }
};

// Get current user function
export const getCurrentUser = async () => {
  try {
    const accountService = getAccount();
    const databasesService = getDatabases();
    
    const currentAccount = await accountService.get();

    try {
      // Get user document
      const users = await databasesService.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal("userId", currentAccount.$id)]
      );

      if (users.documents.length > 0) {
        const userData = users.documents[0];
        return {
          id: currentAccount.$id,
          email: currentAccount.email,
          name: userData.name,
          syncEnabled: userData.syncEnabled,
        };
      } else {
        // Create user document if it doesn't exist
        await databasesService.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          ID.unique(),
          {
            userId: currentAccount.$id,
            email: currentAccount.email,
            name: currentAccount.name || "User",
            syncEnabled: false,
          }
        );

        return {
          id: currentAccount.$id,
          email: currentAccount.email,
          name: currentAccount.name || "User",
          syncEnabled: false,
        };
      }
    } catch (dbError) {
      console.error("[Appwrite] Error fetching user document:", dbError);

      // Return basic user info
      return {
        id: currentAccount.$id,
        email: currentAccount.email,
        name: currentAccount.name || "User",
        syncEnabled: false,
      };
    }
  } catch (error) {
    console.error("[Appwrite] Get current user error:", error);
    return null;
  }
};

// Export for convenience
export default {
  getClient,
  getAccount,
  getDatabases,
  login,
  logout,
  getCurrentUser,
};
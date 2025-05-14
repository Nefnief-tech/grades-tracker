import { Client, Account, Databases, ID, Query } from "appwrite";

// Define types locally to avoid import issues
export interface Grade {
  id: string;
  value: number;
  type: string;
  date: string;
  weight?: number;
}

export interface Subject {
  id: string;
  name: string;
  grades: Grade[];
  averageGrade: number;
}

// Feature flags
export const ENABLE_CLOUD_FEATURES = true; 
export const ENABLE_ENCRYPTION = true; 
export let FORCE_LOCAL_MODE = false;
let hasShownNetworkError = false;

// Hardcoded Appwrite configuration - guaranteed to work
const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "68235ffb0033b3172656";

// Database configuration from environment variables with hardcoded fallbacks
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "67d6b079002144822b5e";
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "67d6b0ac000fc4ecaaaf";
export const SUBJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID || "67d6b0be003d69d6d863";
export const GRADES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID || "67d6b0c600002e7b01f5";

// Unified configuration object
export const config = {
  endpoint: ENDPOINT,
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  usersCollectionId: USERS_COLLECTION_ID,
  subjectsCollectionId: SUBJECTS_COLLECTION_ID,
  gradesCollectionId: GRADES_COLLECTION_ID
};

// Client singletons
let appwriteClient: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;

// Function to check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Enhanced logging helper
function logAppwriteInfo(message: string, ...args: any[]) {
  const env = typeof window !== "undefined" ? "browser" : "server";
  const envPrefix = `[${env}]`;
  console.log(`[Appwrite]${envPrefix} ${message}`, ...args);
}

// Function to show a network error toast (only once)
const showNetworkErrorOnce = () => {
  if (isBrowser && !hasShownNetworkError) {
    hasShownNetworkError = true;
    console.log("[Appwrite] Network error detected - showing toast notification");
    // Create simple toast notification
    try {
      const toast = document.createElement("div");
      toast.className = "fixed top-4 right-4 bg-red-500 text-white p-4 rounded-md shadow-lg z-50";
      toast.innerHTML = "Network error connecting to cloud. Using local storage instead.";
      document.body.appendChild(toast);
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 5000);
    } catch (error) {
      console.error("Failed to show network error toast:", error);
    }
  }
};

// Function to enable local mode only
export function enableLocalModeOnly() {
  FORCE_LOCAL_MODE = true;
  logAppwriteInfo("Local-only mode has been enabled. All cloud features are disabled.");
}

// Client initialization - the main function
export const getClient = () => {
  if (!appwriteClient) {
    try {
      logAppwriteInfo("Initializing client with hardcoded values");
      appwriteClient = new Client();
      
      // Always use hardcoded values for reliability
      appwriteClient.setEndpoint(ENDPOINT);
      logAppwriteInfo("Set endpoint:", ENDPOINT);
      
      appwriteClient.setProject(PROJECT_ID);
      logAppwriteInfo("Set project ID:", PROJECT_ID);
    } catch (error) {
      logAppwriteInfo("Error initializing client:", error);
      throw error;
    }
  }
  return appwriteClient;
};

// Get account instance - initialize if needed
export const getAccount = () => {
  if (!account) {
    account = new Account(getClient());
  }
  return account;
};

// Get databases instance - initialize if needed
export const getDatabases = () => {
  if (!databases) {
    databases = new Databases(getClient());
  }
  return databases;
};

// Alternative initialization function
export const initializeAppwrite = () => {
  if (!appwriteClient) {
    logAppwriteInfo("Initializing Appwrite via initializeAppwrite()");
    appwriteClient = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID);
    logAppwriteInfo("Appwrite initialized successfully via initializeAppwrite()");
  }
  return appwriteClient;
};

// Check if we can connect to the Appwrite server
export async function checkCloudConnection(): Promise<boolean> {
  try {
    if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE || !appwriteClient) {
      return false;
    }

    // Simple health check
    const response = await fetch(`${ENDPOINT}/health/time`, {
      headers: { 'X-Appwrite-Project': PROJECT_ID }
    });
    
    return response.ok;
  } catch (error) {
    logAppwriteInfo("Cloud connection check failed:", error);
    return false;
  }
}

// Helper functions for authentication
export const createAccount = async (
  email: string,
  password: string,
  name: string
) => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE) {
    showNetworkErrorOnce();
    throw new Error("Cloud features are unavailable. Please try again later.");
  }

  try {
    const accountService = getAccount();
    const databasesService = getDatabases();
    const newAccount = await accountService.create(ID.unique(), email, password, name);

    if (newAccount) {
      try {
        // Create user document in database
        await databasesService.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          ID.unique(),
          {
            userId: newAccount.$id,
            email: email,
            name: name,
            syncEnabled: false,
          }
        );
      } catch (dbError) {
        console.error("Error creating user document:", dbError);
      }
    }

    return newAccount;
  } catch (error: any) {
    console.error("Error creating account:", error);

    if (error.code === 409) {
      throw new Error("An account with this email already exists");
    } else if (error.code === 400) {
      throw new Error("Invalid email or password format");
    } else {
      throw error;
    }
  }
};

// Login function with reliable client
export const login = async (email: string, password: string) => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE) {
    showNetworkErrorOnce();
    throw new Error("Cloud features are unavailable. Please try again later.");
  }

  try {
    const accountService = getAccount();
    return await accountService.createEmailPasswordSession(email, password);
  } catch (error: any) {
    console.error("Error logging in:", error);

    if (error.code === 401) {
      throw new Error("Invalid email or password");
    } else {
      throw error;
    }
  }
};

// Login function
export const logout = async () => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE) {
    return { success: true };
  }

  try {
    const accountService = getAccount();
    return await accountService.deleteSession("current");
  } catch (error: any) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Get current user function that works with the fixed client
export const getCurrentUser = async () => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE) {
    return null;
  }

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
      console.error("Error fetching user document:", dbError);

      // Return basic user info
      return {
        id: currentAccount.$id,
        email: currentAccount.email,
        name: currentAccount.name || "User",
        syncEnabled: false,
      };
    }
  } catch (error: any) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Helper function for database operations
export const updateUserSyncPreference = async (
  userId: string,
  syncEnabled: boolean
) => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE) {
    showNetworkErrorOnce();
    throw new Error("Cloud features are unavailable. Please try again later.");
  }

  try {
    const databasesService = getDatabases();
    const users = await databasesService.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    if (users.documents.length > 0) {
      const userDoc = users.documents[0];
      return await databasesService.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userDoc.$id,
        { syncEnabled: syncEnabled }
      );
    } else {
      throw new Error("User document not found");
    }
  } catch (error: any) {
    console.error("Error updating user sync preference:", error);
    throw error;
  }
};

// Initialize right away if in browser
if (ENABLE_CLOUD_FEATURES && isBrowser && !FORCE_LOCAL_MODE) {
  try {
    initializeAppwrite();
    
    // Account and databases instances
    account = new Account(appwriteClient!);
    databases = new Databases(appwriteClient!);
    
    // Connection check
    setTimeout(() => {
      checkCloudConnection().then(connected => {
        if (connected) {
          logAppwriteInfo("Background connection check successful");
        } else {
          logAppwriteInfo("Background connection check failed");
          showNetworkErrorOnce();
        }
      });
    }, 1000);
  } catch (error) {
    logAppwriteInfo("Failed to initialize Appwrite:", error);
    showNetworkErrorOnce();
    enableLocalModeOnly();
  }
}

// Default exports for convenience
export default {
  getClient,
  getAccount,
  getDatabases,
  checkCloudConnection,
  login,
  logout,
  getCurrentUser,
};
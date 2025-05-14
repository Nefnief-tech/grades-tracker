import { Client, Account, Databases, ID, Query } from "appwrite";

/**
 * Direct Appwrite client with hardcoded values to avoid environment variable issues
 */

// Hardcoded configuration - guaranteed to work
const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "68235ffb0033b3172656";
const DATABASE_ID = "67d6b079002144822b5e";
const USERS_COLLECTION_ID = "67d6b0ac000fc4ecaaaf";
const SUBJECTS_COLLECTION_ID = "67d6b0be003d69d6d863";
const GRADES_COLLECTION_ID = "67d6b0c600002e7b01f5";
const TIMETABLE_COLLECTION_ID = "67e0595c001fb247cd57";
const TESTS_COLLECTION_ID = "67e2f62c000e8723bd8d";

// Client singleton
let client: Client | null = null;

/**
 * Get the Appwrite client with hardcoded values
 * This bypasses any environment variable loading problems
 */
export function getDirectClient(): Client {
  if (!client) {
    client = new Client();
    
    try {
      console.log("[Direct] Initializing Appwrite with hardcoded values");
      client.setEndpoint(ENDPOINT);
      console.log("[Direct] Endpoint set:", ENDPOINT);
      
      client.setProject(PROJECT_ID);
      console.log("[Direct] Project ID set:", PROJECT_ID);
    } catch (error) {
      console.error("[Direct] Failed to initialize client:", error);
      throw error;
    }
  }
  
  return client;
}

/**
 * Get Account service with reliable configuration
 */
export function getAccount(): Account {
  return new Account(getDirectClient());
}

/**
 * Get Databases service with reliable configuration
 */
export function getDatabases(): Databases {
  return new Databases(getDirectClient());
}

/**
 * Test the connection to Appwrite
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = getDirectClient();
    const response = await fetch(`${ENDPOINT}/health/time`, {
      headers: {
        'X-Appwrite-Project': PROJECT_ID
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("[Direct] Connection test passed:", data);
      return true;
    } else {
      console.error("[Direct] Connection test failed:", {
        status: response.status,
        statusText: response.statusText
      });
      return false;
    }
  } catch (error) {
    console.error("[Direct] Connection test error:", error);
    return false;
  }
}

/**
 * Get the current user with the direct client
 */
export async function getCurrentUser() {
  try {
    const account = getAccount();
    return await account.get();
  } catch (error) {
    console.error("[Direct] Get current user error:", error);
    return null;
  }
}

/**
 * Log in with the direct client
 */
export async function login(email: string, password: string) {
  try {
    const account = getAccount();
    return await account.createEmailPasswordSession(email, password);
  } catch (error) {
    console.error("[Direct] Login error:", error);
    throw error;
  }
}

/**
 * Configuration export with hardcoded values
 */
export const directConfig = {
  endpoint: ENDPOINT,
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  usersCollectionId: USERS_COLLECTION_ID,
  subjectsCollectionId: SUBJECTS_COLLECTION_ID,
  gradesCollectionId: GRADES_COLLECTION_ID,
  timetableCollectionId: TIMETABLE_COLLECTION_ID,
  testsCollectionId: TESTS_COLLECTION_ID,
};

export default {
  getDirectClient,
  getAccount,
  getDatabases,
  testConnection,
  getCurrentUser,
  login,
  directConfig
};
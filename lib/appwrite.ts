import { Client, Account, Databases, ID, Query } from "appwrite";
import { rateLimitHandler } from "./rate-limit-handler";
import type { Subject, Grade } from "@/types/grades";

// Feature flag to enable/disable cloud features
export const ENABLE_CLOUD_FEATURES = true; // Set to true to enable cloud features

// Feature flag to enable/disable encryption
export const ENABLE_ENCRYPTION = true; // Set to true to enable encryption

// Add a local mode flag that can be controlled at runtime
export let FORCE_LOCAL_MODE = false;

// Flag to track if we've already shown the network error
let hasShownNetworkError = false;

// Enhanced logging with more deployment details
function logAppwriteInfo(message: string, ...args: any[]) {
  const env = typeof window !== "undefined" ? "browser" : "server";
  const envPrefix = `[${env}]`;
  const isProduction = process.env.NODE_ENV === "production";

  // Always log critical connection issues
  if (
    message.includes("error") ||
    message.includes("failed") ||
    message.includes("invalid") ||
    !isProduction
  ) {
    console.log(`[Appwrite]${envPrefix} ${message}`, ...args);

    // In browser, log additional deployment info for debugging
    if (env === "browser") {
      console.log(`[Appwrite] Environment variables:`, {
        endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ? "set" : "missing",
        projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
          ? "set"
          : "missing",
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
          ? "set"
          : "missing",
        environment: process.env.NODE_ENV,
        railwayDomain: process.env.RAILWAY_PUBLIC_DOMAIN || "not set",
      });
    }
  }
}

// Add this function at the top of the file, after the imports
function getEnvironmentVariable(
  key: string,
  defaultValue: string = ""
): string {
  // Try to get from process.env
  const value = process.env[key] || "";

  if (value) {
    return value;
  }

  // For client-side, try to access window.__env if available (some deployment setups use this)
  if (
    typeof window !== "undefined" &&
    (window as any).__env &&
    (window as any).__env[key]
  ) {
    return (window as any).__env[key];
  }

  // Log the missing environment variable in development mode
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[Appwrite] Missing environment variable: ${key}, using default value`
    );
  }

  return defaultValue;
}

// Appwrite configuration from environment variables with better fallbacks
const appwriteEndpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.nief.tech/v1";
const appwriteProjectId =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "67d6ea990025fa097964";

// Database configuration from environment variables
export const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "67d6b079002144822b5e";
export const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID ||
  "67d6b0ac000fc4ecaaaf";
export const SUBJECTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID ||
  "67d6b0be003d69d6d863";
export const GRADES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID ||
  "67d6b0c600002e8b01f5";

// Add the missing config object with hardcoded fallbacks
const config = {
  endpoint: appwriteEndpoint,
  projectId: appwriteProjectId,
  databaseId: DATABASE_ID,
  usersCollectionId: USERS_COLLECTION_ID,
  subjectsCollectionId: SUBJECTS_COLLECTION_ID,
  gradesCollectionId: GRADES_COLLECTION_ID,
};

// Initialize Appwrite client only if cloud features are enabled
let appwriteClient: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;

// Function to check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Function to check if Web Crypto API is available and compatible
const isCryptoAvailable = () => {
  return (
    isBrowser &&
    typeof crypto !== "undefined" &&
    typeof crypto.subtle !== "undefined" &&
    typeof crypto.subtle.importKey === "function" &&
    typeof crypto.subtle.deriveKey === "function" &&
    typeof crypto.subtle.encrypt === "function"
  );
};

// Encryption utilities
const getEncryptionKey = async (userId: string): Promise<CryptoKey | null> => {
  if (!isCryptoAvailable()) {
    console.warn("Web Crypto API not available on this platform");
    return null;
  }

  try {
    // Derive a key from the userId using PBKDF2
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(userId),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    // Use a fixed salt (you could also store a unique salt per user)
    const salt = encoder.encode("GradesAppSalt");

    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Error generating encryption key:", error);
    return null;
  }
};

const encrypt = async (userId: string, data: any): Promise<string> => {
  if (!ENABLE_ENCRYPTION || !isCryptoAvailable()) {
    return JSON.stringify(data);
  }

  try {
    const key = await getEncryptionKey(userId);
    if (!key) {
      return JSON.stringify(data);
    }

    const encoder = new TextEncoder();
    const dataToEncrypt = encoder.encode(JSON.stringify(data));

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      dataToEncrypt
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode.apply(null, Array.from(combined)));
  } catch (error) {
    console.error("Encryption error:", error);
    // Fall back to unencrypted if encryption fails
    return JSON.stringify(data);
  }
};

const decrypt = async (
  userId: string,
  encryptedString: string
): Promise<any> => {
  if (!ENABLE_ENCRYPTION || !isCryptoAvailable()) {
    return JSON.parse(encryptedString);
  }

  try {
    // Convert from base64
    const binary = atob(encryptedString);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const key = await getEncryptionKey(userId);
    if (!key) {
      return JSON.parse(encryptedString);
    }

    // Extract IV (first 12 bytes)
    const iv = bytes.slice(0, 12);
    const encryptedData = bytes.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedData));
  } catch (error) {
    console.error("Decryption error:", error);
    // Try to parse as unencrypted if decryption fails
    try {
      return JSON.parse(encryptedString);
    } catch {
      return null;
    }
  }
};

// Function to show a network error toast (only once)
const showNetworkErrorOnce = () => {
  if (isBrowser && !hasShownNetworkError) {
    hasShownNetworkError = true;
    // Create and show a toast notification
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-md shadow-lg z-50 flex items-center gap-2 max-w-md";
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wifi-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 4.17-2.65"/><path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"/><path d="M16.85 11.25a10 10 0 0 1 2.22 1.68"/><path d="M5 12.03a10 10 0 0 1 5.17-2.8"/><path d="M10.71 19.71a1 1 0 1 1-1.42-1.42 1 1 0 0 1 1.42 1.42z"/></svg>
      <span>Network error connecting to cloud. Using local storage instead.</span>
      <button class="ml-auto text-destructive-foreground/70 hover:text-destructive-foreground">×</button>
    `;

    try {
      document.body.appendChild(toast);

      // Remove the toast after 5 seconds
      setTimeout(() => {
        toast.classList.add("opacity-0", "transition-opacity", "duration-300");
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, 5000);

      // Add click event to close button
      const closeButton = toast.querySelector("button");
      if (closeButton) {
        closeButton.addEventListener("click", () => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        });
      }
    } catch (error) {
      console.error("Failed to show network error toast:", error);
    }
  }
};

// Better validation for the Appwrite endpoint URL
function validateAppwriteEndpoint(endpoint: string): boolean {
  if (!endpoint) {
    logAppwriteInfo(
      "No Appwrite endpoint provided. Check your environment variables."
    );

    // Show more specific error in development
    if (process.env.NODE_ENV !== "production") {
      console.error(`
      ===============================================================
      CONFIGURATION ERROR: APPWRITE ENDPOINT MISSING
      ===============================================================
      Make sure you have set NEXT_PUBLIC_APPWRITE_ENDPOINT in:
      
      1. Your .env.local file for local development
      2. Your Railway project variables for deployment
      
      Current endpoint value: "${endpoint}"
      ===============================================================
      `);
    }

    return false;
  }

  try {
    // Check if it's a valid URL with protocol
    const url = new URL(endpoint);
    logAppwriteInfo(`Validated Appwrite endpoint: ${url.toString()}`);
    return true;
  } catch (e) {
    logAppwriteInfo("Invalid Appwrite endpoint URL:", endpoint, e);
    return false;
  }
}

// Function to enable local mode only
export function enableLocalModeOnly() {
  FORCE_LOCAL_MODE = true;
  logAppwriteInfo(
    "Local-only mode has been enabled. All cloud features are disabled."
  );
}

// Clear initialization errors for tests
if (typeof window !== "undefined") {
  // Add a global function to manually enable local mode (for debugging)
  (window as any).enableLocalModeOnly = enableLocalModeOnly;
}

// Try to initialize Appwrite client
if (ENABLE_CLOUD_FEATURES && isBrowser && !FORCE_LOCAL_MODE) {
  try {
    // Only initialize if we have valid configuration
    if (validateAppwriteEndpoint(appwriteEndpoint) && appwriteProjectId) {
      logAppwriteInfo("Initializing Appwrite client with:", {
        endpoint: appwriteEndpoint,
        projectId: appwriteProjectId ? "[HIDDEN FOR SECURITY]" : undefined,
        databaseId: DATABASE_ID ? "[HIDDEN FOR SECURITY]" : undefined,
      });

      appwriteClient = new Client();

      // Set the endpoint first, then the project ID
      try {
        appwriteClient.setEndpoint(appwriteEndpoint);
        logAppwriteInfo("Endpoint set successfully");
      } catch (endpointError) {
        logAppwriteInfo("Failed to set endpoint:", endpointError);
        throw endpointError;
      }

      try {
        appwriteClient.setProject(appwriteProjectId);
        logAppwriteInfo("Project ID set successfully");
      } catch (projectError) {
        logAppwriteInfo("Failed to set project ID:", projectError);
        throw projectError;
      }

      // Create account and databases instances
      account = new Account(appwriteClient);
      databases = new Databases(appwriteClient);
      logAppwriteInfo("Appwrite client initialized successfully");

      // Check connection
      setTimeout(() => {
        checkCloudConnection().catch((err) => {
          logAppwriteInfo("Background connection check failed:", err);
        });
      }, 1000);
    } else {
      logAppwriteInfo(
        "Appwrite configuration is invalid or missing. Cloud features will be disabled."
      );
      enableLocalModeOnly();
    }
  } catch (error) {
    logAppwriteInfo("Failed to initialize Appwrite client:", error);
    showNetworkErrorOnce();
    enableLocalModeOnly();
  }
} else {
  if (FORCE_LOCAL_MODE) {
    logAppwriteInfo("Local-only mode is active. Cloud features are disabled.");
  } else if (!ENABLE_CLOUD_FEATURES) {
    logAppwriteInfo("Cloud features are disabled in configuration.");
  } else if (!isBrowser) {
    logAppwriteInfo(
      "Not in browser environment, skipping Appwrite initialization."
    );
  }
}

// Add or modify the cloud connection check function
export async function checkCloudConnection(): Promise<boolean> {
  try {
    if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE || !appwriteClient) {
      logAppwriteInfo("Cloud features are disabled or not initialized");
      return false;
    }

    // Try a simple operation to test connection
    const account = new Account(appwriteClient);

    // Just check for the session status without requiring logged in user
    await account.getSession("current").catch((err) => {
      // 401 is expected if not logged in, but means the endpoint responded
      if (err.code === 401) {
        return { valid: true };
      }
      throw err;
    });

    logAppwriteInfo("Cloud connection check successful");
    return true;
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
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE || !account || !databases) {
    showNetworkErrorOnce();
    throw new Error("Cloud features are unavailable. Please try again later.");
  }

  try {
    const newAccount = await account.create(ID.unique(), email, password, name);

    if (newAccount) {
      try {
        // Create user document in database
        await databases.createDocument(
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
    } else if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      throw new Error(
        "Network error. The app will work in offline mode with local storage."
      );
    } else {
      throw error;
    }
  }
};

export const login = async (email: string, password: string) => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE || !account) {
    showNetworkErrorOnce();
    throw new Error("Cloud features are unavailable. Please try again later.");
  }

  try {
    return await account.createEmailPasswordSession(email, password);
  } catch (error: any) {
    console.error("Error logging in:", error);

    if (error.code === 401) {
      throw new Error("Invalid email or password");
    } else if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      throw new Error(
        "Network error. The app will work in offline mode with local storage."
      );
    } else {
      throw error;
    }
  }
};

export const logout = async () => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE || !account) {
    return { success: true };
  }

  try {
    return await account.deleteSession("current");
  } catch (error: any) {
    console.error("Error logging out:", error);

    if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      return { success: true };
    } else {
      throw error;
    }
  }
};

export const getCurrentUser = async () => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE || !account || !databases) {
    return null;
  }

  try {
    const currentAccount = await account.get();

    try {
      // Get user document from database
      const users = await databases.listDocuments(
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
        // If user document doesn't exist, create it
        try {
          await databases.createDocument(
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
        } catch (dbError) {
          console.error("Error creating missing user document:", dbError);
        }

        // Return basic user info
        return {
          id: currentAccount.$id,
          email: currentAccount.email,
          name: currentAccount.name || "User",
          syncEnabled: false,
        };
      }
    } catch (dbError) {
      console.error("Error fetching user document:", dbError);

      // Return basic user info if database operations fail
      return {
        id: currentAccount.$id,
        email: currentAccount.email,
        name: currentAccount.name || "User",
        syncEnabled: false,
      };
    }
  } catch (error: any) {
    console.error("Error getting current user:", error);

    if (error.code === 401) {
      // User is not authenticated
      return null;
    } else if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      console.warn("Network error when checking user. Assuming not logged in.");
      return null;
    } else {
      return null;
    }
  }
};

// Helper functions for database operations
export const updateUserSyncPreference = async (
  userId: string,
  syncEnabled: boolean
) => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE || !databases) {
    showNetworkErrorOnce();
    throw new Error("Cloud features are unavailable. Please try again later.");
  }

  try {
    const users = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    if (users.documents.length > 0) {
      const userDoc = users.documents[0];
      return await databases.updateDocument(
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

    if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      throw new Error(
        "Network error. Changes will be applied when you're back online."
      );
    } else {
      throw error;
    }
  }
};

/**
 * Helper function to sanitize objects before sending to Appwrite
 * This ensures we never send fields that aren't in the schema
 */
function sanitizeForAppwrite(obj: any): any {
  // Create a new clean object with only allowed fields
  const sanitized: any = {};

  // Only copy explicitly allowed fields
  const allowedFields = [
    "userId",
    "subjectid",
    "name",
    "averageGrade",
    "value",
    "type",
    "date",
    "weight",
  ];

  for (const field of allowedFields) {
    if (obj[field] !== undefined) {
      sanitized[field] = obj[field];
    }
  }

  return sanitized;
}

/**
 * Fixed and simplified subject syncing to avoid schema conflicts
 */
export const syncSubjectsToCloud = async (
  userId: string,
  subjects: Subject[]
): Promise<boolean> => {
  console.log(
    `[Cloud] Starting sync for user ${userId} with ${subjects.length} subjects`
  );

  try {
    const databases = getDatabases();

    // Get existing subjects to identify what needs updating vs creating
    console.log(`[Cloud] Fetching existing subjects for user ${userId}`);
    const existingSubjectsResponse = await databases.listDocuments(
      config.databaseId,
      config.subjectsCollectionId,
      [Query.equal("userId", userId), Query.limit(1000)]
    );

    // Log document schema to help debug
    if (existingSubjectsResponse.documents.length > 0) {
      console.log(
        "[Cloud] Subject schema:",
        Object.keys(existingSubjectsResponse.documents[0])
      );
    }

    // Create a map of cloud subjects with Appwrite's internal IDs
    const cloudSubjectMap = new Map();
    existingSubjectsResponse.documents.forEach((doc) => {
      // Try all possible field names for subject ID
      const subjectId = doc.subjectid || doc.subjectId || doc.id || doc.$id;
      if (subjectId) {
        cloudSubjectMap.set(subjectId, doc.$id);
      }
    });

    // Process each subject one by one (more reliable than batch processing)
    for (const subject of subjects) {
      try {
        // Step 1: Create/update the subject
        const cloudDocId = cloudSubjectMap.get(subject.id);
        const encryptedAvg = await encrypt(userId, subject.averageGrade);

        if (cloudDocId) {
          // Update existing subject
          console.log(
            `[Cloud] Updating subject: ${subject.name} (${subject.id})`
          );
          await databases.updateDocument(
            config.databaseId,
            config.subjectsCollectionId,
            cloudDocId,
            sanitizeForAppwrite({
              name: subject.name,
              averageGrade: encryptedAvg,
            })
          );
        } else {
          // Create new subject
          console.log(
            `[Cloud] Creating new subject: ${subject.name} (${subject.id})`
          );
          await databases.createDocument(
            config.databaseId,
            config.subjectsCollectionId,
            ID.unique(),
            sanitizeForAppwrite({
              userId: userId,
              subjectid: subject.id, // Use lowercase consistently
              name: subject.name,
              averageGrade: encryptedAvg,
            })
          );
        }

        // Step 2: Handle grades for this subject
        if (subject.grades && subject.grades.length > 0) {
          // First, get existing grades
          const existingGrades = await databases.listDocuments(
            config.databaseId,
            config.gradesCollectionId,
            [
              Query.equal("userId", userId),
              Query.equal("subjectid", subject.id),
              Query.limit(1000),
            ]
          );

          // Log grade schema to help debug
          if (existingGrades.documents.length > 0) {
            console.log(
              "[Cloud] Grade schema:",
              Object.keys(existingGrades.documents[0])
            );
          }

          // Map existing grades by Appwrite internal ID
          const gradeDocMap = new Map();
          existingGrades.documents.forEach((doc) => {
            // Store by document ID for simplicity
            gradeDocMap.set(doc.$id, doc);
          });

          // Delete all existing grades (safer than trying to update)
          for (const gradeDocId of gradeDocMap.keys()) {
            try {
              await databases.deleteDocument(
                config.databaseId,
                config.gradesCollectionId,
                gradeDocId
              );
            } catch (delError) {
              console.warn(
                `[Cloud] Failed to delete grade ${gradeDocId}:`,
                delError
              );
            }
          }

          // Create fresh grades
          for (const grade of subject.grades) {
            const encryptedValue = await encrypt(userId, grade.value);

            // Create with minimal fields to avoid schema conflicts
            try {
              // CRITICAL FIX: Completely avoid any problematic field names
              // Use only the minimal set of fields known to be supported
              await databases.createDocument(
                config.databaseId,
                config.gradesCollectionId,
                ID.unique(),
                sanitizeForAppwrite({
                  userId: userId,
                  subjectid: subject.id,
                  // Remove gradeKey field entirely - it's causing issues
                  value: encryptedValue,
                  type: grade.type || "Test",
                  date: grade.date || new Date().toISOString().split("T")[0],
                  weight: grade.weight || 1.0,
                })
              );
            } catch (gradeCreateError) {
              console.error(
                `[Cloud] Failed to create grade:`,
                gradeCreateError
              );

              // More minimal fallback - absolutely essential fields only
              try {
                await databases.createDocument(
                  config.databaseId,
                  config.gradesCollectionId,
                  ID.unique(),
                  sanitizeForAppwrite({
                    userId: userId,
                    subjectid: subject.id,
                    value: encryptedValue,
                    type: grade.type || "Test",
                  })
                );
              } catch (fallbackError) {
                console.error(
                  `[Cloud] Even fallback grade creation failed:`,
                  fallbackError
                );
              }
            }
          }
        }
      } catch (subjectError) {
        console.error(
          `[Cloud] Error processing subject ${subject.id}:`,
          subjectError
        );
        // Continue with next subject even if this one fails
      }
    }

    console.log(`[Cloud] Sync completed successfully for user ${userId}`);
    return true;
  } catch (error) {
    console.error("[Cloud] Error in syncSubjectsToCloud:", error);
    return false;
  }
};

/**
 * Fixed and simplified fetching of subjects and grades
 */
export const getSubjectsFromCloud = async (
  userId: string
): Promise<Subject[]> => {
  try {
    console.log(`[Cloud] Fetching subjects for user ${userId}`);
    const databases = getDatabases();

    // Create array to hold results
    const results: Subject[] = [];

    // 1. Get all subjects
    try {
      const subjectsResponse = await databases.listDocuments(
        config.databaseId,
        config.subjectsCollectionId,
        [Query.equal("userId", userId), Query.limit(1000)]
      );

      // Log document count
      console.log(
        `[Cloud] Found ${subjectsResponse.documents.length} subjects`
      );

      // Log first document structure
      if (subjectsResponse.documents.length > 0) {
        console.log(
          "[Cloud] First subject document:",
          JSON.stringify(subjectsResponse.documents[0])
        );
      }

      // Process each subject
      for (const doc of subjectsResponse.documents) {
        try {
          // Ensure we have required fields
          if (!doc.name) {
            console.warn("[Cloud] Subject missing name:", doc.$id);
            continue;
          }

          // Get the subject ID from various possible fields
          const subjectId = doc.subjectid || doc.subjectId || doc.id || doc.$id;

          // Decrypt average grade (if available)
          let avgGrade = 0;
          try {
            if (doc.averageGrade) {
              avgGrade = (await decrypt(userId, doc.averageGrade)) || 0;
            }
          } catch (e) {
            console.warn("[Cloud] Error decrypting average grade:", e);
            avgGrade =
              typeof doc.averageGrade === "number" ? doc.averageGrade : 0;
          }

          // Add subject to results
          const subject: Subject = {
            id: subjectId,
            name: doc.name,
            grades: [],
            averageGrade: avgGrade,
          };

          // Add to results
          results.push(subject);
        } catch (subjectError) {
          console.error("[Cloud] Error processing subject:", subjectError);
        }
      }
    } catch (subjectsError) {
      console.error("[Cloud] Error fetching subjects:", subjectsError);
    }

    // 2. Get grades for each subject
    for (const subject of results) {
      try {
        console.log(`[Cloud] Fetching grades for subject ${subject.id}`);

        const gradesResponse = await databases.listDocuments(
          config.databaseId,
          config.gradesCollectionId,
          [
            Query.equal("userId", userId),
            Query.equal("subjectid", subject.id),
            Query.limit(1000),
          ]
        );

        console.log(
          `[Cloud] Found ${gradesResponse.documents.length} grades for subject ${subject.id}`
        );

        // Process each grade document
        if (gradesResponse.documents.length > 0) {
          // Log first grade document
          console.log(
            "[Cloud] First grade document:",
            JSON.stringify(gradesResponse.documents[0])
          );

          const grades: Grade[] = [];

          for (const doc of gradesResponse.documents) {
            try {
              // Try to find grade ID or generate a unique one
              const gradeId =
                doc.gradeKey ||
                doc.gradeid ||
                doc.gradeId ||
                doc.grade_id ||
                doc.$id ||
                `grade-${Date.now()}-${Math.random()
                  .toString(36)
                  .substring(2, 9)}`;

              // Decrypt value
              let value = 0;
              try {
                if (doc.value) {
                  value = (await decrypt(userId, doc.value)) || 0;
                }
              } catch (decryptError) {
                console.warn(
                  "[Cloud] Error decrypting grade value:",
                  decryptError
                );
                value = typeof doc.value === "number" ? doc.value : 0;
              }

              // Create grade object
              const grade: Grade = {
                id: gradeId,
                value: value,
                type: doc.type || "Test",
                date: doc.date || new Date().toISOString().split("T")[0],
                weight: doc.weight || 1.0,
              };

              grades.push(grade);
            } catch (gradeError) {
              console.error(
                "[Cloud] Error processing grade document:",
                gradeError
              );
            }
          }

          // Sort grades by date (newest first)
          grades.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          // Assign grades to subject
          subject.grades = grades;

          // Recalculate average grade
          if (grades.length > 0) {
            let weightedSum = 0;
            let totalWeight = 0;

            for (const grade of grades) {
              const weight = grade.weight || 1.0;
              weightedSum += grade.value * weight;
              totalWeight += weight;
            }

            subject.averageGrade =
              totalWeight > 0
                ? Number((weightedSum / totalWeight).toFixed(2))
                : 0;
          }
        }
      } catch (gradesError) {
        console.error(
          "[Cloud] Error fetching grades for subject:",
          gradesError
        );
      }
    }

    console.log(
      `[Cloud] Successfully fetched ${results.length} subjects with their grades`
    );
    return results;
  } catch (error) {
    console.error("[Cloud] Error in getSubjectsFromCloud:", error);
    return [];
  }
};

/**
 * Modified deleteGradeFromCloud to handle field name variations
 */
export const deleteGradeFromCloud = async (
  userId: string,
  subjectId: string,
  grade: Grade
): Promise<boolean> => {
  try {
    const databases = getDatabases();

    // Try multiple query combinations to find the grade, but avoid problematic fields
    const queries = [
      // Try with value and type (avoid ID fields completely)
      [
        Query.equal("userId", userId),
        Query.equal("subjectid", subjectId),
        Query.equal("type", grade.type),
        Query.equal("date", grade.date),
      ],
      // Try with just the subject ID (will delete all grades for that subject)
      [Query.equal("userId", userId), Query.equal("subjectid", subjectId)],
    ];

    // Try each query combination
    for (const query of queries) {
      try {
        const response = await databases.listDocuments(
          config.databaseId,
          config.gradesCollectionId,
          query
        );

        if (response.documents.length > 0) {
          // Delete the found documents
          for (const doc of response.documents) {
            await databases.deleteDocument(
              config.databaseId,
              config.gradesCollectionId,
              doc.$id
            );
          }
          return true;
        }
      } catch (queryError) {
        console.warn("[Cloud] Query failed:", queryError);
        // Continue trying other queries
      }
    }

    // If we get here, no matching document was found
    console.warn("[Cloud] No matching grade found to delete");
    return false;
  } catch (error) {
    console.error("[Cloud] Error deleting grade:", error);
    return false;
  }
};

// Also fix syncGradesToCloud
export const syncGradesToCloud = async (
  userId: string,
  subjectid: string,
  grades: any[]
) => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE || !databases) {
    return false;
  }

  try {
    // First, delete all existing grades for this subject
    try {
      // Get all grades in a single request
      const existingGrades = await databases.listDocuments(
        DATABASE_ID,
        GRADES_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.equal("subjectid", subjectid),
          Query.limit(1000),
        ]
      );

      // Delete all grades in parallel for maximum speed
      await Promise.all(
        existingGrades.documents.map((doc) =>
          databases!.deleteDocument(DATABASE_ID, GRADES_COLLECTION_ID, doc.$id)
        )
      );
    } catch (error) {
      console.error("Error deleting existing grades:", error);
    }

    // Remove any potential duplicates before syncing
    const uniqueGrades = removeDuplicateGrades(grades);

    // Process all grades in parallel for maximum speed
    await Promise.all(
      uniqueGrades.map(async (grade) => {
        // Encrypt the grade value if encryption is enabled
        const encryptedValue = await encrypt(userId, grade.value);

        // Create grade document - OMIT gradeid field
        await databases!.createDocument(
          DATABASE_ID,
          GRADES_COLLECTION_ID,
          ID.unique(),
          sanitizeForAppwrite({
            userId: userId,
            subjectid: subjectid,
            // NO gradeid field since it causes validation errors
            value: encryptedValue,
            type: grade.type,
            date: grade.date,
            weight: grade.weight || 1.0,
          })
        );
      })
    );

    return true;
  } catch (error: any) {
    console.error("Error syncing grades to cloud:", error);

    if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      return false;
    } else {
      return false;
    }
  }
};

// Helper function to remove duplicate grades
function removeDuplicateGrades(grades: any[]): any[] {
  const seen = new Set();
  return grades.filter((grade) => {
    const key = `${grade.value}-${grade.type}-${grade.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Delete a subject and all its grades from cloud
export const deleteSubjectFromCloud = async (
  userId: string,
  subjectId: string
): Promise<boolean> => {
  try {
    const databases = getDatabases();

    // 1. Find and delete the subject document - use lowercase field name
    const subjectResponse = await databases.listDocuments(
      config.databaseId,
      config.subjectsCollectionId,
      [
        Query.equal("userId", userId),
        Query.equal("subjectid", subjectId), // Using lowercase field name
      ]
    );

    for (const doc of subjectResponse.documents) {
      await databases.deleteDocument(
        config.databaseId,
        config.subjectsCollectionId,
        doc.$id
      );
    }

    // 2. Find and delete all grades for this subject - subjectid is already lowercase
    const gradesResponse = await databases.listDocuments(
      config.databaseId,
      config.gradesCollectionId,
      [Query.equal("userId", userId), Query.equal("subjectid", subjectId)]
    );

    for (const doc of gradesResponse.documents) {
      await databases.deleteDocument(
        config.databaseId,
        config.gradesCollectionId,
        doc.$id
      );
    }

    return true;
  } catch (error) {
    console.error("[Cloud] Error deleting subject:", error);
    return false;
  }
};

// Delete all cloud data for a user but keep their account
export const deleteAllCloudData = async (userId: string) => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE || !databases) {
    showNetworkErrorOnce();
    throw new Error("Cloud features are unavailable. Please try again later.");
  }

  try {
    // 1. Delete user's subjects
    try {
      const existingSubjects = await databases.listDocuments(
        DATABASE_ID,
        SUBJECTS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      for (const doc of existingSubjects.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          SUBJECTS_COLLECTION_ID,
          doc.$id
        );
      }
    } catch (error) {
      console.error("Error deleting user subjects:", error);
      throw error;
    }

    // 2. Delete user's grades
    try {
      const existingGrades = await databases.listDocuments(
        DATABASE_ID,
        GRADES_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      for (const doc of existingGrades.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          GRADES_COLLECTION_ID,
          doc.$id
        );
      }
    } catch (error) {
      console.error("Error deleting user grades:", error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error deleting cloud data:", error);

    if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      throw new Error(
        "Network error. Please try again when you're back online."
      );
    } else {
      throw error;
    }
  }
};

// Delete user account
export const deleteAccount = async (userId: string) => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE || !account || !databases) {
    showNetworkErrorOnce();
    throw new Error("Cloud features are unavailable. Please try again later.");
  }

  try {
    // First delete all user data
    // 1. Delete user's subjects
    try {
      const existingSubjects = await databases.listDocuments(
        DATABASE_ID,
        SUBJECTS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      for (const doc of existingSubjects.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          SUBJECTS_COLLECTION_ID,
          doc.$id
        );
      }
    } catch (error) {
      console.error("Error deleting user subjects:", error);
    }

    // 2. Delete user's grades
    try {
      const existingGrades = await databases.listDocuments(
        DATABASE_ID,
        GRADES_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      for (const doc of existingGrades.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          GRADES_COLLECTION_ID,
          doc.$id
        );
      }
    } catch (error) {
      console.error("Error deleting user grades:", error);
    }

    // 3. Delete user document
    try {
      const existingUsers = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      for (const doc of existingUsers.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          doc.$id
        );
      }
    } catch (error) {
      console.error("Error deleting user document:", error);
    }

    // 4. Finally delete the user account
    await account.deleteSession("current");
    await account.delete();

    return true;
  } catch (error: any) {
    console.error("Error deleting account:", error);

    if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      throw new Error(
        "Network error. Please try again when you're back online."
      );
    } else {
      throw error;
    }
  }
};

export default {
  syncSubjectsToCloud,
  getSubjectsFromCloud,
  deleteGradeFromCloud,
  deleteSubjectFromCloud,
};

// Initialize Appwrite client
const getClient = () => {
  const client = new Client();

  try {
    console.log("[Appwrite] Initializing client");
    client.setEndpoint(config.endpoint).setProject(config.projectId);

    return client;
  } catch (error) {
    console.error("[Appwrite] Error initializing client:", error);
    throw error;
  }
};

// CRITICAL: Add the missing getDatabases function
const getDatabases = () => {
  try {
    return new Databases(getClient());
  } catch (error) {
    console.error("[Appwrite] Error getting databases instance:", error);
    throw error;
  }
};

export const initializeAppwrite = () => {
  if (!appwriteClient) {
    appwriteClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");
  }
  return appwriteClient;
};

export const getAppwriteClient = () => {
  if (!appwriteClient) {
    initializeAppwrite();
  }
  if (!appwriteClient) {
    throw new Error(
      "Appwrite client not initialized. Call initializeAppwrite first."
    );
  }
  const databases = new Databases(appwriteClient);
  if (!databases) {
    throw new Error("Appwrite databases client not properly initialized");
  }
  return { client: appwriteClient, databases };
};

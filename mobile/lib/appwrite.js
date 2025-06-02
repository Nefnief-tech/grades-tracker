import { Client, Account, Databases, ID, Query } from "appwrite";

// Feature flag to enable/disable cloud features
export const ENABLE_CLOUD_FEATURES = true;

// Feature flag to enable/disable encryption
export const ENABLE_ENCRYPTION = true;

// Add a local mode flag that can be controlled at runtime
export let FORCE_LOCAL_MODE = false;

// Flag to track if we've already shown the network error
let hasShownNetworkError = false;

// Enhanced logging for mobile
function logAppwriteInfo(message, ...args) {
  const isProduction = process.env.NODE_ENV === "production";

  // Always log critical connection issues
  if (
    message.includes("error") ||
    message.includes("failed") ||
    message.includes("invalid") ||
    !isProduction
  ) {
    console.log(`[Appwrite Mobile] ${message}`, ...args);
  }
}

// Appwrite configuration
const appwriteEndpoint = "https://appwrite.nief.tech/v1";
const appwriteProjectId = "68235ffb0033b3172656";

// Database configuration
export const DATABASE_ID = "67d6b079002144822b5e";
export const USERS_COLLECTION_ID = "67d6b0ac000fc4ecaaaf";
export const SUBJECTS_COLLECTION_ID = "67d6b0be003d69d6d863";
export const GRADES_COLLECTION_ID = "67d6b0c600002e7b01f5";

// Configuration object
const config = {
  endpoint: appwriteEndpoint,
  projectId: "67d6ea990025fa097964",
  databaseId: "67d6b079002144822b5e",
  usersCollectionId: USERS_COLLECTION_ID,
  subjectsCollectionId: SUBJECTS_COLLECTION_ID,
  gradesCollectionId: GRADES_COLLECTION_ID,
};

// Initialize Appwrite client only if cloud features are enabled
let appwriteClient = null;
let account = null;
let databases = null;

// Function to get the initialized client or create it if it doesn't exist yet
export const getClient = () => {
  if (!appwriteClient) {
    try {
      console.log("[Appwrite Mobile] Initializing client on demand");
      appwriteClient = new Client();
      appwriteClient.setEndpoint("https://appwrite.nief.tech/v1/").setProject("67d6ea990025fa097964");
    } catch (error) {
      console.error("[Appwrite Mobile] Error initializing client on demand:", error);
      throw error;
    }
  }
  return appwriteClient;
};

// Function to get the databases instance
export const getDatabases = () => {
  if (!databases) {
    try {
      databases = new Databases(getClient());
    } catch (error) {
      console.error("[Appwrite Mobile] Error getting databases instance:", error);
      enableLocalModeOnly();
      throw error;
    }
  }
  return databases;
};

// Function to get the account instance
export const getAccount = () => {
  if (!account) {
    try {
      account = new Account(getClient());
    } catch (error) {
      console.error("[Appwrite Mobile] Error getting account instance:", error);
      enableLocalModeOnly();
      throw error;
    }
  }
  return account;
};

// Function to check if Web Crypto API is available and compatible
const isCryptoAvailable = () => {
  return (
    typeof crypto !== "undefined" &&
    typeof crypto.subtle !== "undefined" &&
    typeof crypto.subtle.importKey === "function" &&
    typeof crypto.subtle.deriveKey === "function" &&
    typeof crypto.subtle.encrypt === "function"
  );
};

// Encryption utilities
const getEncryptionKey = async (userId) => {
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

const encrypt = async (userId, data) => {
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

const decrypt = async (userId, encryptedString) => {
  console.log(`[DEBUG] Decrypt called with:`, {
    userId: userId,
    encryptedString: typeof encryptedString === 'string' ? encryptedString.substring(0, 50) + '...' : encryptedString,
    encryptionEnabled: ENABLE_ENCRYPTION,
    cryptoAvailable: isCryptoAvailable()
  });

  if (!ENABLE_ENCRYPTION || !isCryptoAvailable()) {
    console.log(`[DEBUG] Encryption disabled or crypto unavailable, parsing as JSON`);
    try {
      return JSON.parse(encryptedString);
    } catch (parseError) {
      console.error(`[DEBUG] JSON parse failed:`, parseError);
      return encryptedString;
    }
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
      console.log(`[DEBUG] No encryption key available, falling back to JSON parse`);
      return JSON.parse(encryptedString);
    }

    // Extract IV (first 12 bytes)
    const iv = bytes.slice(0, 12);
    const encryptedData = bytes.slice(12);

    console.log(`[DEBUG] Attempting decryption with key and IV`);
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decryptedData);
    console.log(`[DEBUG] Decrypted text:`, decryptedText);
    
    const result = JSON.parse(decryptedText);
    console.log(`[DEBUG] Final decrypted result:`, result);
    return result;
  } catch (error) {
    console.error("Decryption error:", error);
    // Try to parse as unencrypted if decryption fails
    try {
      const fallbackResult = JSON.parse(encryptedString);
      console.log(`[DEBUG] Fallback JSON parse successful:`, fallbackResult);
      return fallbackResult;
    } catch (parseError) {
      console.error(`[DEBUG] Fallback JSON parse failed:`, parseError);
      return null;
    }
  }
};

// Function to show a network error (mobile compatible)
const showNetworkErrorOnce = () => {
  if (!hasShownNetworkError) {
    hasShownNetworkError = true;
    console.warn("Network error connecting to cloud. Using local storage instead.");
    // In mobile apps, you could show a Toast notification here
  }
};

// Better validation for the Appwrite endpoint URL
function validateAppwriteEndpoint(endpoint) {
  if (!endpoint) {
    logAppwriteInfo(
      "No Appwrite endpoint provided. Check your environment variables."
    );
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

// Try to initialize Appwrite client
if (ENABLE_CLOUD_FEATURES && !FORCE_LOCAL_MODE) {
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
        appwriteClient.setProject("67d6ea990025fa097964");
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
  }
}

// Cloud connection check function
export async function checkCloudConnection() {
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
export const createAccount = async (email, password, name) => {
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
          "67d6b079002144822b5e",
          USERS_COLLECTION_ID,
          ID.unique(),
          {
            userId: newAccount.$id,
            email: email,
            name: name,
            syncEnabled: false,
          }
        );
        
        // Send verification email
        const verificationRedirectUrl = 'https://gradetracker.app/verify-email';
          
        try {
          // Create verification URL
          await account.createVerification(verificationRedirectUrl);
          console.log("Verification email sent to:", email);
        } catch (verifyError) {
          console.error("Error sending verification email:", verifyError);
          // We continue even if verification email fails
        }
      } catch (dbError) {
        console.error("Error creating user document:", dbError);
      }
    }

    return newAccount;
  } catch (error) {
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

export const login = async (email, password) => {
  if (!ENABLE_CLOUD_FEATURES || FORCE_LOCAL_MODE || !account) {
    showNetworkErrorOnce();
    throw new Error("Cloud features are unavailable. Please try again later.");
  }

  try {
    return await account.createEmailPasswordSession(email, password);
  } catch (error) {
    // Check for MFA requirements separately - this needs special handling
    if (
      error.type === 'user_mfa_challenge' || 
      error.type === 'user_more_factors_required' ||
      error.message?.includes('More factors are required')
    ) {
      console.log('MFA challenge required during login');
      // Pass through the MFA challenge error for handling
      throw error;
    }
    
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
  } catch (error) {
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

    // Check if MFA verification is complete or required
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
          isAdmin: userData.isAdmin || false,
          twoFactorEnabled: userData.twoFactorEnabled || currentAccount.mfa || false
        };
      } else {
        // If user document doesn't exist, create it
        try {
          const userDoc = await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            ID.unique(),
            {
              userId: currentAccount.$id,
              email: currentAccount.email,
              name: currentAccount.name || "User",
              syncEnabled: false,
              isAdmin: false,
              twoFactorEnabled: currentAccount.mfa || false
            }
          );
          
          console.log('Created user document:', userDoc.$id);
        } catch (dbError) {
          console.error("Error creating missing user document:", dbError);
        }

        // Return basic user info
        return {
          id: currentAccount.$id,
          email: currentAccount.email,
          name: currentAccount.name || "User",
          syncEnabled: false,
          isAdmin: false,
          twoFactorEnabled: currentAccount.mfa || false
        };
      }
    } catch (dbError) {
      console.error("Error fetching user document:", dbError);
      
      // Check if this is an MFA error
      if (
        dbError.type === 'user_mfa_challenge' || 
        dbError.type === 'user_more_factors_required' ||
        dbError.message?.includes('More factors are required')
      ) {
        throw dbError; // Re-throw MFA errors for handling
      }

      // Return basic user info if database operations fail
      return {
        id: currentAccount.$id,
        email: currentAccount.email,
        name: currentAccount.name || "User",
        syncEnabled: false,
        isAdmin: false,
        twoFactorEnabled: currentAccount.mfa || false
      };
    }
  } catch (error) {
    console.error("Error getting current user:", error);

    // Check for MFA errors
    if (
      error.type === 'user_mfa_challenge' || 
      error.type === 'user_more_factors_required' ||
      error.message?.includes('More factors are required')
    ) {
      throw error; // Let the caller handle MFA errors
    }
    
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

// Helper function to sanitize objects before sending to Appwrite
function sanitizeForAppwrite(obj) {
  // Create a new clean object with only allowed fields
  const sanitized = {};

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

// Fixed and simplified subject syncing
export const syncSubjectsToCloud = async (userId, subjects) => {
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
              await databases.createDocument(
                config.databaseId,
                config.gradesCollectionId,
                ID.unique(),
                sanitizeForAppwrite({
                  userId: userId,
                  subjectid: subject.id,
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

// Fixed and simplified fetching of subjects and grades
export const getSubjectsFromCloud = async (userId) => {
  try {
    console.log(`[Cloud] Fetching subjects for user ${userId}`);
    const databases = getDatabases();

    // Create array to hold results
    const results = [];

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
          const subject = {
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

          const grades = [];

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
                  .substring(2, 9)}`;              // Decrypt value with enhanced debugging
              let value = 0;
              console.log(`[DEBUG] Raw grade value from DB:`, doc.value, typeof doc.value);
              
              try {
                if (doc.value) {
                  console.log(`[DEBUG] Attempting to decrypt value for user ${userId}`);
                  const decryptedValue = await decrypt(userId, doc.value);
                  console.log(`[DEBUG] Decrypted value result:`, decryptedValue, typeof decryptedValue);
                  value = decryptedValue || 0;
                }
              } catch (decryptError) {
                console.error(
                  "[Cloud] Error decrypting grade value:",
                  decryptError,
                  "Raw value was:",
                  doc.value
                );
                // Try to parse as plain number if decryption fails
                value = typeof doc.value === "number" ? doc.value : 0;
                
                // Also try parsing as JSON in case it's stored as plain JSON
                try {
                  const parsed = JSON.parse(doc.value);
                  if (typeof parsed === "number") {
                    value = parsed;
                    console.log(`[DEBUG] Successfully parsed as JSON number:`, value);
                  }
                } catch (jsonError) {
                  console.log(`[DEBUG] Could not parse as JSON either`);
                }
              }

              // Create grade object
              const grade = {
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

export default {
  syncSubjectsToCloud,
  getSubjectsFromCloud,
};
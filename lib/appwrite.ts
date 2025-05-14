import { Client, Account, Databases, ID, Query } from "appwrite";

// Feature flag to enable/disable cloud features
export const ENABLE_CLOUD_FEATURES = true;

// Feature flag to enable/disable encryption
export const ENABLE_ENCRYPTION = true;

// Appwrite configuration from environment variables
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.nief.tech/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "67d6ea990025fa097964";

// Database configuration from environment variables
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

// Initialize client with environment values
export const getClient = () => {
  if (!appwriteClient) {
    console.log("[Appwrite] Initializing client with environment values");
    appwriteClient = new Client();
    
    try {
      appwriteClient.setEndpoint(ENDPOINT);
      console.log("[Appwrite] Endpoint set:", ENDPOINT);
      console.log("[Appwrite] Env endpoint:", process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
      
      appwriteClient.setProject("67d6ea990025fa097964");
      console.log("[Appwrite] Project ID set:", PROJECT_ID);
      console.log("[Appwrite] Env project ID:", process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
      
      // Log database info
      console.log("[Appwrite] Database ID:", DATABASE_ID);
      console.log("[Appwrite] Env database ID:", process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
      
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
    console.log("[Appwrite] Current account:", currentAccount.$id);
    console.log("[Appwrite] Using DATABASE_ID:", DATABASE_ID);
    console.log("[Appwrite] Using USERS_COLLECTION_ID:", USERS_COLLECTION_ID);
    
    // Debug output to check environment variables
    console.log("[Appwrite] Env DATABASE_ID:", process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);

    try {
      // Get user document
      const users = await databasesService.listDocuments(
        "67d6b079002144822b5e",
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
          "67d6b079002144822b5e",
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

// Create account function
export const createAccount = async (email: string, password: string, name: string) => {
  try {
    const accountService = getAccount();
    const databasesService = getDatabases();
    
    // Create the account
    const newAccount = await accountService.create(ID.unique(), email, password, name);
    
    // Create user document
    await databasesService.createDocument(
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
    
    // Log the user in
    await accountService.createEmailPasswordSession(email, password);
    
    return newAccount;
  } catch (error) {
    console.error("[Appwrite] Create account error:", error);
    throw error;
  }
};

// Update user sync preference
export const updateUserSyncPreference = async (userId: string, syncEnabled: boolean) => {
  try {
    const databasesService = getDatabases();
    
    // Find user document
    const users = await databasesService.listDocuments(
      "67d6b079002144822b5e",
      USERS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    
    if (users.documents.length > 0) {
      const userDoc = users.documents[0];
      
      // Update the sync preference
      await databasesService.updateDocument(
        "67d6b079002144822b5e",
        USERS_COLLECTION_ID,
        userDoc.$id,
        {
          syncEnabled: syncEnabled
        }
      );
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("[Appwrite] Update sync preference error:", error);
    throw error;
  }
};

// Delete account function
export const deleteAccount = async () => {
  try {
    const accountService = getAccount();
    
    // Delete the user's account
    await accountService.deleteSession('current');
    
    // Note: In Appwrite v17+, there's no direct method to delete your own account
    // You would typically need to implement this on the server side
    // This function now just logs out the user as a workaround
    console.log("[Appwrite] Account deletion requested - user logged out");
    
    return true;
  } catch (error) {
    console.error("[Appwrite] Delete account error:", error);
    throw error;
  }
};

// Delete all cloud data function
export const deleteAllCloudData = async (userId: string) => {
  try {
    const databasesService = getDatabases();
    
    // Find and delete user's subjects
    const subjects = await databasesService.listDocuments(
      DATABASE_ID,
      SUBJECTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    
    for (const subject of subjects.documents) {
      await databasesService.deleteDocument(
        DATABASE_ID,
        SUBJECTS_COLLECTION_ID,
        subject.$id
      );
    }
    
    // Find and delete user's grades
    const grades = await databasesService.listDocuments(
      DATABASE_ID,
      GRADES_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    
    for (const grade of grades.documents) {
      await databasesService.deleteDocument(
        DATABASE_ID,
        GRADES_COLLECTION_ID,
        grade.$id
      );
    }
    
    // Find and delete user's timetable entries
    const timetableEntries = await databasesService.listDocuments(
      DATABASE_ID,
      TIMETABLE_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    
    for (const entry of timetableEntries.documents) {
      await databasesService.deleteDocument(
        DATABASE_ID,
        TIMETABLE_COLLECTION_ID,
        entry.$id
      );
    }
    
    // Find and delete user's tests
    const tests = await databasesService.listDocuments(
      DATABASE_ID,
      TESTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    
    for (const test of tests.documents) {
      await databasesService.deleteDocument(
        DATABASE_ID,
        TESTS_COLLECTION_ID,
        test.$id
      );
    }
    
    return true;
  } catch (error) {
    console.error("[Appwrite] Delete all cloud data error:", error);
    throw error;
  }
};

// Cloud data retrieval functions
export const getSubjectsFromCloud = async (userId: string) => {
  try {
    console.log("[Appwrite] Fetching subjects from cloud for user:", userId);
    const databasesService = getDatabases();
    
    const [subjects, grades] = await Promise.all([
      databasesService.listDocuments(
        "67d6b079002144822b5e",
        SUBJECTS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      ),
      databasesService.listDocuments(
        "67d6b079002144822b5e",
        GRADES_COLLECTION_ID,
        [Query.equal("userId", userId)]
      )
    ]);
    
    console.log("[Appwrite] Fetched subjects:", subjects.documents.length);
    console.log("[Appwrite] Fetched grades:", grades.documents.length);
    
    // Transform the database structure to match the application's expected structure
    const transformedSubjects = subjects.documents.map(subject => {
      try {
        // Make sure we have a valid ID
        const id = subject.subjectid || subject.id || subject.$id;
        if (!id) {
          console.error("[Appwrite] Subject missing ID:", subject);
          return null;
        }          // Find all grades for this subject - debug version with enhanced logging
        console.log(`[Appwrite] Looking for grades for subject ${id} (${subject.name})`);
        
        // First, log all grade fields to detect issues
        for (let i = 0; i < Math.min(grades.documents.length, 3); i++) {
          const g = grades.documents[i];
          console.log(`[Appwrite] Grade ${i} fields:`, {
            id: g.$id,
            subjectId: g.subjectId,
            subjectid: g.subjectid,
            value: typeof g.value === 'string' ? g.value.substring(0, 10) + '...' : g.value,
            valueType: typeof g.value
          });
        }
        
        const subjectGrades = grades.documents
          .filter(grade => {
            // More comprehensive check for subject relationship
            const matches = grade.subjectId === id || 
                           grade.subjectid === id || 
                           grade.subject_id === id ||
                           grade.SubjectId === id;
            
            if (matches) {
              console.log(`[Appwrite] Found matching grade for subject ${id}`);
            }
            return matches;
          })
          .map(grade => {
            console.log(`[Appwrite] Processing grade for subject ${id}:`, {
              gradeId: grade.$id || grade.id || grade.gradeid,
              value: typeof grade.value === 'string' ? grade.value.substring(0, 10) + '...' : grade.value
            });
            
            // Handle potentially encrypted values with better fallbacks
            let gradeValue = 5; // Default to 5 as a reasonable middle value
            try {
              if (typeof grade.value === 'string') {
                if (!isNaN(parseFloat(grade.value))) {
                  gradeValue = parseFloat(grade.value);
                  console.log(`[Appwrite] Parsed numeric grade: ${gradeValue}`);
                } else if (grade.value.length > 20) {
                  // Likely encrypted
                  console.log(`[Appwrite] Using default for encrypted grade value`);
                }
              } else if (typeof grade.value === 'number') {
                gradeValue = grade.value;
                console.log(`[Appwrite] Using numeric grade: ${gradeValue}`);
              }
            } catch (e) {
              console.log("[Appwrite] Error parsing grade value:", e);
            }
            
            // Similar approach for weight
            let gradeWeight = 1; 
            try {
              if (typeof grade.weight === 'string' && !isNaN(parseFloat(grade.weight))) {
                gradeWeight = parseFloat(grade.weight);
              } else if (typeof grade.weight === 'number') {
                gradeWeight = grade.weight;
              }
            } catch (e) {
              console.log("[Appwrite] Error parsing grade weight:", e);
            }
            
            return {
              id: grade.gradeid || grade.id || grade.$id,
              subjectId: grade.subjectId || grade.subjectid,
              value: gradeValue,
              weight: gradeWeight,
              name: grade.name || grade.type || "",
              date: grade.date || grade.$createdAt
            };
          });
            // Make sure we have a valid name
        const name = subject.name || "";
        if (!name) {
          console.error("[Appwrite] Subject missing name:", subject);
          return null;
        }
        
        // Calculate the average grade
        let averageGrade = 0;
        if (subjectGrades.length > 0) {
          const totalWeight = subjectGrades.reduce((sum, grade) => sum + (grade.weight || 1), 0);
          const weightedSum = subjectGrades.reduce((sum, grade) => sum + (grade.value * (grade.weight || 1)), 0);
          
          if (totalWeight > 0) {
            averageGrade = parseFloat((weightedSum / totalWeight).toFixed(2));
          }
        }
        
        return {
          id: id,
          name: name,
          grades: subjectGrades,  // Attach grades directly
          averageGrade: averageGrade, // Calculated from attached grades
          userId: subject.userId,
          // Include additional fields that might be needed
          weight: parseFloat(subject.weight) || 1,
          color: subject.color || "#3498db",
          created: subject.$createdAt,
          updated: subject.$updatedAt
        };
      } catch (err) {
        console.error("Error transforming subject:", subject, err);
        return null;
      }
    }).filter(Boolean); // Filter out any null values from failed transformations
    
    return transformedSubjects;
  } catch (error) {
    console.error("[Appwrite] Error fetching subjects from cloud:", error);
    throw error;
  }
};

export const getGradesFromCloud = async (userId: string) => {
  try {
    console.log("[Appwrite] Fetching grades from cloud for user:", userId);
    const databasesService = getDatabases();
    
    const grades = await databasesService.listDocuments(
      "67d6b079002144822b5e",
      GRADES_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    
    console.log("[Appwrite] Fetched grades:", grades.documents.length);
    
    // Log the first grade to debug the structure
    if (grades.documents.length > 0) {
      console.log("[Appwrite] Sample grade structure:", JSON.stringify(grades.documents[0]));
      
      // Log some key fields to help debug the issue
      const firstGrade = grades.documents[0];
      console.log("[Appwrite] Key grade fields:", {
        id: firstGrade.$id,
        subjectId: firstGrade.subjectId || firstGrade.subjectid,
        value: typeof firstGrade.value === 'string' ? 
          (firstGrade.value.length > 30 ? firstGrade.value.substring(0, 10) + '...' : firstGrade.value) : 
          firstGrade.value,
        valueType: typeof firstGrade.value,
        weight: firstGrade.weight,
        name: firstGrade.name,
        isValueEncrypted: typeof firstGrade.value === 'string' && 
                        firstGrade.value.length > 20 && 
                        isNaN(parseFloat(firstGrade.value))
      });
    }
    
    // Transform the database structure to match the application's expected structure
    const transformedGrades = grades.documents.map(grade => {
      try {        // Handle encryption - try to parse if it's a number or use encrypted value
        let gradeValue = 0;
        try {
          if (typeof grade.value === 'string' && !isNaN(parseFloat(grade.value))) {
            gradeValue = parseFloat(grade.value);
          } else if (typeof grade.value === 'number') {
            gradeValue = grade.value;
          } else {
            // Handle encrypted values with a reasonable default
            console.log("[Appwrite] Detected likely encrypted value:", 
              typeof grade.value === 'string' ? grade.value.substring(0, 10) + '...' : typeof grade.value);
            gradeValue = 5; // Default for encrypted values
          }
        } catch (e) {
          console.log("[Appwrite] Could not parse grade value, might be encrypted:", grade.value);
          gradeValue = 5; // Use 5 as a reasonable default
        }
        
        // Handle weight the same way
        let gradeWeight = 1;
        try {
          if (typeof grade.weight === 'string' && !isNaN(parseFloat(grade.weight))) {
            gradeWeight = parseFloat(grade.weight);
          } else if (typeof grade.weight === 'number') {
            gradeWeight = grade.weight;
          } else if (grade.weight !== undefined && grade.weight !== null) {
            // Handle encrypted weights
            console.log("[Appwrite] Detected likely encrypted weight, using default");
          }
        } catch (e) {
          console.log("[Appwrite] Could not parse grade weight, might be encrypted:", grade.weight);
        }
        
        const transformedGrade = {
          id: grade.gradeid || grade.id || grade.$id,
          subjectId: grade.subjectId,
          value: gradeValue,
          weight: gradeWeight,
          name: grade.name || "",
          date: grade.date || grade.$createdAt,
          userId: grade.userId,
          created: grade.$createdAt,
          updated: grade.$updatedAt
        };
        
        return transformedGrade;
      } catch (err) {
        console.error("[Appwrite] Error transforming grade:", grade, err);
        return null;
      }
    }).filter(Boolean); // Filter out any null values
    
    return transformedGrades;
  } catch (error) {
    console.error("[Appwrite] Error fetching grades from cloud:", error);
    throw error;
  }
};

export const getTimetableFromCloud = async (userId: string) => {
  try {
    console.log("[Appwrite] Fetching timetable from cloud for user:", userId);
    const databasesService = getDatabases();
    
    const entries = await databasesService.listDocuments(
      "67d6b079002144822b5e",
      TIMETABLE_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    
    console.log("[Appwrite] Fetched timetable entries:", entries.documents.length);
    
    // Transform the database structure to match the application's expected structure
    const transformedEntries = entries.documents.map(entry => {
      return {
        id: entry.entryId || entry.id || entry.$id,
        day: entry.day,
        hour: entry.hour,
        subjectId: entry.subjectId,
        userId: entry.userId,
        room: entry.room || "",
        created: entry.$createdAt,
        updated: entry.$updatedAt
      };
    });
    
    return transformedEntries;
  } catch (error) {
    console.error("[Appwrite] Error fetching timetable from cloud:", error);
    throw error;
  }
};

export const getTestsFromCloud = async (userId: string) => {
  try {
    console.log("[Appwrite] Fetching tests from cloud for user:", userId);
    const databasesService = getDatabases();
    
    const tests = await databasesService.listDocuments(
      "67d6b079002144822b5e",
      TESTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    
    console.log("[Appwrite] Fetched tests:", tests.documents.length);
    
    // Transform the database structure to match the application's expected structure
    const transformedTests = tests.documents.map(test => {
      return {
        id: test.testId || test.id || test.$id,
        subjectId: test.subjectId,
        name: test.name || "",
        date: test.date,
        details: test.details || "",
        userId: test.userId,
        created: test.$createdAt,
        updated: test.$updatedAt
      };
    });
    
    return transformedTests;
  } catch (error) {
    console.error("[Appwrite] Error fetching tests from cloud:", error);
    throw error;
  }
};

// Save grades to cloud
export const saveGradesToCloud = async (userId: string, grades: any[]) => {
  try {
    console.log("[Appwrite] Saving grades to cloud for user:", userId, "Count:", grades.length);
    const databasesService = getDatabases();
    
    // Delete existing grades for this user
    const existingGrades = await databasesService.listDocuments(
      "67d6b079002144822b5e",
      GRADES_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    
    console.log("[Appwrite] Deleting existing grades:", existingGrades.documents.length);
    
    for (const grade of existingGrades.documents) {
      await databasesService.deleteDocument(
        "67d6b079002144822b5e",
        GRADES_COLLECTION_ID,
        grade.$id
      );
    }
    
    // Create new grade documents
    for (const grade of grades) {
      console.log("[Appwrite] Saving grade:", JSON.stringify(grade));
      
      // Ensure the value is stored as a string to avoid floating point issues
      const gradeToSave = {
        ...grade,
        value: String(grade.value),
        weight: String(grade.weight || 1),
        gradeid: grade.id,
        userId: userId
      };
      
      await databasesService.createDocument(
        "67d6b079002144822b5e",
        GRADES_COLLECTION_ID,
        ID.unique(),
        gradeToSave
      );
    }
    
    console.log("[Appwrite] Successfully saved grades to cloud");
    return true;
  } catch (error) {
    console.error("[Appwrite] Error saving grades to cloud:", error);
    throw error;
  }
};

// Save subjects to cloud
export const saveSubjectsToCloud = async (userId: string, subjects: any[]) => {
  try {
    console.log("[Appwrite] Saving subjects to cloud for user:", userId);
    const databasesService = getDatabases();
    
    // Delete existing subjects for this user
    const existingSubjects = await databasesService.listDocuments(
      "67d6b079002144822b5e",
      SUBJECTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    
    for (const subject of existingSubjects.documents) {
      await databasesService.deleteDocument(
        "67d6b079002144822b5e",
        SUBJECTS_COLLECTION_ID,
        subject.$id
      );
    }
    
    // Create new subject documents
    for (const subject of subjects) {
      const subjectToSave = {
        ...subject,
        subjectid: subject.id,
        userId: userId,
        // Make sure grades array is not saved directly in subject document
        grades: []
      };
      
      await databasesService.createDocument(
        "67d6b079002144822b5e",
        SUBJECTS_COLLECTION_ID,
        ID.unique(),
        subjectToSave
      );
    }
    
    console.log("[Appwrite] Saved subjects to cloud:", subjects.length);
    return true;
  } catch (error) {
    console.error("[Appwrite] Error saving subjects to cloud:", error);
    throw error;
  }
};

// Export for convenience
// Associate subjects and grades before returning
export const getSyncedSubjectsWithGrades = async (userId: string) => {
  console.log("[Appwrite] Getting synchronized subjects with grades for user:", userId);
  
  try {
    // First get all subjects
    const subjects = await getSubjectsFromCloud(userId);
    console.log("[Appwrite] Retrieved subjects:", subjects.length);
    
    // Then get all grades
    const grades = await getGradesFromCloud(userId);
    console.log("[Appwrite] Retrieved grades:", grades.length);
    
    // Associate grades with their subjects
    const subjectsWithGrades = subjects.filter(subject => subject !== null).map(subject => {
      // Find all grades for this subject (check both subjectId and subjectid)
      const subjectGrades = grades
        .filter(grade => grade !== null && (grade.subjectId === subject.id || grade.subjectid === subject.id));
      
      // Create a new subject object with the grades included
      return {
        ...subject,
        grades: subjectGrades,
        // Recalculate average if needed
        averageGrade: calculateGradeAverage(subjectGrades)
      };
    });
    
    console.log("[Appwrite] Returning subjects with associated grades:", subjectsWithGrades.length);
    return subjectsWithGrades;
  } catch (error) {
    console.error("[Appwrite] Error getting synced subjects with grades:", error);
    throw error;
  }
};

// Helper function to calculate grade averages
const calculateGradeAverage = (grades: any[]) => {
  if (!grades || grades.length === 0) return 0;
  
  // Calculate weighted average
  let totalWeight = 0;
  let weightedSum = 0;
  
  grades.forEach(grade => {
    const value = parseFloat(grade.value) || 0;
    const weight = parseFloat(grade.weight) || 1;
    weightedSum += value * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(2)) : 0;
};

export default {
  getClient,
  getAccount,
  getDatabases,
  login,
  logout,
  getCurrentUser,
  createAccount,
  updateUserSyncPreference,
  deleteAccount,
  deleteAllCloudData,
  getSubjectsFromCloud,
  getGradesFromCloud, 
  getTimetableFromCloud,
  getTestsFromCloud,
  saveGradesToCloud,
  saveSubjectsToCloud,
  getSyncedSubjectsWithGrades // Add the new function to the exports
};
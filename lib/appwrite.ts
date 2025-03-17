import { Client, Account, Databases, ID, Query } from "appwrite";

// Feature flag to enable/disable cloud features
export const ENABLE_CLOUD_FEATURES = true; // Set to true to enable cloud features

// Flag to track if we've already shown the network error
let hasShownNetworkError = false;

// Appwrite configuration
const appwriteEndpoint = "https://appwrite.nief.tech/v1";
const appwriteProjectId = "67d6ea990025fa097964"; // Replace with your actual project ID

// Database configuration
export const DATABASE_ID = "67d6b079002144822b5e";
export const USERS_COLLECTION_ID = "67d6b0ac000fc4ecaaaf";
export const SUBJECTS_COLLECTION_ID = "67d6b0be003d69d6d863";
export const GRADES_COLLECTION_ID = "67d6b0c600002e7b01f5";

// Initialize Appwrite client only if cloud features are enabled
let appwriteClient: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;

// Function to check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

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
    document.body.appendChild(toast);

    // Remove the toast after 5 seconds
    setTimeout(() => {
      toast.classList.add("opacity-0", "transition-opacity", "duration-300");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 5000);

    // Add click event to close button
    const closeButton = toast.querySelector("button");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        document.body.removeChild(toast);
      });
    }
  }
};

// Try to initialize Appwrite client
if (ENABLE_CLOUD_FEATURES && isBrowser) {
  try {
    appwriteClient = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId);
    account = new Account(appwriteClient);
    databases = new Databases(appwriteClient);
  } catch (error) {
    console.error("Failed to initialize Appwrite client:", error);
    showNetworkErrorOnce();
  }
}

// Helper functions for authentication
export const createAccount = async (
  email: string,
  password: string,
  name: string
) => {
  if (!ENABLE_CLOUD_FEATURES || !account || !databases) {
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
  if (!ENABLE_CLOUD_FEATURES || !account) {
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
  if (!ENABLE_CLOUD_FEATURES || !account) {
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
  if (!ENABLE_CLOUD_FEATURES || !account || !databases) {
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
  if (!ENABLE_CLOUD_FEATURES || !databases) {
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

export const syncSubjectsToCloud = async (userId: string, subjects: any[]) => {
  // Ensure all subjects have required fields
  subjects = subjects.map((subject) => ({
    ...subject,
    id: subject.id || ID.unique(),
  }));
  if (!ENABLE_CLOUD_FEATURES || !databases) {
    return false;
  }

  const timestamp = new Date().toISOString();

  try {
    // First, delete all existing subjects for this user
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
      console.error("Error deleting existing subjects:", error);
    }

    // Then, create new subject documents
    for (const subject of subjects) {
      await databases.createDocument(
        DATABASE_ID,
        SUBJECTS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          subjectid: subject.id,
          name: subject.name,
          averageGrade: subject.averageGrade || 0,
        }
      );

      // Sync grades for this subject
      await syncGradesToCloud(userId, subject.id, subject.grades || []);
    }

    return true;
  } catch (error: any) {
    console.error("Error syncing subjects to cloud:", error);

    if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      return false;
    } else {
      return false;
    }
  }
};

export const syncGradesToCloud = async (
  userId: string,
  subjectid: string,
  grades: any[]
) => {
  if (!ENABLE_CLOUD_FEATURES || !databases) {
    return false;
  }

  try {
    // First, delete all existing grades for this subject
    try {
      const existingGrades = await databases.listDocuments(
        DATABASE_ID,
        GRADES_COLLECTION_ID,
        [Query.equal("userId", userId), Query.equal("subjectid", subjectid)]
      );

      for (const doc of existingGrades.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          GRADES_COLLECTION_ID,
          doc.$id
        );
      }
    } catch (error) {
      console.error("Error deleting existing grades:", error);
    }

    // Then, create new grade documents
    for (const grade of grades) {
      await databases.createDocument(
        DATABASE_ID,
        GRADES_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          subjectid: subjectid,
          value: grade.value, // Changed from gradeValue to value to match expected schema
          type: grade.type,
          date: grade.date,
          weight: grade.weight || 1.0,
        }
      );
    }

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

export const getSubjectsFromCloud = async (userId: string) => {
  if (!ENABLE_CLOUD_FEATURES || !databases) {
    console.warn("Cloud features are disabled or database is not initialized");
    return [];
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      SUBJECTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    if (!response.documents || response.documents.length === 0) {
      console.warn("No subjects found in cloud storage");
      return [];
    }

    // Process the documents to extract subject data
    const result = await Promise.all(
      response.documents.map(async (subjectDoc) => {
        try {
          // Get grades for this subject
          const grades = await databases.listDocuments(
            DATABASE_ID,
            GRADES_COLLECTION_ID,
            [
              Query.equal("userId", userId),
              Query.equal("subjectid", subjectDoc.subjectid),
            ]
          );

          const formattedGrades = grades.documents.map((grade) => ({
            value: grade.value, // Using value instead of gradeValue
            type: grade.type,
            date: grade.date,
            weight: grade.weight || 1.0,
          }));

          return {
            id: subjectDoc.subjectid, // Using subjectid (lowercase) to match database schema
            name: subjectDoc.name,
            grades: formattedGrades,
            averageGrade: subjectDoc.averageGrade || 0,
          };
        } catch (gradeError) {
          console.error(
            `Error fetching grades for subject ${subjectDoc.subjectid}:`,
            gradeError
          );
          return {
            id: subjectDoc.subjectid,
            name: subjectDoc.name,
            grades: [],
            averageGrade: 0,
          };
        }
      })
    );

    return result.filter(Boolean);
  } catch (error: any) {
    console.error("Error getting subjects from cloud:", error);

    if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      console.warn(
        "Network error when fetching cloud subjects. Using local data."
      );
      return [];
    } else {
      return [];
    }
  }
};

// Delete a subject and all its grades from cloud
export const deleteSubjectFromCloud = async (
  userId: string,
  subjectId: string
) => {
  if (!ENABLE_CLOUD_FEATURES || !databases) {
    return false;
  }

  try {
    // First, delete all grades for this subject
    try {
      const existingGrades = await databases.listDocuments(
        DATABASE_ID,
        GRADES_COLLECTION_ID,
        [Query.equal("userId", userId), Query.equal("subjectid", subjectId)]
      );

      for (const doc of existingGrades.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          GRADES_COLLECTION_ID,
          doc.$id
        );
      }
    } catch (error) {
      console.error("Error deleting grades for subject:", error);
    }

    // Then, delete the subject document
    try {
      const existingSubjects = await databases.listDocuments(
        DATABASE_ID,
        SUBJECTS_COLLECTION_ID,
        [Query.equal("userId", userId), Query.equal("subjectid", subjectId)]
      );

      for (const doc of existingSubjects.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          SUBJECTS_COLLECTION_ID,
          doc.$id
        );
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error("Error deleting subject from cloud:", error);

    if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      return false;
    } else {
      return false;
    }
  }
};

// Delete a specific grade from a subject
export const deleteGradeFromCloud = async (
  userId: string,
  subjectId: string,
  gradeToDelete: Grade
) => {
  if (!ENABLE_CLOUD_FEATURES || !databases) {
    return false;
  }

  try {
    // Find the grade document by matching all its properties
    const grades = await databases.listDocuments(
      DATABASE_ID,
      GRADES_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("subjectid", subjectId),
        Query.equal("value", gradeToDelete.value),
        Query.equal("type", gradeToDelete.type),
        Query.equal("date", gradeToDelete.date),
      ]
    );

    // Delete the matching grade document
    if (grades.documents.length > 0) {
      await databases.deleteDocument(
        DATABASE_ID,
        GRADES_COLLECTION_ID,
        grades.documents[0].$id
      );
      return true;
    }

    return false;
  } catch (error: any) {
    console.error("Error deleting grade from cloud:", error);

    if (error.message && error.message.includes("NetworkError")) {
      showNetworkErrorOnce();
      return false;
    } else {
      return false;
    }
  }
};

// Delete all cloud data for a user but keep their account
export const deleteAllCloudData = async (userId: string) => {
  if (!ENABLE_CLOUD_FEATURES || !databases) {
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
  if (!ENABLE_CLOUD_FEATURES || !account || !databases) {
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

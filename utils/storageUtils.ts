import type { Subject, Grade } from "../types/grades";
import {
  syncSubjectsToCloud,
  getSubjectsFromCloud,
  ENABLE_CLOUD_FEATURES,
  deleteGradeFromCloud,
  deleteSubjectFromCloud,
} from "@/lib/appwrite";
import { initializeSubjects } from "./cookieUtils";

const STORAGE_KEY = "gradeCalculator";

// Debug function to log storage operations
const logStorageOperation = (operation: string, data: any) => {
  console.log(`Storage ${operation}:`, data);
};

// Notify other components that subjects have been updated
export function notifySubjectsUpdated(): void {
  if (typeof window !== "undefined") {
    const event = new Event("subjectsUpdated");
    window.dispatchEvent(event);
  }
}

// Save subjects to localStorage with error handling
export async function saveSubjectsToStorage(
  subjects: Subject[],
  userId?: string,
  syncEnabled?: boolean
): boolean {
  const timestamp = new Date().toISOString();
  localStorage.setItem("lastSyncTimestamp", timestamp);
  try {
    const subjectsJson = JSON.stringify(subjects);
    logStorageOperation("saving", subjects);
    localStorage.setItem(STORAGE_KEY, subjectsJson);
    notifySubjectsUpdated();

    // If cloud features are enabled, user is logged in, and sync is enabled, sync to cloud
    if (ENABLE_CLOUD_FEATURES && userId && syncEnabled) {
      try {
        const syncSuccess = await syncSubjectsToCloud(userId, subjects);
        if (!syncSuccess) {
          console.log("Cloud sync failed - using local storage");
          window.dispatchEvent(new Event("syncPreferenceChanged"));
        }
      } catch (error) {
        console.error("Sync error:", error);
        window.dispatchEvent(new Event("syncPreferenceChanged"));
      }
    }

    return true;
  } catch (error) {
    console.error("Error saving subjects to localStorage:", error);
    return false;
  }
}

// Validate and normalize subject structures
function validateAndNormalizeSubjects(subjects: Subject[]): Subject[] {
  return subjects.filter((subject) => {
    if (!subject.id || !subject.name) {
      console.error("Invalid subject structure:", subject);
      return false;
    }
    subject.grades = subject.grades || [];
    subject.averageGrade = calculateAverage(subject.grades);
    return true;
  });
}

// Get subjects from localStorage or cloud with error handling
export async function getSubjectsFromStorage(
  userId?: string,
  syncEnabled?: boolean
): Promise<Subject[]> {
  try {
    // If cloud features are enabled, user is logged in, and sync is enabled, try to get from cloud first
    if (ENABLE_CLOUD_FEATURES && userId && syncEnabled) {
      console.log("Attempting to fetch subjects from cloud...");
      try {
        const cloudSubjects = await getSubjectsFromCloud(userId);
        console.log("Cloud subjects received:", cloudSubjects);

        if (cloudSubjects && Array.isArray(cloudSubjects)) {
          const validatedCloudSubjects =
            validateAndNormalizeSubjects(cloudSubjects);
          console.log("Validated cloud subjects:", validatedCloudSubjects);

          // Get local subjects to compare with cloud subjects
          const localSubjectsJson = localStorage.getItem(STORAGE_KEY);
          let localSubjects: Subject[] = [];

          if (localSubjectsJson) {
            try {
              localSubjects = JSON.parse(localSubjectsJson);
            } catch (e) {
              console.error("Error parsing local subjects:", e);
            }
          }

          // Find local subjects that don't exist in the cloud (were deleted on another device)
          const cloudSubjectIds = validatedCloudSubjects.map((s) => s.id);
          const localOnlySubjects = localSubjects.filter(
            (s) => !cloudSubjectIds.includes(s.id)
          );

          // Find local subjects that exist in cloud but need to sync their grades
          const syncNeededSubjects = localSubjects.filter(
            (s) =>
              cloudSubjectIds.includes(s.id) && s.grades && s.grades.length > 0
          );

          // First, upload any new grades from local subjects that exist in cloud
          for (const subject of syncNeededSubjects) {
            const cloudSubject = validatedCloudSubjects.find(
              (cs) => cs.id === subject.id
            );
            if (cloudSubject) {
              // Find grades in local that don't exist in cloud
              // We can't easily compare grade objects directly, so we'll just sync all grades
              // for subjects that have been modified locally
              const lastSyncTime = localStorage.getItem("lastSyncTimestamp");
              if (lastSyncTime) {
                const lastSync = new Date(lastSyncTime);
                const now = new Date();
                // If last sync was more than 5 minutes ago, or subject has more grades locally
                if (
                  now.getTime() - lastSync.getTime() > 5 * 60 * 1000 ||
                  subject.grades.length !== cloudSubject.grades.length
                ) {
                  await syncSubjectsToCloud(userId, [subject]);
                }
              }
            }
          }

          // Then handle deletions - remove local subjects that don't exist in cloud
          if (localOnlySubjects.length > 0) {
            console.log(
              `Found ${localOnlySubjects.length} subjects that were deleted in cloud but exist locally`
            );
            // Keep only subjects that exist in cloud
            const updatedLocalSubjects = localSubjects.filter((s) =>
              cloudSubjectIds.includes(s.id)
            );
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(updatedLocalSubjects)
            );
            console.log("Updated local storage to match cloud deletions");
          }

          if (validatedCloudSubjects && validatedCloudSubjects.length > 0) {
            console.log("Successfully fetched subjects from cloud");
            localStorage.setItem("lastSyncTimestamp", new Date().toISOString());
            const subjectsJson = JSON.stringify(validatedCloudSubjects);
            localStorage.setItem(STORAGE_KEY, subjectsJson);
            notifySubjectsUpdated();
            return validatedCloudSubjects;
          }
        }
        console.log(
          "No valid subjects found in cloud or invalid data structure, checking local storage"
        );
      } catch (error) {
        console.error("Error getting subjects from cloud:", error);
        // Continue to local storage on cloud error
      }
    } else {
      console.log("Cloud sync not enabled or user not logged in");
    }

    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return [];
    }

    const subjectsJson = localStorage.getItem(STORAGE_KEY);
    if (!subjectsJson) {
      console.log("No subjects found in localStorage - initializing defaults");
      const defaultSubjects = initializeSubjects();
      await saveSubjectsToStorage(defaultSubjects, userId, syncEnabled);
      return defaultSubjects;
    }

    let subjects: Subject[] = [];
    try {
      const parsedData = JSON.parse(subjectsJson);
      subjects = Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
      console.error("Error parsing subjects JSON:", e);
      console.error("Raw JSON data:", subjectsJson);
      subjects = [];
    }

    if (!Array.isArray(subjects)) {
      subjects = [];
      saveSubjectsToStorage(subjects, userId, syncEnabled);
      return subjects;
    }

    // Migrate existing grades to include weights
    const migratedSubjects = subjects.map((subject) => {
      if (subject.grades && subject.grades.length > 0) {
        subject.grades = subject.grades.map((grade) => {
          if (grade.weight === undefined) {
            // Assign weight based on type
            grade.weight = grade.type === "Test" ? 2.0 : 1.0;
          }
          return grade;
        });
        // Recalculate average with weights
        subject.averageGrade = calculateAverage(subject.grades);
      }
      return subject;
    });

    // Save migrated subjects back to storage
    if (JSON.stringify(subjects) !== JSON.stringify(migratedSubjects)) {
      saveSubjectsToStorage(migratedSubjects, userId, syncEnabled);
    }

    logStorageOperation("retrieving", migratedSubjects);
    return validateAndNormalizeSubjects(migratedSubjects);
  } catch (error) {
    console.error("Error retrieving subjects from localStorage:", error);
    const defaultSubjects = initializeSubjects();
    saveSubjectsToStorage(defaultSubjects, userId, syncEnabled);
    return defaultSubjects;
  }
}

// Add a grade to a specific subject
export async function addGradeToSubject(
  subjectid: string,
  grade: Grade,
  userId?: string,
  syncEnabled?: boolean
): Promise<boolean> {
  try {
    console.log(`Adding grade to subject ${subjectid}:`, grade);
    const subjects = await getSubjectsFromStorage(userId, syncEnabled);
    const subjectIndex = subjects.findIndex((s) => s.id === subjectid);

    if (subjectIndex === -1) {
      console.error(`Subject with id ${subjectid} not found`);
      return false;
    }

    const updatedSubject = { ...subjects[subjectIndex] };
    // Ensure grades array exists
    if (!updatedSubject.grades) {
      updatedSubject.grades = [];
    }

    updatedSubject.grades = [...updatedSubject.grades, grade];
    updatedSubject.averageGrade = calculateAverage(updatedSubject.grades);
    subjects[subjectIndex] = updatedSubject;
    const saveResult = await saveSubjectsToStorage(
      subjects,
      userId,
      syncEnabled
    );
    console.log("Subjects saved successfully:", saveResult);
    return saveResult;
  } catch (error) {
    console.error("Error adding grade to subject:", error);
    return false;
  }
}

// Delete a grade from a specific subject
export async function deleteGradeFromSubject(
  subjectid: string,
  gradeIndex: number,
  userId?: string,
  syncEnabled?: boolean
): Promise<boolean> {
  try {
    const subjects = await getSubjectsFromStorage(userId, syncEnabled);
    const subjectIndex = subjects.findIndex((s) => s.id === subjectid);

    if (subjectIndex === -1) {
      console.error(`Subject with id ${subjectId} not found`);
      return false;
    }

    const updatedSubject = { ...subjects[subjectIndex] };
    // Ensure grades array exists
    if (!updatedSubject.grades || updatedSubject.grades.length === 0) {
      return true; // Nothing to delete
    }

    // Store the deleted grade for cloud sync if needed
    const deletedGrade = updatedSubject.grades[gradeIndex];

    updatedSubject.grades = updatedSubject.grades.filter(
      (_, i) => i !== gradeIndex
    );
    updatedSubject.averageGrade = calculateAverage(updatedSubject.grades);
    subjects[subjectIndex] = updatedSubject;
    const saveResult = await saveSubjectsToStorage(
      subjects,
      userId,
      syncEnabled
    );

    // If we're connected to the cloud and have the userId, try to delete directly
    // from the cloud as well to ensure cross-device consistency
    if (
      ENABLE_CLOUD_FEATURES &&
      userId &&
      syncEnabled &&
      deleteGradeFromCloud
    ) {
      try {
        await deleteGradeFromCloud(userId, subjectid, deletedGrade);
      } catch (cloudError) {
        console.error(
          "Failed to delete grade from cloud directly:",
          cloudError
        );
        // Continue anyway as the change will be synced on the next full sync
      }
    }

    return saveResult;
  } catch (error) {
    console.error("Error deleting grade from subject:", error);
    return false;
  }
}

// Get a specific subject by ID
export async function getSubjectById(
  subjectId: string,
  userId?: string,
  syncEnabled?: boolean
): Promise<Subject | null> {
  try {
    const subjects = await getSubjectsFromStorage(userId, syncEnabled);
    const subject = subjects.find((s) => s.id === subjectId);
    return subject || null;
  } catch (error) {
    console.error("Error getting subject by ID:", error);
    return null;
  }
}

// Calculate average grade with weights
function calculateAverage(grades: Grade[]): number {
  if (!grades || grades.length === 0) return 0;

  // Calculate weighted sum and total weight
  const { weightedSum, totalWeight } = grades.reduce(
    (acc, grade) => {
      const weight = grade.weight || 1.0; // Default to 1.0 if weight is not defined
      return {
        weightedSum: acc.weightedSum + grade.value * weight,
        totalWeight: acc.totalWeight + weight,
      };
    },
    { weightedSum: 0, totalWeight: 0 }
  );

  // Return weighted average
  return Number.parseFloat((weightedSum / totalWeight).toFixed(2));
}

// Clear all grades data (for testing)
export function clearAllGradesData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function ensureAllSubjectsExist(subjects: Subject[]): Subject[] {
  // Preserve intentionally empty arrays
  if (subjects.length === 0) return [];

  const defaultSubjects = initializeSubjects();
  const existingSubjectIds = subjects.map((s) => s.id);

  const missingSubjects = defaultSubjects.filter(
    (s) => !existingSubjectIds.includes(s.id)
  );

  return [...subjects, ...missingSubjects];
}

// Add a new subject
export async function addNewSubject(
  name: string,
  userId?: string,
  syncEnabled?: boolean
): Promise<boolean> {
  try {
    if (!name.trim()) {
      console.error("Subject name cannot be empty");
      return false;
    }

    const subjects = await getSubjectsFromStorage(userId, syncEnabled);

    // Generate a unique ID based on the name (lowercase, spaces replaced with hyphens)
    const id = name.toLowerCase().replace(/\s+/g, "-");

    // Check if a subject with this ID already exists
    if (subjects.some((s) => s.id === id)) {
      console.error(`Subject with id ${id} already exists`);
      return false;
    }

    const newSubject: Subject = {
      id,
      name,
      grades: [],
    };

    const updatedSubjects = [...subjects, newSubject];
    return saveSubjectsToStorage(updatedSubjects, userId, syncEnabled);
  } catch (error) {
    console.error("Error adding new subject:", error);
    return false;
  }
}

// Delete a subject
export async function deleteSubject(
  subjectId: string,
  userId?: string,
  syncEnabled?: boolean
): Promise<boolean> {
  try {
    const subjects = await getSubjectsFromStorage(userId, syncEnabled);
    const filteredSubjects = subjects.filter((s) => s.id !== subjectId);

    if (filteredSubjects.length === subjects.length) {
      console.error(`Subject with id ${subjectId} not found`);
      return false;
    }

    // If we're connected to the cloud, delete from cloud first
    if (
      ENABLE_CLOUD_FEATURES &&
      userId &&
      syncEnabled &&
      deleteSubjectFromCloud
    ) {
      try {
        await deleteSubjectFromCloud(userId, subjectId);
      } catch (cloudError) {
        console.error(
          "Failed to delete subject from cloud directly:",
          cloudError
        );
        // Continue anyway as we'll still update local storage
      }
    }

    return saveSubjectsToStorage(filteredSubjects, userId, syncEnabled);
  } catch (error) {
    console.error("Error deleting subject:", error);
    return false;
  }
}

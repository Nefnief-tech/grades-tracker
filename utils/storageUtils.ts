import type { Subject, Grade } from "../types/grades";
import {
  syncSubjectsToCloud,
  getSubjectsFromCloud,
  ENABLE_CLOUD_FEATURES,
  deleteGradeFromCloud,
  deleteSubjectFromCloud,
} from "@/lib/appwrite";
import { initializeSubjects } from "./cookieUtils";

// Constants
const STORAGE_KEY = "gradeCalculator";
const CACHE_TTL = 30000; // Increased from 10000 to 30000 (30 seconds cache lifetime)
const CLOUD_FETCH_THROTTLE = 300000; // 5 minutes between cloud fetches

// Memory cache to prevent redundant storage operations
const memoryCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Logs storage operations for debugging
 */
function logStorage(operation: string, data?: any): void {
  console.log(`📦 Storage ${operation}`, data ? data : "");
}

/**
 * Notifies components that subjects have been updated
 */
export function notifySubjectsUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("subjectsUpdated"));
  }
}

/**
 * Gets data from memory cache if it's still valid
 */
function getFromCache<T>(key: string): T | null {
  const cachedData = memoryCache.get(key);

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data;
  }

  return null;
}

/**
 * Stores data in memory cache
 */
function setInCache<T>(key: string, data: T): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Calculates the weighted average of grades
 */
function calculateAverage(grades: Grade[]): number {
  if (!grades || grades.length === 0) return 0;

  const { weightedSum, totalWeight } = grades.reduce(
    (acc, grade) => {
      const weight = grade.weight || 1.0;
      return {
        weightedSum: acc.weightedSum + grade.value * weight,
        totalWeight: acc.totalWeight + weight,
      };
    },
    { weightedSum: 0, totalWeight: 0 }
  );

  return totalWeight > 0
    ? Number.parseFloat((weightedSum / totalWeight).toFixed(2))
    : 0;
}

/**
 * Validates and normalizes subject structures
 */
function validateSubjects(subjects: Subject[]): Subject[] {
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

/**
 * Saves subjects to localStorage and optionally to cloud
 */
export async function saveSubjectsToStorage(
  subjects: Subject[],
  userId?: string,
  syncEnabled?: boolean
): Promise<boolean> {
  const timestamp = new Date().toISOString();

  try {
    // Save to localStorage
    logStorage("saving", { subjectCount: subjects.length });
    const subjectsJson = JSON.stringify(subjects);
    localStorage.setItem(STORAGE_KEY, subjectsJson);
    localStorage.setItem("lastSyncTimestamp", timestamp);

    // Update memory cache
    const cacheKey = `subjects-${userId || "anonymous"}`;
    setInCache(cacheKey, subjects);

    // Notify listeners
    notifySubjectsUpdated();

    // If cloud sync is enabled, sync to cloud
    if (ENABLE_CLOUD_FEATURES && userId && syncEnabled) {
      logStorage("cloud sync started", { userId });

      try {
        const syncSuccess = await syncSubjectsToCloud(userId, subjects);

        if (syncSuccess) {
          logStorage("cloud sync success");
        } else {
          logStorage("cloud sync failed");
          window.dispatchEvent(new Event("syncPreferenceChanged"));
        }
      } catch (error) {
        console.error("Cloud sync error:", error);
        window.dispatchEvent(new Event("syncPreferenceChanged"));
      }
    } else {
      logStorage("cloud sync skipped", {
        enabled: ENABLE_CLOUD_FEATURES && syncEnabled,
      });
    }

    return true;
  } catch (error) {
    console.error("Error saving subjects:", error);
    return false;
  }
}

/**
 * Retrieves subjects from localStorage or cloud
 */
export async function getSubjectsFromStorage(
  userId?: string,
  syncEnabled?: boolean
): Promise<Subject[]> {
  const cacheKey = `subjects-${userId || "anonymous"}`;

  // Try memory cache first (fastest) with longer cache validity
  const cachedSubjects = getFromCache<Subject[]>(cacheKey);
  if (cachedSubjects) {
    logStorage("using cached subjects", { count: cachedSubjects.length });
    return cachedSubjects;
  }

  // Then try localStorage (fast)
  try {
    const localSubjectsJson = localStorage.getItem(STORAGE_KEY);

    if (localSubjectsJson) {
      const localSubjects = JSON.parse(localSubjectsJson);
      const validatedSubjects = validateSubjects(localSubjects);

      // Store in cache for future fast access
      setInCache(cacheKey, validatedSubjects);

      // If cloud sync is enabled, trigger background fetch - but throttle it heavily
      if (ENABLE_CLOUD_FEATURES && userId && syncEnabled) {
        // Use a much longer throttle interval (5 minutes = 300000ms)
        const lastFetchTime = localStorage.getItem("lastCloudFetchTime");
        const now = Date.now();

        // Only fetch if it's been more than 5 minutes since last fetch
        if (
          !lastFetchTime ||
          now - parseInt(lastFetchTime) > CLOUD_FETCH_THROTTLE
        ) {
          localStorage.setItem("lastCloudFetchTime", now.toString());

          // Use a longer delay before triggering background fetch
          setTimeout(() => {
            fetchAndMergeCloudData(userId, syncEnabled);
          }, 5000); // 5 second delay
        } else {
          logStorage("skipping cloud fetch - heavily throttled", {
            timeSinceLastFetch: lastFetchTime
              ? Math.round((now - parseInt(lastFetchTime)) / 1000) + "s"
              : "unknown",
            nextFetchIn: lastFetchTime
              ? Math.round(
                  (CLOUD_FETCH_THROTTLE - (now - parseInt(lastFetchTime))) /
                    1000
                ) + "s"
              : "unknown",
          });
        }
      }

      logStorage("using local subjects", { count: validatedSubjects.length });
      return validatedSubjects;
    }
  } catch (e) {
    console.error("Error reading from localStorage:", e);
  }

  // If we reach here, we have no local data - try cloud if enabled
  if (ENABLE_CLOUD_FEATURES && userId && syncEnabled) {
    try {
      logStorage("fetching from cloud", { userId });
      const cloudSubjects = await getSubjectsFromCloud(userId);

      if (
        cloudSubjects &&
        Array.isArray(cloudSubjects) &&
        cloudSubjects.length > 0
      ) {
        const validatedCloudSubjects = validateSubjects(cloudSubjects);

        // Save to localStorage and cache
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(validatedCloudSubjects)
        );
        localStorage.setItem("lastSyncTimestamp", new Date().toISOString());
        setInCache(cacheKey, validatedCloudSubjects);

        logStorage("using cloud subjects", {
          count: validatedCloudSubjects.length,
        });
        return validatedCloudSubjects;
      }
    } catch (error) {
      console.error("Error fetching from cloud:", error);
    }
  }

  // If we still have no data, initialize with defaults
  const defaultSubjects = initializeSubjects();
  saveSubjectsToStorage(defaultSubjects, userId, syncEnabled);
  setInCache(cacheKey, defaultSubjects);

  logStorage("using default subjects", { count: defaultSubjects.length });
  return defaultSubjects;
}

/**
 * Fetches data from cloud and merges with local data
 */
async function fetchAndMergeCloudData(
  userId: string,
  syncEnabled: boolean
): Promise<void> {
  try {
    // Set a timestamp to track when we started the operation
    const fetchStartTime = Date.now();

    // Skip if another fetch happened in the last 10 seconds
    const lastFetchTime = localStorage.getItem("lastBgFetchTime");
    if (lastFetchTime && fetchStartTime - parseInt(lastFetchTime) < 10000) {
      logStorage("background fetch skipped - too soon after previous fetch");
      return;
    }

    // Update the last background fetch time
    localStorage.setItem("lastBgFetchTime", fetchStartTime.toString());

    logStorage("background cloud fetch started");

    const cloudSubjects = await getSubjectsFromCloud(userId);

    if (
      !cloudSubjects ||
      !Array.isArray(cloudSubjects) ||
      cloudSubjects.length === 0
    ) {
      logStorage("no cloud data found");
      return;
    }

    // Ensure IDs are unique before updating cache
    const validatedCloudSubjects = validateSubjects(cloudSubjects).map(
      (subject) => {
        // If ID doesn't have enough entropy, add some
        if (!subject.id.includes("-")) {
          const randomSuffix = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0");
          subject.id = `${subject.id}-${randomSuffix}`;
        }
        return subject;
      }
    );

    const cacheKey = `subjects-${userId || "anonymous"}`;

    // Update localStorage and memory cache
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedCloudSubjects));
    localStorage.setItem("lastSyncTimestamp", new Date().toISOString());
    setInCache(cacheKey, validatedCloudSubjects);

    // Notify UI components
    notifySubjectsUpdated();

    // Update lastCloudFetchTime to throttle future fetches
    localStorage.setItem("lastCloudFetchTime", fetchStartTime.toString());

    logStorage("background fetch complete", {
      count: validatedCloudSubjects.length,
      time: `${Date.now() - fetchStartTime}ms`,
    });
  } catch (error) {
    console.error("Background cloud fetch failed:", error);
  }
}

/**
 * Adds a new grade to a subject
 */
export async function addGradeToSubject(
  subjectId: string,
  grade: Grade,
  userId?: string,
  syncEnabled?: boolean
): Promise<boolean> {
  try {
    logStorage("adding grade", { subjectId, grade });
    const subjects = await getSubjectsFromStorage(userId, syncEnabled);
    const subjectIndex = subjects.findIndex((s) => s.id === subjectId);

    if (subjectIndex === -1) {
      console.error(`Subject with ID ${subjectId} not found`);
      return false;
    }

    // Clone the subject to avoid mutations
    const updatedSubject = { ...subjects[subjectIndex] };

    // Ensure grades array exists
    if (!updatedSubject.grades) {
      updatedSubject.grades = [];
    }

    // Add the new grade and recalculate average
    updatedSubject.grades = [...updatedSubject.grades, grade];
    updatedSubject.averageGrade = calculateAverage(updatedSubject.grades);

    // Update the subject in the array
    const updatedSubjects = [...subjects];
    updatedSubjects[subjectIndex] = updatedSubject;

    // Save to storage
    return await saveSubjectsToStorage(updatedSubjects, userId, syncEnabled);
  } catch (error) {
    console.error("Error adding grade:", error);
    return false;
  }
}

/**
 * Deletes a grade from a subject
 */
export async function deleteGradeFromSubject(
  subjectId: string,
  gradeIndex: number,
  userId?: string,
  syncEnabled?: boolean
): Promise<boolean> {
  try {
    logStorage("deleting grade", { subjectId, gradeIndex });
    const subjects = await getSubjectsFromStorage(userId, syncEnabled);
    const subjectIndex = subjects.findIndex((s) => s.id === subjectId);

    if (subjectIndex === -1) {
      console.error(`Subject with ID ${subjectId} not found`);
      return false;
    }

    // Clone the subject to avoid mutations
    const updatedSubject = { ...subjects[subjectIndex] };

    // Ensure grades array exists
    if (!updatedSubject.grades || updatedSubject.grades.length === 0) {
      return true; // Nothing to delete
    }

    // Store deleted grade for cloud operations
    const deletedGrade = updatedSubject.grades[gradeIndex];

    // Remove grade and recalculate average
    updatedSubject.grades = updatedSubject.grades.filter(
      (_, i) => i !== gradeIndex
    );
    updatedSubject.averageGrade = calculateAverage(updatedSubject.grades);

    // Update the subject in the array
    const updatedSubjects = [...subjects];
    updatedSubjects[subjectIndex] = updatedSubject;

    // Save to storage
    const saveResult = await saveSubjectsToStorage(
      updatedSubjects,
      userId,
      syncEnabled
    );

    // Additionally try to delete from cloud directly
    if (
      ENABLE_CLOUD_FEATURES &&
      userId &&
      syncEnabled &&
      deleteGradeFromCloud
    ) {
      try {
        await deleteGradeFromCloud(userId, subjectId, deletedGrade);
      } catch (cloudError) {
        console.error(
          "Failed to delete grade from cloud directly:",
          cloudError
        );
        // Continue anyway as the change will be synced later
      }
    }

    return saveResult;
  } catch (error) {
    console.error("Error deleting grade:", error);
    return false;
  }
}

/**
 * Gets a specific subject by ID
 */
export async function getSubjectById(
  subjectId: string,
  userId?: string,
  syncEnabled?: boolean
): Promise<Subject | null> {
  const cacheKey = `subject-${subjectId}-${userId || "anonymous"}`;

  // Try memory cache first
  const cachedSubject = getFromCache<Subject | null>(cacheKey);
  if (cachedSubject !== null) {
    return cachedSubject;
  }

  try {
    const subjects = await getSubjectsFromStorage(userId, syncEnabled);
    const subject = subjects.find((s) => s.id === subjectId) || null;

    // Cache the result
    setInCache(cacheKey, subject);

    return subject;
  } catch (error) {
    console.error("Error getting subject by ID:", error);
    return null;
  }
}

/**
 * Creates a new subject
 */
export async function addNewSubject(
  name: string,
  userId?: string,
  syncEnabled?: boolean
): Promise<boolean> {
  try {
    if (!name.trim()) {
      throw new Error("Subject name cannot be empty");
    }

    // Get existing subjects but with forced cache usage to prevent duplicates
    const cacheKey = `subjects-${userId || "anonymous"}`;
    const cachedSubjects = getFromCache<Subject[]>(cacheKey);

    // Use cached data if available, fetch from storage only if necessary
    let subjects: Subject[];
    if (cachedSubjects) {
      subjects = cachedSubjects;
      logStorage("using cached subjects for duplicate check", {
        count: subjects.length,
      });
    } else {
      subjects = await getSubjectsFromStorage(userId, false); // Get from storage but don't trigger cloud sync
    }

    // Implement a simple debounce for subject creation using localStorage
    const lastCreatedSubject = localStorage.getItem("lastCreatedSubject");
    if (lastCreatedSubject) {
      try {
        const { subjectName, timestamp } = JSON.parse(lastCreatedSubject);
        const now = Date.now();

        // If we tried to create a subject with the same name in the last 5 seconds, block it
        if (subjectName === name.trim() && now - timestamp < 5000) {
          logStorage("blocking duplicate subject creation", {
            name,
            timeSinceLastCreation: now - timestamp,
          });
          return true; // Return success without doing anything to prevent duplicates
        }
      } catch (e) {
        // Ignore JSON parse errors in localStorage
      }
    }

    // Check for duplicate names (case-insensitive)
    const nameExists = subjects.some(
      (s) => s.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (nameExists) {
      throw new Error("A subject with this name already exists");
    }

    // Generate a unique ID that's truly unique
    // Use timestamp plus random number to prevent duplicates
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${timestamp.toString(
      36
    )}-${randomSuffix}`;

    logStorage("creating subject", { id, name });

    // Store the subject name and timestamp to prevent duplicate creation
    localStorage.setItem(
      "lastCreatedSubject",
      JSON.stringify({
        subjectName: name.trim(),
        timestamp,
      })
    );

    // Create new subject
    const newSubject: Subject = {
      id,
      name: name.trim(),
      grades: [],
      averageGrade: 0,
    };

    // Add to existing subjects
    const updatedSubjects = [...subjects, newSubject];

    // Save to storage
    return await saveSubjectsToStorage(updatedSubjects, userId, syncEnabled);
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Re-throw errors with messages
    }
    console.error("Unknown error adding subject:", error);
    return false;
  }
}

/**
 * Deletes a subject
 */
export async function deleteSubject(
  subjectId: string,
  userId?: string,
  syncEnabled?: boolean
): Promise<boolean> {
  try {
    logStorage("deleting subject", { subjectId });
    const subjects = await getSubjectsFromStorage(userId, syncEnabled);
    const filteredSubjects = subjects.filter((s) => s.id !== subjectId);

    if (filteredSubjects.length === subjects.length) {
      console.error(`Subject with ID ${subjectId} not found`);
      return false;
    }

    // Try to delete from cloud first
    if (
      ENABLE_CLOUD_FEATURES &&
      userId &&
      syncEnabled &&
      deleteSubjectFromCloud
    ) {
      try {
        await deleteSubjectFromCloud(userId, subjectId);
      } catch (cloudError) {
        console.error("Failed to delete subject from cloud:", cloudError);
        // Continue anyway
      }
    }

    // Save filtered subjects
    return await saveSubjectsToStorage(filteredSubjects, userId, syncEnabled);
  } catch (error) {
    console.error("Error deleting subject:", error);
    return false;
  }
}

/**
 * Saves a grade to a subject with optimistic UI updates
 */
export const saveGradeToSubject = async (
  subjectId: string,
  grade: Grade,
  userId?: string,
  syncEnabled?: boolean
): Promise<void> => {
  try {
    logStorage("saving grade", { subjectId, grade });

    // Use cached subjects when possible to reduce storage reads
    const cacheKey = `subjects-${userId || "anonymous"}`;
    let subjects: Subject[] = [];

    // Try memory cache first for better performance
    const cachedSubjects = getFromCache<Subject[]>(cacheKey);
    if (cachedSubjects) {
      subjects = cachedSubjects;
    } else {
      subjects = await getSubjectsFromStorage(userId, false); // Don't trigger cloud sync yet
    }

    const subjectIndex = subjects.findIndex((s) => s.id === subjectId);

    if (subjectIndex === -1) {
      throw new Error(`Subject not found with ID: ${subjectId}`);
    }

    const subject = { ...subjects[subjectIndex] };

    // Check for existing grade with same ID or properties
    const existingIndex = subject.grades.findIndex(
      (g) =>
        g.id === grade.id ||
        (g.value === grade.value &&
          g.type === grade.type &&
          g.date === grade.date)
    );

    if (existingIndex !== -1) {
      // Update existing grade
      subject.grades = [
        ...subject.grades.slice(0, existingIndex),
        grade,
        ...subject.grades.slice(existingIndex + 1),
      ];
    } else {
      // Add new grade
      subject.grades = [...subject.grades, grade];
    }

    // Recalculate average
    subject.averageGrade = calculateAverage(subject.grades);

    // Update subjects array
    const updatedSubjects = [...subjects];
    updatedSubjects[subjectIndex] = subject;

    // Update memory cache immediately for optimistic UI
    setInCache(cacheKey, updatedSubjects);

    // Update subject cache for optimistic UI
    const subjectCacheKey = `subject-${subjectId}-${userId || "anonymous"}`;
    setInCache(subjectCacheKey, subject);

    // Notify UI for immediate feedback
    window.dispatchEvent(new Event("subjectsUpdated"));

    // Save to localStorage without waiting - this happens in the background
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSubjects));

    // Then start the cloud sync in the background if enabled
    if (ENABLE_CLOUD_FEATURES && userId && syncEnabled) {
      // This runs in the background - don't await it
      syncSubjectsToCloud(userId, updatedSubjects).catch((e) => {
        console.error("Background sync failed:", e);
      });
    }

    // Dispatch additional event with a small delay to ensure UI is updated
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("gradeAdded", {
          detail: { subjectId, grade },
        })
      );
    }, 100);
  } catch (error) {
    console.error("Error saving grade:", error);
    throw error;
  }
};

/**
 * Ensures all default subjects exist
 */
export function ensureAllSubjectsExist(subjects: Subject[]): Subject[] {
  if (subjects.length === 0) return [];

  const defaultSubjects = initializeSubjects();
  const existingIds = new Set(subjects.map((s) => s.id));
  const missingSubjects = defaultSubjects.filter((s) => !existingIds.has(s.id));

  return [...subjects, ...missingSubjects];
}

/**
 * Clear all grade data (for testing)
 */
export function clearAllGradesData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("lastSyncTimestamp");
  memoryCache.clear();
  logStorage("cleared all data");
}

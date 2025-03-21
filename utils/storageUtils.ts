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
export function notifySubjectsUpdated(eventId?: string): void {
  if (typeof window !== "undefined") {
    console.log(
      "Dispatching subjectsUpdated event",
      eventId ? `(ID: ${eventId})` : ""
    );

    // Use CustomEvent to allow passing data
    const event = eventId
      ? new CustomEvent("subjectsUpdated", { detail: { eventId } })
      : new Event("subjectsUpdated");

    window.dispatchEvent(event);
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
 * Gets data from localStorage
 */
function getFromLocalStorage(): Subject[] {
  try {
    const localSubjectsJson = localStorage.getItem(STORAGE_KEY);

    if (!localSubjectsJson) {
      return initializeSubjects();
    }

    const localSubjects = JSON.parse(localSubjectsJson);
    return validateSubjects(localSubjects);
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return initializeSubjects();
  }
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
  syncEnabled?: boolean,
  forceRefresh?: boolean
): Promise<Subject[]> {
  const cacheKey = `subjects-${userId || "anonymous"}`;

  // Allow force refresh by checking URL parameter
  const forceRefreshParam =
    typeof window !== "undefined" &&
    window.location.search.includes("refresh=true");

  if (forceRefresh || forceRefreshParam) {
    // When force refreshing, clear cached data
    memoryCache.delete(cacheKey);
    logStorage("force refresh requested - cleared cache");
  }

  // Try memory cache first (fastest) with longer cache validity
  const cachedSubjects = getFromCache<Subject[]>(cacheKey);
  if (cachedSubjects && !forceRefresh) {
    logStorage("using cached subjects", { count: cachedSubjects.length });
    return cachedSubjects;
  }

  // If cloud is enabled and we're doing a force refresh, try to get data from cloud first
  if (ENABLE_CLOUD_FEATURES && userId && syncEnabled && forceRefresh) {
    try {
      logStorage("force fetching from cloud", { userId });
      const cloudSubjects = await getSubjectsFromCloud(userId);

      if (
        cloudSubjects &&
        Array.isArray(cloudSubjects) &&
        cloudSubjects.length > 0
      ) {
        const validatedCloudSubjects = validateSubjects(cloudSubjects);

        logStorage("got cloud subjects", {
          count: validatedCloudSubjects.length,
        });

        // Save to localStorage
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(validatedCloudSubjects)
        );
        localStorage.setItem("lastSyncTimestamp", new Date().toISOString());

        // Update the cache
        setInCache(cacheKey, validatedCloudSubjects);

        // Notify about the update
        notifySubjectsUpdated();

        return validatedCloudSubjects;
      }
    } catch (error) {
      console.error("Error force fetching from cloud:", error);
    }
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
  syncEnabled?: boolean,
  forceRefresh?: boolean
): Promise<Subject | null> {
  console.log(`Looking up subject: ${subjectId}`);

  // CRITICAL FIX: FIRST try direct localStorage access for immediate response
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const localStorageData = localStorage.getItem(STORAGE_KEY);
      if (localStorageData) {
        const allSubjects = JSON.parse(localStorageData);
        if (Array.isArray(allSubjects)) {
          const directSubject = allSubjects.find((s) => s.id === subjectId);
          if (directSubject) {
            console.log(`Found subject directly: ${directSubject.name}`);
            return directSubject;
          }
        }
      }
    } catch (e) {
      console.error("Direct localStorage lookup failed:", e);
    }
  }

  // If direct lookup failed, use the cached version or fetch
  const cacheKey = `subject-${subjectId}-${userId || "anonymous"}`;

  // Clear cache if force refresh is requested
  if (forceRefresh) {
    memoryCache.delete(cacheKey);
  }

  // Try memory cache first if not forcing refresh
  const cachedSubject = !forceRefresh
    ? getFromCache<Subject | null>(cacheKey)
    : null;

  if (cachedSubject !== null) {
    console.log(`Found subject in cache: ${cachedSubject.name}`);
    return cachedSubject;
  }

  try {
    // Force fresh data from storage
    console.log("Getting fresh subjects data from storage");
    const subjects = await getSubjectsFromStorage(
      userId,
      syncEnabled,
      forceRefresh
    );

    console.log(
      `Got ${subjects.length} subjects, looking for ID: ${subjectId}`
    );
    const subject = subjects.find((s) => s.id === subjectId) || null;

    if (subject) {
      console.log(`Found subject in retrieved data: ${subject.name}`);
      // Cache the result for future quick access
      setInCache(cacheKey, subject);
      return subject;
    } else {
      console.error(`Subject with ID ${subjectId} not found in subjects list`);
      return null;
    }
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
 * ENHANCED CRITICAL PATH: Saves a grade to a subject directly
 */
export const saveGradeToSubject = async (
  subjectId: string,
  grade: Grade,
  userId?: string,
  syncEnabled?: boolean
): Promise<void> => {
  const operationId = `grade-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  console.log(`[${operationId}] GRADE SAVE OPERATION STARTED`);

  try {
    // 1. DIRECT STORAGE FIRST - most reliable method
    let directSaveSuccess = false;
    try {
      // Get current data
      const storageData = localStorage.getItem(STORAGE_KEY);

      if (storageData) {
        const allSubjects = JSON.parse(storageData);

        if (Array.isArray(allSubjects)) {
          const subjectIndex = allSubjects.findIndex((s) => s.id === subjectId);

          if (subjectIndex >= 0) {
            // Initialize or get grades array
            if (!allSubjects[subjectIndex].grades) {
              allSubjects[subjectIndex].grades = [];
            }

            // Add the grade
            allSubjects[subjectIndex].grades.push(grade);

            // Recalculate average
            allSubjects[subjectIndex].averageGrade = calculateAverage(
              allSubjects[subjectIndex].grades
            );

            // Save directly to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allSubjects));

            console.log(`[${operationId}] ✅ DIRECT SAVE SUCCESS`);
            directSaveSuccess = true;
          }
        }
      }
    } catch (directError) {
      console.error(`[${operationId}] ⚠️ DIRECT SAVE FAILED:`, directError);
    }

    // 2. API METHOD AS FALLBACK
    if (!directSaveSuccess) {
      console.log(`[${operationId}] Using API method as fallback`);
      const subjects = await getSubjectsFromStorage(userId, false);
      const subjectIndex = subjects.findIndex((s) => s.id === subjectId);

      if (subjectIndex === -1) {
        throw new Error(`Subject with ID ${subjectId} not found`);
      }

      // Clone to avoid mutations
      const updatedSubject = { ...subjects[subjectIndex] };

      // Ensure grades array exists
      updatedSubject.grades = updatedSubject.grades || [];

      // Add grade and recalculate
      updatedSubject.grades.push(grade);
      updatedSubject.averageGrade = calculateAverage(updatedSubject.grades);

      // Update in array
      const updatedSubjects = [...subjects];
      updatedSubjects[subjectIndex] = updatedSubject;

      // Save through normal channel
      await saveSubjectsToStorage(updatedSubjects, userId, syncEnabled);
      console.log(`[${operationId}] ✅ API SAVE SUCCESS`);
    }

    // 3. ENSURE CACHES ARE CLEARED
    memoryCache.clear();

    // 4. EVENT NOTIFICATIONS
    // Simple events first
    window.dispatchEvent(new Event("gradeAdded"));
    window.dispatchEvent(new Event("subjectsUpdated"));
    window.dispatchEvent(new Event("gradesChanged"));

    // Then custom event with details
    window.dispatchEvent(
      new CustomEvent("gradeAdded", {
        detail: {
          subjectId,
          gradeId: grade.id,
          eventId: operationId,
        },
      })
    );

    // 5. CLOUD SYNC (if enabled)
    if (ENABLE_CLOUD_FEATURES && userId && syncEnabled) {
      try {
        // Get latest data to sync
        const latestData = localStorage.getItem(STORAGE_KEY);
        const latestSubjects = latestData ? JSON.parse(latestData) : [];

        // Sync in background
        syncSubjectsToCloud(userId, latestSubjects)
          .then(() => console.log(`[${operationId}] ☁️ CLOUD SYNC SUCCESS`))
          .catch((cloudError) =>
            console.error(`[${operationId}] ☁️ CLOUD SYNC FAILED:`, cloudError)
          );
      } catch (syncError) {
        console.error(
          `[${operationId}] Error preparing cloud sync:`,
          syncError
        );
      }
    }

    console.log(`[${operationId}] 🎉 GRADE SAVE COMPLETED`);
  } catch (error) {
    console.error(`[${operationId}] 🔥 CRITICAL FAILURE:`, error);

    // LAST RESORT: Force refresh after 2 seconds to ensure UI is updated
    setTimeout(() => {
      console.log("Dispatching forceRefresh event");
      window.dispatchEvent(new CustomEvent("forceRefresh"));
    }, 2000);

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

/**
 * Clears cache for a specific subject
 */
export function clearSubjectCache(userId?: string, subjectId?: string): void {
  if (userId && subjectId) {
    // Clear cache for specific subject
    const subjectCacheKey = `subject-${subjectId}-${userId || "anonymous"}`;
    memoryCache.delete(subjectCacheKey);
    logStorage("cleared cache for subject", { subjectId });
  }
}

/**
 * Clear cache specifically for forcing refresh
 */
export function clearCacheForRefresh(): void {
  // Clear all memory cache
  memoryCache.clear();

  // Clear timestamp records to force fresh fetch
  localStorage.removeItem("lastBgFetchTime");
  localStorage.removeItem("lastCloudFetchTime");

  logStorage("cleared cache for refresh");
}

/**
 * Debug function to check subjects and grades
 */
export function debugSubjects(userId?: string): void {
  const cacheKey = `subjects-${userId || "anonymous"}`;
  const subjects = getFromCache<Subject[]>(cacheKey);

  console.log("=== SUBJECTS DEBUG ===");
  console.log("From cache:", subjects);

  try {
    const localStorageSubjects = localStorage.getItem(STORAGE_KEY);
    console.log(
      "From localStorage:",
      localStorageSubjects ? JSON.parse(localStorageSubjects) : "No data"
    );
  } catch (e) {
    console.error("Error reading from localStorage:", e);
  }

  console.log("=== END DEBUG ===");
}

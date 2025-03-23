import type { Subject, Grade } from "../types/grades";
import {
  syncSubjectsToCloud,
  getSubjectsFromCloud,
  ENABLE_CLOUD_FEATURES,
  deleteGradeFromCloud,
  deleteSubjectFromCloud,
} from "@/lib/appwrite";
import { initializeSubjects } from "./cookieUtils";
import { Subject, Grade, TimetableEntry } from "@/types/grades";

// Import Appwrite at the module level to ensure it's available
import * as appwriteModule from "@/lib/appwrite";

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

/**
 * Get timetable entries from storage with cloud sync support
 * @param userId Optional user ID for cloud sync
 * @param syncEnabled Whether to fetch from cloud
 * @returns Array of timetable entries
 */
export const getTimetableEntries = async (
  userId?: string,
  syncEnabled?: boolean
): Promise<TimetableEntry[]> => {
  try {
    // Try to fetch from cloud if sync is enabled and user is logged in
    if (syncEnabled && userId) {
      try {
        // Get Appwrite client using our reliable method
        const { databases, Query } = await getAppwriteDatabases();

        if (!databases) {
          throw new Error("Appwrite databases client not properly initialized");
        }

        console.log("Fetching timetable entries from cloud...");

        // Query all documents in the timetable collection for this user
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
          process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID ||
            "timetableEntries",
          [Query.equal("userId", userId)]
        );

        if (!response || !response.documents) {
          console.log("No cloud timetable entries found");
          return getLocalTimetableEntries();
        }

        // Transform Appwrite documents to TimetableEntry objects
        const entries = response.documents.map((doc: any) => ({
          id: doc.entryId,
          subjectId: doc.subjectId,
          day: doc.day,
          startTime: doc.startTime,
          endTime: doc.endTime,
          room: doc.room || "",
          notes: doc.notes || "",
          recurring: doc.recurring ?? true,
          color: doc.color || "", // Include color in document data
        }));

        // Cache the cloud data in localStorage
        localStorage.setItem("timetableEntries", JSON.stringify(entries));
        localStorage.setItem("lastSyncTimestamp", new Date().toISOString());

        console.log(`Loaded ${entries.length} timetable entries from cloud`);
        return entries;
      } catch (cloudError) {
        console.error("Error fetching timetable from cloud:", cloudError);
        // Fall back to local storage
        return getLocalTimetableEntries();
      }
    }

    // If not using cloud, get from localStorage
    return getLocalTimetableEntries();
  } catch (error) {
    console.error("Error getting timetable entries:", error);
    return [];
  }
};

/**
 * Get timetable entries from local storage only
 * @returns Array of timetable entries
 */
const getLocalTimetableEntries = (): TimetableEntry[] => {
  try {
    const timetableJSON = localStorage.getItem("timetableEntries");
    if (timetableJSON) {
      return JSON.parse(timetableJSON);
    }
  } catch (error) {
    console.error("Error parsing timetable from localStorage:", error);
  }
  return [];
};

/**
 * Save timetable entries to storage with cloud sync
 * @param entries Array of timetable entries to save
 * @param userId Optional user ID for cloud sync
 * @param syncEnabled Whether to sync to cloud
 */
export const saveTimetableEntries = async (
  entries: TimetableEntry[],
  userId?: string,
  syncEnabled?: boolean
): Promise<void> => {
  try {
    // Always save to localStorage first
    localStorage.setItem("timetableEntries", JSON.stringify(entries));
    console.log(`Saved ${entries.length} timetable entries to localStorage`);

    // If sync is enabled and user is logged in, save to cloud as well
    if (syncEnabled && userId) {
      try {
        // Get Appwrite client using our reliable method
        const { databases, ID, Query } = await getAppwriteDatabases();

        if (!databases) {
          throw new Error("Appwrite databases client not properly initialized");
        }

        console.log(`Syncing timetable to cloud for user ${userId}`);

        // First clear existing entries for this user
        await clearCloudTimetableEntries(userId);

        // Then create new entries for all current timetable items
        for (const entry of entries) {
          const documentData = {
            userId: userId,
            entryId: entry.id,
            subjectId: entry.subjectId,
            day: entry.day,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: entry.room || "",
            notes: entry.notes || "",
            recurring: entry.recurring !== undefined ? entry.recurring : true,
            color: entry.color || "", // Include color in document data
          };

          await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
            process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID ||
              "timetableEntries",
            ID.unique(),
            documentData
          );
        }

        // Update last sync timestamp
        localStorage.setItem("lastSyncTimestamp", new Date().toISOString());
        console.log(
          `Successfully synced ${entries.length} timetable entries to cloud`
        );
      } catch (cloudError) {
        console.error("Error syncing timetable to cloud:", cloudError);
        // Still consider the operation successful if local storage worked
      }
    }
  } catch (error) {
    console.error("Error saving timetable entries:", error);
    throw error;
  }
};

/**
 * Clear all cloud timetable entries for a user
 */
const clearCloudTimetableEntries = async (userId: string): Promise<void> => {
  try {
    // Get Appwrite client using our reliable method
    const { databases, Query } = await getAppwriteDatabases();

    if (!databases) {
      throw new Error("Appwrite databases client not properly initialized");
    }

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID ||
      "timetableEntries";

    console.log(`Finding existing timetable entries for user ${userId}`);

    // Find all timetable entries for this user
    const response = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("userId", userId),
    ]);

    if (response.documents && response.documents.length > 0) {
      console.log(
        `Deleting ${response.documents.length} existing timetable entries`
      );

      // Delete each document
      for (const doc of response.documents) {
        await databases.deleteDocument(databaseId, collectionId, doc.$id);
      }
    } else {
      console.log("No existing timetable entries to delete");
    }
  } catch (error) {
    console.error("Error clearing cloud timetable entries:", error);
    throw error;
  }
};

/**
 * Delete a timetable entry
 * @param entryId ID of the entry to delete
 */
export const deleteTimetableEntry = async (entryId: string): Promise<void> => {
  try {
    const entries = await getTimetableEntries();
    const updatedEntries = entries.filter((entry) => entry.id !== entryId);
    await saveTimetableEntries(updatedEntries);
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    throw error;
  }
};

/**
 * Update a timetable entry
 * @param updatedEntry The entry with updated fields
 */
export const updateTimetableEntry = async (
  updatedEntry: TimetableEntry
): Promise<void> => {
  try {
    const entries = await getTimetableEntries();
    const entryIndex = entries.findIndex(
      (entry) => entry.id === updatedEntry.id
    );

    if (entryIndex === -1) {
      throw new Error("Timetable entry not found");
    }

    entries[entryIndex] = updatedEntry;
    await saveTimetableEntries(entries);
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    throw error;
  }
};

/**
 * Update a grade in a subject
 * @param subjectId ID of the subject
 * @param updatedGrade The updated grade object
 * @returns Promise that resolves when the grade is updated
 */
export const updateGrade = async (
  subjectId: string,
  updatedGrade: Grade
): Promise<void> => {
  try {
    // Get the subject
    const subject = await getSubject(subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    // Find the grade index
    const gradeIndex =
      subject.grades?.findIndex((g) => g.id === updatedGrade.id) ?? -1;
    if (gradeIndex === -1) {
      throw new Error("Grade not found");
    }

    // Update the grade
    if (!subject.grades) {
      subject.grades = [];
    }
    subject.grades[gradeIndex] = updatedGrade;

    // Calculate new average
    const totalWeight = subject.grades.reduce(
      (sum, g) => sum + (g.weight || 1),
      0
    );
    const weightedSum = subject.grades.reduce(
      (sum, g) => sum + g.value * (g.weight || 1),
      0
    );
    subject.averageGrade = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Save the updated subject
    await saveSubject(subject);

    // Dispatch event for any listeners
    dispatchStorageEvent();
  } catch (error) {
    console.error("Error updating grade:", error);
    throw error;
  }
};

/**
 * Delete a grade from a subject
 * @param subjectId ID of the subject
 * @param gradeId ID of the grade to delete
 * @returns Promise that resolves when the grade is deleted
 */
export const deleteGrade = async (
  subjectId: string,
  gradeId: string
): Promise<void> => {
  try {
    // Get the subject
    const subject = await getSubject(subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    // Find the grade
    if (!subject.grades) {
      throw new Error("No grades found in subject");
    }

    // Filter out the grade to delete
    subject.grades = subject.grades.filter((g) => g.id !== gradeId);

    // Recalculate average
    if (subject.grades.length > 0) {
      const totalWeight = subject.grades.reduce(
        (sum, g) => sum + (g.weight || 1),
        0
      );
      const weightedSum = subject.grades.reduce(
        (sum, g) => sum + g.value * (g.weight || 1),
        0
      );
      subject.averageGrade = totalWeight > 0 ? weightedSum / totalWeight : 0;
    } else {
      subject.averageGrade = 0;
    }

    // Save the updated subject
    await saveSubject(subject);

    // Dispatch event for any listeners
    dispatchStorageEvent();
  } catch (error) {
    console.error("Error deleting grade:", error);
    throw error;
  }
};

/**
 * Add a new subject
 * @param subjectData Subject name string or partial subject object
 * @param userId Optional user ID for cloud sync
 * @param syncEnabled Whether to sync to cloud
 * @returns The newly created subject
 */
export const addNewSubject = async (
  subjectData: {
    name: string;
    description?: string;
    teacher?: string;
    room?: string;
    color?: string; // Include color property
  },
  userId?: string,
  syncEnabled?: boolean
): Promise<void> => {
  try {
    // Get existing subjects
    const existingSubjects = localStorage.getItem("subjects");
    const subjects = existingSubjects ? JSON.parse(existingSubjects) : [];

    // Create new subject with ID and initial data
    const newSubject = {
      id: generateId(),
      name: subjectData.name,
      description: subjectData.description,
      teacher: subjectData.teacher,
      room: subjectData.room,
      color: subjectData.color, // Store color
      grades: [],
      averageGrade: 0,
    };

    // Add to existing subjects
    const updatedSubjects = [...subjects, newSubject];

    // Save to storage
    await saveSubjectsToStorage(updatedSubjects, userId, syncEnabled);

    // Dispatch an event to notify components that subjects have been updated
    const event = new Event("subjectsUpdated");
    window.dispatchEvent(event);
  } catch (error) {
    console.error("Error adding new subject:", error);
    throw error;
  }
};

import { generateId } from "@/utils/idUtils";
// Direct imports from Appwrite for fallback
import { Client, Databases, ID, Query } from "appwrite";

// Create a direct client for fallback situations
let fallbackClient: Client | null = null;
let fallbackDatabases: Databases | null = null;

/**
 * Initialize fallback Appwrite client if needed
 */
const initializeFallbackClient = () => {
  if (typeof window === "undefined") return null;

  try {
    if (!fallbackClient) {
      fallbackClient = new Client();
      fallbackClient
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

      fallbackDatabases = new Databases(fallbackClient);
      console.log("Fallback Appwrite client initialized");
    }
    return { client: fallbackClient, databases: fallbackDatabases };
  } catch (error) {
    console.error("Failed to initialize fallback Appwrite client:", error);
    return null;
  }
};

/**
 * Get Appwrite databases client, either from the module or fallback
 */
const getAppwriteDatabases = async () => {
  try {
    // Try importing from the module first
    const appwriteModule = await import("@/lib/appwrite");

    // Check if databases exists and is accessible
    if (
      appwriteModule.databases &&
      typeof appwriteModule.databases.listDocuments === "function"
    ) {
      return {
        databases: appwriteModule.databases,
        ID: appwriteModule.ID,
        Query: appwriteModule.Query,
      };
    }

    // Try the fallback client if module client fails
    const fallback = initializeFallbackClient();
    if (fallback && fallback.databases) {
      return {
        databases: fallback.databases,
        ID: ID,
        Query: Query,
      };
    }

    throw new Error("Could not access Appwrite databases client");
  } catch (error) {
    console.error("Error accessing Appwrite client:", error);
    throw error;
  }
};

/**
 * Save subjects to Appwrite cloud storage
 */
const saveSubjectsToCloud = async (
  subjects: Subject[],
  userId: string
): Promise<void> => {
  try {
    // Get Appwrite clients reliably
    const clients = await getAppwriteClients();
    if (!clients || !clients.databases) {
      throw new Error("Appwrite databases client not properly initialized");
    }

    const { databases, ID, Query } = clients;

    // First delete all existing subjects for this user
    await clearCloudSubjects(userId);

    // Create new documents for each subject
    for (const subject of subjects) {
      const documentData = {
        userId: userId,
        subjectId: subject.id,
        name: subject.name,
        color: subject.color || "", // Add color to document data
        description: subject.description || "",
        teacher: subject.teacher || "",
        room: subject.room || "",
        averageGrade: subject.averageGrade || 0,
      };

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
        process.env.NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID || "subjects",
        ID.unique(),
        documentData
      );

      // Add grades for this subject
      if (subject.grades && subject.grades.length > 0) {
        // ...existing code to save grades...
      }
    }

    console.log(`Successfully saved ${subjects.length} subjects to cloud`);
  } catch (error) {
    console.error("Error saving subjects to cloud:", error);
    throw error;
  }
};

/**
 * Get subjects from Appwrite cloud storage
 */
const getSubjectsFromCloud = async (userId: string): Promise<Subject[]> => {
  try {
    // Get Appwrite clients reliably
    const clients = await getAppwriteClients();
    if (!clients || !clients.databases) {
      throw new Error("Appwrite databases client not properly initialized");
    }

    const { databases, Query } = clients;

    // Get all subject documents for this user
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
      process.env.NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID || "subjects",
      [Query.equal("userId", userId)]
    );

    // Process subject documents
    const subjects: Subject[] = [];
    for (const doc of response.documents) {
      // Create a new subject object
      const subject: Subject = {
        id: doc.subjectId,
        name: doc.name,
        color: doc.color || undefined, // Get color from document
        description: doc.description || undefined,
        teacher: doc.teacher || undefined,
        room: doc.room || undefined,
        averageGrade: doc.averageGrade || 0,
        grades: [],
      };

      // Get grades for this subject
      // ...existing code to get grades...

      subjects.push(subject);
    }

    return subjects;
  } catch (error) {
    console.error("Error getting subjects from cloud:", error);
    throw error;
  }
};

/**
 * Save timetable entries to cloud storage
 */
const saveTimetableEntriesToCloud = async (
  entries: TimetableEntry[],
  userId: string
): Promise<void> => {
  try {
    // Get Appwrite clients reliably
    const clients = await getAppwriteClients();
    if (!clients || !clients.databases) {
      throw new Error("Appwrite databases client not properly initialized");
    }

    const { databases, ID, Query } = clients;

    // Clear existing entries
    await clearCloudTimetableEntries(userId);

    // Create new entries
    for (const entry of entries) {
      const documentData = {
        userId: userId,
        entryId: entry.id,
        subjectId: entry.subjectId,
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: entry.room || "",
        notes: entry.notes || "",
        recurring: entry.recurring !== undefined ? entry.recurring : true,
        color: entry.color || "", // Include color in document data
      };

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
        process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID ||
          "timetableEntries",
        ID.unique(),
        documentData
      );
    }

    console.log(
      `Successfully saved ${entries.length} timetable entries to cloud`
    );
  } catch (error) {
    console.error("Error saving timetable entries to cloud:", error);
    throw error;
  }
};

/**
 * Get timetable entries from cloud storage
 */
const getTimetableEntriesFromCloud = async (
  userId: string
): Promise<TimetableEntry[]> => {
  try {
    // Get Appwrite clients reliably
    const clients = await getAppwriteClients();
    if (!clients || !clients.databases) {
      throw new Error("Appwrite databases client not properly initialized");
    }

    const { databases, Query } = clients;

    // Query documents
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
      process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID ||
        "timetableEntries",
      [Query.equal("userId", userId)]
    );

    // Map to TimetableEntry objects
    const entries: TimetableEntry[] = response.documents.map((doc: any) => ({
      id: doc.entryId,
      subjectId: doc.subjectId,
      day: doc.day,
      startTime: doc.startTime,
      endTime: doc.endTime,
      room: doc.room || undefined,
      notes: doc.notes || undefined,
      recurring: doc.recurring !== undefined ? doc.recurring : true,
      color: doc.color || undefined, // Include color in parsed data
    }));

    return entries;
  } catch (error) {
    console.error("Error getting timetable entries from cloud:", error);
    throw error;
  }
};

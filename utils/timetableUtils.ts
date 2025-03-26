import { TimetableEntry } from "@/types/grades";
import { Client, Databases, Query } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite";

/**
 * Get timetable entries from storage (local or cloud)
 */
export const getTimetableEntries = async (
  userId?: string,
  syncEnabled?: boolean
): Promise<TimetableEntry[]> => {
  try {
    // Check if we should use cloud storage
    if (userId && syncEnabled) {
      return await getTimetableEntriesFromCloud(userId);
    } else {
      return getTimetableEntriesFromLocalStorage();
    }
  } catch (error) {
    console.error("Error getting timetable entries:", error);
    // Fall back to local storage if cloud fails
    return getTimetableEntriesFromLocalStorage();
  }
};

/**
 * Get timetable entries from local storage
 */
const getTimetableEntriesFromLocalStorage = (): TimetableEntry[] => {
  try {
    const storedEntries = localStorage.getItem("timetableEntries");
    if (storedEntries) {
      return JSON.parse(storedEntries);
    }
  } catch (error) {
    console.error("Error reading timetable entries from local storage:", error);
  }
  return [];
};

/**
 * Save timetable entries to local storage
 */
export const saveTimetableEntriesToLocalStorage = (
  entries: TimetableEntry[]
): void => {
  try {
    localStorage.setItem("timetableEntries", JSON.stringify(entries));
  } catch (error) {
    console.error("Error saving timetable entries to local storage:", error);
  }
};

/**
 * Get timetable entries from cloud storage
 */
const getTimetableEntriesFromCloud = async (
  userId: string
): Promise<TimetableEntry[]> => {
  try {
    const { databases } = await getAppwriteClient();
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    return response.documents.map((doc) => ({
      id: doc.$id,
      subjectId: doc.subjectId,
      day: doc.day,
      startTime: doc.startTime,
      endTime: doc.endTime,
      room: doc.room,
      notes: doc.notes,
      recurring: doc.recurring || true,
      color: doc.color,
    }));
  } catch (error) {
    console.error("Error getting timetable entries from cloud:", error);
    return [];
  }
};

/**
 * Save a timetable entry to cloud storage
 */
export const saveTimetableEntryToCloud = async (
  entry: Omit<TimetableEntry, "id">,
  userId: string
): Promise<TimetableEntry> => {
  try {
    const { databases } = await getAppwriteClient();
    const response = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        subjectId: entry.subjectId,
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: entry.room || "",
        notes: entry.notes || "",
        recurring: entry.recurring !== undefined ? entry.recurring : true,
        color: entry.color || "",
      }
    );

    return {
      id: response.$id,
      subjectId: response.subjectId,
      day: response.day,
      startTime: response.startTime,
      endTime: response.endTime,
      room: response.room,
      notes: response.notes,
      recurring: response.recurring,
      color: response.color,
    };
  } catch (error) {
    console.error("Error saving timetable entry to cloud:", error);
    throw error;
  }
};

/**
 * Delete a timetable entry
 */
export const deleteTimetableEntry = async (
  entryId: string,
  userId?: string,
  syncEnabled?: boolean
): Promise<boolean> => {
  try {
    // Remove from local storage
    const localEntries = getTimetableEntriesFromLocalStorage();
    const updatedEntries = localEntries.filter((entry) => entry.id !== entryId);
    saveTimetableEntriesToLocalStorage(updatedEntries);

    // If cloud sync is enabled, delete from cloud too
    if (userId && syncEnabled) {
      const { databases } = await getAppwriteClient();
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID!,
        entryId
      );
    }

    return true;
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    return false;
  }
};

import { ID, Query } from "appwrite";
import {
  StudySession,
  PomodoroSettings,
  StudyStats,
} from "@/types/studySession";
import { generateId } from "@/utils/idUtils";
import { format, subDays, startOfWeek } from "date-fns";
// Import encryption utilities
import { encrypt, decrypt } from "@/lib/appwrite";

// Local storage keys
const SESSIONS_STORAGE_KEY = "studySessions";
const SETTINGS_STORAGE_KEY = "pomodoroSettings";

// Get Appwrite client using the existing utility
const getAppwriteClient = async () => {
  const { getAppwriteClient } = await import("@/utils/storageUtils");
  return getAppwriteClient();
};

// Save a study session to storage (local and cloud)
export async function saveStudySession(
  session: StudySession
): Promise<StudySession> {
  try {
    // If session doesn't have an ID, generate one
    if (!session.id) {
      session.id = generateId();
    }
    
    // Clone session to avoid modifying the original
    const sessionToSave = { ...session };
    
    // IMPROVED ENCRYPTION - Always encrypt notes if they exist and userId is available
    if (sessionToSave.notes && sessionToSave.userId) {
      try {
        console.log("⚙️ Encrypting notes for session", sessionToSave.id);
        // Force string conversion to ensure compatibility
        const notesStr = String(sessionToSave.notes);
        
        // Check if notes are already encrypted (to avoid double encryption)
        if (!/^[A-Za-z0-9+/=]+$/.test(notesStr) || notesStr.length < 24) {
          sessionToSave.notes = await encrypt(sessionToSave.userId, notesStr);
          console.log("✓ Notes encrypted successfully");
        } else {
          console.log("⚠️ Notes appear to be already encrypted, skipping encryption");
        }
      } catch (encryptError) {
        console.error("❌ Failed to encrypt notes:", encryptError);
        // Don't fall back to plaintext - this ensures we notice the encryption failure
        throw new Error("Failed to encrypt sensitive data: " + encryptError.message);
      }
    }

    // Get existing sessions from local storage
    const sessionsJson = localStorage.getItem(SESSIONS_STORAGE_KEY);
    let sessions: StudySession[] = sessionsJson ? JSON.parse(sessionsJson) : [];

    // Update if exists, otherwise add
    const index = sessions.findIndex((s) => s.id === sessionToSave.id);
    if (index !== -1) {
      sessions[index] = sessionToSave;
    } else {
      sessions.push(sessionToSave);
    }

    // Save to local storage
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));

    // If userId exists, save to cloud
    if (sessionToSave.userId) {
      try {
        const { databases, ID } = await getAppwriteClient();
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
        const collectionId =
          process.env.NEXT_PUBLIC_APPWRITE_POMODORO_COLLECTION_ID || "";

        // Check if document exists
        const docs = await databases.listDocuments(databaseId, collectionId, [
          Query.equal("sessionId", sessionToSave.id),
        ]);

        // IMPORTANT: Verify notes are encrypted before saving to the cloud
        if (sessionToSave.notes && 
            (!/^[A-Za-z0-9+/=]+$/.test(sessionToSave.notes) || 
             sessionToSave.notes.length < 24)) {
          console.error("❌ Attempting to save unencrypted notes to cloud. Aborting.");
          throw new Error("Security check failed: Notes must be encrypted before saving to cloud");
        }

        // Prepare the document data - ensure all fields are properly typed
        const documentData = {
          userId: sessionToSave.userId,
          sessionId: sessionToSave.id,
          subjectId: sessionToSave.subjectId,
          startTime: sessionToSave.startTime,
          endTime: sessionToSave.endTime,
          duration: sessionToSave.duration,
          completed: sessionToSave.completed,
          notes: sessionToSave.notes, // This should now be encrypted
          pomodoros: sessionToSave.pomodoros,
        };

        if (docs.documents.length > 0) {
          // Update existing document
          await databases.updateDocument(
            databaseId,
            collectionId,
            docs.documents[0].$id,
            documentData
          );
          console.log("✓ Updated session in cloud with encrypted notes");
        } else {
          // Create new document
          await databases.createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            documentData
          );
          console.log("✓ Created session in cloud with encrypted notes");
        }
      } catch (cloudError) {
        console.error("❌ Error saving study session to cloud:", cloudError);
        // Continue without failing - local storage is the source of truth
      }
    }

    // Return the original session (not the encrypted version)
    return session;
  } catch (error) {
    console.error("❌ Error saving study session:", error);
    throw error;
  }
}

// Get study sessions from storage (local and cloud)
export async function getStudySessions(
  userId?: string
): Promise<StudySession[]> {
  try {
    // Get sessions from local storage
    const sessionsJson = localStorage.getItem(SESSIONS_STORAGE_KEY);
    let sessions: StudySession[] = sessionsJson ? JSON.parse(sessionsJson) : [];

    // Filter by userId if provided
    if (userId) {
      sessions = sessions.filter((s) => s.userId === userId);

      // Decrypt notes in sessions
      sessions = await Promise.all(
        sessions.map(async (session) => {
          // Create a copy to avoid mutating the original
          const decryptedSession = { ...session };
          
          // Decrypt notes if they exist
          if (decryptedSession.notes) {
            try {
              // Check if the notes appear to be encrypted
              if (decryptedSession.notes.length > 24 && /^[A-Za-z0-9+/=]+$/.test(decryptedSession.notes)) {
                decryptedSession.notes = await decrypt(userId, decryptedSession.notes);
              }
            } catch (decryptError) {
              console.error("Failed to decrypt notes, using as is:", decryptError);
            }
          }
          
          return decryptedSession;
        })
      );

      // Try to fetch from cloud
      try {
        const { databases, Query } = await getAppwriteClient();
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
        const collectionId =
          process.env.NEXT_PUBLIC_APPWRITE_POMODORO_COLLECTION_ID || "";

        const docs = await databases.listDocuments(databaseId, collectionId, [
          Query.equal("userId", userId),
          Query.limit(500),
        ]);

        if (docs.documents.length > 0) {
          // Map cloud documents to StudySession objects with decrypted notes
          const cloudSessions = await Promise.all(
            docs.documents.map(async (doc) => {
              let decryptedNotes = doc.notes || "";
              
              // Attempt to decrypt notes if they exist
              if (decryptedNotes) {
                try {
                  // Check if the notes appear to be encrypted
                  if (decryptedNotes.length > 24 && /^[A-Za-z0-9+/=]+$/.test(decryptedNotes)) {
                    decryptedNotes = await decrypt(userId, decryptedNotes);
                  }
                } catch (decryptError) {
                  console.error("Failed to decrypt cloud notes, using as is:", decryptError);
                }
              }

              return {
                id: doc.sessionId,
                userId: doc.userId,
                subjectId: doc.subjectId,
                startTime: doc.startTime,
                endTime: doc.endTime,
                duration: doc.duration,
                completed: doc.completed,
                notes: decryptedNotes,
                pomodoros: doc.pomodoros || 0,
              };
            })
          );

          // Merge cloud sessions with local sessions
          // Use a Map to deduplicate by ID, preferring cloud data
          const sessionMap = new Map<string, StudySession>();

          // Add local sessions first
          sessions.forEach((s) => sessionMap.set(s.id, s));

          // Then override with cloud sessions
          cloudSessions.forEach((s) => sessionMap.set(s.id, s));

          sessions = Array.from(sessionMap.values());

          // Update local storage with merged data (with encrypted notes)
          const sessionsForStorage = await Promise.all(
            sessions.map(async (session) => {
              const sessionForStorage = { ...session };
              if (sessionForStorage.notes && sessionForStorage.userId) {
                try {
                  sessionForStorage.notes = await encrypt(sessionForStorage.userId, sessionForStorage.notes);
                } catch (encryptError) {
                  console.error("Failed to encrypt notes for storage:", encryptError);
                }
              }
              return sessionForStorage;
            })
          );
          
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessionsForStorage));
        }
      } catch (cloudError) {
        console.error("Error fetching study sessions from cloud:", cloudError);
        // Continue with local sessions
      }
    }

    // Sort by startTime (newest first)
    return sessions.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  } catch (error) {
    console.error("Error getting study sessions:", error);
    return [];
  }
}

// Delete a study session
export async function deleteStudySession(
  sessionId: string,
  userId: string
): Promise<boolean> {
  try {
    // Delete from local storage
    const sessionsJson = localStorage.getItem(SESSIONS_STORAGE_KEY);

    if (sessionsJson) {
      let sessions: StudySession[] = JSON.parse(sessionsJson);
      sessions = sessions.filter((s) => s.id !== sessionId);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    }

    // Delete from cloud
    try {
      const { databases, Query } = await getAppwriteClient();
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
      const collectionId =
        process.env.NEXT_PUBLIC_APPWRITE_POMODORO_COLLECTION_ID || "";

      const docs = await databases.listDocuments(databaseId, collectionId, [
        Query.equal("sessionId", sessionId),
        Query.equal("userId", userId),
      ]);

      for (const doc of docs.documents) {
        await databases.deleteDocument(databaseId, collectionId, doc.$id);
      }
    } catch (cloudError) {
      console.error("Error deleting study session from cloud:", cloudError);
      // Continue without failing
    }

    return true;
  } catch (error) {
    console.error("Error deleting study session:", error);
    return false;
  }
}

// Calculate study statistics
export async function getStudyStats(userId: string): Promise<StudyStats> {
  try {
    const sessions = await getStudySessions(userId);
    const completedSessions = sessions.filter((s) => s.completed);

    // Default stats
    const stats: StudyStats = {
      totalTimeToday: 0,
      totalTimeThisWeek: 0,
      totalSessions: completedSessions.length,
      sessionsPerSubject: {},
      timePerSubject: {},
      averageSessionLength: 0,
      streakDays: 0,
      lastStudyDate: null,
    };

    if (completedSessions.length === 0) {
      return stats;
    }

    // Calculate time per subject and sessions per subject
    let totalTime = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = startOfWeek(today);

    // Map to track unique study days
    const studyDays = new Map<string, boolean>();

    // Track the most recent consecutive days
    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate: Date | null = null;

    completedSessions.forEach((session) => {
      const sessionStartDate = new Date(session.startTime);
      const dayKey = format(sessionStartDate, "yyyy-MM-dd");

      // Track study days
      studyDays.set(dayKey, true);

      // Process session duration if available
      if (session.duration) {
        totalTime += session.duration;

        // Add to subject stats
        const subjectId = session.subjectId || "unassigned";

        stats.sessionsPerSubject[subjectId] =
          (stats.sessionsPerSubject[subjectId] || 0) + 1;
        stats.timePerSubject[subjectId] =
          (stats.timePerSubject[subjectId] || 0) + session.duration;

        // Check if session is from today
        if (sessionStartDate >= today) {
          stats.totalTimeToday += session.duration;
        }

        // Check if session is from this week
        if (sessionStartDate >= weekStart) {
          stats.totalTimeThisWeek += session.duration;
        }
      }

      // Track the most recent date
      if (!lastDate || sessionStartDate > lastDate) {
        lastDate = sessionStartDate;
        stats.lastStudyDate = session.startTime;
      }
    });

    // Calculate average session length
    stats.averageSessionLength = totalTime / completedSessions.length;

    // Calculate streak (consecutive days)
    // Sort study days
    const sortedDays = Array.from(studyDays.keys()).sort();

    if (sortedDays.length > 0) {
      currentStreak = 1;
      maxStreak = 1;

      for (let i = 1; i < sortedDays.length; i++) {
        const prevDate = new Date(sortedDays[i - 1]);
        const currDate = new Date(sortedDays[i]);

        // Check if dates are consecutive
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);

        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
    }

    stats.streakDays = maxStreak;

    return stats;
  } catch (error) {
    console.error("Error calculating study stats:", error);
    return {
      totalTimeToday: 0,
      totalTimeThisWeek: 0,
      totalSessions: 0,
      sessionsPerSubject: {},
      timePerSubject: {},
      averageSessionLength: 0,
      streakDays: 0,
      lastStudyDate: null,
    };
  }
}

// Save and get pomodoro settings
export async function savePomodoroSettings(
  userId: string,
  settings: PomodoroSettings
): Promise<PomodoroSettings> {
  try {
    // Save to local storage
    localStorage.setItem(
      `${SETTINGS_STORAGE_KEY}-${userId}`,
      JSON.stringify(settings)
    );

    // Save to cloud (if implemented)
    // Note: For simplicity, we're only using local storage for settings

    return settings;
  } catch (error) {
    console.error("Error saving pomodoro settings:", error);
    throw error;
  }
}

export async function getPomodoroSettings(
  userId: string
): Promise<PomodoroSettings | null> {
  try {
    // Get from local storage
    const settingsJson = localStorage.getItem(
      `${SETTINGS_STORAGE_KEY}-${userId}`
    );
    return settingsJson ? JSON.parse(settingsJson) : null;
  } catch (error) {
    console.error("Error getting pomodoro settings:", error);
    return null;
  }
}

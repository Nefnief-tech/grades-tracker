import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  StudySession,
  PomodoroSettings,
  StudyStats,
} from "@/types/studySession";
import {
  saveStudySession,
  getStudySessions,
  deleteStudySession,
  getStudyStats,
  savePomodoroSettings,
  getPomodoroSettings,
} from "@/utils/studySessionUtils";
import { generateId } from "@/utils/idUtils"; // Use the existing idUtils instead of uuid

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  alarmSound: "bell",
  alarmVolume: 50,
};

export function useStudySession() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);

  // Fetch study sessions
  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const fetchedSessions = await getStudySessions(user.id);
      setSessions(fetchedSessions);

      const studyStats = await getStudyStats(user.id);
      setStats(studyStats);

      const pomodoroSettings = await getPomodoroSettings(user.id);
      setSettings(pomodoroSettings || DEFAULT_SETTINGS);
    } catch (err) {
      console.error("Error fetching study sessions:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch study sessions")
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load sessions on mount and when user changes
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Start a new study session
  const startSession = useCallback(
    async (subjectId: string | null = null, notes: string = "") => {
      if (!user) return null;

      try {
        // Create a proper ID for the new session - Using local generateId function
        const sessionId = generateId();

        const newSession: StudySession = {
          id: sessionId,
          userId: user.id,
          subjectId,
          startTime: new Date().toISOString(),
          endTime: null,
          duration: null,
          completed: false,
          notes,
          pomodoros: 0,
        };

        const createdSession = await saveStudySession(newSession);
        console.log("Session created successfully:", createdSession);

        // Update state with the new session
        setCurrentSession(createdSession);

        // Force a refresh of the sessions list
        setTimeout(() => {
          fetchSessions();
        }, 500);

        return createdSession;
      } catch (err) {
        console.error("Error starting study session:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to start study session")
        );
        return null;
      }
    },
    [user, fetchSessions]
  );

  // Fix the endSession function to calculate duration correctly
  const endSession = useCallback(
    async (pomodoros: number, notes?: string) => {
      console.log("End session called with:", {
        pomodoros,
        notes,
        currentSession,
      });

      if (!user) {
        console.error("Cannot end session: No user logged in");
        return false;
      }

      if (!currentSession) {
        console.error("Cannot end session: No active session");
        return false;
      }

      try {
        const endTime = new Date().toISOString();
        const startTime = new Date(currentSession.startTime);
        const endDateTime = new Date(endTime);

        // Calculate duration in minutes correctly
        const durationMs = endDateTime.getTime() - startTime.getTime();
        const durationMinutes = Math.max(1, Math.round(durationMs / 60000)); // Ensure at least 1 minute

        console.log(`Session duration calculation:`, {
          startTime: startTime.toISOString(),
          endTime: endDateTime.toISOString(),
          durationMs,
          durationMinutes,
        });

        const updatedSession: StudySession = {
          ...currentSession,
          endTime,
          duration: durationMinutes,
          completed: true,
          pomodoros,
          notes: notes !== undefined ? notes : currentSession.notes,
        };

        console.log("Saving updated session:", updatedSession);
        await saveStudySession(updatedSession);

        // Clear current session AFTER saving successfully
        setCurrentSession(null);

        // Refresh sessions list to show the completed session
        await fetchSessions();

        return true;
      } catch (err) {
        console.error("Error ending study session:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to end study session")
        );
        return false;
      }
    },
    [currentSession, user, fetchSessions]
  );

  // Delete a study session
  const removeSession = useCallback(
    async (sessionId: string) => {
      if (!user) return false;

      try {
        await deleteStudySession(sessionId, user.id);
        setSessions((prevSessions) =>
          prevSessions.filter((session) => session.id !== sessionId)
        );
        fetchSessions(); // Refresh sessions and stats
        return true;
      } catch (err) {
        console.error("Error deleting study session:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to delete study session")
        );
        return false;
      }
    },
    [user, fetchSessions]
  );

  // Update settings
  const updateSettings = useCallback(
    async (newSettings: Partial<PomodoroSettings>) => {
      if (!user) return false;

      try {
        const updatedSettings = { ...settings, ...newSettings };
        await savePomodoroSettings(user.id, updatedSettings);
        setSettings(updatedSettings);
        return true;
      } catch (err) {
        console.error("Error updating pomodoro settings:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to update settings")
        );
        return false;
      }
    },
    [user, settings]
  );

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    stats,
    settings,
    startSession,
    endSession,
    removeSession,
    updateSettings,
    fetchSessions,
  };
}

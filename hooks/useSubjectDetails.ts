import { useState, useEffect, useCallback } from "react";
import { getSubjectById } from "@/utils/storageUtils";
import { useAuth } from "@/contexts/AuthContext";
import type { Subject } from "@/types/grades";

export function useSubjectDetails(subjectId: string) {
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchSubject = useCallback(async () => {
    if (!user || !subjectId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const fetchedSubject = await getSubjectById(
        subjectId,
        user.id,
        user.syncEnabled
      );

      if (fetchedSubject) {
        setSubject(fetchedSubject);
      } else {
        setError(new Error("Subject not found"));
      }
    } catch (err) {
      console.error("Error fetching subject:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, user, refreshTrigger]);

  // Initial fetch and refetch on dependencies change
  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  // Listen for update events
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener("subjectsUpdated", handleUpdate);
    window.addEventListener("gradeAdded", handleUpdate);

    return () => {
      window.removeEventListener("subjectsUpdated", handleUpdate);
      window.removeEventListener("gradeAdded", handleUpdate);
    };
  }, []);

  // Function to manually trigger refresh
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    subject,
    isLoading,
    error,
    refresh,
  };
}

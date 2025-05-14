import { useState, useEffect, useCallback, useRef } from "react";
import { fetchSubjectsWithGrades, clearCache } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import type { Subject } from "@/types/grades";

/**
 * Enhanced hook for fetching and managing subjects and grades
 * @returns The subjects hook interface
 */
export function useSubjectsWithGrades() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchInProgressRef = useRef(false);
  
  // Fetch subjects with their grades
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!user?.id || !user.syncEnabled) {
      // No user or sync disabled
      setSubjects([]);
      setIsLoading(false);
      return;
    }
    
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      console.log("Fetch already in progress");
      return;
    }
    
    try {
      fetchInProgressRef.current = true;
      setIsLoading(true);
      
      // Clear cache if force refreshing
      if (forceRefresh) {
        clearCache();
      }
      
      console.log("Fetching subjects with grades");
      const data = await fetchSubjectsWithGrades(user.id);
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`Retrieved ${data.length} subjects with grades`);
        setSubjects(data);
        
        // Cache in localStorage for faster future access
        localStorage.setItem("gradeCalculator", JSON.stringify(data));
      } else {
        console.log("No subjects found");
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching subjects with grades:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Try to use cached data as fallback
      try {
        const cachedData = localStorage.getItem("gradeCalculator");
        if (cachedData) {
          const localSubjects = JSON.parse(cachedData);
          if (Array.isArray(localSubjects) && localSubjects.length > 0) {
            console.log(`Using cached data: ${localSubjects.length} subjects`);
            setSubjects(localSubjects);
          }
        }
      } catch (cacheErr) {
        console.error("Failed to read cached data:", cacheErr);
      }
    } finally {
      setIsLoading(false);
      // Release fetch lock after a short delay to prevent rapid re-fetches
      setTimeout(() => {
        fetchInProgressRef.current = false;
      }, 1000);
    }
  }, [user]);
  
  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchData(true);
    }
  }, [user, fetchData]);
  
  // Manual refresh function for consumers
  const refreshSubjects = useCallback(() => {
    fetchData(true);
  }, [fetchData]);
  
  return {
    subjects,
    isLoading,
    error,
    refreshSubjects,
  };
}
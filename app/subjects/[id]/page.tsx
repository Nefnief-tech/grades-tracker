"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradeTable } from "@/components/GradeTable";
import { GradeForm } from "@/components/GradeForm";
import { GradeHistoryChart } from "@/components/GradeHistoryChart";
import { ArrowLeft, BarChart2, Award } from "lucide-react";
import Link from "next/link";
import { getSubjectById, debugSubjects } from "@/utils/storageUtils";
import { DebugPanel } from "@/components/DebugPanel";

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [subject, setSubject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const subjectId = params.id as string;

  // Define refs at the component level
  const previousSubject = useRef<any>(null);
  const componentId = useRef(`subject-${subjectId}-${Date.now()}`);
  const lastProcessedTime = useRef(0);
  const refreshInProgress = useRef(false);
  const processedEvents = useRef(new Set<string>());
  const isRefreshingRef = useRef(false);
  const fetchCountRef = useRef(0);

  // Function to load subject data with critical anti-loop fixes
  const loadSubject = useCallback(async () => {
    if (!user || !subjectId) {
      router.push("/landing");
      return;
    }

    // CRITICAL FIX: Add a counter to prevent excessive fetches
    fetchCountRef.current += 1;
    const currentFetchCount = fetchCountRef.current;

    if (currentFetchCount > 10) {
      console.error("Too many fetches detected, breaking potential loop");
      return;
    }

    // Prevent loading again if already loading
    if (isLoading) {
      console.log("Already loading subject, skipping duplicate load");
      return;
    }

    console.log(`Loading subject data (${currentFetchCount}):`, subjectId);
    setIsLoading(true);

    try {
      // Always force refresh to get the most recent data
      const fetchedSubject = await getSubjectById(
        subjectId,
        user.id,
        user.syncEnabled,
        true // Always force refresh
      );

      if (!fetchedSubject) {
        console.error("Subject not found, redirecting to home");
        router.push("/");
        return;
      }

      console.log(
        `Loaded subject "${fetchedSubject.name}" with ${
          fetchedSubject.grades?.length || 0
        } grades`
      );
      setSubject(fetchedSubject);
      previousSubject.current = fetchedSubject;
    } catch (error) {
      console.error("Error loading subject:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);

      // Reset fetch counter after successful load
      setTimeout(() => {
        fetchCountRef.current = 0;
      }, 5000);
    }
  }, [user, subjectId, router, isLoading]);

  // Function to refresh subject data
  const refreshSubject = useCallback(() => {
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);

    setTimeout(() => {
      isRefreshingRef.current = false;
    }, 500);
  }, []);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    if (user) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("refresh", "true");
      window.history.replaceState({}, "", currentUrl.toString());

      setIsRefreshing(true);
      setRefreshKey((prev) => prev + 1);

      setTimeout(() => {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("refresh");
        window.history.replaceState({}, "", cleanUrl.toString());
      }, 500);
    }
  }, [user]);

  // Debug function
  const debugData = useCallback(() => {
    if (user) {
      debugSubjects(user.id);
    }
  }, [user]);

  // Initial load effect
  // CRITICAL: Only load on user change, not on refreshKey!
  useEffect(() => {
    if (user) {
      loadSubject();
    }
  }, [user, loadSubject]); // Remove refreshKey from dependencies

  // Add a separate effect for refresh key changes
  useEffect(() => {
    if (refreshKey > 0 && user) {
      // Only refresh if we're not already loading and not exceeding fetch count
      if (!isLoading && fetchCountRef.current < 5) {
        console.log(`Refresh key changed (${refreshKey}), loading subject`);
        loadSubject();
      }
    }
  }, [refreshKey, user, isLoading, loadSubject]);

  // Event listeners effect - highly simplified
  useEffect(() => {
    // Simplify event handling for grade added - ONLY care about this in the subject page
    const handleGradeAdded = (event: CustomEvent) => {
      if (event.detail?.subjectId !== subjectId) return;

      console.log(`Grade added for ${subjectId}, refreshing subject`);

      // Just set the refresh key - let the other effect handle loading
      setRefreshKey((prev) => prev + 1);
    };

    // Only listen for grade added events - ignore subjectsUpdated
    console.log(`Setting up grade added listener for subject ${subjectId}`);
    window.addEventListener("gradeAdded", handleGradeAdded as EventListener);

    return () => {
      window.removeEventListener(
        "gradeAdded",
        handleGradeAdded as EventListener
      );
    };
  }, [subjectId]);

  // Helper functions
  const getGradeColor = (grade: number): string => {
    if (grade <= 1.5) return "text-green-600 dark:text-green-400";
    if (grade <= 2.5) return "text-blue-600 dark:text-blue-400";
    if (grade <= 3.5) return "text-yellow-600 dark:text-yellow-400";
    if (grade <= 4.5) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeBadgeColor = (grade: number): string => {
    if (grade <= 1.5) return "bg-green-500/10";
    if (grade <= 2.5) return "bg-blue-500/10";
    if (grade <= 3.5) return "bg-yellow-500/10";
    if (grade <= 4.5) return "bg-orange-500/10";
    return "bg-red-500/10";
  };

  // Show skeleton loading state
  if (isLoading || !subject) {
    return <SubjectSkeleton />;
  }

  // Render component
  return (
    <div className="container py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to dashboard
        </Link>

        {/* Add a refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={forceRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          {isRefreshing ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              Refreshing...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
              Refresh from Cloud
            </>
          )}
        </Button>

        {/* Add a debug button in development mode */}
        {process.env.NODE_ENV === "development" && (
          <Button
            variant="outline"
            size="sm"
            onClick={debugData}
            className="ml-2"
          >
            Debug Data
          </Button>
        )}
      </div>

      {/* Enhanced Subject Header with Large Average */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">{subject.name}</h1>
          <div
            className={`${getGradeBadgeColor(
              subject.averageGrade
            )} rounded-xl p-4 flex items-center gap-3`}
          >
            <Award
              className={`h-7 w-7 ${getGradeColor(subject.averageGrade)}`}
            />
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Average Grade
              </div>
              <div
                className={`text-3xl font-bold ${getGradeColor(
                  subject.averageGrade
                )}`}
              >
                {subject.averageGrade.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-muted/40 border-muted mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">
                  Total Grades:
                </div>
                <div className="text-2xl font-semibold">
                  {subject.grades.length}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">
                  Average Grade:
                </div>
                <div
                  className={`text-4xl font-bold ${getGradeColor(
                    subject.averageGrade
                  )}`}
                >
                  {subject.averageGrade.toFixed(1)}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">
                  Last Grade:
                </div>
                <div className="text-2xl font-semibold">
                  {subject.grades.length > 0
                    ? subject.grades[subject.grades.length - 1].value.toFixed(1)
                    : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Grade History
              </CardTitle>
              <CardDescription>
                Visual representation of your grade history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <GradeHistoryChart grades={subject.grades} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add New Grade</CardTitle>
              <CardDescription>
                Record a new grade for this subject
              </CardDescription>
            </CardHeader>
            <GradeForm subjectId={subject.id} onGradeAdded={refreshSubject} />
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Grade History</CardTitle>
              <CardDescription>
                All grades recorded for this subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={
                  isRefreshing
                    ? "opacity-80 transition-opacity duration-200"
                    : ""
                }
              >
                <GradeTable
                  grades={subject.grades}
                  subjectId={subject.id}
                  onGradeDeleted={refreshSubject} // Reuse the same handler for deletions
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Debug Panel at the bottom */}
      {process.env.NODE_ENV === "development" && (
        <DebugPanel subjectId={subjectId} />
      )}
    </div>
  );
}

// Helper debounce function for smoother UI updates
function debounce(fn: Function, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function SubjectSkeleton() {
  return (
    <div className="container py-8 animate-pulse">
      <div className="mb-6">
        <div className="h-6 bg-muted w-32 rounded"></div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="h-10 bg-muted w-64 rounded"></div>
          <div className="h-20 w-36 bg-muted/30 rounded-xl"></div>
        </div>

        <div className="h-24 bg-muted/40 rounded-lg mb-8"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-80 bg-muted/40 border border-muted rounded-lg"></div>
        </div>
        <div>
          <div className="h-64 bg-muted/40 border border-muted rounded-lg"></div>
        </div>
        <div className="lg:col-span-3">
          <div className="h-80 bg-muted/40 border border-muted rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

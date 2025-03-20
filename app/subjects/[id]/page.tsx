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
import { getSubjectById } from "@/utils/storageUtils";
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
  const previousSubject = useRef<any>(null);

  // Function to load subject data with debouncing
  const loadSubject = useCallback(async () => {
    if (!user || !subjectId) {
      router.push("/landing");
      return;
    }

    setIsLoading(true);
    try {
      const fetchedSubject = await getSubjectById(
        subjectId,
        user.id,
        user.syncEnabled
      );

      if (!fetchedSubject) {
        router.push("/");
        return;
      }

      // Keep previous data during refresh to prevent UI jumps
      if (isRefreshing && previousSubject.current) {
        // Only update the grades and average, keep the rest
        previousSubject.current.grades = fetchedSubject.grades;
        previousSubject.current.averageGrade = fetchedSubject.averageGrade;
        setSubject({ ...previousSubject.current });
      } else {
        setSubject(fetchedSubject);
        previousSubject.current = fetchedSubject;
      }
    } catch (error) {
      console.error("Error loading subject:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, subjectId, router, isRefreshing]);

  // Initial load and refresh on refresh key change
  useEffect(() => {
    if (user) {
      loadSubject();
    }
  }, [user, loadSubject, refreshKey]);

  // Add listener for subject updates with debouncing
  useEffect(() => {
    const debouncedRefresh = debounce(() => {
      setIsRefreshing(true);
      setRefreshKey((prev) => prev + 1);
    }, 300);

    const handleSubjectsUpdated = () => {
      debouncedRefresh();
    };

    window.addEventListener("subjectsUpdated", handleSubjectsUpdated);
    window.addEventListener("gradeAdded", handleSubjectsUpdated);

    return () => {
      window.removeEventListener("subjectsUpdated", handleSubjectsUpdated);
      window.removeEventListener("gradeAdded", handleSubjectsUpdated);
    };
  }, []);

  // Add a refresh lock to prevent multiple refreshes
  const isRefreshingRef = useRef(false);

  // Function to refresh subject data
  const refreshSubject = useCallback(() => {
    // Prevent multiple refreshes in quick succession
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);

    // Reset the refresh lock after a delay
    setTimeout(() => {
      isRefreshingRef.current = false;
    }, 500);
  }, []);

  // Helper function to determine grade color
  const getGradeColor = (grade: number): string => {
    if (grade <= 1.5) return "text-green-600 dark:text-green-400";
    if (grade <= 2.5) return "text-blue-600 dark:text-blue-400";
    if (grade <= 3.5) return "text-yellow-600 dark:text-yellow-400";
    if (grade <= 4.5) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  // Helper function to get grade badge color
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

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to dashboard
        </Link>
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

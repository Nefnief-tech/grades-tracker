"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SidebarInset } from "@/components/ui/sidebar";
import type { Subject } from "../types/grades";
import { getSubjectsFromStorage } from "../utils/storageUtils";
import { SubjectForm } from "../components/SubjectForm";
import { BookOpen, ArrowRight, LineChart, Info } from "lucide-react";
import { GradeHistoryChart } from "../components/GradeHistoryChart";
import { SubjectList } from "../components/SubjectList";
import { AverageGradeBanner } from "../components/AverageGradeBanner";

function getGradeColor(grade: number): string {
  if (grade <= 1.5) return "bg-green-500";
  if (grade <= 2.5) return "bg-yellow-500";
  if (grade <= 3.5) return "bg-orange-500";
  return "bg-red-500";
}

export default function Home() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubjects = async () => {
    const savedSubjects = await getSubjectsFromStorage(
      user?.id,
      user?.syncEnabled
    );
    setSubjects(savedSubjects);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSubjects();
  }, [user]);

  // Listen for sync preference changes
  useEffect(() => {
    const handleSyncChange = () => {
      loadSubjects();
    };

    window.addEventListener("syncPreferenceChanged", handleSyncChange);
    return () => {
      window.removeEventListener("syncPreferenceChanged", handleSyncChange);
    };
  }, []);

  if (isLoading) {
    return (
      <SidebarInset className="w-full">
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset className="w-full">
      {/* This container will fill the entire available space */}
      <div className="w-full">
        {/* Inner container with max-width to center content on large screens */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Add the Average Grade Banner at the top */}
          {subjects.length > 0 && <AverageGradeBanner subjects={subjects} />}

          <div className="space-y-6 md:space-y-8 w-full py-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                German Grade Calculator
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Track and calculate your grades using the German grading system
                (1-6)
              </p>
              <div className="bg-muted/30 p-2 md:p-3 rounded-md mt-2 text-xs sm:text-sm flex flex-col sm:flex-row items-start gap-2">
                <Info className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="mb-1">
                    <span className="font-medium">Weighted Grading:</span> Tests
                    count double (2.0x) compared to other grade types (1.0x).
                  </p>
                  <p>
                    <span className="font-medium">Graph Interpretation:</span>{" "}
                    The graph goes up for good grades (1) and down for poor
                    grades (6).
                  </p>
                  <p>
                    <span className="font-medium">Important:</span> The At the
                    current moment, u are not able to delete subjects, so name
                    them carefully
                  </p>
                </div>
              </div>
            </div>

            {/* Add Subject Form */}
            <div className="mb-4 md:mb-8">
              <SubjectForm onSubjectAdded={loadSubjects} />
            </div>

            <div className="space-y-2 md:space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                Your Subjects
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Select a subject to view and add grades
              </p>
            </div>

            {subjects.length > 0 ? (
              <SubjectList
                subjects={subjects}
                onSubjectDeleted={loadSubjects}
              />
            ) : (
              <Card className="bg-card border-border p-6 text-center">
                <p className="text-muted-foreground">
                  No subjects found. Add your first subject above.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}

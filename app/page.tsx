"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { SubjectForm } from "../components/SubjectForm";
import { SubjectList } from "../components/SubjectList";
import { AverageGradeBanner } from "../components/AverageGradeBanner";
import { BookOpen, Info } from "lucide-react";
import { useSubjects } from "@/hooks/useSubjects";
import { LoadingSubjects } from "@/components/LoadingSubjects";
import { FetchCounter } from "@/components/FetchCounter"; // Add this import

// Add a global counter for page mounts to track excessive re-renders
let mountCount = 0;

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { subjects, isLoading, refreshSubjects } = useSubjects();
  const mountCountRef = useRef(0);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/landing");
    }
  }, [user, authLoading, router]);

  // Listen for sync preference changes
  useEffect(() => {
    const handleSyncChange = () => {
      refreshSubjects();
    };

    window.addEventListener("syncPreferenceChanged", handleSyncChange);
    return () => {
      window.removeEventListener("syncPreferenceChanged", handleSyncChange);
    };
  }, [refreshSubjects]);

  // Track mount count to detect excessive rerenders
  useEffect(() => {
    mountCount++;
    mountCountRef.current = mountCount;
    console.log(`Dashboard mounted ${mountCount} time(s)`);

    return () => {
      console.log(
        `Dashboard unmounted after ${mountCountRef.current} mount(s)`
      );
    };
  }, []);

  // Format the current date
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <SidebarInset className="w-full">
        <div className="flex items-center justify-center h-screen">
          <LoadingSkeleton />
        </div>
      </SidebarInset>
    );
  }

  // If no user and not loading, the redirect will happen via the useEffect
  if (!user) {
    return (
      <SidebarInset className="w-full">
        <div className="flex items-center justify-center h-screen">
          Redirecting...
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset className="w-full">
      <div className="w-full">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-muted-foreground text-sm mb-4">
            Today is {currentDate}
          </div>

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
                    <span className="font-medium">Important:</span> At the
                    current moment, you are not able to delete subjects, so name
                    them carefully
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4 md:mb-8">
              <SubjectForm onSubjectAdded={refreshSubjects} />
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

            {isLoading ? (
              <LoadingSubjects />
            ) : subjects.length > 0 ? (
              <SubjectList
                subjects={subjects}
                onSubjectDeleted={refreshSubjects}
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
        {/* Add the fetch counter in development */}
        {process.env.NODE_ENV === "development" && <FetchCounter />}
      </div>
    </SidebarInset>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 animate-pulse">
      <div className="h-4 w-48 bg-muted rounded mb-8"></div>
      <div className="h-24 bg-muted/50 rounded-lg mb-8"></div>
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted rounded"></div>
        <div className="h-4 w-96 bg-muted rounded"></div>
        <div className="h-20 bg-muted/30 rounded"></div>
        <div className="h-12 bg-muted rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

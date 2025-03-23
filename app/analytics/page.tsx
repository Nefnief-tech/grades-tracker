"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { GradeAnalytics } from "@/components/GradeAnalytics";
import { useSubjects } from "@/hooks/useSubjects";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { subjects, isLoading, error } = useSubjects();

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-10 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mb-6">
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load your data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No data state
  if (subjects.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <Card className="p-8 text-center">
          <h2 className="text-xl mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-4">
            Add subjects and grades to see analytics and visualizations.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <GradeAnalytics subjects={subjects} />
    </div>
  );
}

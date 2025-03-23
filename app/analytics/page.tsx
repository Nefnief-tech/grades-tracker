"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/charts";
import { useSubjects } from "@/hooks/useSubjects";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { subjects, isLoading } = useSubjects();
  const [averageGrade, setAverageGrade] = useState<number | null>(null);

  useEffect(() => {
    if (subjects.length > 0) {
      // Calculate overall average grade
      const totalGrades = subjects.reduce((acc, subject) => {
        return subject.grades ? acc + subject.grades.length : acc;
      }, 0);

      const weightedSum = subjects.reduce((acc, subject) => {
        return subject.grades
          ? acc + subject.averageGrade * subject.grades.length
          : acc;
      }, 0);

      setAverageGrade(
        totalGrades > 0 ? Number((weightedSum / totalGrades).toFixed(2)) : null
      );
    }
  }, [subjects]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subjects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {subjects.reduce((acc, subject) => {
                return subject.grades ? acc + subject.grades.length : acc;
              }, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {averageGrade !== null ? averageGrade : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Tabs */}
      <Tabs defaultValue="grades" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
          <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
          <TabsTrigger value="trends">Grade Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <PieChart subjects={subjects} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <BarChart subjects={subjects} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Grade Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <LineChart subjects={subjects} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Subject } from "@/types/grades";
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/charts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  GraduationCap,
  LineChart as LineChartIcon,
  Megaphone,
  PieChart as PieChartIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Calculate grade trend (improving, declining, stable)
const calculateTrend = (subjects: Subject[]) => {
  // Get all grades across all subjects
  const allGrades = subjects.flatMap((subject) =>
    subject.grades
      ? subject.grades.map((g) => ({
          ...g,
          date: new Date(g.date),
          subjectName: subject.name,
        }))
      : []
  );

  // Sort chronologically
  allGrades.sort((a, b) => a.date.getTime() - b.date.getTime());

  if (allGrades.length < 4) return "neutral"; // Not enough data

  // Compare first half with second half
  const halfway = Math.floor(allGrades.length / 2);
  const firstHalf = allGrades.slice(0, halfway);
  const secondHalf = allGrades.slice(halfway);

  const firstHalfAvg =
    firstHalf.reduce((sum, g) => sum + g.value, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, g) => sum + g.value, 0) / secondHalf.length;

  // Remember in German system, lower is better
  if (secondHalfAvg < firstHalfAvg - 0.3) return "improving";
  if (secondHalfAvg > firstHalfAvg + 0.3) return "declining";
  return "stable";
};

export function GradeAnalytics({ subjects }: { subjects: Subject[] }) {
  // Calculate metrics
  const metrics = useMemo(() => {
    if (!subjects.length) return null;

    const totalGrades = subjects.reduce(
      (acc, subject) => acc + (subject.grades?.length || 0),
      0
    );

    // Calculate overall average with weights considered
    let totalWeightedSum = 0;
    let totalWeight = 0;
    subjects.forEach((subject) => {
      if (subject.grades) {
        subject.grades.forEach((grade) => {
          totalWeightedSum += grade.value * (grade.weight || 1);
          totalWeight += grade.weight || 1;
        });
      }
    });

    const overallAverage =
      totalWeight > 0
        ? Number((totalWeightedSum / totalWeight).toFixed(2))
        : null;

    // Sort subjects by performance
    const sortedSubjects = [...subjects].sort(
      (a, b) => a.averageGrade - b.averageGrade
    );

    const bestSubject =
      sortedSubjects.length > 0 && sortedSubjects[0].averageGrade > 0
        ? sortedSubjects[0]
        : null;

    const worstSubject =
      sortedSubjects.length > 0
        ? sortedSubjects[sortedSubjects.length - 1]
        : null;

    const trend = calculateTrend(subjects);

    return {
      totalGrades,
      overallAverage,
      bestSubject,
      worstSubject,
      trend,
    };
  }, [subjects]);

  if (!metrics) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl mb-2">No Data Available</h2>
        <p className="text-muted-foreground mb-4">
          Add subjects and grades to see analytics and visualizations.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalGrades}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Across {subjects.length} subjects
            </p>
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
              {metrics.overallAverage !== null ? metrics.overallAverage : "N/A"}
            </div>
            <div className="flex items-center mt-1">
              <div
                className={cn(
                  "text-sm flex items-center",
                  metrics.trend === "improving"
                    ? "text-green-600 dark:text-green-400"
                    : metrics.trend === "declining"
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                )}
              >
                {metrics.trend === "improving" && (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {metrics.trend === "declining" && (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                )}
                <span>
                  {metrics.trend === "improving"
                    ? "Improving"
                    : metrics.trend === "declining"
                    ? "Declining"
                    : "Stable"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {metrics.bestSubject && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Best Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="text-xl font-bold truncate"
                title={metrics.bestSubject.name}
              >
                {metrics.bestSubject.name}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {metrics.bestSubject.averageGrade.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  average grade
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {metrics.worstSubject && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Needs Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="text-xl font-bold truncate"
                title={metrics.worstSubject.name}
              >
                {metrics.worstSubject.name}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Megaphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  {metrics.worstSubject.averageGrade.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  average grade
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Tabs - with icons */}
      <Tabs defaultValue="distribution" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="distribution" className="flex items-center gap-1">
            <PieChartIcon className="h-4 w-4" />
            <span>Grade Distribution</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span>Subject Performance</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-1">
            <LineChartIcon className="h-4 w-4" />
            <span>Grade Trends</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <Card>
            <CardContent className="h-[450px] pt-6">
              <PieChart subjects={subjects} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardContent className="h-[450px] pt-6">
              <BarChart subjects={subjects} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardContent className="h-[450px] pt-6">
              <LineChart subjects={subjects} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

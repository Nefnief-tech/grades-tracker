import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  AlertTriangle,
  ThumbsUp,
} from "lucide-react";

interface PerformanceInsightsProps {
  subjects: any[];
  recentTrend: "improving" | "declining" | "stable";
  predictions: any[] | null;
  strengths: {
    bestSubject?: string;
    worstSubject?: string;
    mostImproved?: string;
  };
  isMobile?: boolean;
}

export function PerformanceInsights({
  subjects,
  recentTrend,
  predictions,
  strengths,
  isMobile = false,
}: PerformanceInsightsProps) {
  // Handle no data
  if (!subjects || subjects.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          Add subjects and grades to see performance insights.
        </p>
      </div>
    );
  }

  // Count grades per subject
  const gradeDistribution = {};
  let totalGrades = 0;

  subjects.forEach((subject) => {
    if (subject.grades && subject.grades.length > 0) {
      gradeDistribution[subject.name] = subject.grades.length;
      totalGrades += subject.grades.length;
    }
  });

  // Extract useful insights
  const mostGradesSubject = Object.keys(gradeDistribution).reduce(
    (a, b) => (gradeDistribution[a] > gradeDistribution[b] ? a : b),
    Object.keys(gradeDistribution)[0]
  );

  const fewestGradesSubject = Object.keys(gradeDistribution).reduce(
    (a, b) => (gradeDistribution[a] < gradeDistribution[b] ? a : b),
    Object.keys(gradeDistribution)[0]
  );

  return (
    <div className={`space-y-6 ${isMobile ? "text-sm" : ""}`}>
      {/* Key trends */}
      <div>
        <h3
          className={`font-semibold ${isMobile ? "text-base" : "text-lg"} mb-3`}
        >
          Recent Performance
        </h3>

        <div className="flex items-center gap-2 mb-2">
          {recentTrend === "improving" ? (
            <div className="flex items-center gap-2">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span>Your grades are improving! Keep up the great work.</span>
            </div>
          ) : recentTrend === "declining" ? (
            <div className="flex items-center gap-2">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span>
                Your grades are trending downward. Consider additional study
                time.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span>
                Your grades are stable. Focus on maintaining consistency.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subject analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best and worst subjects */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className={`${isMobile ? "text-base" : "text-lg"}`}>
              Subject Analysis
            </CardTitle>
            <CardDescription>Your strongest and weakest areas</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {strengths.bestSubject && (
                <li className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Best subject:</span>
                  {strengths.bestSubject}
                </li>
              )}

              {strengths.worstSubject && (
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Needs improvement:</span>
                  {strengths.worstSubject}
                </li>
              )}

              {strengths.mostImproved && (
                <li className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Most improved:</span>
                  {strengths.mostImproved}
                </li>
              )}

              {mostGradesSubject && (
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Most assessed:</span>
                  {mostGradesSubject} ({gradeDistribution[mostGradesSubject]}{" "}
                  grades)
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Predictions */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className={`${isMobile ? "text-base" : "text-lg"}`}>
              Grade Predictions
            </CardTitle>
            <CardDescription>Future performance forecast</CardDescription>
          </CardHeader>
          <CardContent>
            {predictions && predictions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm">
                  Based on your recent performance, your grades are projected
                  to:
                </p>

                {predictions[0].value < predictions[2].value ? (
                  <div className="flex items-center gap-2 text-red-500">
                    <TrendingDown className="h-4 w-4" />
                    <span>
                      Decline to {predictions[2].value.toFixed(1)} in the coming
                      months
                    </span>
                  </div>
                ) : predictions[0].value > predictions[2].value ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                      Improve to {predictions[2].value.toFixed(1)} in the coming
                      months
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-blue-500">
                    <BarChart2 className="h-4 w-4" />
                    <span>
                      Remain stable around {predictions[0].value.toFixed(1)}
                    </span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Predictions based on your grade trends over the past semester.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Not enough data yet for predictions. Add more grades over time.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <div>
        <h3
          className={`font-semibold ${isMobile ? "text-base" : "text-lg"} mb-3`}
        >
          Recommendations
        </h3>

        <ul className="space-y-2">
          {recentTrend === "declining" && strengths.worstSubject && (
            <li className="flex items-start gap-2">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-1 rounded-full mt-1">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span>
                Focus on improving {strengths.worstSubject} - consider
                additional practice or tutoring.
              </span>
            </li>
          )}

          {totalGrades < 10 && (
            <li className="flex items-start gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mt-1">
                <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span>
                Add more grades to get more accurate insights and predictions.
              </span>
            </li>
          )}

          {strengths.bestSubject && (
            <li className="flex items-start gap-2">
              <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mt-1">
                <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span>
                Keep up your strong performance in {strengths.bestSubject}.
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

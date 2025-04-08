"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradeHistoryChart } from "@/components/GradeHistoryChart";

// Separate client component that uses search params
function ChartControls() {
  const searchParams = useSearchParams();
  const [chartType, setChartType] = useState("line");

  useEffect(() => {
    // Get the chart type from URL params if available
    const paramType = searchParams?.get("type");
    if (paramType && ["line", "bar", "radar"].includes(paramType)) {
      setChartType(paramType);
    }
  }, [searchParams]);

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Button
        variant={chartType === "line" ? "default" : "outline"}
        onClick={() => setChartType("line")}
      >
        Line Chart
      </Button>
      <Button
        variant={chartType === "bar" ? "default" : "outline"}
        onClick={() => setChartType("bar")}
      >
        Bar Chart
      </Button>
      <Button
        variant={chartType === "radar" ? "default" : "outline"}
        onClick={() => setChartType("radar")}
      >
        Radar Chart
      </Button>
      <div className="ml-auto text-sm text-muted-foreground">
        Chart type: <span className="font-medium">{chartType}</span>
      </div>
    </div>
  );
}

// Example data for our charts
const sampleGrades = [
  { id: "1", value: 1.5, type: "Test", date: "2023-01-15", weight: 2.0 },
  { id: "2", value: 2.3, type: "Homework", date: "2023-02-10", weight: 1.0 },
  { id: "3", value: 1.7, type: "Oral Exam", date: "2023-03-05", weight: 1.0 },
  { id: "4", value: 2.0, type: "Test", date: "2023-04-20", weight: 2.0 },
  { id: "5", value: 1.3, type: "Project", date: "2023-05-15", weight: 1.0 },
  { id: "6", value: 2.7, type: "Test", date: "2023-06-10", weight: 2.0 },
  { id: "7", value: 1.0, type: "Oral Exam", date: "2023-07-05", weight: 1.0 },
];

export default function ChartsDemo() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Charts Demo</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Grade Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Wrap the component using useSearchParams with Suspense */}
          <Suspense
            fallback={
              <div className="flex gap-3">
                <Button variant="outline" disabled>
                  Line Chart
                </Button>
                <Button variant="outline" disabled>
                  Bar Chart
                </Button>
                <Button variant="outline" disabled>
                  Radar Chart
                </Button>
              </div>
            }
          >
            <ChartControls />
          </Suspense>

          <div className="h-80">
            <GradeHistoryChart grades={sampleGrades} />
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm mb-4">
        This page demonstrates various chart types for visualizing grade data.
      </p>
    </div>
  );
}

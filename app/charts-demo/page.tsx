"use client";

import React from "react";
import { GradeHistoryChart } from "@/components/GradeHistoryChart";
import { DebugGradeData } from "@/components/DebugGradeData";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import SimpleChartTest from "@/components/SimpleChartTest";

// Sample data for testing
const sampleGrades = [
  { id: "1", subject: "Math", grade: 2, date: "2023-01-05" },
  { id: "2", subject: "Math", grade: 3, date: "2023-02-10" },
  { id: "3", subject: "Math", grade: 1.5, date: "2023-03-15" },
  { id: "4", subject: "Math", grade: 4, date: "2023-04-20" },
  { id: "5", subject: "Math", grade: 2.5, date: "2023-05-25" },
];

export default function ChartsDemo() {
  const [chartType, setChartType] = React.useState<"line" | "bar">("line");
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Charts Demo</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            Toggle Theme ({theme})
          </Button>
        </div>
      </div>

      <div className="mb-4 flex space-x-2">
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
      </div>

      {/* Testing with a simple chart to verify Recharts works */}
      <SimpleChartTest />

      <div className="border p-4 rounded-lg mb-6 bg-card">
        <h2 className="text-xl font-semibold mb-4 text-card-foreground">
          Grade History Chart
        </h2>
        <GradeHistoryChart
          grades={sampleGrades}
          height={300}
          chartType={chartType}
          className="mb-6"
        />
      </div>

      <DebugGradeData grades={sampleGrades} title="Sample Grades Data" />
    </div>
  );
}

"use client";

import { ThemeProvider } from "next-themes";
import React from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dynamically import charts components to avoid SSR issues
const ChartComponents = dynamic(() => import("@/components/ChartComponents"), {
  ssr: false, // This will disable Server Side Rendering for these components
  loading: () => (
    <div className="flex items-center justify-center h-[300px]">
      Loading charts...
    </div>
  ),
});

// Sample data for demonstration
const data = [
  { name: "Jan", value: 3.2 },
  { name: "Feb", value: 4.1 },
  { name: "Mar", value: 2.5 },
  { name: "Apr", value: 3.8 },
  { name: "May", value: 4.2 },
  { name: "Jun", value: 5.0 },
];

export default function ChartsDemo() {
  const [chartType, setChartType] = React.useState("line");

  return (
    // Wrap everything in ThemeProvider to fix the build error
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Grades Charts Demo</h1>

        <div className="mb-4">
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
              <CardDescription>View your grade progression</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartComponents
                data={data}
                type={chartType}
                chartId="progress"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subject Comparison</CardTitle>
              <CardDescription>Compare grades across subjects</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartComponents
                data={data}
                type={chartType}
                chartId="comparison"
                color="#82ca9d"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { Subject } from "@/types/grades";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Label,
  Cell,
} from "recharts";

interface SubjectComparisonChartProps {
  subjects: Subject[];
}

export function SubjectComparisonChart({
  subjects,
}: SubjectComparisonChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Filter out subjects without grades and sort by average grade
  const subjectsWithGrades = subjects
    .filter((subject) => (subject.grades?.length || 0) > 0)
    .sort((a, b) => a.averageGrade - b.averageGrade);

  // Transform for chart data
  const chartData = subjectsWithGrades.map((subject) => ({
    name: subject.name,
    average: subject.averageGrade,
    gradeCount: subject.grades?.length || 0,
  }));

  // Get bar color based on grade
  const getBarColor = (grade) => {
    if (grade <= 2.0) return "#22c55e"; // Green for best grades
    if (grade <= 3.0) return "#3b82f6"; // Blue
    if (grade <= 4.0) return "#eab308"; // Yellow
    if (grade <= 5.0) return "#f97316"; // Orange
    return "#ef4444"; // Red for worst grades
  };

  // If no data is available
  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          Add grades to your subjects to see comparison.
        </p>
      </div>
    );
  }

  // Layout adaptations for mobile
  const useMobileLayout = chartData.length > 5;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout={useMobileLayout ? "vertical" : "horizontal"}
        margin={{
          top: 10,
          right: 30,
          left: useMobileLayout ? 100 : 20,
          bottom: useMobileLayout ? 20 : 70,
        }}
      >
        {useMobileLayout ? (
          // Vertical layout for many subjects
          <>
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12 }}
            />
            <XAxis
              type="number"
              domain={[1, 6]}
              tickCount={6}
              tick={{ fontSize: 12 }}
            />
          </>
        ) : (
          // Horizontal layout for fewer subjects
          <>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis
              domain={[1, 6]}
              reversed={true} // 1 is best, 6 is worst in German system
              tick={{ fontSize: 12 }}
            />
          </>
        )}

        <Tooltip
          formatter={(value: number) => [value.toFixed(2), "Average Grade"]}
          labelFormatter={(label) =>
            `${label} (${
              chartData.find((d) => d.name === label)?.gradeCount || 0
            } grades)`
          }
          contentStyle={{
            backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
            borderColor: isDark ? "#333333" : "#e2e8f0",
            borderRadius: "6px",
          }}
        />
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDark ? "#333333" : "#e2e8f0"}
        />

        {useMobileLayout ? (
          <Bar dataKey="average" name="Average Grade" barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.average)} />
            ))}
          </Bar>
        ) : (
          <Bar dataKey="average" name="Average Grade" fill="#3b82f6">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.average)} />
            ))}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

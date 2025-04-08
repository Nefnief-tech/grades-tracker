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
  ReferenceLine,
  Cell,
} from "recharts";

interface AverageGradeChartProps {
  subject: Subject;
}

export function AverageGradeChart({ subject }: AverageGradeChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Organize grades by type
  const gradesByType = {};

  subject.grades?.forEach((grade) => {
    const type = grade.type || "Unknown";
    if (!gradesByType[type]) {
      gradesByType[type] = {
        grades: [],
        average: 0,
      };
    }
    gradesByType[type].grades.push(grade);
  });

  // Calculate average for each type
  Object.keys(gradesByType).forEach((type) => {
    const grades = gradesByType[type].grades;
    let sum = 0;
    let totalWeight = 0;

    grades.forEach((grade) => {
      sum += grade.value * (grade.weight || 1);
      totalWeight += grade.weight || 1;
    });

    gradesByType[type].average = totalWeight > 0 ? sum / totalWeight : 0;
  });

  // Transform for chart data
  const chartData = Object.keys(gradesByType).map((type) => ({
    name: type,
    average: gradesByType[type].average,
    count: gradesByType[type].grades.length,
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
  if (!chartData.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          No grade data available for this subject.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
      >
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: isDark ? "#333333" : "#e2e8f0" }}
          axisLine={{ stroke: isDark ? "#333333" : "#e2e8f0" }}
        />
        <YAxis
          domain={[1, 6]}
          reversed={true} // 1 is best, 6 is worst in German system
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: isDark ? "#333333" : "#e2e8f0" }}
          axisLine={{ stroke: isDark ? "#333333" : "#e2e8f0" }}
        />
        <Tooltip
          formatter={(value: number) => [value.toFixed(2), "Average Grade"]}
          labelFormatter={(label) =>
            `${label} (${
              chartData.find((d) => d.name === label)?.count || 0
            } grades)`
          }
          contentStyle={{
            backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
            borderColor: isDark ? "#333333" : "#e2e8f0",
            borderRadius: "6px",
          }}
        />
        <ReferenceLine
          y={subject.averageGrade}
          stroke="#888888"
          strokeDasharray="3 3"
          label={{
            value: `Overall: ${subject.averageGrade.toFixed(2)}`,
            position: "insideBottomRight",
            fill: isDark ? "#f8f8f8" : "#1a1a1a",
            fontSize: 12,
          }}
        />
        <Bar
          dataKey="average"
          name="Average Grade"
          // Use dynamic colors based on grade value
          fill="#3b82f6"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.average)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

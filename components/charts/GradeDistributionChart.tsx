"use client";

import { useEffect, useRef } from "react";
import { Subject } from "@/types/grades";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface GradeDistributionChartProps {
  subjects: Subject[];
}

export function GradeDistributionChart({
  subjects,
}: GradeDistributionChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Process all grades from all subjects
  const allGrades = subjects.flatMap((subject) => subject.grades || []);

  // Group grades into grade ranges for display (1.0-1.9, 2.0-2.9, etc.)
  const gradeCounts = [
    { name: "1.0-1.9", count: 0, color: "#22c55e" }, // Green for best grades
    { name: "2.0-2.9", count: 0, color: "#3b82f6" }, // Blue
    { name: "3.0-3.9", count: 0, color: "#eab308" }, // Yellow
    { name: "4.0-4.9", count: 0, color: "#f97316" }, // Orange
    { name: "5.0-6.0", count: 0, color: "#ef4444" }, // Red for worst grades
  ];

  // Count grades in each range
  allGrades.forEach((grade) => {
    const value = grade.value;
    if (value >= 1.0 && value < 2.0) {
      gradeCounts[0].count++;
    } else if (value >= 2.0 && value < 3.0) {
      gradeCounts[1].count++;
    } else if (value >= 3.0 && value < 4.0) {
      gradeCounts[2].count++;
    } else if (value >= 4.0 && value < 5.0) {
      gradeCounts[3].count++;
    } else if (value >= 5.0 && value <= 6.0) {
      gradeCounts[4].count++;
    }
  });

  // Filter out ranges with 0 count
  const filteredData = gradeCounts.filter((item) => item.count > 0);

  // Generate a message if no data is available
  if (filteredData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          No grade data available for distribution analysis.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {filteredData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              stroke={isDark ? "#1a1a1a" : "#f8f8f8"}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value} grades`, "Count"]}
          contentStyle={{
            backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
            borderColor: isDark ? "#333333" : "#e2e8f0",
            borderRadius: "6px",
          }}
          labelStyle={{
            color: isDark ? "#f8f8f8" : "#1a1a1a",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

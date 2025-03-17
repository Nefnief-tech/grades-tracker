"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatDate } from "@/utils/formatDate";
import type { Grade } from "@/types/grades";

interface GradeHistoryChartProps {
  grades: Grade[];
  height?: number;
  showAxis?: boolean;
  showGrid?: boolean;
  chartType?: "line" | "bar";
  className?: string;
}

export function GradeHistoryChart({
  grades,
  height = 200,
  showAxis = true,
  showGrid = true,
  chartType = "line",
  className = "",
}: GradeHistoryChartProps) {
  // Sort grades by date
  const sortedGrades = React.useMemo(() => {
    return [...grades]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((grade) => ({
        ...grade,
        formattedDate: formatDate(grade.date),
      }));
  }, [grades]);

  // If no grades, show placeholder
  if (grades.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-${height} ${className}`}
      >
        <p className="text-muted-foreground text-sm">No grades recorded</p>
      </div>
    );
  }

  // In German grading system, 1 is best and 6 is worst
  // So we invert the domain to make the chart more intuitive
  return (
    <div className={`w-full ${className}`} style={{ height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "line" ? (
          <LineChart data={sortedGrades}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {showAxis && (
              <>
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  height={50}
                />
                <YAxis
                  domain={[1, 6]}
                  reversed={true}
                  tick={{ fontSize: 12 }}
                  width={30}
                />
              </>
            )}
            <Tooltip
              formatter={(value) => [`Grade: ${value}`, "Value"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 4 }}
            />
          </LineChart>
        ) : (
          <BarChart data={sortedGrades}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {showAxis && (
              <>
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  height={50}
                />
                <YAxis
                  domain={[1, 6]}
                  reversed={true}
                  tick={{ fontSize: 12 }}
                  width={30}
                />
              </>
            )}
            <Tooltip
              formatter={(value) => [`Grade: ${value}`, "Value"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" barSize={30} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

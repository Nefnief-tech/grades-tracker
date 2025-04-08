"use client";

import { useEffect, useRef } from "react";
import { Subject, Grade } from "@/types/grades";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { format, subMonths, isAfter } from "date-fns";
import { Tooltip as CustomTooltip } from "@/components/ui/tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GradeTrendChartProps {
  subjects: Subject[];
  timeRange: "1m" | "3m" | "6m" | "1y" | "all";
  enableTouch?: boolean; // New prop for touch interactions
}

export function GradeTrendChart({
  subjects,
  timeRange,
  enableTouch = false,
}: GradeTrendChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Filter subjects with grades
  const subjectsWithGrades = subjects.filter(
    (subject) => subject.grades && subject.grades.length > 0
  );

  // Get all grades across subjects with dates, sorted by date
  let allGradesWithDates: {
    subjectId: string;
    subjectName: string;
    date: Date;
    value: number;
    type: string;
  }[] = [];

  subjectsWithGrades.forEach((subject) => {
    subject.grades?.forEach((grade) => {
      if (grade.date) {
        try {
          const gradeDate = new Date(grade.date);
          allGradesWithDates.push({
            subjectId: subject.id,
            subjectName: subject.name,
            date: gradeDate,
            value: grade.value,
            type: grade.type || "Unknown",
          });
        } catch (e) {
          console.error("Invalid date:", grade.date);
        }
      }
    });
  });

  // Sort by date
  allGradesWithDates.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Filter by time range
  const now = new Date();
  const filterDate =
    timeRange === "1m"
      ? subMonths(now, 1)
      : timeRange === "3m"
      ? subMonths(now, 3)
      : timeRange === "6m"
      ? subMonths(now, 6)
      : timeRange === "1y"
      ? subMonths(now, 12)
      : new Date(0); // "all" - beginning of time

  if (timeRange !== "all") {
    allGradesWithDates = allGradesWithDates.filter((g) =>
      isAfter(g.date, filterDate)
    );
  }

  // Generate chart data with format for recharts
  const chartData = allGradesWithDates.map((grade) => ({
    date: format(grade.date, "MMM d, yyyy"),
    [grade.subjectName]: grade.value,
    // For tooltip display
    type: grade.type,
    rawDate: grade.date,
  }));

  // Generate unique colors for each subject
  const subjectColors = {
    average: "#888888",
    // Pre-defined colors for common subjects
    Math: "#3b82f6",
    Physics: "#22c55e",
    Chemistry: "#ef4444",
    Biology: "#eab308",
    History: "#a855f7",
    English: "#ec4899",
    German: "#14b8a6",
  };

  // Add any missing subjects with generated colors
  subjectsWithGrades.forEach((subject) => {
    if (!subjectColors[subject.name]) {
      // Generate a color based on the subject name
      const hue = (subject.name.charCodeAt(0) * 137) % 360;
      subjectColors[subject.name] = `hsl(${hue}, 70%, 60%)`;
    }
  });

  // If no data is available after filtering
  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          {subjectsWithGrades.length === 0
            ? "Add grades to see your grade trends."
            : `No grades available in the selected time range (${timeRange}).`}
        </p>
      </div>
    );
  }

  // Enhance for mobile - reduce tick count on small screens
  const useFewerTicks = chartData.length > 5;

  // Enhanced chart renderer with touch support
  const renderChart = () => {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
        >
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={useFewerTicks ? Math.ceil(chartData.length / 5) : 0}
          />
          <YAxis
            domain={[1, 6]}
            reversed={true} // 1 is best, 6 is worst in German system
            tick={{ fontSize: 12 }}
          />
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#333333" : "#e2e8f0"}
          />
          <Tooltip
            labelFormatter={(label, items) => {
              const item = items[0]?.payload;
              if (item) {
                return `${format(item.rawDate, "MMMM d, yyyy")} - ${item.type}`;
              }
              return label;
            }}
            formatter={(value: number, name: string) => [
              value.toFixed(2),
              name,
            ]}
            contentStyle={{
              backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
              borderColor: isDark ? "#333333" : "#e2e8f0",
              borderRadius: "6px",
            }}
            // Enhanced tooltip position on mobile
            position={enableTouch ? { y: 0 } : undefined}
            // Show on touch
            trigger={enableTouch ? "click" : undefined}
          />
          <Legend
            verticalAlign="top"
            height={36}
            // Enhanced legend for mobile
            wrapperStyle={enableTouch ? { fontSize: "0.85rem" } : undefined}
          />

          {/* Render a line for each subject */}
          {subjectsWithGrades.map((subject) => (
            <Line
              key={subject.id}
              type="monotone"
              dataKey={subject.name}
              stroke={subjectColors[subject.name]}
              activeDot={{ r: enableTouch ? 10 : 8 }} // Larger touch target
              strokeWidth={2}
              connectNulls={true}
            />
          ))}

          {/* Add average trend line if multiple subjects */}
          {subjectsWithGrades.length > 1 && (
            <Line
              type="monotone"
              dataKey="average"
              stroke={subjectColors.average}
              strokeDasharray="5 5"
              strokeWidth={2}
              connectNulls={true}
            />
          )}

          {/* Add performance prediction line */}
          {enableTouch && chartData.length >= 3 && (
            <Line
              type="monotone"
              dataKey="prediction"
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={2}
              connectNulls={true}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // For touch devices, add help tooltip
  if (enableTouch) {
    return (
      <div className="relative">
        <TooltipProvider>
          <CustomTooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-0 right-0 p-1 rounded-full bg-primary/10 z-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Tap data points for details</p>
            </TooltipContent>
          </CustomTooltip>
        </TooltipProvider>

        {renderChart()}

        <p className="text-xs text-muted-foreground text-center mt-2">
          Tap on points to view details. Pinch to zoom.
        </p>
      </div>
    );
  }

  return renderChart();
}

"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { Subject, Grade } from "@/types/grades";

interface AverageGradeBannerProps {
  subjects: Subject[];
}

function getGradeColor(grade: number): string {
  if (grade <= 1.5) return "bg-green-500 text-white";
  if (grade <= 2.5) return "bg-yellow-500 text-white";
  if (grade <= 3.5) return "bg-orange-500 text-white";
  return "bg-red-500 text-white";
}

function getPerformanceLabel(grade: number): string {
  if (grade <= 1.5) return "Excellent";
  if (grade <= 2.5) return "Good";
  if (grade <= 3.5) return "Satisfactory";
  if (grade <= 4.5) return "Sufficient";
  return "Insufficient";
}

export function AverageGradeBanner({ subjects }: AverageGradeBannerProps) {
  const { overallAverage, totalGrades } = useMemo(() => {
    // Combine all grades from all subjects
    const allGrades: { value: number; weight: number }[] = [];
    subjects.forEach((subject) => {
      if (subject.grades && subject.grades.length > 0) {
        allGrades.push(...subject.grades);
      }
    });

    // Calculate weighted average
    if (allGrades.length === 0) {
      return { overallAverage: 0, totalGrades: 0 };
    }

    const { weightedSum, totalWeight } = allGrades.reduce(
      (acc, grade) => {
        const weight = grade.weight || 1.0;
        return {
          weightedSum: acc.weightedSum + grade.value * weight,
          totalWeight: acc.totalWeight + weight,
        };
      },
      { weightedSum: 0, totalWeight: 0 }
    );

    const average =
      totalWeight > 0
        ? Number.parseFloat((weightedSum / totalWeight).toFixed(2))
        : 0;

    return { overallAverage: average, totalGrades: allGrades.length };
  }, [subjects]);

  // If no grades, don't show the banner
  if (totalGrades === 0) {
    return null;
  }

  const gradeColorClass = getGradeColor(overallAverage);
  const performanceLabel = getPerformanceLabel(overallAverage);

  return (
    <Card
      className={`${gradeColorClass} mb-6 p-4 flex justify-between items-center`}
    >
      <div>
        <h3 className="font-semibold text-lg md:text-xl">Overall Average</h3>
        <p className="text-xs md:text-sm opacity-90">
          Based on {totalGrades} grade{totalGrades !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="text-right">
        <div className="text-2xl md:text-3xl font-bold">
          {overallAverage.toFixed(2)}
        </div>
        <div className="text-xs md:text-sm opacity-90">{performanceLabel}</div>
      </div>
    </Card>
  );
}

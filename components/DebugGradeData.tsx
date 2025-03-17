"use client";

import React from "react";
import type { Grade } from "@/types/grades";

interface DebugGradeDataProps {
  grades: Grade[];
  title?: string;
}

export function DebugGradeData({
  grades,
  title = "Debug Grade Data",
}: DebugGradeDataProps) {
  return (
    <div className="border border-red-500 p-4 m-4 rounded bg-card">
      <h3 className="text-lg font-bold text-red-500">{title}</h3>
      <p className="text-card-foreground">
        Number of grades: {grades?.length || 0}
      </p>
      <div className="mt-2 overflow-auto max-h-40">
        {grades && grades.length > 0 ? (
          <>
            <p className="text-card-foreground font-medium">First grade:</p>
            <pre className="text-xs text-card-foreground bg-muted p-2 rounded">
              {JSON.stringify(grades[0], null, 2)}
            </pre>
            <p className="text-card-foreground font-medium mt-2">All grades:</p>
            <pre className="text-xs text-card-foreground bg-muted p-2 rounded">
              {JSON.stringify(grades, null, 2)}
            </pre>
          </>
        ) : (
          <p className="text-red-500">No grades data available</p>
        )}
      </div>
    </div>
  );
}

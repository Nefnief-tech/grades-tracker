// Grade types - fixed enum with specific types
export type GradeType = "Test" | "Oral Exam" | "Homework" | "Project";

// Grade interface - explicitly define all required fields
export interface Grade {
  id: string;
  value: number;
  type: GradeType;
  date: string;
  weight: number; // Either 1.0 or 2.0 based on type
}

// Subject interface
export interface Subject {
  id: string;
  name: string;
  grades: Grade[];
  averageGrade: number;
}

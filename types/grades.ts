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

export interface TimetableEntry {
  id: string;
  subjectId: string;
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  room?: string;
  notes?: string;
  recurring?: boolean; // Whether this is a weekly recurring entry
  color?: string; // Custom color override for this specific entry
}

// Define the Test type
export interface Test {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date format
  subjectId: string;
  completed: boolean;
  priority?: "high" | "medium" | "low";
  reminderEnabled?: boolean;
  reminderDate?: string; // ISO date format
}

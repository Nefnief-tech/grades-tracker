// Grade types - fixed enum with specific types
export type GradeType = "Test" | "Oral Exam" | "Homework" | "Project";

export interface Grade {
  id: string;
  value: number;
  date?: string;
  type?: string;
  weight?: number;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  grades?: Grade[];
  averageGrade: number;
  color?: string; // Add color field for subject customization
  teacher?: string;
  room?: string;
}

// Add new types for timetable functionality
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
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  room?: string;
  notes?: string;
  recurring?: boolean;
  color?: string; // Add color property for timetable entries
}

export interface TimetableDay {
  name: string;
  value:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  entries: TimetableEntry[];
}

export type GradeType = "Test" | "Oral Exam" | "Homework" | "Project"

export interface Grade {
  value: number
  type: GradeType
  date: string
  weight: number // Add weight property
}

export interface Subject {
  id: string
  name: string
  grades: Grade[]
  averageGrade?: number
}


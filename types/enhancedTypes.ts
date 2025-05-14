import { Subject as BaseSubject, Grade as BaseGrade } from "./grades";

/**
 * Enhanced Subject interface with additional fields
 */
export interface EnhancedSubject extends BaseSubject {
  // Optional fields
  color?: string;
  created?: string;
  updated?: string;
  weight?: number;
  visible?: boolean;
}

/**
 * Enhanced Grade interface with additional fields
 */
export interface EnhancedGrade extends BaseGrade {
  // Core required fields
  subjectId: string;
  
  // Optional fields
  date?: string;
  created?: string;
  updated?: string;
  notes?: string;
  type?: string;
}

/**
 * Type guard to check if a subject has grades attached
 */
export function hasGrades(subject: EnhancedSubject): boolean {
  return Array.isArray(subject.grades) && subject.grades.length > 0;
}

/**
 * Helper function to create a new subject with default values
 */
export function createNewSubject(name: string, id?: string): EnhancedSubject {
  const timestamp = Date.now();
  const uniqueId = id || `${name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
  
  return {
    id: uniqueId,
    name: name.trim(),
    grades: [],
    averageGrade: 0,
    color: "#" + Math.floor(Math.random()*16777215).toString(16), // Random color
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    weight: 1,
    visible: true
  };
}

/**
 * Helper function to create a new grade with default values
 */
export function createNewGrade(
  subjectId: string, 
  value: number, 
  name: string = "", 
  weight: number = 1
): EnhancedGrade {
  const timestamp = Date.now();
  const gradeId = `grade-${timestamp}-${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    id: gradeId,
    subjectId,
    value,
    name: name.trim(),
    weight,
    date: new Date().toISOString(),
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
}
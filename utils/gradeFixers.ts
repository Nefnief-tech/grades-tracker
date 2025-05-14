import type { Subject, Grade } from "../types/grades";

/**
 * Utility to ensure a subject has a valid grades array
 */
export function ensureGradesArray(subject: Subject): Subject {
  if (!subject) return subject;
  
  if (!Array.isArray(subject.grades)) {
    console.warn(`Subject ${subject.id} has invalid grades array, fixing`);
    subject.grades = [];
  }
  
  // Filter out any null or undefined grades
  subject.grades = subject.grades.filter(grade => grade != null);
  
  return subject;
}

/**
 * Ensure grade has the proper structure and properties
 */
export function normalizeGrade(grade: any): Grade {
  if (!grade) return null as any;
  
  let value = 5; // Default value
  
  // Try to parse the value if it's a string
  if (typeof grade.value === 'string') {
    const parsed = parseFloat(grade.value);
    if (!isNaN(parsed)) {
      value = parsed;
    } else if (grade.value.length > 20) {
      // Likely encrypted value, use default
      console.log(`Using default value for encrypted grade`);
    }
  } else if (typeof grade.value === 'number') {
    value = grade.value;
  }
  
  let weight = 1; // Default weight
  
  // Try to parse the weight if it's a string
  if (typeof grade.weight === 'string') {
    const parsed = parseFloat(grade.weight);
    if (!isNaN(parsed)) {
      weight = parsed;
    }
  } else if (typeof grade.weight === 'number') {
    weight = grade.weight;
  }
  
  // Return a normalized grade object
  return {
    id: grade.id || grade.gradeid || grade.$id || `grade-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    value,
    weight,
    // Optional fields can be kept as is
    ...grade
  };
}

/**
 * Fix a subject's grades for display
 */
export function fixSubjectGrades(subject: Subject): Subject {
  if (!subject) return subject;
  
  // First ensure the subject has a grades array
  const fixedSubject = ensureGradesArray(subject);
  
  // Then normalize each grade
  fixedSubject.grades = fixedSubject.grades.map(grade => normalizeGrade(grade));
  
  // Recalculate the average grade
  let weightedSum = 0;
  let totalWeight = 0;
  
  fixedSubject.grades.forEach(grade => {
    const value = grade.value || 0;
    const weight = grade.weight || 1;
    weightedSum += value * weight;
    totalWeight += weight;
  });
  
  fixedSubject.averageGrade = totalWeight > 0 
    ? parseFloat((weightedSum / totalWeight).toFixed(2)) 
    : 0;
  
  return fixedSubject;
}

/**
 * Fix all subjects' grades for display
 */
export function fixAllSubjectsGrades(subjects: Subject[]): Subject[] {
  if (!Array.isArray(subjects)) return [];
  return subjects.map(subject => fixSubjectGrades(subject));
}
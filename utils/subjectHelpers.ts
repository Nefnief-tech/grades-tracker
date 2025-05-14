import { Subject, Grade } from "../types/grades";

/**
 * Utility function to check if a subject has valid grades
 * @param subject The subject to check
 * @returns Whether the subject has valid grades
 */
export function hasValidGrades(subject: Subject): boolean {
  if (!subject) return false;
  if (!Array.isArray(subject.grades)) return false;
  if (subject.grades.length === 0) return false;
  
  // Check if there's at least one valid grade
  return subject.grades.some(grade => 
    grade && 
    typeof grade.value !== 'undefined' && 
    grade.value !== null
  );
}

/**
 * Gets the count of valid grades in a subject
 * @param subject The subject to check
 * @returns The number of valid grades
 */
export function getValidGradeCount(subject: Subject): number {
  if (!subject || !Array.isArray(subject.grades)) return 0;
  
  return subject.grades.filter(grade => 
    grade && 
    typeof grade.value !== 'undefined' && 
    grade.value !== null
  ).length;
}

/**
 * Fixes any issues with the subject structure
 * @param subject The subject to normalize
 * @returns A normalized subject with valid structure
 */
export function normalizeSubject(subject: Subject): Subject {
  if (!subject) return subject;
  
  // Ensure grades array exists
  if (!Array.isArray(subject.grades)) {
    subject.grades = [];
  }
  
  // Filter out any invalid grades
  const validGrades = subject.grades.filter(grade => 
    grade && 
    typeof grade.value !== 'undefined' && 
    grade.value !== null
  );
  
  // Calculate average grade correctly
  let averageGrade = 0;
  if (validGrades.length > 0) {
    const totalWeight = validGrades.reduce((sum, grade) => sum + (grade.weight || 1), 0);
    const weightedSum = validGrades.reduce((sum, grade) => sum + (grade.value * (grade.weight || 1)), 0);
    
    if (totalWeight > 0) {
      averageGrade = parseFloat((weightedSum / totalWeight).toFixed(2));
    }
  }
  
  return {
    ...subject,
    grades: validGrades,
    averageGrade
  };
}

/**
 * Debug utility to check if a subject's grade structure is valid
 * @param subject The subject to check
 * @returns A report on the subject's validity
 */
export function debugSubjectGrades(subject: Subject): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!subject) {
    return { valid: false, issues: ['Subject is null or undefined'] };
  }
  
  if (!subject.id) {
    issues.push('Missing subject ID');
  }
  
  if (!subject.name) {
    issues.push('Missing subject name');
  }
  
  if (!Array.isArray(subject.grades)) {
    issues.push('Grades is not an array');
  } else {
    // Check if grades have required properties
    const invalidGrades = subject.grades.filter(grade => 
      !grade || 
      typeof grade.value === 'undefined' || 
      grade.value === null
    );
    
    if (invalidGrades.length > 0) {
      issues.push(`${invalidGrades.length} invalid grades found`);
    }
    
    // Check if any grades are likely encrypted
    const likelyEncryptedGrades = subject.grades.filter(grade => 
      grade && 
      typeof grade.value === 'string' && 
      isNaN(parseFloat(grade.value)) &&
      grade.value.length > 20
    );
    
    if (likelyEncryptedGrades.length > 0) {
      issues.push(`${likelyEncryptedGrades.length} grades appear to be encrypted`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
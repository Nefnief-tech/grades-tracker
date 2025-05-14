import type { Subject, Grade } from "@/types/grades";

/**
 * Calculates the weighted average of grades
 * @param grades Array of grades to calculate average for
 * @returns The calculated weighted average
 */
export function calculateGradeAverage(grades: Grade[]): number {
  if (!grades || grades.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const grade of grades) {
    // Handle both number and string values
    const value = typeof grade.value === 'number' ? grade.value : parseFloat(String(grade.value)) || 0;
    const weight = typeof grade.weight === 'number' ? grade.weight : parseFloat(String(grade.weight)) || 1;
    
    weightedSum += value * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(2)) : 0;
}

/**
 * Attach grades to their respective subjects
 * @param subjects Array of subjects
 * @param grades Array of grades
 * @returns Subjects with their grades attached
 */
export function attachGradesToSubjects(subjects: Subject[], grades: Grade[]): Subject[] {
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return [];
  }
  
  if (!grades || !Array.isArray(grades) || grades.length === 0) {
    // Return subjects with empty grades arrays
    return subjects.map(subject => ({
      ...subject,
      grades: [],
      averageGrade: 0
    }));
  }
  
  // Map through each subject and attach its grades
  return subjects.map(subject => {
    // Find all grades that belong to this subject
    const subjectGrades = grades.filter(grade => grade.subjectId === subject.id);
    
    // Calculate the average grade
    const averageGrade = calculateGradeAverage(subjectGrades);
    
    // Return the subject with grades and average attached
    return {
      ...subject,
      grades: subjectGrades,
      averageGrade
    };
  });
}

/**
 * Normalize subject data structure
 * @param subject Subject to normalize
 * @returns Normalized subject
 */
export function normalizeSubject(subject: any): Subject {
  if (!subject) return null as any;
  
  // Ensure required fields
  return {
    id: subject.id || subject.subjectid || subject.$id,
    name: subject.name || "",
    grades: subject.grades || [],
    averageGrade: subject.averageGrade || 0,
    // Optional fields with defaults
    color: subject.color || "#3498db",
    weight: parseFloat(String(subject.weight)) || 1,
    created: subject.created || subject.$createdAt || new Date().toISOString(),
    updated: subject.updated || subject.$updatedAt || new Date().toISOString(),
  };
}
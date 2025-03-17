import Cookies from "js-cookie";
import type { Subject, Grade } from "../types/grades";

const COOKIE_NAME = "gradeCalculator";

// Debug function to log cookie operations
const logCookieOperation = (operation: string, data: any) => {
  console.log(`Cookie ${operation}:`, data);
};

// Initialize default subjects
export function initializeSubjects(): Subject[] {
  // Removed default subjects - users will start with an empty list
  return [];
}

// Save subjects to cookies with error handling
export function saveSubjectsToCookies(subjects: Subject[]): boolean {
  try {
    const subjectsJson = JSON.stringify(subjects);
    logCookieOperation("saving", subjects);
    Cookies.set(COOKIE_NAME, subjectsJson, { expires: 365, path: "/" });
    return true;
  } catch (error) {
    console.error("Error saving subjects to cookies:", error);
    return false;
  }
}

// Get subjects from cookies with error handling
export function getSubjectsFromCookies(): Subject[] {
  try {
    const subjectsJson = Cookies.get(COOKIE_NAME);
    if (!subjectsJson) {
      const defaultSubjects = initializeSubjects();
      saveSubjectsToCookies(defaultSubjects);
      return defaultSubjects;
    }

    const subjects = JSON.parse(subjectsJson) as Subject[];
    logCookieOperation("retrieving", subjects);
    return subjects;
  } catch (error) {
    console.error("Error retrieving subjects from cookies:", error);
    const defaultSubjects = initializeSubjects();
    saveSubjectsToCookies(defaultSubjects);
    return defaultSubjects;
  }
}

// Add a grade to a specific subject
export function addGradeToSubject(subjectId: string, grade: Grade): boolean {
  try {
    console.log(`Adding grade to subject ${subjectId}:`, grade);
    const subjects = getSubjectsFromCookies();
    const subjectIndex = subjects.findIndex((s) => s.id === subjectId);

    if (subjectIndex === -1) {
      console.error(`Subject with id ${subjectId} not found`);
      return false;
    }

    const updatedSubject = { ...subjects[subjectIndex] };

    // Ensure grades array exists
    if (!updatedSubject.grades) {
      updatedSubject.grades = [];
    }

    updatedSubject.grades = [...updatedSubject.grades, grade];
    updatedSubject.averageGrade = calculateAverage(updatedSubject.grades);

    subjects[subjectIndex] = updatedSubject;
    const saveResult = saveSubjectsToCookies(subjects);
    console.log("Subjects saved successfully:", saveResult);
    return saveResult;
  } catch (error) {
    console.error("Error adding grade to subject:", error);
    return false;
  }
}

// Delete a grade from a specific subject
export function deleteGradeFromSubject(
  subjectId: string,
  gradeIndex: number
): boolean {
  try {
    const subjects = getSubjectsFromCookies();
    const subjectIndex = subjects.findIndex((s) => s.id === subjectId);

    if (subjectIndex === -1) {
      console.error(`Subject with id ${subjectId} not found`);
      return false;
    }

    const updatedSubject = { ...subjects[subjectIndex] };

    // Ensure grades array exists
    if (!updatedSubject.grades || updatedSubject.grades.length === 0) {
      return true; // Nothing to delete
    }

    updatedSubject.grades = updatedSubject.grades.filter(
      (_, i) => i !== gradeIndex
    );
    updatedSubject.averageGrade = calculateAverage(updatedSubject.grades);

    subjects[subjectIndex] = updatedSubject;
    return saveSubjectsToCookies(subjects);
  } catch (error) {
    console.error("Error deleting grade from subject:", error);
    return false;
  }
}

// Get a specific subject by ID
export function getSubjectById(subjectId: string): Subject | null {
  try {
    const subjects = getSubjectsFromCookies();
    const subject = subjects.find((s) => s.id === subjectId);
    return subject || null;
  } catch (error) {
    console.error("Error getting subject by ID:", error);
    return null;
  }
}

// Calculate average grade
function calculateAverage(grades: Grade[]): number {
  if (!grades || grades.length === 0) return 0;
  const sum = grades.reduce((acc, grade) => acc + grade.value, 0);
  return Number.parseFloat((sum / grades.length).toFixed(2));
}

// Clear all grades data (for testing)
export function clearAllGradesData(): void {
  Cookies.remove(COOKIE_NAME, { path: "/" });
}

export function ensureAllSubjectsExist(subjects: Subject[]): Subject[] {
  const defaultSubjects = initializeSubjects();
  const existingSubjectIds = subjects.map((s) => s.id);

  const missingSubjects = defaultSubjects.filter(
    (s) => !existingSubjectIds.includes(s.id)
  );

  return [...subjects, ...missingSubjects];
}

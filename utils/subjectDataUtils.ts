import { getSubjectsFromCloud, getGradesFromCloud } from "@/lib/appwrite";
import type { Subject } from "@/types/grades";

/**
 * Calculates the weighted average of grades
 */
function calculateAverage(grades: any[]): number {
  if (!grades || grades.length === 0) return 0;

  const totalWeight = grades.reduce((sum, grade) => sum + (parseFloat(grade.weight) || 1), 0);
  const weightedSum = grades.reduce(
    (sum, grade) => sum + (parseFloat(grade.value) || 0) * (parseFloat(grade.weight) || 1),
    0
  );

  return totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(2)) : 0;
}

/**
 * Fetches subjects with grades from the cloud
 */
export async function getSubjectsWithGrades(userId: string): Promise<Subject[]> {
  console.log("[SubjectData] Fetching subjects with grades for user:", userId);
  
  try {
    // Get all subjects first
    const subjects = await getSubjectsFromCloud(userId);
    console.log("[SubjectData] Retrieved subjects:", subjects.length);
    
    // Get all grades
    const grades = await getGradesFromCloud(userId);
    console.log("[SubjectData] Retrieved grades:", grades.length);
    
    // Associate grades with subjects
    return subjects.map(subject => {
      // Find grades for this subject
      const subjectGrades = grades.filter(grade => grade.subjectId === subject.id);
      
      // Return a new subject object with grades included
      return {
        ...subject,
        grades: subjectGrades,
        averageGrade: calculateAverage(subjectGrades)
      };
    });
  } catch (error) {
    console.error("[SubjectData] Error fetching subjects with grades:", error);
    return [];
  }
}
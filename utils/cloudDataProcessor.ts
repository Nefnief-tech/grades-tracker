import { getSubjectsFromCloud, getGradesFromCloud } from "@/lib/appwrite";

/**
 * Fetches subjects and grades from the cloud and merges them together
 * @param userId User ID to fetch data for
 * @returns Subjects with their grades attached
 */
export async function getSubjectsWithGradesAttached(userId: string) {
  console.log("[CloudDataProcessor] Fetching subjects and grades for user:", userId);
  
  try {
    // Fetch subjects and grades in parallel for efficiency
    const [subjects, allGrades] = await Promise.all([
      getSubjectsFromCloud(userId),
      getGradesFromCloud(userId)
    ]);
    
    console.log(`[CloudDataProcessor] Retrieved ${subjects.length} subjects and ${allGrades.length} grades`);
    
    // Convert the raw data into properly structured subjects with grades
    const subjectsWithGrades = subjects.map(subject => {
      // Find all grades for this subject
      const subjectGrades = allGrades.filter(grade => {
        return grade.subjectId === subject.id;
      });
      
      console.log(`[CloudDataProcessor] Found ${subjectGrades.length} grades for subject ${subject.name}`);
      
      // Calculate the average grade
      let averageGrade = 0;
      if (subjectGrades.length > 0) {
        let totalWeight = 0;
        let weightedSum = 0;
        
        for (const grade of subjectGrades) {
          const gradeValue = parseFloat(grade.value) || 0;
          const gradeWeight = parseFloat(grade.weight) || 1;
          
          weightedSum += gradeValue * gradeWeight;
          totalWeight += gradeWeight;
        }
        
        if (totalWeight > 0) {
          averageGrade = parseFloat((weightedSum / totalWeight).toFixed(2));
        }
      }
      
      // Return the subject with its grades
      return {
        ...subject,
        grades: subjectGrades,
        averageGrade: averageGrade
      };
    });
    
    console.log(`[CloudDataProcessor] Processed ${subjectsWithGrades.length} subjects with their grades`);
    return subjectsWithGrades;
    
  } catch (error) {
    console.error("[CloudDataProcessor] Error processing cloud data:", error);
    throw error;
  }
}
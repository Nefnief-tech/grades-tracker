import { getSubjectsFromCloud, getGradesFromCloud } from "@/lib/appwrite";
import type { Subject, Grade } from "@/types/grades";

// Cache mechanism for efficient data access
let cachedSubjects: Subject[] = [];
let cachedGrades: Grade[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 60 seconds cache lifetime

/**
 * Calculates weighted grade average
 */
function calculateAverage(grades: Grade[]): number {
  if (!grades || grades.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;
  
  for (const grade of grades) {
    const value = typeof grade.value === 'number' ? grade.value : parseFloat(grade.value as any) || 0;
    const weight = typeof grade.weight === 'number' ? grade.weight : parseFloat(grade.weight as any) || 1;
    
    weightedSum += value * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(2)) : 0;
}

/**
 * Fetches and connects subjects with their grades
 */
export async function fetchSubjectsWithGrades(userId: string): Promise<Subject[]> {
  console.log("[DataService] Fetching subjects with grades");
  
  // Check if we have recent cached data
  const now = Date.now();
  if (cachedSubjects.length > 0 && now - lastFetchTime < CACHE_TTL) {
    console.log("[DataService] Using cached subjects+grades data");
    return cachedSubjects;
  }
  
  try {
    // Fetch both subjects and grades in parallel for efficiency
    const [rawSubjects, allGrades] = await Promise.all([
      getSubjectsFromCloud(userId),
      getGradesFromCloud(userId)
    ]);
    
    console.log(`[DataService] Fetched ${rawSubjects.length} subjects and ${allGrades.length} grades`);
    
    // Process and merge the data
    const subjectsWithGrades = rawSubjects.map(subject => {
      // Find all grades that belong to this subject
      const subjectGrades = allGrades.filter(grade => grade.subjectId === subject.id);
      
      // Return a complete subject with its grades
      return {
        ...subject,
        grades: subjectGrades,
        averageGrade: calculateAverage(subjectGrades)
      };
    });
    
    // Update cache
    cachedSubjects = subjectsWithGrades;
    cachedGrades = allGrades;
    lastFetchTime = now;
    
    console.log(`[DataService] Processed ${subjectsWithGrades.length} subjects with grades`);
    return subjectsWithGrades;
  } catch (error) {
    console.error("[DataService] Error fetching data:", error);
    throw error;
  }
}

/**
 * Clears the cache to force fresh data fetch
 */
export function clearCache(): void {
  cachedSubjects = [];
  cachedGrades = [];
  lastFetchTime = 0;
  console.log("[DataService] Cache cleared");
}
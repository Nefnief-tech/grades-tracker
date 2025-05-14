import { useMemo } from 'react';
import { useSubjects } from './useSubjects';
import { processSubjectsWithGrades } from '@/utils/gradeProcessor';

/**
 * Hook that returns subjects with guaranteed properly processed grades
 * Use this hook in components that need to display grades
 */
export function useProcessedSubjects() {
  const { subjects, isLoading, error, refreshSubjects } = useSubjects();
  
  // Process subjects to ensure grades are always properly shown
  const processedSubjects = useMemo(() => {
    return processSubjectsWithGrades(subjects);
  }, [subjects]);
  
  return {
    subjects: processedSubjects,
    isLoading,
    error,
    refreshSubjects
  };
}
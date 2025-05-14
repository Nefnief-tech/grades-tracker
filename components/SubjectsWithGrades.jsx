'use client';

import React, { useMemo } from 'react';
import { processSubjectsWithGrades } from '@/utils/gradeProcessor';

/**
 * Wrapper component that ensures subjects have their grades properly attached
 * before passing them to the child component
 */
export default function SubjectsWithGrades({ subjects, children, isLoading, error }) {
  // Process subjects to ensure grades are properly attached and formatted
  const processedSubjects = useMemo(() => {
    console.log("[SubjectsWithGrades] Processing subjects:", subjects?.length || 0);
    return processSubjectsWithGrades(subjects);
  }, [subjects]);
  
  // Log some debug info
  React.useEffect(() => {
    if (processedSubjects?.length) {
      // Log the first subject as an example
      const example = processedSubjects[0];
      console.log("[SubjectsWithGrades] First subject after processing:", {
        name: example.name,
        id: example.id,
        gradesCount: example.grades?.length || 0,
        averageGrade: example.averageGrade
      });
    }
  }, [processedSubjects]);

  // Render children with the processed subjects
  return React.cloneElement(children, { 
    subjects: processedSubjects,
    isLoading,
    error
  });
}
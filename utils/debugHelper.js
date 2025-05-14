/**
 * Debug utilities for troubleshooting app issues
 */

// Store raw subjects for debugging
let _rawSubjects = [];

/**
 * Initialize debug helpers
 */
export function initializeDebugHelpers() {
  if (typeof window !== 'undefined') {
    // Set defaults
    window.DEBUG_USE_DEFAULTS_FOR_ENCRYPTED = 
      typeof window.DEBUG_USE_DEFAULTS_FOR_ENCRYPTED === 'boolean' ? 
      window.DEBUG_USE_DEFAULTS_FOR_ENCRYPTED : true;
      
    // Add debug function to check subjects directly
    window.DEBUG_SHOW_RAW_SUBJECTS = () => {
      console.log("Current raw subjects:", _rawSubjects);
    };
    
    // Add a global utility to clear the subject cache
    window.CLEAR_SUBJECT_CACHE = () => {
      localStorage.removeItem('gradeCalculator');
      console.log("Subject cache cleared");
      return "Cache cleared. Refresh the page to reload subjects.";
    };
    
    // Add a debug flag for the console
    console.log(
      "%cDebug helpers initialized. Try: window.DEBUG_SHOW_RAW_SUBJECTS() or window.CLEAR_SUBJECT_CACHE()",
      "background: #3f3f3f; color: #bada55; padding: 5px; border-radius: 3px;"
    );
  }
}

/**
 * Update the raw subjects store
 */
export function storeRawSubjects(subjects) {
  _rawSubjects = subjects;
  if (typeof window !== 'undefined') {
    window.DEBUG_SUBJECTS = subjects;
  }
}

/**
 * Debug a subject's grades
 */
export function debugSubjectGrades(subject) {
  if (!subject) {
    console.warn("No subject provided to debug");
    return;
  }
  
  console.group(`Subject: ${subject.name} (${subject.id})`);
  console.log("Average grade:", subject.averageGrade);
  
  if (!Array.isArray(subject.grades)) {
    console.warn("Grades is not an array:", subject.grades);
    console.groupEnd();
    return;
  }
  
  console.log(`Grades count: ${subject.grades.length}`);
  subject.grades.forEach((grade, index) => {
    console.group(`Grade #${index + 1}`);
    console.log("ID:", grade.id);
    console.log("Value:", grade.value, typeof grade.value);
    console.log("Weight:", grade.weight, typeof grade.weight);
    console.log("Name:", grade.name);
    console.log("SubjectId:", grade.subjectId);
    console.groupEnd();
  });
  
  console.groupEnd();
}

// Make sure types are defined for TypeScript projects
if (typeof window !== 'undefined') {
  window.DEBUG_USE_DEFAULTS_FOR_ENCRYPTED = true;
  window.DEBUG_SUBJECTS = [];
  window.DEBUG_SHOW_RAW_SUBJECTS = () => console.log("Not initialized yet");
  window.CLEAR_SUBJECT_CACHE = () => console.log("Not initialized yet");
}
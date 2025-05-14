/**
 * Utility functions for processing and displaying grades
 */

/**
 * Ensures subjects have their grades properly attached and formatted
 * @param {Array} subjects - Array of subjects from the API
 * @returns {Array} - Subjects with properly attached grades
 */
export function processSubjectsWithGrades(subjects) {
  if (!Array.isArray(subjects)) return [];
  
  return subjects.map(subject => {
    // Skip null subjects
    if (!subject) return null;
    
    // Ensure grades array exists
    if (!Array.isArray(subject.grades)) {
      subject.grades = [];
    }
    
    // Clean up any invalid grades
    const validGrades = subject.grades.filter(grade => grade !== null);
    
    // Calculate average grade correctly
    let averageGrade = 0;
    if (validGrades.length > 0) {
      let totalWeight = 0;
      let weightedSum = 0;
      
      validGrades.forEach(grade => {
        // Make sure value and weight are numbers
        const value = typeof grade.value === 'number' ? grade.value : 
                     (typeof grade.value === 'string' && !isNaN(parseFloat(grade.value))) ? 
                     parseFloat(grade.value) : 5; // Default to 5 for encrypted values
                     
        const weight = typeof grade.weight === 'number' ? grade.weight : 
                      (typeof grade.weight === 'string' && !isNaN(parseFloat(grade.weight))) ? 
                      parseFloat(grade.weight) : 1; // Default to 1 for missing weights
        
        weightedSum += value * weight;
        totalWeight += weight;
      });
      
      if (totalWeight > 0) {
        averageGrade = parseFloat((weightedSum / totalWeight).toFixed(2));
      }
    }
    
    // Return updated subject
    return {
      ...subject,
      grades: validGrades,
      averageGrade: averageGrade
    };
  }).filter(Boolean); // Remove null subjects
}

/**
 * Ensures a grade object has the proper structure and values
 * @param {Object} grade - A grade object from the API
 * @returns {Object} - A normalized grade object
 */
export function normalizeGrade(grade) {
  if (!grade) return null;
  
  // Process value
  let value = 5; // Default value
  if (typeof grade.value === 'number') {
    value = grade.value;
  } else if (typeof grade.value === 'string' && !isNaN(parseFloat(grade.value))) {
    value = parseFloat(grade.value);
  }
  
  // Process weight
  let weight = 1; // Default weight
  if (typeof grade.weight === 'number') {
    weight = grade.weight;
  } else if (typeof grade.weight === 'string' && !isNaN(parseFloat(grade.weight))) {
    weight = parseFloat(grade.weight);
  }
  
  return {
    ...grade,
    value: value,
    weight: weight
  };
}
/**
 * Timetable Transformer
 * Utility functions to transform and normalize various API response formats
 * into the standard TimeTableWeek structure used by the application
 */

import { TimeTableWeek, TimeTableDay, TimeTableLesson } from './timetable-service';

// Standard weekday names used throughout the application
export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

interface RawLesson {
  period?: number;
  startTime?: string;
  endTime?: string;
  subject?: string;
  teacher?: string;
  room?: string;
  notes?: string;
  isCancelled?: boolean;
  isSubstitution?: boolean;
  [key: string]: any; // Allow for other properties in the raw data
}

import { getPeriodTimes } from './school-time-utility';
import { SCHOOL_SCHEDULE } from '@/lib/school-time-utility';

// Keep track of which transformer is being used
let usedTransformer: string | null = null;

/**
 * Get information about which transformer was used
 */
export function getTransformerInfo(): { name: string | null } {
  return { name: usedTransformer };
}

/**
 * Transforms API response data into a standardized TimeTableWeek format
 * Handles various formats that the API might return
 */
export function transformTimetableData(data: any): TimeTableWeek | null {
  // Debug entire transformation process  
  console.log('----- TRANSFORMER START -----');
  
  // Try the direct adapter first for the specific format we know
  try {
    console.log("Trying direct adapter first");
    const directResult = directAdapter(data);
    if (directResult) {
      console.log("Direct adapter succeeded!");
      console.log('----- TRANSFORMER END - SUCCESS (direct adapter) -----');
      return directResult;
    }
  } catch (error) {
    console.error("Direct adapter failed:", error);
  }
  
  if (!data || typeof data !== 'object') {
    console.error('Invalid timetable data provided:', data);
    return null;
  }

  // Log data structure for debugging
  console.log('Transforming timetable data:', typeof data, Array.isArray(data), Object.keys(data));
  // First, check if we have a typical structure with day names as properties
  let hasStandardStructure = WEEKDAYS.some(day => day in data);
  
  // If we have our standard structure, normalize it
  if (hasStandardStructure) {
    return normalizeStandardStructure(data);
  }
  // Check if we have a 'data' property that contains the actual timetable
  if (data.data && typeof data.data === 'object') {
    console.log('Checking data.data property:', typeof data.data, Object.keys(data.data));
    
    // Special case: handle the specific format with days and periods arrays
    if (data.data.days && Array.isArray(data.data.days) && 
        data.data.periods && Array.isArray(data.data.periods)) {
      console.log('Found days and periods arrays in data.data');
      try {
        const result = normalizeSpecificFormat(data.data);
        if (result) {
          console.log('Successfully normalized specific format');
          console.log('----- TRANSFORMER END - SUCCESS -----');
          return result;
        }
      } catch (error) {
        console.error('Error normalizing specific format:', error);
      }
    }
    
    // Handle the new specific format with structured data
    if (data.data.structured && typeof data.data.structured === 'object') {
      console.log('Found structured data:', 
                typeof data.data.structured, 
                Object.keys(data.data.structured));
                
      // Verify the structure more carefully
      console.log('structured.days:', typeof data.data.structured.days, 
                 data.data.structured.days ? Array.isArray(data.data.structured.days) : 'null');
      console.log('structured.periods:', typeof data.data.structured.periods,
                 data.data.structured.periods ? Array.isArray(data.data.structured.periods) : 'null');
      console.log('structured.classes:', typeof data.data.structured.classes,
                 data.data.structured.classes ? Array.isArray(data.data.structured.classes) : 'null');
                
      if (data.data.structured.days && Array.isArray(data.data.structured.days) &&
          data.data.structured.periods && Array.isArray(data.data.structured.periods) &&
          data.data.structured.classes && Array.isArray(data.data.structured.classes)) {
        console.log('Trying to normalize structured format with classes');
        try {
          const result = normalizeStructuredFormat(data.data.structured);
          if (result) {
            console.log('Successfully normalized structured format');
            console.log('----- TRANSFORMER END - SUCCESS -----');
            return result;
          } else {
            console.error('normalizeStructuredFormat returned null or undefined');
          }
        } catch (error) {
          console.error('Error normalizing structured format:', error);
        }
      }
    }
    
    const innerData = normalizeStandardStructure(data.data);
    if (innerData) return innerData;
  }
  
  // Check if it's an array of days
  if (Array.isArray(data)) {
    return normalizeArrayStructure(data);
  }
    // Check for other common formats
  if ('days' in data && Array.isArray(data.days) && 'periods' in data && Array.isArray(data.periods)) {
    // Check if it's the structured format with classes
    if ('classes' in data && Array.isArray(data.classes)) {
      try {
        return normalizeStructuredFormat(data);
      } catch (error) {
        console.error('Error normalizing structured format:', error);
      }
    }
    
    // Try the regular format with days and periods
    try {
      return normalizeSpecificFormat(data);
    } catch (error) {
      console.error('Error normalizing specific format:', error);
    }
  }
  
  if ('days' in data && Array.isArray(data.days)) {
    return normalizeArrayStructure(data.days);
  }
  
  // Check for structured property
  if ('structured' in data && typeof data.structured === 'object' &&
      data.structured.days && Array.isArray(data.structured.days) &&
      data.structured.periods && Array.isArray(data.structured.periods) &&
      data.structured.classes && Array.isArray(data.structured.classes)) {
    try {
      return normalizeStructuredFormat(data.structured);
    } catch (error) {
      console.error('Error normalizing structured format from structured property:', error);
    }
  }
  
  // Check for numeric keys (0, 1, 2, 3, 4) which might represent days of the week
  if (Object.keys(data).some(key => !isNaN(Number(key)))) {
    return normalizeNumericKeysStructure(data);
  }
    // Final attempt: check for any properties that might contain lessons arrays
  const result = extractLessonsFromAnyStructure(data);
  if (result) {
    console.log('Successfully extracted lessons from structure');
    console.log('----- TRANSFORMER END - SUCCESS -----');
    return result;
  }
  
  console.error('Unable to transform timetable data, unrecognized format:', typeof data);
  console.log('----- TRANSFORMER END - FAILED -----');
  return null;
}

/**
 * Normalizes a standard structure where days of the week are properties
 */
function normalizeStandardStructure(data: any): TimeTableWeek | null {
  const result: TimeTableWeek = {} as TimeTableWeek;
  let hasData = false;
  
  for (const dayName of WEEKDAYS) {
    if (dayName in data) {
      const dayData = data[dayName];
      
      // Day data could be a TimeTableDay object or just an array of lessons
      if (typeof dayData === 'object') {
        if (Array.isArray(dayData)) {
          // It's just an array of lessons
          result[dayName] = {
            dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            lessons: normalizeLessons(dayData)
          };
          hasData = result[dayName].lessons.length > 0 || hasData;
        } else {
          // It's a TimeTableDay object
          result[dayName] = {
            dayName: dayData.dayName || dayName.charAt(0).toUpperCase() + dayName.slice(1),
            date: dayData.date,
            lessons: Array.isArray(dayData.lessons) ? normalizeLessons(dayData.lessons) : []
          };
          hasData = result[dayName].lessons.length > 0 || hasData;
        }
      }
    }
  }
  
  return hasData ? result : null;
}

/**
 * Normalizes an array structure like [dayData1, dayData2, ...]
 */
function normalizeArrayStructure(data: any[]): TimeTableWeek | null {
  const result: TimeTableWeek = {} as TimeTableWeek;
  let hasData = false;
  
  data.forEach((dayData, index) => {
    if (!dayData) return;
    
    // Determine dayName: either use the one provided, derive from index, or use custom format
    let dayName = '';
    if (dayData.dayName && typeof dayData.dayName === 'string') {
      dayName = dayData.dayName.toLowerCase();
    } else if (index < WEEKDAYS.length) {
      dayName = WEEKDAYS[index];
    } else {
      dayName = `day${index + 1}`;
    }
    
    // Normalize the lessons array
    let lessons: TimeTableLesson[] = [];
    
    if (Array.isArray(dayData.lessons)) {
      lessons = normalizeLessons(dayData.lessons);
    } else if (Array.isArray(dayData)) {
      lessons = normalizeLessons(dayData);
    }
    
    if (lessons.length > 0) {
      result[dayName] = {
        dayName: dayData.dayName || dayName.charAt(0).toUpperCase() + dayName.slice(1),
        date: dayData.date,
        lessons
      };
      hasData = true;
    }
  });
  
  return hasData ? result : null;
}

/**
 * Normalizes a structure with numeric keys like {0: dayData1, 1: dayData2, ...}
 */
function normalizeNumericKeysStructure(data: any): TimeTableWeek | null {
  const result: TimeTableWeek = {} as TimeTableWeek;
  let hasData = false;
  
  Object.keys(data).forEach(key => {
    const index = Number(key);
    if (isNaN(index)) return;
    
    const dayData = data[key];
    if (!dayData) return;
    
    // Map numeric index to day name
    const dayName = index < WEEKDAYS.length ? WEEKDAYS[index] : `day${index + 1}`;
    
    // Process lessons
    let lessons: TimeTableLesson[] = [];
    if (Array.isArray(dayData.lessons)) {
      lessons = normalizeLessons(dayData.lessons);
    } else if (Array.isArray(dayData)) {
      lessons = normalizeLessons(dayData);
    }
    
    if (lessons.length > 0) {
      result[dayName] = {
        dayName: dayData.dayName || dayName.charAt(0).toUpperCase() + dayName.slice(1),
        date: dayData.date,
        lessons
      };
      hasData = true;
    }
  });
  
  return hasData ? result : null;
}

/**
 * Extracts lessons from any structure by recursively searching for arrays
 */
function extractLessonsFromAnyStructure(data: any): TimeTableWeek | null {
  const result: TimeTableWeek = {} as TimeTableWeek;
  let hasData = false;
  
  // Helper function to recursively find arrays that might be lessons
  function findLessonArrays(obj: any, path: string[] = []): void {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      // Check if this array looks like lessons
      if (obj.length > 0) {
        // Extra safety check to ensure we don't crash on null/undefined items
        const firstValidItem = obj.find(item => item && typeof item === 'object');
        
        if (firstValidItem && 
            (firstValidItem.subject || firstValidItem.period || firstValidItem.startTime)) {
          // This looks like a lessons array! Map it to a day
          const dayIndex = result ? Object.keys(result).length : 0;
          const dayName = dayIndex < WEEKDAYS.length ? WEEKDAYS[dayIndex] : `day${dayIndex + 1}`;
          
          const lessons = normalizeLessons(obj);
          if (lessons.length > 0) {
            result[dayName] = {
              dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
              lessons
            };
            hasData = true;
          }
        } else {
          // Recurse into array items
          obj.forEach((item, idx) => {
            if (item !== null && item !== undefined) {
              findLessonArrays(item, [...path, idx.toString()]);
            }
          });
        }
      }
    } else {
      // Recurse into object properties
      Object.keys(obj).forEach(key => {
        if (obj[key] !== null && obj[key] !== undefined) {
          findLessonArrays(obj[key], [...path, key]);
        }
      });
    }
  }
  
  try {
    findLessonArrays(data);
  } catch (error) {
    console.error('Error finding lesson arrays:', error);
  }
  
  return hasData ? result : null;
}

/**
 * Normalizes an array of lessons to ensure they have all required properties
 */
function normalizeLessons(lessons: RawLesson[]): TimeTableLesson[] {
  if (!Array.isArray(lessons)) return [];
  
  return lessons
    .filter(lesson => lesson && typeof lesson === 'object')
    .map((lesson, index) => {
      try {
        // Ensure minimum required properties
        const normalizedLesson: TimeTableLesson = {
          period: lesson?.period || index + 1,
          startTime: lesson?.startTime || '00:00',
          endTime: lesson?.endTime || '00:00',
          subject: lesson?.subject || 'Unknown Subject',
          teacher: lesson?.teacher || '',
          room: lesson?.room || '',
          notes: lesson?.notes || '',
          isCancelled: !!lesson?.isCancelled,
          isSubstitution: !!lesson?.isSubstitution
        };
        
        return normalizedLesson;
      } catch (error) {
        console.error('Error normalizing lesson:', error, lesson);
        // Return a placeholder lesson if we can't normalize
        return {
          period: index + 1,
          startTime: '00:00',
          endTime: '00:00',
          subject: `Unknown Subject ${index + 1}`,
          teacher: '',
          room: '',
          notes: 'Error processing this lesson data',
          isCancelled: false,
          isSubstitution: false
        };
      }
    });
}

/**
 * Normalize the specific format with days and periods arrays plus classes array
 * This format appears to be structured as:
 * {
 *   data: {
 *     structured: {
 *       days: ["Montag", "Dienstag", ...],
 *       periods: ["1.08.10 - 08.55", "2.08.55 - 09.40", ...],
 *       classes: [
 *         { day: 0, period: 0, content: "F312", subject: "F312", room: "F312", lines: ["F312"] },
 *         ...
 *       ]
 *     }
 *   }
 * }
 */
function normalizeSpecificFormat(data: any): TimeTableWeek | null {
  const result: TimeTableWeek = {} as TimeTableWeek;
  let hasData = false;

  try {
    // Ensure we have the necessary arrays
    if (!Array.isArray(data.days) || !Array.isArray(data.periods)) {
      return null;
    }

    // Generate empty days with no lessons
    data.days.forEach((dayName: string, dayIndex: number) => {
      // Convert German day names to English
      const lowerDayName = dayName.toLowerCase();
      let englishDayName = '';
      
      if (lowerDayName.includes('montag')) englishDayName = 'monday';
      else if (lowerDayName.includes('dienstag')) englishDayName = 'tuesday';
      else if (lowerDayName.includes('mittwoch')) englishDayName = 'wednesday';
      else if (lowerDayName.includes('donnerstag')) englishDayName = 'thursday';
      else if (lowerDayName.includes('freitag')) englishDayName = 'friday';
      else if (lowerDayName.includes('samstag')) englishDayName = 'saturday';
      else if (lowerDayName.includes('sonntag')) englishDayName = 'sunday';
      else englishDayName = `day${dayIndex + 1}`;
      
      result[englishDayName] = {
        dayName: dayName,
        lessons: []
      };
    });
    
    // Process periods to extract time information
    const periods = data.periods.map((periodStr: string) => {
      const match = periodStr.match(/(\d+)\.(\d+:\d+)\s*-\s*(\d+:\d+)/);
      if (match) {
        return {
          period: parseInt(match[1], 10),
          startTime: match[2],
          endTime: match[3]
        };
      }
      return null;
    }).filter(Boolean);
    
    // If lessons data is available, process it
    if (data.lessons && Array.isArray(data.lessons)) {
      data.lessons.forEach((lesson: any) => {
        if (!lesson || typeof lesson !== 'object') return;
        
        const dayIndex = lesson.day !== undefined ? lesson.day : 0;
        const periodIndex = lesson.period !== undefined ? lesson.period : 0;
        
        // Get the day name
        if (dayIndex >= 0 && dayIndex < data.days.length) {
          const dayName = data.days[dayIndex].toLowerCase();
          let englishDayName = '';
          
          if (dayName.includes('montag')) englishDayName = 'monday';
          else if (dayName.includes('dienstag')) englishDayName = 'tuesday';
          else if (dayName.includes('mittwoch')) englishDayName = 'wednesday';
          else if (dayName.includes('donnerstag')) englishDayName = 'thursday';
          else if (dayName.includes('freitag')) englishDayName = 'friday';
          else englishDayName = `day${dayIndex + 1}`;
          
          // Get the period info
          const periodInfo = periodIndex >= 0 && periodIndex < periods.length 
            ? periods[periodIndex] 
            : { period: periodIndex + 1, startTime: '00:00', endTime: '00:00' };
          
          // Create the normalized lesson
          const normalizedLesson: TimeTableLesson = {
            period: periodInfo ? periodInfo.period : periodIndex + 1,
            startTime: periodInfo ? periodInfo.startTime : '00:00',
            endTime: periodInfo ? periodInfo.endTime : '00:00',
            subject: lesson.subject || `Subject ${periodIndex + 1}`,
            teacher: lesson.teacher || '',
            room: lesson.room || '',
            notes: lesson.notes || '',
            isCancelled: !!lesson.isCancelled,
            isSubstitution: !!lesson.isSubstitution
          };
          
          // Add the lesson to the appropriate day
          if (result[englishDayName]) {
            result[englishDayName].lessons.push(normalizedLesson);
            hasData = true;
          }
        }
      });
    } else {
      // If we don't have lesson data, create sample lessons for visualization
      Object.keys(result).forEach((dayName, dayIndex) => {
        const day = result[dayName];
        for (let i = 0; i < 5; i++) { // Create 5 sample lessons per day
          const periodInfo = i < periods.length ? periods[i] : null;
          day.lessons.push({
            period: periodInfo ? periodInfo.period : i + 1,
            startTime: periodInfo ? periodInfo.startTime : `0${8 + i}:00`,
            endTime: periodInfo ? periodInfo.endTime : `0${9 + i}:00`,
            subject: `Sample Subject ${i + 1}`,
            teacher: `Teacher ${dayIndex + 1}`,
            room: `Room ${100 + i}`,
            notes: '',
            isCancelled: false,
            isSubstitution: false
          });
        }
        hasData = true;
      });
    }

    return hasData ? result : null;
  } catch (error) {
    console.error('Error in normalizeSpecificFormat:', error);
    return null;
  }
}

/**
 * Normalize the structured format with classes array
 * This format appears to be structured as:
 * {
 *   days: ["Montag", "Dienstag", ...],
 *   periods: ["1.08.10 - 08.55", "2.08.55 - 09.40", ...],
 *   classes: [
 *     { day: 0, period: 0, content: "F312", subject: "F312", room: "F312", lines: ["F312"] },
 *     ...
 *   ]
 * }
 */
function normalizeStructuredFormat(data: any): TimeTableWeek | null {
  const result: TimeTableWeek = {} as TimeTableWeek;
  let hasData = false;

  try {
    // Debug the input data
    console.log("normalizeStructuredFormat - input data structure:", 
      typeof data,
      data ? Object.keys(data) : "null");
      
    // Ensure we have the necessary arrays
    if (!Array.isArray(data.days) || !Array.isArray(data.periods) || !Array.isArray(data.classes)) {
      console.error("Missing required arrays in structured data");
      console.error("days:", typeof data.days, data.days ? Array.isArray(data.days) : "null"); 
      console.error("periods:", typeof data.periods, data.periods ? Array.isArray(data.periods) : "null");
      console.error("classes:", typeof data.classes, data.classes ? Array.isArray(data.classes) : "null");
      return null;
    }

    // Map German day names to English
    const dayMappings: {[key: string]: string} = {
      'montag': 'monday',
      'dienstag': 'tuesday',
      'mittwoch': 'wednesday',
      'donnerstag': 'thursday',
      'freitag': 'friday',
      'samstag': 'saturday',
      'sonntag': 'sunday'
    };

    // Initialize days with empty lessons arrays
    data.days.forEach((dayName: string, dayIndex: number) => {
      const dayNameLower = dayName.toLowerCase();
      
      // Get English day name or default to dayX format
      let englishDayName = '';
      Object.entries(dayMappings).forEach(([german, english]) => {
        if (dayNameLower.includes(german)) {
          englishDayName = english;
        }
      });
      
      if (!englishDayName) {
        englishDayName = `day${dayIndex + 1}`;
      }
      
      result[englishDayName] = {
        dayName: dayName,
        lessons: []
      };
    });
    
    // Process periods to extract time information
    const periodInfos = data.periods.map((periodStr: string) => {
      const match = periodStr.match(/(\d+)\.(\d+:\d+)\s*-\s*(\d+:\d+)/);
      if (match) {
        return {
          period: parseInt(match[1], 10),
          startTime: match[2],
          endTime: match[3]
        };
      }
      return null;
    }).filter(Boolean);
    
    // Process all classes
    if (data.classes && Array.isArray(data.classes)) {
      data.classes.forEach((classItem: any) => {
        if (!classItem || typeof classItem !== 'object') return;
        
        // Make sure we have the necessary data
        if (classItem.day === undefined || classItem.period === undefined) return;
        
        const dayIndex = typeof classItem.day === 'number' ? classItem.day : parseInt(classItem.day, 10);
        const periodIndex = typeof classItem.period === 'number' ? classItem.period : parseInt(classItem.period, 10);
        
        if (isNaN(dayIndex) || isNaN(periodIndex)) return;
        
        // Skip if day or period index is out of bounds
        if (dayIndex < 0 || dayIndex >= data.days.length) return;
        if (periodIndex < 0 || periodIndex >= data.periods.length) return;

        // Get the day name
        const dayName = data.days[dayIndex];
        if (!dayName) return;
        
        const dayNameLower = dayName.toLowerCase();
        
        // Get English day name
        let englishDayName = '';
        Object.entries(dayMappings).forEach(([german, english]) => {
          if (dayNameLower.includes(german)) {
            englishDayName = english;
          }
        });
        
        if (!englishDayName) {
          englishDayName = `day${dayIndex + 1}`;
        }
        
        // Get period info
        const periodInfo = periodInfos[periodIndex];
        if (!periodInfo) return;
        
        // Create lesson object
        const lesson: TimeTableLesson = {
          period: periodInfo.period,
          startTime: periodInfo.startTime,
          endTime: periodInfo.endTime,
          subject: classItem.subject || classItem.content || `Subject ${periodIndex + 1}`,
          room: classItem.room || '',
          teacher: classItem.teacher || '',
          notes: classItem.notes || '',
          isCancelled: !!classItem.isCancelled,
          isSubstitution: !!classItem.isSubstitution
        };
        
        // Add the lesson to the day
        if (result[englishDayName]) {
          result[englishDayName].lessons.push(lesson);
          hasData = true;
        }
      });
    }
    
    // Sort lessons by period for each day
    Object.values(result).forEach(day => {
      day.lessons.sort((a, b) => a.period - b.period);
    });    if (!hasData) {
      console.error("No data was processed in normalizeStructuredFormat");
      return null;
    }
    
    console.log("Successfully created timetable with days:", Object.keys(result));
    for (const dayName in result) {
      console.log(`- ${dayName}: ${result[dayName].lessons.length} lessons`);
    }
    
    return result;
  } catch (error) {
    console.error('Error in normalizeStructuredFormat:', error);
    return null;
  }
}

/**
 * Direct adapter for the specific format we're receiving
 * This is a focused handler for the exact format we see in the logs
 */
function directAdapter(data: any): TimeTableWeek | null {
  try {
    console.log("Using direct adapter for specific format");
      // Check if data exists at all
    if (!data) {
      console.error("No data received in transformer");
      return null;
    }
    
    // Try to locate structured data in any possible format
    let structuredData;
    
    // Option 1: data.data.structured (original expected path)
    if (data.data && data.data.structured) {
      structuredData = data.data.structured;
    }
    // Option 2: data.structured (direct path)
    else if (data.structured) {
      structuredData = data.structured;
    }
    // Option 3: data itself might be the structured object
    else if (data.days && data.periods && data.classes) {
      structuredData = data;
    }
    // Option 4: Look for it in first level properties
    else if (typeof data === 'object') {
      for (const key in data) {
        const value = data[key];
        if (value && typeof value === 'object') {
          if (value.structured) {
            structuredData = value.structured;
            break;
          } else if (value.days && value.periods && value.classes) {
            structuredData = value;
            break;
          }
        }
      }
    }
    
    // If we couldn't find structured data anywhere
    if (!structuredData) {
      console.error("Could not locate structured data in API response");
      return null;
    }
    
    const structured = data.data.structured;
    
    // Validate the required fields
    if (!Array.isArray(structured.days) || !Array.isArray(structured.periods) || !Array.isArray(structured.classes)) {
      console.error("Missing required arrays in direct adapter");
      return null;
    }
    
    // Map German day names to English
    const dayMappings = [
      { german: "montag", english: "monday" },
      { german: "dienstag", english: "tuesday" },
      { german: "mittwoch", english: "wednesday" },
      { german: "donnerstag", english: "thursday" },
      { german: "freitag", english: "friday" },
      { german: "samstag", english: "saturday" },
      { german: "sonntag", english: "sunday" }
    ];
    
    // Create the result object
    const result: TimeTableWeek = {} as TimeTableWeek;
    
    // Initialize days
    structured.days.forEach((dayName: string, index: number) => {
      const lowerDayName = dayName.toLowerCase();
      
      // Find matching English day name
      let englishDayName = `day${index+1}`;
      for (const mapping of dayMappings) {
        if (lowerDayName.includes(mapping.german)) {
          englishDayName = mapping.english;
          break;
        }
      }
      
      result[englishDayName] = {
        dayName: dayName,
        lessons: []
      };
    });    // Parse periods for time information
    const periodInfos = structured.periods.map((periodStr: string, index: number) => {      // Format is like "1.08.10 - 08.55" - extract period number and times
      const match = periodStr.match(/(\d+)\.(\d+:\d+)\s*-\s*(\d+:\d+)/);
      if (match) {
        const periodNum = parseInt(match[1], 10);
          // Use the standard school schedule instead of the exact extracted times
        // This ensures consistent time display across the application
        const { start: startTime, end: endTime } = getPeriodTimes(periodNum);
        
        // Format the time without the period number
        const timeOnly = `${startTime} - ${endTime}`;
        
        return {
          index: index,
          period: periodNum,
          periodText: match[1],
          startTime: startTime,
          endTime: endTime,
          timeOnly: timeOnly,
          fullPeriodText: `${periodNum}. ${startTime} - ${endTime}` // Use standardized format
        };
      }
      return {
        index: index,
        period: index + 1,
        periodText: (index + 1).toString(),
        startTime: "00:00",
        endTime: "00:00",
        timeOnly: "00:00 - 00:00",
        fullPeriodText: `${index + 1}. 00:00 - 00:00`
      };
    });
    
    // Process classes
    let hasData = false;
    structured.classes.forEach((classItem: any) => {
      if (!classItem || typeof classItem !== 'object') return;
      
      if (classItem.day === undefined || classItem.period === undefined) {
        console.log("Skipping class item without day or period:", classItem);
        return;
      }
      
      const dayIndex = Number(classItem.day);
      const periodIndex = Number(classItem.period);
      
      if (isNaN(dayIndex) || isNaN(periodIndex)) {
        console.log("Skipping class item with invalid day or period:", classItem);
        return;
      }
      
      if (dayIndex < 0 || dayIndex >= structured.days.length) {
        console.log("Skipping class item with out of range day index:", classItem);
        return;
      }
      
      const dayName = structured.days[dayIndex];
      if (!dayName) {
        console.log("Skipping class item with invalid day name:", classItem);
        return;
      }
      
      const lowerDayName = dayName.toLowerCase();
      let englishDayName = `day${dayIndex+1}`;
      
      for (const mapping of dayMappings) {
        if (lowerDayName.includes(mapping.german)) {
          englishDayName = mapping.english;
          break;
        }
      }          const periodInfo = periodInfos[periodIndex] || {
        period: periodIndex + 1,
        periodText: (periodIndex + 1).toString(),
        startTime: "00:00",
        endTime: "00:00",
        timeOnly: "00:00 - 00:00",
        fullPeriodText: `${periodIndex + 1}. 00:00 - 00:00`
      };const lesson: TimeTableLesson = {
        period: periodInfo.period,
        startTime: periodInfo.startTime,
        endTime: periodInfo.endTime,
        subject: classItem.subject || classItem.content || "",
        room: classItem.room || "",
        teacher: classItem.teacher || "",
        notes: "",
        isCancelled: false,
        isSubstitution: false,
        periodLabel: periodInfo.timeOnly || `${periodInfo.startTime} - ${periodInfo.endTime}`,
        periodNumber: periodInfo.period
      };
      
      if (result[englishDayName]) {
        result[englishDayName].lessons.push(lesson);
        hasData = true;
      }
    });
    
    if (!hasData) {
      console.error("No data processed in direct adapter");
      return null;
    }
    
    // Sort lessons by period for each day
    Object.values(result).forEach(day => {
      if (day.lessons) {
        day.lessons.sort((a, b) => a.period - b.period);
      }
    });
    
    console.log("Direct adapter successful - created timetable with days:", Object.keys(result));
    for (const dayName in result) {
      console.log(`- ${dayName}: ${result[dayName].lessons.length} lessons`);
    }
    
    return result;
  } catch (error) {
    console.error("Error in direct adapter:", error);
    return null;
  }
}

/**
 * Helper function to detect cancellations and substitutions from various API formats 
 */
function detectLessonStatus(item: any): { isCancelled: boolean, isSubstitution: boolean } {
  // Check for cancellations
  const isCancelled = 
    item.code === 'cancelled' || 
    item.type === 'cancelled' || 
    (item.info && typeof item.info === 'string' && 
      (item.info.toLowerCase().includes('entfall') || 
       item.info.toLowerCase().includes('cancel')));
       
  // Check for substitutions
  const isSubstitution = 
    item.code === 'substitution' || 
    item.type === 'substitution' || 
    item.type === 'vertretung' || 
    (item.info && typeof item.info === 'string' && 
      (item.info.toLowerCase().includes('vertret') || 
       item.info.toLowerCase().includes('substit') ||
       item.info.toLowerCase().includes('ersatz')));
       
  return { isCancelled, isSubstitution };
}

/**
 * Updated external API transformer with enhanced status detection
 */
async function transformExternalApiFormat(data: any): Promise<TimeTableWeek | null> {
  try {
    console.log('Attempting to transform external API format');
    
    // Check if we have the expected structure
    if (!data || typeof data !== 'object') {
      console.error('External API data is not an object');
      return null;
    }
    
    // Extract structured data if it exists
    let apiData = data;
    if (data.structured) {
      apiData = data.structured;
    }
    
    // External API format has days, classes, and periods arrays
    if (!Array.isArray(apiData.days) || !Array.isArray(apiData.classes)) {
      console.error('External API data format not recognized', apiData);
      return null;
    }
    
    const result: TimeTableWeek = {} as TimeTableWeek;
    const dayMapping = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    
    // Initialize the days
    dayMapping.forEach((dayName, index) => {
      const dayLabel = apiData.days[index] || dayName;
      result[dayName] = {
        date: '',
        dayName: dayLabel,
        lessons: []
      };
    });
    
    // Process each class entry
    if (apiData.classes && Array.isArray(apiData.classes)) {
      apiData.classes.forEach((item: any) => {
        // Skip if day or period is invalid
        if (typeof item.day !== 'number' || item.day < 0 || item.day >= dayMapping.length) {
          console.warn('Skipping lesson with invalid day:', item);
          return;
        }
        
        const dayKey = dayMapping[item.day];
        
        // Get period info
        let startTime = "00:00";
        let endTime = "00:00";
        let periodLabel = `Period ${item.period + 1}`;
        
        // Try to extract time from periods array if available
        if (apiData.periods && Array.isArray(apiData.periods) && item.period < apiData.periods.length) {
          const periodStr = apiData.periods[item.period];
          // Periods are in format "1.08:00 - 08:45" - extract times
          const match = periodStr?.match(/\d+\.(\d+:\d+)\s*-\s*(\d+:\d+)/);
          if (match) {
            startTime = match[1];
            endTime = match[2];
            periodLabel = `${startTime} - ${endTime}`;
          }
        }
        
        // Detect lesson status
        const { isCancelled, isSubstitution } = detectLessonStatus(item);
        
        // Create the lesson
        const lesson: TimeTableLesson = {
          period: item.period + 1, // Convert to 1-based for display
          periodNumber: item.period + 1,
          startTime,
          endTime,
          periodLabel,
          subject: item.subject || "",
          room: item.room || "",
          teacher: item.teacher || "",
          notes: item.info || "",
          isCancelled,
          isSubstitution
        };
        
        // Add the lesson to the appropriate day
        result[dayKey].lessons.push(lesson);
      });
    }
    
    // Sort lessons for each day by period
    Object.keys(result).forEach(day => {
      result[day].lessons.sort((a, b) => a.period - b.period);
    });
    
    console.log('External API transformer succeeded with:', 
      Object.keys(result).length, 'days,',
      Object.values(result).reduce((total, day) => total + day.lessons.length, 0), 'total lessons,',
      Object.values(result).reduce((total, day) => 
        total + day.lessons.filter(l => l.isCancelled).length, 0), 'cancelled,',
      Object.values(result).reduce((total, day) => 
        total + day.lessons.filter(l => l.isSubstitution).length, 0), 'substitutions');
      
    return result;
  } catch (error) {
    console.error('Error transforming external API format:', error);
    return null;
  }
}

/**
 * Update the direct format transformer to also use our enhanced lesson status detection
 */

async function updateLessonInDirectFormat(lesson: any, classItem: any): Promise<void> {
  // Use our enhanced detection function
  const { isCancelled, isSubstitution } = detectLessonStatus(classItem);
  
  // Update the lesson properties
  lesson.isCancelled = isCancelled;
  lesson.isSubstitution = isSubstitution;
  
  // Add extra information for debugging
  if (classItem.info) {
    lesson.notes = classItem.info;
  }
  
  // Log if we found a special status
  if (isCancelled || isSubstitution) {
    console.log(`Detected ${isCancelled ? 'cancellation' : 'substitution'} for ${lesson.subject}, period ${lesson.period}`);
  }
}

// Modified transformDirectFormatLessons to use our enhanced lesson status detection
async function transformDirectFormatLessonsWithEnhancedStatus(data: any): Promise<TimeTableWeek | null> {
  // Check data & try to find structured data
  if (!data) {
    console.error("No data received in transformer");
    return null;
  }
  
  // Try to find structured data in various possible locations
  let structured;
  
  // Option 1: In data.data.structured (expected path)
  if (data.data && data.data.structured) {
    structured = data.data.structured;
  }
  // Option 2: Directly in data.structured
  else if (data.structured) {
    structured = data.structured;
  }
  // Option 3: Data itself might be the structured object
  else if (data.days && data.periods && data.classes) {
    structured = data;
  }
  // Option 4: Look for it in first level properties
  else if (data && typeof data === 'object') {
    for (const key in data) {
      const value = data[key];
      if (value && typeof value === 'object') {
        if (value.structured) {
          structured = value.structured;
          break;
        } else if (value.days && value.periods && value.classes) {
          structured = value;
          break;
        }
      }
    }
  }
  
  if (!structured) {
    console.error("Could not locate structured data format in API response", data);
    return null;
  }
  
  // Validate the required fields
  if (!Array.isArray(structured.days) || !Array.isArray(structured.periods) || !Array.isArray(structured.classes)) {
    console.error("Invalid structured data format - missing required arrays", structured);
    return null;
  }
  
  console.log("Found valid structured data format with:", 
    structured.days.length, "days,",
    structured.periods.length, "periods,",
    structured.classes.length, "classes"
  );
  
  // Parse periods for time information
  const periodInfos = structured.periods.map((periodStr: string, index: number) => {
    // Format is like "1.08.10 - 08.55" - extract period number and times
    const match = periodStr.match(/(\d+)\.(\d+:\d+)\s*-\s*(\d+:\d+)/);
    if (match) {
      const periodNum = parseInt(match[1], 10);
      const startTime = match[2];
      const endTime = match[3];
      
      // Format the time without the period number
      const timeOnly = `${startTime} - ${endTime}`;
      
      return {
        index: index,
        period: periodNum,
        periodText: match[1],
        startTime: startTime,
        endTime: endTime,
        timeOnly: timeOnly,
        fullPeriodText: `${periodNum}. ${startTime} - ${endTime}` // Use standardized format
      };
    }
    return {
      index: index,
      period: index + 1,
      periodText: (index + 1).toString(),
      startTime: "00:00",
      endTime: "00:00",
      timeOnly: "00:00 - 00:00",
      fullPeriodText: `${index + 1}. 00:00 - 00:00`
    };
  });
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const result: TimeTableWeek = {} as TimeTableWeek;
  
  // For each day, build up lessons list
  structured.days.forEach((dayName: string, dayIndex: number) => {
    // Map German day names to English
    dayName = dayName.toLowerCase();
    if (dayName === 'montag') dayName = 'monday';
    if (dayName === 'dienstag') dayName = 'tuesday';
    if (dayName === 'mittwoch') dayName = 'wednesday';
    if (dayName === 'donnerstag') dayName = 'thursday';
    if (dayName === 'freitag') dayName = 'friday';
    
    const dayKey = days[dayIndex] || dayName.toLowerCase();
    result[dayKey] = {
      date: '',
      dayName: dayName,
      lessons: []
    };
    
    // Process class items for the current day
    structured.classes.forEach((classItem: any) => {
      if (classItem.day !== dayIndex) return;
      
      const periodIndex = classItem.period;
      const periodInfo = periodInfos[periodIndex] || {
        period: periodIndex + 1,
        periodText: (periodIndex + 1).toString(),
        startTime: "00:00",
        endTime: "00:00",
        timeOnly: "00:00 - 00:00",
        fullPeriodText: `${periodIndex + 1}. 00:00 - 00:00`
      };
      
      // Create the lesson and use our enhanced status detection
      const { isCancelled, isSubstitution } = detectLessonStatus(classItem);
      
      const lesson: TimeTableLesson = {
        period: periodInfo.period,
        startTime: periodInfo.startTime,
        endTime: periodInfo.endTime,
        subject: classItem.subject || classItem.content || "",
        room: classItem.room || "",
        teacher: classItem.teacher || "",
        notes: classItem.info || "",
        isCancelled,
        isSubstitution,
        periodLabel: periodInfo.timeOnly || `${periodInfo.startTime} - ${periodInfo.endTime}`,
        periodNumber: periodInfo.period
      };
      
      result[dayKey].lessons.push(lesson);
    });
    
    // Sort lessons by period
    result[dayKey].lessons.sort((a, b) => a.period - b.period);
  });
  
  // Add metadata
  if (data.timestamp) {
    (result as any).timestamp = data.timestamp;
  }
  if (data.statusMessage) {
    (result as any).statusMessage = data.statusMessage;
  }
  
  // Check if we found any data
  const dayWithLessons = Object.values(result).find(day => day.lessons.length > 0);
  if (!dayWithLessons) {
    console.warn("Transformed data has no lessons");
  } else {
    console.log("Transformed data: ", 
      Object.keys(result), "days with lessons,",
      "Cancelled:", Object.values(result).reduce((count, day) => count + day.lessons.filter(l => l.isCancelled).length, 0),
      "Substitutions:", Object.values(result).reduce((count, day) => count + day.lessons.filter(l => l.isSubstitution).length, 0)
    );
  }
  
  return result;
}

/**
 * Main transformer function that detects the format and calls the appropriate transformer
 */
export async function transformAPIResponseToTimeTable(data: any): Promise<TimeTableWeek | null> {
  if (!data) {
    console.error("No data received in transformer");
    return null;
  }
  
  console.log("Attempting to transform API response:", Object.keys(data));
    // Add detailed logging to understand the API response structure
  console.log("API response keys:", Object.keys(data));
  
  // Try to extract structured data from any possible location
  let structuredData;
  
  // Option 1: data.structured (direct path in timetable-api format)
  if (data.structured && 
      Array.isArray(data.structured.days) && 
      Array.isArray(data.structured.classes)) {
    structuredData = data.structured;
    console.log("Found data.structured format");
  }
  // Option 2: data.data.structured (nested format)
  else if (data.data && data.data.structured && 
           Array.isArray(data.data.structured.days) && 
           Array.isArray(data.data.structured.classes)) {
    structuredData = data.data.structured;
    console.log("Found data.data.structured format");
  }
  // Option 3: data itself might be the structured object
  else if (data.days && data.periods && data.classes && 
           Array.isArray(data.days) && 
           Array.isArray(data.classes)) {
    structuredData = data;
    console.log("Data itself contains structured format");
  }   // Option 4: Raw data format directly containing days
  else if (data.monday || data.tuesday || data.wednesday || data.thursday || data.friday) {
    console.log("Direct timetable week format detected");
    return data as TimeTableWeek;
  }
  // Option 5: Direct array of lessons
  else if (Array.isArray(data) && data.length > 0) {
    console.log("Found direct array of lessons format");
    
    try {
      // Check if array items have typical lesson properties
      const hasLessonProps = data.some(item => 
        item && typeof item === 'object' && 
        (item.subject || item.class || item.room || item.teacher || item.period)
      );
      
      if (hasLessonProps) {
        // Try to organize by day
        const dayMap: Record<string, any[]> = {
          '0': [], '1': [], '2': [], '3': [], '4': []
        };
        
        data.forEach(lesson => {
          const day = lesson.day !== undefined ? lesson.day.toString() : '0';
          if (dayMap[day]) {
            dayMap[day].push(lesson);
          } else {
            dayMap['0'].push(lesson);
          }
        });
        
        // Create classes array
        const classes: any[] = [];
        Object.entries(dayMap).forEach(([day, lessons]) => {
          lessons.forEach(lesson => {
            classes.push({
              day: parseInt(day, 10),
              period: lesson.period || lesson.hour || 0,
              subject: lesson.subject || lesson.name || "",
              room: lesson.room || "",
              teacher: lesson.teacher || "",
              code: lesson.status || (lesson.cancelled ? 'cancelled' : (lesson.substitution ? 'substitution' : ''))
            });
          });
        });
        
        if (classes.length > 0) {
          structuredData = {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            periods: SCHOOL_SCHEDULE.periods.map((p, i) => `${i+1}.${p.start} - ${p.end}`),
            classes
          };
          console.log(`Created structured data from raw lessons array with ${classes.length} classes`);
        }
      }
    } catch (err) {
      console.error("Error parsing raw lessons array:", err);
    }
  }
  // Option 6: Specific format from the external API
  else if (data.plan || data.plaene) {
    console.log("External API plan format detected");
    // Try to extract structured data from plan
    const planData = data.plan || data.plaene;
    
    if (planData && typeof planData === 'object') {
      console.log("Plan data keys:", Object.keys(planData));
        // Create a simplified structure that our transformer can work with
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const classes: any[] = []; // Use any[] to avoid type errors
      const periods = SCHOOL_SCHEDULE.periods.map((p, i) => 
        `${i+1}.${p.start} - ${p.end}`
      );
      
      // Try to extract classes from the plan
      // This depends on the specific format of the external API
      try {
        // Log plan data structure
        console.log("Exploring plan data structure...");
        
        if (Array.isArray(planData)) {
          // If plan is an array, try to process each item
          console.log("Plan is an array with", planData.length, "items");
          planData.forEach((item, index) => {
            if (item && typeof item === 'object') {
              console.log(`Plan item ${index} keys:`, Object.keys(item));
              
              // Extract lessons from plan items
              const day = item.day || item.weekday || 0;
              const lessons = item.lessons || item.timetable || item.classes || [];
              
              if (Array.isArray(lessons)) {
                console.log(`Found ${lessons.length} lessons for day ${day}`);
                
                // Convert lessons to our format
                lessons.forEach(lesson => {
                  classes.push({
                    day: day,
                    period: lesson.period || lesson.hour || 0,
                    subject: lesson.subject || lesson.name || "",
                    room: lesson.room || "",
                    teacher: lesson.teacher || "",
                    code: lesson.status || (lesson.cancelled ? 'cancelled' : (lesson.substitution ? 'substitution' : ''))
                  });
                });
              }
            }
          });
        } else {
          // If plan is an object, try to extract days
          for (const key in planData) {
            const dayData = planData[key];
            if (dayData && typeof dayData === 'object') {
              console.log(`Plan day ${key} keys:`, Object.keys(dayData));
              
              // Try to find lessons
              const lessons = dayData.lessons || dayData.timetable || dayData.classes || [];
              if (Array.isArray(lessons)) {
                const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(key.toLowerCase());
                
                console.log(`Found ${lessons.length} lessons for day ${key} (index ${dayIndex})`);
                
                // Convert lessons to our format
                lessons.forEach(lesson => {
                  classes.push({
                    day: dayIndex >= 0 ? dayIndex : 0,
                    period: lesson.period || lesson.hour || 0,
                    subject: lesson.subject || lesson.name || "",
                    room: lesson.room || "",
                    teacher: lesson.teacher || "",
                    code: lesson.status || (lesson.cancelled ? 'cancelled' : (lesson.substitution ? 'substitution' : ''))
                  });
                });
              }
            }
          }
        }
        
        // If we have extracted any classes, create a structured data object
        if (classes.length > 0) {
          structuredData = { days, periods, classes };
          console.log(`Created structured data with ${classes.length} classes`);
        }
      } catch (err) {
        console.error("Error parsing plan data:", err);
      }
    }
  }
  
  // If we still couldn't find structured data, try to create a minimal structure
  if (!structuredData) {
    console.error("Could not locate structured data in API response, attempting to create a minimal structure");
    
    // Log the entire data structure (excluding large arrays/objects) for debugging
    console.log("API response structure:", 
      JSON.stringify(data, (key, value) => {
        // Skip large arrays and objects for clarity
        if (Array.isArray(value) && value.length > 10) {
          return `[Array with ${value.length} items]`;
        }
        if (value !== null && typeof value === 'object' && Object.keys(value).length > 10) {
          return `{Object with ${Object.keys(value).length} keys}`;
        }
        return value;
      }, 2).substring(0, 1000) + "..."
    );
    
    // Create a minimal structure with mock data
    // This will allow the app to continue functioning
    structuredData = {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      periods: SCHOOL_SCHEDULE.periods.map((p, i) => `${i+1}.${p.start} - ${p.end}`),
      classes: [
        { day: 0, period: 0, subject: 'M', room: '101', teacher: 'Unknown' },
        { day: 0, period: 1, subject: 'E', room: '102', teacher: 'Unknown' }
      ]
    };
    console.log("Created minimal fallback structure");
  }
  
  console.log("Found structured data with", 
    structuredData.days.length, "days and",
    structuredData.classes.length, "classes");
  
  // Process the structured data into our timetable format
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const result: TimeTableWeek = {} as TimeTableWeek;
    // For each day, initialize an empty lessons array
  // If no days are defined, use default days
  if (!structuredData.days || !Array.isArray(structuredData.days) || structuredData.days.length === 0) {
    // Create default days
    days.forEach(day => {
      result[day] = {
        date: '',
        dayName: day.charAt(0).toUpperCase() + day.slice(1),
        lessons: []
      };
    });
  } else {
    structuredData.days.forEach((dayName: string, dayIndex: number) => {
      // Map day names if needed
      let processedDayName = String(dayName).toLowerCase();
      if (processedDayName === 'montag') processedDayName = 'monday';
      if (processedDayName === 'dienstag') processedDayName = 'tuesday';
      if (processedDayName === 'mittwoch') processedDayName = 'wednesday';
      if (processedDayName === 'donnerstag') processedDayName = 'thursday';
      if (processedDayName === 'freitag') processedDayName = 'friday';
      
      const dayKey = days[dayIndex] || processedDayName;
      result[dayKey] = {
        date: '',
        dayName: dayName,
        lessons: []
      };
    });
  }
    // Parse period information or use default periods if not available
  const periodInfos = (structuredData.periods || []).length > 0 
    ? (structuredData.periods || []).map((periodStr: string, index: number) => {
      // Format is like "1.08.10 - 08.55" - extract period number and times
      const match = periodStr.match(/(\d+)\.(\d+:\d+)\s*-\s*(\d+:\d+)/);
      if (match) {
        return {
          period: parseInt(match[1], 10),
          startTime: match[2],
          endTime: match[3],
          timeLabel: `${match[2]} - ${match[3]}`
        };
      }
      return {
        period: index + 1,
        startTime: "00:00",
        endTime: "00:00",
        timeLabel: ""
      };
    })
    : SCHOOL_SCHEDULE.periods.map((p, i) => ({
      period: p.period,
      startTime: p.start,
      endTime: p.end,
      timeLabel: `${p.start} - ${p.end}`
    }));
    // Process each class entry
  structuredData.classes.forEach((classItem: any) => {
    // Ensure day index is a number and normalize it within range
    let dayIndex = 0;
    
    // Handle various formats of the day property
    if (typeof classItem.day === 'number') {
      dayIndex = classItem.day;
    } else if (typeof classItem.day === 'string') {
      // Try to parse as number first
      const parsed = parseInt(classItem.day, 10);
      if (!isNaN(parsed)) {
        dayIndex = parsed;
      } else {
        // Try to match day name
        const dayName = classItem.day.toLowerCase();
        dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(dayName);
        if (dayIndex < 0) {
          // Try German day names
          dayIndex = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag'].indexOf(dayName);
        }
      }
    }
    
    // Ensure day index is valid
    if (dayIndex < 0 || dayIndex >= days.length) {
      dayIndex = 0; // Default to Monday if invalid
    }
    
    // Get the day key
    const dayKey = days[dayIndex];
    
    // Create the day if it doesn't exist
    if (!result[dayKey]) {
      result[dayKey] = {
        date: '',
        dayName: structuredData.days[dayIndex] || days[dayIndex],
        lessons: []
      };
    }
    
    // Get period info
    const periodIndex = classItem.period;
    const periodInfo = periodInfos[periodIndex] || {
      period: periodIndex + 1,
      startTime: "00:00",
      endTime: "00:00",
      timeLabel: ""
    };
      // Use our enhanced helper function to detect lesson status
    const { isCancelled, isSubstitution } = detectLessonStatus(classItem);
    
    // Create the lesson
    const lesson: TimeTableLesson = {
      period: periodInfo.period,
      periodNumber: periodInfo.period,
      startTime: periodInfo.startTime,
      endTime: periodInfo.endTime,
      periodLabel: periodInfo.timeLabel,
      subject: classItem.subject || "",
      room: classItem.room || "",
      teacher: classItem.teacher || "",
      notes: classItem.info || "",
      isCancelled,
      isSubstitution
    };
    
    // Add to the appropriate day
    result[dayKey].lessons.push(lesson);
  });
  
  // Sort lessons by period for each day
  Object.values(result).forEach(day => {
    day.lessons.sort((a, b) => a.period - b.period);
  });
  
  console.log("Successfully transformed data with", Object.keys(result).length, "days");
  return result;
}

/**
 * Fix the error by directly updating the function implementation
 */
async function transformDirectFormatLessons(data: any): Promise<TimeTableWeek | null> {
  try {
    // Check if data exists at all
    if (!data) {
      console.error("No data received in transformer");
      return null;
    }
    
    // Try to locate structured data in any possible format
    let structuredData;
    
    // Option 1: data.data.structured (original expected path)
    if (data.data && data.data.structured) {
      structuredData = data.data.structured;
    }
    // Option 2: data.structured (direct path)
    else if (data.structured) {
      structuredData = data.structured;
    }
    // Option 3: data itself might be the structured object
    else if (data.days && data.periods && data.classes) {
      structuredData = data;
    }
    // Option 4: Look for it in first level properties
    else if (typeof data === 'object') {
      for (const key in data) {
        const value = data[key];
        if (value && typeof value === 'object') {
          if (value.structured) {
            structuredData = value.structured;
            break;
          } else if (value.days && value.periods && value.classes) {
            structuredData = value;
            break;
          }
        }
      }
    }
    
    // If we couldn't find structured data anywhere
    if (!structuredData) {
      console.error("Could not locate structured data in API response");
      return null;
    }
    
    // Validate the structured data
    if (!Array.isArray(structuredData.days) || 
        !Array.isArray(structuredData.periods) || 
        !Array.isArray(structuredData.classes)) {
      console.error("Invalid structured data format - missing required arrays");
      return null;
    }
    
    console.log("Found valid structured data format with:", 
      structuredData.days.length, "days,",
      structuredData.periods.length, "periods,",
      structuredData.classes.length, "classes"
    );
    
    // Continue with processing the structured data
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const result: TimeTableWeek = {} as TimeTableWeek;
    
    // Parse periods for time information
    const periodInfos = structuredData.periods.map((periodStr: string, index: number) => {
      // Format is like "1.08.10 - 08.55" - extract period number and times
      const match = periodStr.match(/(\d+)\.(\d+:\d+)\s*-\s*(\d+:\d+)/);
      if (match) {
        const periodNum = parseInt(match[1], 10);
        const startTime = match[2];
        const endTime = match[3];
        
        // Format the time without the period number
        const timeOnly = `${startTime} - ${endTime}`;
        
        return {
          index: index,
          period: periodNum,
          periodText: match[1],
          startTime: startTime,
          endTime: endTime,
          timeOnly: timeOnly,
          fullPeriodText: `${periodNum}. ${startTime} - ${endTime}` // Use standardized format
        };
      }
      return {
        index: index,
        period: index + 1,
        periodText: (index + 1).toString(),
        startTime: "00:00",
        endTime: "00:00",
        timeOnly: "00:00 - 00:00",
        fullPeriodText: `${index + 1}. 00:00 - 00:00`
      };
    });
    
    // For each day, build up lessons list
    structuredData.days.forEach((dayName: string, dayIndex: number) => {
      // Map German day names to English
      dayName = dayName.toLowerCase();
      if (dayName === 'montag') dayName = 'monday';
      if (dayName === 'dienstag') dayName = 'tuesday';
      if (dayName === 'mittwoch') dayName = 'wednesday';
      if (dayName === 'donnerstag') dayName = 'thursday';
      if (dayName === 'freitag') dayName = 'friday';
      
      const dayKey = days[dayIndex] || dayName.toLowerCase();
      result[dayKey] = {
        date: '',
        dayName: dayName,
        lessons: []
      };
      
      // Process class items for the current day
      structuredData.classes.forEach((classItem: any) => {
        if (classItem.day !== dayIndex) return;
        
        const periodIndex = classItem.period;
        const periodInfo = periodInfos[periodIndex] || {
          period: periodIndex + 1,
          periodText: (periodIndex + 1).toString(),
          startTime: "00:00",
          endTime: "00:00",
          timeOnly: "00:00 - 00:00",
          fullPeriodText: `${periodIndex + 1}. 00:00 - 00:00`
        };
        
        // Use our enhanced status detection
        const { isCancelled, isSubstitution } = detectLessonStatus(classItem);
        
        const lesson: TimeTableLesson = {
          period: periodInfo.period,
          startTime: periodInfo.startTime,
          endTime: periodInfo.endTime,
          subject: classItem.subject || classItem.content || "",
          room: classItem.room || "",
          teacher: classItem.teacher || "",
          notes: classItem.info || "",
          isCancelled,
          isSubstitution,
          periodLabel: periodInfo.timeOnly || `${periodInfo.startTime} - ${periodInfo.endTime}`,
          periodNumber: periodInfo.period
        };
        
        result[dayKey].lessons.push(lesson);
      });
      
      // Sort lessons by period
      result[dayKey].lessons.sort((a, b) => a.period - b.period);
    });
    
    return result;
  } catch (error) {
    console.error("Error in transformDirectFormatLessons", error);
    return null;
  }
}



export default {
  transformTimetableData,
  WEEKDAYS
};
/**
 * Timetable Service
 * Handles fetching and processing timetable data
 */

// Types for the timetable data
export interface TimeTableResponse {
  success?: boolean;
  data?: TimeTableWeek;
  timestamp?: string;
  message?: string;
  isFallback?: boolean;  // Indicates if this is fallback data
  reason?: string;       // Reason for using fallback data
  errorMessage?: string; // Original error message if any
  [key: string]: any;    // Allow for other properties
}

export interface TimeTableWeek {
  monday: TimeTableDay;
  tuesday: TimeTableDay;
  wednesday: TimeTableDay;
  thursday: TimeTableDay;
  friday: TimeTableDay;
  [key: string]: TimeTableDay;
}

export interface TimeTableDay {
  dayName: string;
  date?: string;
  lessons: TimeTableLesson[];
}

// Add periodLabel to the TimeTableLesson interface
export interface TimeTableLesson {
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher?: string;
  room?: string;
  notes?: string;
  isCancelled?: boolean;
  isSubstitution?: boolean;
  periodLabel?: string; // Full period text, e.g., "1.08.10 - 08.55"
  periodNumber?: number; // The period number, e.g., 1
}

import { FALLBACK_TIMETABLE } from './timetable-fallback';
import { transformTimetableData } from './timetable-transformer';
import { parseTimeToMinutes } from './school-time-utility';

/**
 * Fetches the timetable data from the API
 * Falls back to sample data if the API is not available
 */
export async function fetchTimeTable(): Promise<TimeTableResponse> {
  try {
    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Use our internal API proxy to avoid CORS issues
      const response = await fetch('/api/timetable', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`API responded with status: ${response.status}, using fallback data`);
        return FALLBACK_TIMETABLE;
      }
      
      const rawData = await response.json();
      
      // Transform the data to ensure it matches our expected format
      const transformedData = transformTimetableData(rawData);
      
      // If transformation failed, use fallback data
      if (!transformedData) {
        console.warn('Failed to transform timetable data, using fallback data');
        return FALLBACK_TIMETABLE;
      }
      
      return {
        success: true,
        data: transformedData,
        timestamp: new Date().toISOString()
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('Error fetching timetable:', fetchError);
      return FALLBACK_TIMETABLE;
    }
  } catch (error) {
    console.error('Unexpected error in fetchTimeTable:', error);
    return FALLBACK_TIMETABLE;
  }
}

/**
 * Get the current day's name to highlight it in the timetable
 */
export function getCurrentDayName(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = new Date().getDay();
  return days[currentDay];
}

/**
 * Checks if a lesson is currently active based on its start and end times
 */
export function isCurrentlyActive(startTime: string, endTime: string): boolean {
  const now = new Date();
  const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Parse times to minutes for easier comparison
  const currentTimeInMinutes = parseTimeToMinutes(currentTimeString);
  const startTimeInMinutes = parseTimeToMinutes(startTime);
  const endTimeInMinutes = parseTimeToMinutes(endTime);
  
  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
}

/**
 * Gets the current or next lesson from the timetable
 */
export function getCurrentOrNextLesson(timetable: TimeTableWeek): { 
  lesson: TimeTableLesson | null; 
  dayName: string; 
  isCurrentLesson: boolean;
} {
  // Safety check for timetable structure
  if (!timetable || typeof timetable !== 'object') {
    return { lesson: null, dayName: 'monday', isCurrentLesson: false };
  }
  
  // Debug the timetable structure
  console.log('Timetable structure in getCurrentOrNextLesson:', Object.keys(timetable));
  
  const currentDayName = getCurrentDayName();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  // Get the first available day from the timetable
  const availableDays = Object.keys(timetable);
  if (availableDays.length === 0) {
    return { lesson: null, dayName: 'monday', isCurrentLesson: false };
  }
  
  const defaultDayName = availableDays.includes('monday') ? 'monday' : availableDays[0];
  
  // Check if it's a weekend
  if (currentDayName === 'saturday' || currentDayName === 'sunday') {
    // Return the first lesson of the first available day
    const defaultDay = timetable[defaultDayName];
    if (defaultDay && Array.isArray(defaultDay.lessons) && defaultDay.lessons.length > 0) {
      return { 
        lesson: defaultDay.lessons[0],
        dayName: defaultDayName,
        isCurrentLesson: false
      };
    } else {
      // Look for any day with lessons
      for (const dayName of availableDays) {
        const day = timetable[dayName];
        if (day && Array.isArray(day.lessons) && day.lessons.length > 0) {
          return {
            lesson: day.lessons[0],
            dayName,
            isCurrentLesson: false
          };
        }
      }
      return { lesson: null, dayName: defaultDayName, isCurrentLesson: false };
    }
  }
  
  // Check current day's lessons
  const currentDay = timetable[currentDayName];
  if (currentDay && Array.isArray(currentDay.lessons) && currentDay.lessons.length > 0) {
    // Find current lesson
    try {
      for (const lesson of currentDay.lessons) {
        // Ensure lesson has valid properties
        if (!lesson.startTime || !lesson.endTime) continue;
        
        const [startHour, startMinute] = lesson.startTime.split(':').map(Number);
        const [endHour, endMinute] = lesson.endTime.split(':').map(Number);
        
        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) continue;
        
        const startTimeMinutes = startHour * 60 + startMinute;
        const endTimeMinutes = endHour * 60 + endMinute;
        
        if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes) {
          return { lesson, dayName: currentDayName, isCurrentLesson: true };
        }
      }
      
      // Find next lesson today
      for (const lesson of currentDay.lessons) {
        if (!lesson.startTime) continue;
        
        const [startHour, startMinute] = lesson.startTime.split(':').map(Number);
        if (isNaN(startHour) || isNaN(startMinute)) continue;
        
        const startTimeMinutes = startHour * 60 + startMinute;
        
        if (currentTimeMinutes < startTimeMinutes) {
          return { lesson, dayName: currentDayName, isCurrentLesson: false };
        }
      }
    } catch (error) {
      console.error('Error processing current day lessons:', error);
    }
  }
  
  // If no current or upcoming lessons today, find the first lesson for the next day
  // First create list of all available days
  const availableWeekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    .filter(day => {
      const dayData = timetable[day];
      return dayData && Array.isArray(dayData.lessons) && dayData.lessons.length > 0;
    });
    
  if (availableWeekdays.length === 0) {
    // No standard weekdays found, try any available days
    for (const dayName of availableDays) {
      const day = timetable[dayName];
      if (day && Array.isArray(day.lessons) && day.lessons.length > 0) {
        return {
          lesson: day.lessons[0],
          dayName,
          isCurrentLesson: false
        };
      }
    }
  }
  
  const currentDayIndex = availableWeekdays.indexOf(currentDayName);
  
  if (currentDayIndex >= 0 && currentDayIndex < availableWeekdays.length - 1) {
    // There's a next weekday
    const nextDay = availableWeekdays[currentDayIndex + 1];
    if (timetable[nextDay] && Array.isArray(timetable[nextDay].lessons) && timetable[nextDay].lessons.length > 0) {
      return { 
        lesson: timetable[nextDay].lessons[0], 
        dayName: nextDay,
        isCurrentLesson: false
      };
    }
  }
  
  // If we're on Friday or no next day was found, return the first lesson of the first available day
  const firstDay = availableWeekdays[0] || defaultDayName;
  if (timetable[firstDay] && Array.isArray(timetable[firstDay].lessons) && timetable[firstDay].lessons.length > 0) {
    return { 
      lesson: timetable[firstDay].lessons[0],
      dayName: firstDay,
      isCurrentLesson: false
    };
  }
  
  // Fall back to null if no lessons were found
  return { lesson: null, dayName: defaultDayName, isCurrentLesson: false };
}

/**
 * Debug function to help diagnose API data formats
 */
export function debugApiFormat(data: any): string {
  try {
    if (!data) return "No data received";
    
    const result: string[] = []; // Initialize as string array
    result.push(`API Response Type: ${typeof data}`);
    
    if (typeof data === 'object') {
      result.push(`Top-level keys: ${Object.keys(data).join(', ')}`);
      
      if (data.data) {
        result.push(`data property type: ${typeof data.data}`);
        if (typeof data.data === 'object') {
          result.push(`data keys: ${Object.keys(data.data).join(', ')}`);
        }
      }
      
      if (data.structured) {
        result.push(`structured property keys: ${Object.keys(data.structured).join(', ')}`);
        if (data.structured.classes) {
          result.push(`classes count: ${data.structured.classes.length}`);
        }
      }
      
      if (data.plan || data.plaene) {
        const planData = data.plan || data.plaene;
        result.push(`plan data type: ${typeof planData}`);
        if (typeof planData === 'object') {
          if (Array.isArray(planData)) {
            result.push(`plan items: ${planData.length}`);
          } else {
            result.push(`plan keys: ${Object.keys(planData).join(', ')}`);
          }
        }
      }
    }
    
    return result.join('\n');
  } catch (error) {
    return `Error analyzing API format: ${error}`;
  }
}

export default {
  fetchTimeTable,
  getCurrentDayName,
  isCurrentlyActive,
  getCurrentOrNextLesson
};
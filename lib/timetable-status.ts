/**
 * Utility functions for handling timetable API status and fallbacks
 */
import { TimeTableResponse, TimeTableWeek } from './timetable-service';

/**
 * Check if the timetable data is fallback data
 */
export function isFallbackData(data: TimeTableResponse | TimeTableWeek | null | undefined): boolean {
  if (!data) return false;
  
  // Check for explicit isFallback flag
  if ('isFallback' in data && data.isFallback) return true;
  
  // Check for the known fallback data signature (hardcoded date)
  if ('monday' in data && 
      data.monday && 
      data.monday.date === '2025-05-26') return true;
  
  // If it has a data property, check that too
  if ('data' in data && data.data) {
    return isFallbackData(data.data);
  }
  
  return false;
}

/**
 * Get a user-friendly message about the API status
 */
export function getApiStatusMessage(data: TimeTableResponse): string {
  if (!isFallbackData(data)) return '';
  
  // Default message
  let message = 'The timetable API is currently unavailable. Showing sample data instead.';
  
  // If we have more specific information, include it
  if (data.reason) {
    if (data.reason.startsWith('client_status_')) {
      const statusCode = data.reason.replace('client_status_', '');
      if (statusCode === '429') {
        message = 'The timetable API is rate limited (429). Please try again later.';
      } else if (statusCode === '404') {
        message = 'The timetable API endpoint was not found (404). Please check the configuration.';
      } else if (statusCode === '403') {
        message = 'Access to the timetable API was denied (403). Authentication may be required.';
      } else if (statusCode === '500') {
        message = 'The timetable API encountered a server error (500). Please try again later.';
      }
    }
    else if (data.reason === 'timeout') {
      message = 'The timetable API request timed out. Please try again later.';
    }
    else if (data.reason === 'parse_error') {
      message = 'The timetable data could not be parsed. The API may have changed format.';
    }
  }
  
  return message;
}

/**
 * Determine if the API is likely to be permanently unavailable or just temporarily
 */
export function isPermanentFailure(data: TimeTableResponse): boolean {
  if (!isFallbackData(data)) return false;
  
  if (data.reason) {
    // These status codes typically indicate configuration or permission issues
    if (data.reason.includes('404') || data.reason.includes('403') || 
        data.reason.includes('401') || data.reason.includes('parse_error')) {
      return true;
    }
  }
  
  return false;
}

export default {
  isFallbackData,
  getApiStatusMessage,
  isPermanentFailure
};
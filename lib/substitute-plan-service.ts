/**
 * Substitute Plan Service
 * Fetches and parses substitute plan data from API
 */

// Types for the substitute plan data
export interface SubstitutePlanResponse {
  success: boolean;
  timestamp: string;
  speech: string;
  rawData: string;
}

export interface SubstituteDay {
  date: string;
  weekNumber: number;
  entries: SubstituteEntry[];
}

export interface SubstituteEntry {
  period: string;
  substitute: string;
  subject: string;
  room: string;
  info: string;
}

/**
 * Fetches the substitute plan from our local API proxy
 * This avoids CORS issues by using our server-side API route
 */
export async function fetchSubstitutePlan(): Promise<SubstitutePlanResponse> {
  try {
    // Use our internal API route instead of the external API directly
    const response = await fetch('/api/substitute-plan');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as SubstitutePlanResponse;
  } catch (error) {
    console.error('Error fetching substitute plan:', error);
    throw error;
  }
}

/**
 * Parses the raw substitute plan data into a structured format
 */
export function parseSubstitutePlan(rawData: string): SubstituteDay[] {
  const days: SubstituteDay[] = [];
  
  // Split the raw data by new lines
  const lines = rawData.split('\n');
  
  let currentDay: SubstituteDay | null = null;
  let inEntriesSection = false;
  
  for (const line of lines) {
    // Check if this is a day header line (e.g., "Mo., 26.05.2025 - KW 22")
    const dayHeaderMatch = line.match(/([A-Za-z]+\., \d{2}\.\d{2}\.\d{4}) - KW (\d+)/);
    
    if (dayHeaderMatch) {
      // Start a new day
      currentDay = {
        date: dayHeaderMatch[1],
        weekNumber: parseInt(dayHeaderMatch[2], 10),
        entries: []
      };
      days.push(currentDay);
      inEntriesSection = false;
      continue;
    }
    
    // Check if this is the column headers line
    if (line.includes('Std.') && line.includes('Vertretung') && line.includes('Fach') && line.includes('Raum')) {
      inEntriesSection = true;
      continue;
    }
    
    // If we're in the entries section and have a current day, parse entry lines
    if (inEntriesSection && currentDay) {
      // Split by tabs, accounting for potential empty fields
      const parts = line.split('\t').map(part => part.trim());
      
      // Only process lines that have at least 3 parts and start with a period number
      if (parts.length >= 5 && parts[0].match(/^\d+\./)) {
        const entry: SubstituteEntry = {
          period: parts[0],
          substitute: parts[1],
          subject: parts[2],
          room: parts[3],
          info: parts[4]
        };
        
        currentDay.entries.push(entry);
      }
    }
  }
  
  return days;
}

export default {
  fetchSubstitutePlan,
  parseSubstitutePlan
};
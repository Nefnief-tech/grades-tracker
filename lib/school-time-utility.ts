/**
 * School Time Utility
 * Handles the specific school schedule with accurate time slots
 */

// School schedule configuration
export const SCHOOL_SCHEDULE = {
  startTime: '08:10',
  lessonDuration: 45, // minutes
  shortBreakDuration: 20, // minutes after each block of two lessons
  lunchBreak: {
    start: '13:20',
    end: '14:00'
  },
  // Special periods with exact times
  periods: [
    { period: 1, start: '08:10', end: '08:55' },
    { period: 2, start: '08:55', end: '09:40' },
    // 20 minute break
    { period: 3, start: '10:00', end: '10:45' },
    { period: 4, start: '10:45', end: '11:30' },
    // 20 minute break
    { period: 5, start: '11:50', end: '12:35' },
    { period: 6, start: '12:35', end: '13:20' },
    // Lunch break 40 minutes
    { period: 7, start: '14:00', end: '14:45' },
    { period: 8, start: '14:45', end: '15:30' },
    { period: 9, start: '15:30', end: '16:15' },
    { period: 10, start: '16:15', end: '17:00' },
    { period: 11, start: '17:00', end: '17:45' },
    { period: 12, start: '17:45', end: '18:30' }
  ]
};

/**
 * Gets the start and end time for a specific period
 */
export function getPeriodTimes(periodNumber: number): { start: string, end: string } {
  const period = SCHOOL_SCHEDULE.periods.find(p => p.period === periodNumber);
  
  if (period) {
    return { start: period.start, end: period.end };
  }
  
  // Fallback calculation (should not be needed with our complete schedule)
  return { start: 'Unknown', end: 'Unknown' };
}

/**
 * Formats a period label with the correct time format
 * Example: "08:10 - 08:55"
 */
export function formatPeriodTime(periodNumber: number): string {
  const { start, end } = getPeriodTimes(periodNumber);
  return `${start} - ${end}`;
}

/**
 * Checks if a given time is during a break
 */
export function isDuringBreak(timeString: string): boolean {
  const time = parseTimeToMinutes(timeString);
  
  // Check if it's during lunch break
  const lunchBreakStart = parseTimeToMinutes(SCHOOL_SCHEDULE.lunchBreak.start);
  const lunchBreakEnd = parseTimeToMinutes(SCHOOL_SCHEDULE.lunchBreak.end);
  if (time >= lunchBreakStart && time < lunchBreakEnd) {
    return true;
  }
  
  // Check if it's during short breaks
  for (let i = 0; i < SCHOOL_SCHEDULE.periods.length - 1; i++) {
    if (i % 2 === 1) { // After every 2 lessons (periods 2->3, 4->5)
      const breakStart = parseTimeToMinutes(SCHOOL_SCHEDULE.periods[i].end);
      const breakEnd = parseTimeToMinutes(SCHOOL_SCHEDULE.periods[i+1].start);
      if (time >= breakStart && time < breakEnd) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Gets the current or upcoming period based on the current time
 */
export function getCurrentOrUpcomingPeriod(): number {
  const now = new Date();
  const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentMinutes = parseTimeToMinutes(currentTimeString);
  
  // Find the current or next period
  for (const period of SCHOOL_SCHEDULE.periods) {
    const startMinutes = parseTimeToMinutes(period.start);
    const endMinutes = parseTimeToMinutes(period.end);
    
    // If current time is before the end of this period
    if (currentMinutes < endMinutes) {
      return period.period;
    }
  }
  
  // Default to first period of next day if after school hours
  return 1;
}

export default {
  SCHOOL_SCHEDULE,
  getPeriodTimes,
  formatPeriodTime,
  isDuringBreak,
  getCurrentOrUpcomingPeriod
};
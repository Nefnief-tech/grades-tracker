/**
 * Fallback data for the timetable service
 * Used when the API is unavailable
 */

import { TimeTableResponse, TimeTableWeek } from './timetable-service';

/**
 * Sample timetable data to be used as fallback
 */
export const FALLBACK_TIMETABLE: TimeTableResponse = {
  success: true,
  timestamp: new Date().toISOString(),
  data: {
    monday: {
      dayName: 'Monday',
      date: '2025-05-26',
      lessons: [
        {
          period: 1,
          startTime: '08:00',
          endTime: '08:45',
          subject: 'Mathematics',
          teacher: 'Mrs. Johnson',
          room: '201'
        },
        {
          period: 2,
          startTime: '08:50',
          endTime: '09:35',
          subject: 'Physics',
          teacher: 'Mr. Roberts',
          room: '309'
        },
        {
          period: 3,
          startTime: '09:50',
          endTime: '10:35',
          subject: 'English',
          teacher: 'Ms. Smith',
          room: '105'
        },
        {
          period: 4,
          startTime: '10:40',
          endTime: '11:25',
          subject: 'History',
          teacher: 'Mr. Peterson',
          room: '218'
        },
        {
          period: 5,
          startTime: '11:40',
          endTime: '12:25',
          subject: 'Computer Science',
          teacher: 'Mrs. Davis',
          room: '302',
          notes: 'Bring your laptop'
        }
      ]
    },
    tuesday: {
      dayName: 'Tuesday',
      date: '2025-05-27',
      lessons: [
        {
          period: 1,
          startTime: '08:00',
          endTime: '08:45',
          subject: 'Biology',
          teacher: 'Dr. Wilson',
          room: '311'
        },
        {
          period: 2,
          startTime: '08:50',
          endTime: '09:35',
          subject: 'Biology',
          teacher: 'Dr. Wilson',
          room: '311'
        },
        {
          period: 3,
          startTime: '09:50',
          endTime: '10:35',
          subject: 'Physical Education',
          teacher: 'Coach Brown',
          room: 'Gym',
          notes: 'Bring your PE uniform'
        },
        {
          period: 4,
          startTime: '10:40',
          endTime: '11:25',
          subject: 'Mathematics',
          teacher: 'Mrs. Johnson',
          room: '201'
        },
        {
          period: 5,
          startTime: '11:40',
          endTime: '12:25',
          subject: 'Art',
          teacher: 'Ms. Garcia',
          room: '103'
        },
        {
          period: 6,
          startTime: '13:10',
          endTime: '13:55',
          subject: 'Chemistry',
          teacher: 'Dr. Martinez',
          room: '310',
          isSubstitution: true
        }
      ]
    },
    wednesday: {
      dayName: 'Wednesday',
      date: '2025-05-28',
      lessons: [
        {
          period: 1,
          startTime: '08:00',
          endTime: '08:45',
          subject: 'English',
          teacher: 'Ms. Smith',
          room: '105'
        },
        {
          period: 2,
          startTime: '08:50',
          endTime: '09:35',
          subject: 'Physics',
          teacher: 'Mr. Roberts',
          room: '309'
        },
        {
          period: 3,
          startTime: '09:50',
          endTime: '10:35',
          subject: 'Mathematics',
          teacher: 'Mrs. Johnson',
          room: '201'
        },
        {
          period: 4,
          startTime: '10:40',
          endTime: '11:25',
          subject: 'Foreign Language',
          teacher: 'Mrs. Lopez',
          room: '107'
        },
        {
          period: 5,
          startTime: '11:40',
          endTime: '12:25',
          subject: 'History',
          teacher: 'Mr. Peterson',
          room: '218',
          isCancelled: true
        }
      ]
    },
    thursday: {
      dayName: 'Thursday',
      date: '2025-05-29',
      lessons: [
        {
          period: 1,
          startTime: '08:00',
          endTime: '08:45',
          subject: 'Computer Science',
          teacher: 'Mrs. Davis',
          room: '302'
        },
        {
          period: 2,
          startTime: '08:50',
          endTime: '09:35',
          subject: 'Computer Science',
          teacher: 'Mrs. Davis',
          room: '302'
        },
        {
          period: 3,
          startTime: '09:50',
          endTime: '10:35',
          subject: 'English',
          teacher: 'Ms. Smith',
          room: '105'
        },
        {
          period: 4,
          startTime: '10:40',
          endTime: '11:25',
          subject: 'Physics',
          teacher: 'Mr. Roberts',
          room: '309',
          isSubstitution: true
        },
        {
          period: 5,
          startTime: '11:40',
          endTime: '12:25',
          subject: 'Mathematics',
          teacher: 'Mrs. Johnson',
          room: '201'
        }
      ]
    },
    friday: {
      dayName: 'Friday',
      date: '2025-05-30',
      lessons: [
        {
          period: 1,
          startTime: '08:00',
          endTime: '08:45',
          subject: 'History',
          teacher: 'Mr. Peterson',
          room: '218'
        },
        {
          period: 2,
          startTime: '08:50',
          endTime: '09:35',
          subject: 'Foreign Language',
          teacher: 'Mrs. Lopez',
          room: '107'
        },
        {
          period: 3,
          startTime: '09:50',
          endTime: '10:35',
          subject: 'Physical Education',
          teacher: 'Coach Brown',
          room: 'Gym'
        },
        {
          period: 4,
          startTime: '10:40',
          endTime: '11:25',
          subject: 'Art',
          teacher: 'Ms. Garcia',
          room: '103'
        },
        {
          period: 5,
          startTime: '11:40',
          endTime: '12:25',
          subject: 'Biology',
          teacher: 'Dr. Wilson',
          room: '311'
        }
      ]
    }
  }
};
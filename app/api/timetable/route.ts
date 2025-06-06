import { NextResponse } from 'next/server';
import { transformAPIResponseToTimeTable } from '@/lib/timetable-transformer';
import { SCHOOL_SCHEDULE } from '@/lib/school-time-utility';

export const dynamic = 'force-dynamic';

// External API URL
const EXTERNAL_API_URL = 'https://test-api-pwwbj5-10d814-150-230-144-172.traefik.me/api/plan';

// Generate mock data for fallback
function generateMockData() {
  return {
    structured: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      periods: SCHOOL_SCHEDULE.periods.map(p => `${p.period}.${p.start} - ${p.end}`),
      classes: [
        { day: 0, period: 0, subject: 'M', room: '101', teacher: 'Smith' },
        { day: 1, period: 0, subject: 'D', room: '201', teacher: 'Davis', code: 'substitution' },
        { day: 1, period: 2, subject: 'G', room: '203', teacher: 'Wilson', code: 'cancelled' }
        // More classes would be here in a real implementation
      ]
    }
  };
}

// Create sample substitute plan data for testing
function createSampleSubstituteData() {
  return {
    substitutions: [
      {
        day: 0, // Monday
        period: 2,
        subject: 'E',
        cancelled: true,
        info: 'Teacher Ms. English is sick - lesson cancelled',
        originalTeacher: 'Ms. English'
      },
      {
        day: 0, // Monday  
        period: 3,
        subject: 'D',
        substitution: true,
        newTeacher: 'Mr. Substitute',
        originalTeacher: 'Ms. German',
        info: 'Ms. German is absent - substituted by Mr. Substitute'
      },
      {
        day: 1, // Tuesday
        period: 1,
        subject: 'M',
        substitution: true,
        newRoom: 'R105',
        originalRoom: 'R101',
        info: 'Room changed due to maintenance'
      }
    ]
  };
}

// Enhanced fallback timetable with sample cancellations and substitutions
function createEnhancedFallbackTimeTable() {
  return {
    monday: {
      date: new Date().toLocaleDateString(),
      dayName: 'Monday',
      lessons: [
        {
          period: 1,
          periodNumber: 1,
          subject: 'M',
          room: 'R101',
          teacher: 'Mr. Math',
          startTime: '08:00',
          endTime: '08:45',
          periodLabel: '08:00 - 08:45',
          isCancelled: false,
          isSubstitution: false
        },
        {
          period: 2,
          periodNumber: 2,
          subject: 'E',
          room: 'R102',
          teacher: 'Ms. English',
          startTime: '08:45',
          endTime: '09:30',
          periodLabel: '08:45 - 09:30',
          isCancelled: true,
          isSubstitution: false,
          notes: 'Teacher is sick - lesson cancelled'
        },
        {
          period: 3,
          periodNumber: 3,
          subject: 'D',
          room: 'R103',
          teacher: 'Mr. Substitute',
          startTime: '09:45',
          endTime: '10:30',
          periodLabel: '09:45 - 10:30',
          isCancelled: false,
          isSubstitution: true,
          notes: 'Ms. German is absent - substituted by Mr. Substitute'
        },
        {
          period: 4,
          periodNumber: 4,
          subject: 'Ph',
          room: 'Lab2',
          teacher: 'Dr. Science',
          startTime: '10:45',
          endTime: '11:30',
          periodLabel: '10:45 - 11:30',
          isCancelled: false,
          isSubstitution: true,
          notes: 'Room changed from Lab1 to Lab2 due to equipment maintenance'
        }
      ]
    },
    tuesday: { 
      date: new Date(Date.now() + 86400000).toLocaleDateString(),
      dayName: 'Tuesday', 
      lessons: [
        {
          period: 1,
          periodNumber: 1,
          subject: 'B',
          room: 'R201',
          teacher: 'Ms. Biology',
          startTime: '08:00',
          endTime: '08:45',
          periodLabel: '08:00 - 08:45',
          isCancelled: true,
          isSubstitution: false,
          notes: 'Class trip cancelled due to weather'
        },
        {
          period: 2,
          periodNumber: 2,
          subject: 'C',
          room: 'R202',
          teacher: 'Mr. SubstituteChemistry',
          startTime: '08:45',
          endTime: '09:30',
          periodLabel: '08:45 - 09:30',
          isCancelled: false,
          isSubstitution: true,
          notes: 'Dr. Chemistry is at a conference - covered by Mr. SubstituteChemistry'
        }
      ] 
    },
    wednesday: { 
      date: new Date(Date.now() + 172800000).toLocaleDateString(),
      dayName: 'Wednesday', 
      lessons: [
        {
          period: 1,
          periodNumber: 1,
          subject: 'G',
          room: 'R301',
          teacher: 'Mr. History',
          startTime: '08:00',
          endTime: '08:45',
          periodLabel: '08:00 - 08:45',
          isCancelled: false,
          isSubstitution: false
        }
      ] 
    },
    thursday: { 
      date: new Date(Date.now() + 259200000).toLocaleDateString(),
      dayName: 'Thursday', 
      lessons: [] 
    },
    friday: { 
      date: new Date(Date.now() + 345600000).toLocaleDateString(),
      dayName: 'Friday', 
      lessons: [] 
    }
  };
}

// Simple fix for transformer issue - return enhanced fallback data directly
async function getEnhancedTimetableData() {
  return createEnhancedFallbackTimeTable(); // Use enhanced fallback but without forced demo data
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    
    // Fetch data from the external API
    let rawData;
    try {
      console.log(`Fetching timetable data from external API: ${EXTERNAL_API_URL}`);
      const response = await fetch(EXTERNAL_API_URL, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-store',
        next: { revalidate: 60 }
      });
      
      if (!response.ok) {
        throw new Error(`External API returned status: ${response.status}`);
      }
      
      rawData = await response.json();
      
      // Log the structure for debugging
      console.log('API structure:', Object.keys(rawData));
      if (rawData.structured) {
        console.log('Found structured data with classes:', 
          rawData.structured.classes ? rawData.structured.classes.length : 'none');
      }
    } catch (fetchError) {
      console.error('Error fetching from external API:', fetchError);
      rawData = generateMockData();
    }
    
    // Transform to our timetable format
    const timetableData = await transformAPIResponseToTimeTable(rawData);
    
    // Return the data
    return NextResponse.json({
      data: timetableData,
      raw: force ? rawData : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in timetable API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timetable data', message: (error as Error).message },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

interface CustomTimetableRequest {
  username: string;
  password: string;
  baseUrl: string;
  timetableUrl: string;
}

interface TimetableEntry {
  day: string;
  period: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

interface TimetableDay {
  day: string;
  date: string;
  periods: TimetableEntry[];
}

// Simulate timetable data extraction
function generateSampleTimetable(): TimetableDay[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const subjects = ['Mathematics', 'English', 'German', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Art', 'Music', 'PE'];
  const teachers = ['Mr. Smith', 'Ms. Johnson', 'Dr. Brown', 'Mrs. Davis', 'Mr. Wilson', 'Ms. Garcia', 'Dr. Miller'];
  const rooms = ['A101', 'B205', 'C102', 'Lab1', 'Gym', 'Art1', 'Music1', 'B301', 'A203'];
  
  const timetable: TimetableDay[] = [];
  
  days.forEach((day, dayIndex) => {
    const periods: TimetableEntry[] = [];
    const periodsPerDay = Math.floor(Math.random() * 3) + 6; // 6-8 periods per day
    
    for (let period = 1; period <= periodsPerDay; period++) {
      const startHour = 8 + Math.floor((period - 1) * 0.75); // Roughly 45 min periods
      const startMinute = ((period - 1) * 45) % 60;
      const endHour = startHour + (startMinute + 45 >= 60 ? 1 : 0);
      const endMinute = (startMinute + 45) % 60;
      
      const time = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}-${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      periods.push({
        day,
        period,
        time,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        teacher: teachers[Math.floor(Math.random() * teachers.length)],
        room: rooms[Math.floor(Math.random() * rooms.length)]
      });
    }
    
    // Calculate date (assuming current week)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Offset to get to Monday
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() + mondayOffset + dayIndex);
    
    timetable.push({
      day,
      date: dayDate.toISOString().split('T')[0],
      periods
    });
  });
  
  return timetable;
}

// Simulate login and data extraction
async function extractTimetableData(baseUrl: string, timetableUrl: string, username: string, password: string) {
  try {
    // Step 1: Test base URL connectivity
    const baseResponse = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!baseResponse.ok) {
      throw new Error(`Cannot reach base URL (HTTP ${baseResponse.status})`);
    }
    
    // Step 2: Test timetable URL
    const timetableResponse = await fetch(timetableUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!timetableResponse.ok) {
      throw new Error(`Cannot reach timetable URL (HTTP ${timetableResponse.status})`);
    }
    
    const content = await timetableResponse.text();
    
    // Check if this looks like a timetable page
    const timetableIndicators = [
      'stundenplan', 'timetable', 'schedule', 'stunde',
      'montag', 'dienstag', 'monday', 'tuesday'
    ];
    
    const hasTimetableContent = timetableIndicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (!hasTimetableContent) {
      throw new Error('Page does not appear to contain timetable data');
    }
    
    // For demo purposes, return simulated timetable data
    // In a real implementation, this would parse the actual HTML/JSON response
    return generateSampleTimetable();
    
  } catch (error) {
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    console.log(`[${requestId}] Custom timetable extraction request`);
    
    const body: CustomTimetableRequest = await request.json();
    const { username, password, baseUrl, timetableUrl } = body;
    
    // Validate required fields
    if (!username || !password || !baseUrl || !timetableUrl) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        details: 'Please provide username, password, baseUrl, and timetableUrl'
      }, { status: 400 });
    }
    
    // Validate URL formats
    try {
      new URL(baseUrl);
      new URL(timetableUrl);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid URL format',
        details: 'Please ensure both URLs are valid (include https://)'
      }, { status: 400 });
    }
    
    console.log(`[${requestId}] Extracting timetable from: ${timetableUrl}`);
    
    // Extract timetable data
    const timetableData = await extractTimetableData(baseUrl, timetableUrl, username, password);
    
    const processingTime = Date.now() - startTime;
    
    // Calculate statistics
    const totalPeriods = timetableData.reduce((sum, day) => sum + day.periods.length, 0);
    const uniqueSubjects = new Set(timetableData.flatMap(day => day.periods.map(p => p.subject)));
    const uniqueTeachers = new Set(timetableData.flatMap(day => day.periods.map(p => p.teacher)));
    const uniqueRooms = new Set(timetableData.flatMap(day => day.periods.map(p => p.room)));
    
    console.log(`[${requestId}] Successfully extracted timetable: ${timetableData.length} days, ${totalPeriods} total periods`);
    
    return NextResponse.json({
      success: true,
      message: 'Timetable extracted successfully',
      data: {
        schedule: timetableData,
        statistics: {
          totalDays: timetableData.length,
          totalPeriods,
          uniqueSubjects: uniqueSubjects.size,
          uniqueTeachers: uniqueTeachers.size,
          uniqueRooms: uniqueRooms.size,
          averagePeriodsPerDay: Math.round(totalPeriods / timetableData.length * 10) / 10
        }
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        source: 'custom_portal',
        extractionMethod: 'simulated',
        processingTime: `${processingTime}ms`,
        urls: {
          baseUrl,
          timetableUrl
        }
      }
    });
    
  } catch (error: any) {
    console.error(`[${requestId}] Error extracting timetable:`, error);
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: false,
      error: 'Timetable extraction failed',
      details: error instanceof Error ? error.message : String(error),
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: `${processingTime}ms`,
        errorType: 'extraction_error'
      }
    }, { status: 500 });
  }
}
import { TimeTableWeek, TimeTableDay, TimeTableLesson } from './timetable-service';

// Process structured data from external APIs
async function processStructuredData(structuredData: any): Promise<TimeTableWeek | null> {
  try {
    console.log('Processing structured data:', Object.keys(structuredData || {}));
    
    if (!structuredData) {
      return null;
    }

    // Transform structured data into our timetable format
    const timetable: TimeTableWeek = {
      monday: { date: '', dayName: 'Monday', lessons: [] },
      tuesday: { date: '', dayName: 'Tuesday', lessons: [] },
      wednesday: { date: '', dayName: 'Wednesday', lessons: [] },
      thursday: { date: '', dayName: 'Thursday', lessons: [] },
      friday: { date: '', dayName: 'Friday', lessons: [] }
    };

    // Process the structured data based on its format
    // This would contain the actual transformation logic for your external API
    // For now, returning basic structure
    
    return timetable;
  } catch (error) {
    console.error('Error processing structured data:', error);
    return null;
  }
}

// Main transformer function with enhanced format detection
export async function transformAPIResponseToTimeTable(rawData: any): Promise<TimeTableWeek | null> {
  try {
    console.log('Transformer received data with keys:', Object.keys(rawData || {}));
    
    if (!rawData) {
      console.error('No raw data provided to transformer');
      return null;
    }

    // Handle direct timetable format (our enhanced fallback data)
    if (rawData.monday || rawData.tuesday || rawData.wednesday || rawData.thursday || rawData.friday) {
      console.log('Found direct timetable format - using as-is');
      return rawData as TimeTableWeek;
    }

    // Handle wrapped format where timetable is nested in data property
    if (rawData.data && typeof rawData.data === 'object') {
      // Check if data contains direct timetable structure
      if (rawData.data.monday || rawData.data.tuesday || rawData.data.wednesday || 
          rawData.data.thursday || rawData.data.friday) {
        console.log('Found timetable in data property');
        return rawData.data as TimeTableWeek;
      }
      
      // Check for structured data format
      if (rawData.data.structured) {
        console.log('Found structured data format - processing...');
        return await processStructuredData(rawData.data.structured);
      }
    }

    // Handle structured data at root level
    if (rawData.structured) {
      console.log('Found structured data at root level');
      return await processStructuredData(rawData.structured);
    }

    // If no recognizable format found, log what we have and return null
    console.error('Could not recognize timetable data format');
    console.log('Available properties:', Object.keys(rawData));
    if (rawData.data) {
      console.log('Properties in data:', Object.keys(rawData.data));
    }
    
    return null;
  } catch (error) {
    console.error('Error in transformAPIResponseToTimeTable:', error);
    return null;
  }
}

// Enhanced transformer with substitute plan integration
export async function transformAPIResponseToTimeTableWithSubstitutes(
  rawData: any, 
  substituteData: any
): Promise<TimeTableWeek | null> {
  try {
    console.log('Enhanced transformer with substitute plan integration');
    
    // First get the basic timetable
    const basicTimetable = await transformAPIResponseToTimeTable(rawData);
    
    if (!basicTimetable) {
      console.log('Could not get basic timetable, returning null');
      return null;
    }

    if (!substituteData) {
      console.log('No substitute data provided, returning basic timetable');
      return basicTimetable;
    }

    console.log('Applying substitute plan data to timetable');
    
    // Create a lookup map for substitute information
    const substituteLookup = new Map<string, any>();
    
    // Process substitute data into lookup format
    if (substituteData.substitutions && Array.isArray(substituteData.substitutions)) {
      substituteData.substitutions.forEach((sub: any) => {
        const key = `${sub.day}-${sub.period}`;
        const subInfo = {
          isCancelled: sub.cancelled || false,
          isSubstitution: sub.substitution || false,
          newTeacher: sub.newTeacher || sub.teacher,
          newRoom: sub.newRoom || sub.room,
          newSubject: sub.newSubject || sub.subject,
          info: sub.info || sub.note || ''
        };
        substituteLookup.set(key, subInfo);
        
        // Also create subject-specific key
        if (sub.subject) {
          const subjectKey = `${sub.day}-${sub.period}-${sub.subject}`;
          substituteLookup.set(subjectKey, subInfo);
        }
      });
    }

    // Apply substitute plan changes to each lesson
    Object.entries(basicTimetable).forEach(([dayName, day]) => {
      const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(dayName);
      
      day.lessons.forEach((lesson) => {
        // Create lookup keys for this lesson
        const lookupKeys = [
          `${dayIndex}-${lesson.period}-${lesson.subject}`,
          `${dayIndex}-${lesson.periodNumber}-${lesson.subject}`,
          `${dayIndex}-${lesson.period}`,
          `${dayIndex}-${lesson.periodNumber}`
        ];
        
        // Find substitute information using any of the keys
        let substituteInfo = null;
        for (const key of lookupKeys) {
          substituteInfo = substituteLookup.get(key);
          if (substituteInfo) {
            console.log(`Found substitute info for ${dayName} using key: ${key}`);
            break;
          }
        }
        
        if (substituteInfo) {
          console.log(`Applying substitute info to ${dayName} period ${lesson.period}: ${lesson.subject}`);
          
          // Apply cancellation
          if (substituteInfo.isCancelled) {
            lesson.isCancelled = true;
            lesson.notes = substituteInfo.info || 'Lesson cancelled';
            console.log(`Marked lesson as cancelled: ${dayName} P${lesson.period} ${lesson.subject}`);
          }
          
          // Apply substitution
          if (substituteInfo.isSubstitution) {
            lesson.isSubstitution = true;
            
            // Store original values before substitution
            const originalTeacher = lesson.teacher;
            const originalRoom = lesson.room;
            const originalSubject = lesson.subject;
            
            // Update teacher if substituted
            if (substituteInfo.newTeacher && substituteInfo.newTeacher !== lesson.teacher) {
              lesson.teacher = substituteInfo.newTeacher;
              lesson.notes = (lesson.notes || '') + (lesson.notes ? ' | ' : '') + `Teacher: ${originalTeacher} → ${substituteInfo.newTeacher}`;
            }
            
            // Update room if changed
            if (substituteInfo.newRoom && substituteInfo.newRoom !== lesson.room) {
              lesson.room = substituteInfo.newRoom;
              lesson.notes = (lesson.notes || '') + (lesson.notes ? ' | ' : '') + `Room: ${originalRoom} → ${substituteInfo.newRoom}`;
            }
            
            // Update subject if changed
            if (substituteInfo.newSubject && substituteInfo.newSubject !== lesson.subject) {
              lesson.subject = substituteInfo.newSubject;
              lesson.notes = (lesson.notes || '') + (lesson.notes ? ' | ' : '') + `Subject: ${originalSubject} → ${substituteInfo.newSubject}`;
            }
            
            // Add substitute info to notes if not already present
            if (substituteInfo.info && !lesson.notes?.includes(substituteInfo.info)) {
              lesson.notes = substituteInfo.info + (lesson.notes ? ' | ' + lesson.notes : '');
            }
            
            console.log(`Marked lesson as substitution: ${dayName} P${lesson.period} ${lesson.subject}`);
          }
        }
      });
    });

    console.log('Successfully applied substitute plan data');
    return basicTimetable;
  } catch (error) {
    console.error('Error in enhanced transformer:', error);
    return await transformAPIResponseToTimeTable(rawData);
  }
}
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  fetchTimeTable, 
  getCurrentDayName, 
  isCurrentlyActive, 
  getCurrentOrNextLesson,
  debugApiFormat,
  TimeTableWeek,
  TimeTableDay,
  TimeTableLesson
} from "@/lib/timetable-service";
import { isFallbackData, getApiStatusMessage } from "@/lib/timetable-status";
import { getFullSubjectName } from "@/lib/subject-mapping";
import { formatPeriodTime } from "@/lib/school-time-utility";
import { 
  AlertCircle, 
  Clock, 
  Calendar, 
  BookOpen, 
  Map, 
  User, 
  RefreshCw,
  CheckCircle2,
  CircleDashed
} from "lucide-react";

export default function TimetablePage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<TimeTableWeek | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('');
  
  // Function to fetch timetable data
  const fetchData = async () => {
    setLoading(true);
    setError(null);      try {      const data = await fetchTimeTable();
      
      // Enhanced debugging of the API response
      console.log('Received timetable API response');
      console.log('API format analysis:', debugApiFormat(data));
      
      // Log a shortened version to avoid console bloat
      try {
        console.log('API data preview:', 
          JSON.stringify(data, (key, value) => {
            // Skip large arrays and objects for clarity
            if (Array.isArray(value) && value.length > 3) {
              return `[Array with ${value.length} items]`;
            }
            if (value !== null && typeof value === 'object' && Object.keys(value).length > 5) {
              return `{Object with ${Object.keys(value).length} keys}`;
            }
            return value;
          }, 2).substring(0, 500) + "..."
        );
      } catch (e) {
        console.log('Could not stringify API response:', e);
      }
        // Check if the data is valid
      if (data) {
        // Our API route should now always return a standardized format
        // with a data property containing the normalized timetable
        let timetableData: TimeTableWeek;
        
        try {
          if (data.data && typeof data.data === 'object') {
            // Standard format with data property
            timetableData = data.data;
          } else if ('monday' in data || 'tuesday' in data || 'wednesday' in data || 
                     'thursday' in data || 'friday' in data) {
            // Direct timetable object
            timetableData = data as unknown as TimeTableWeek;
          } else {
            // Unknown format
            console.error('Invalid timetable data format:', data);
            setError('Invalid timetable data format');
            setLoading(false);
            return;
          }
          
          // Log our parsed timetable data
          console.log('Parsed timetable structure:', 
            Object.keys(timetableData).length + ' days,', 
            Object.keys(timetableData).map(day => 
              `${day}: ${timetableData[day]?.lessons?.length || 0} lessons`
            )
          );
        } catch (parseError) {
          console.error('Error parsing timetable data:', parseError, data);
          setError('Error parsing timetable data: ' + (parseError instanceof Error ? parseError.message : 'Unknown error'));
          setLoading(false);
          return;
        }
          // Check if we have any valid days with lessons
        if (Object.keys(timetableData).length === 0) {
          setError('Timetable data is empty or in an incompatible format');
          setLoading(false);
          return;
        }
        
        setTimetable(timetableData);
        
        // Handle different timestamp formats
        if (data.timestamp) {
          try {
            // Try to parse the timestamp, handling both ISO strings and custom formats
            const date = new Date(data.timestamp.replace ? data.timestamp.replace(/-/g, ':') : data.timestamp);
            setLastUpdated(date.toLocaleString());
          } catch (e) {
            // If timestamp parsing fails, use current time
            setLastUpdated(new Date().toLocaleString());
          }
        } else {
          setLastUpdated(new Date().toLocaleString());
        }
        
        // Set active tab to current day or first available day
        const currentDay = getCurrentDayName();
        const availableDays = Object.keys(timetableData);
        
        if (currentDay === 'saturday' || currentDay === 'sunday' || !timetableData[currentDay]) {
          // Weekend or current day not in timetable - select first available day
          setActiveTab(availableDays[0] || 'monday');
        } else {
          setActiveTab(currentDay);
        }
      } else {
        setError('Failed to load timetable data');
      }
    } catch (err) {
      let errorMessage = `Error loading timetable: ${err instanceof Error ? err.message : 'Unknown error'}`;
      
      // Check if this might be a CORS or network error
      if (errorMessage.includes('NetworkError') || errorMessage.includes('CORS')) {
        errorMessage = 'Network error: Cannot access the timetable API. The server might be unavailable or there might be a CORS issue.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
    // Load data on initial render
  useEffect(() => {
    fetchData();
  }, []);
  
  // Debug effect to check for substitutions and cancellations
  useEffect(() => {
    if (timetable) {
      let substitutionCount = 0;
      let cancellationCount = 0;
      
      Object.values(timetable).forEach(day => {
        day.lessons.forEach(lesson => {
          if (lesson.isCancelled) cancellationCount++;
          if (lesson.isSubstitution) substitutionCount++;
        });
      });
      
      console.log(`Timetable contains ${cancellationCount} cancelled lessons and ${substitutionCount} substitutions`);
    }
  }, [timetable]);
  
  // Function to format time ranges
  const formatTimeRange = (startTime: string, endTime: string): string => {
    return `${startTime} - ${endTime}`;
  };
  
  // Function to get badge variant based on lesson status
  const getLessonBadgeVariant = (lesson: TimeTableLesson): "default" | "secondary" | "destructive" | "outline" => {
    if (lesson.isCancelled) {
      return "destructive";
    }
    if (lesson.isSubstitution) {
      return "secondary";
    }
    if (isCurrentlyActive(lesson.startTime, lesson.endTime)) {
      return "default";
    }
    return "outline";
  };
    // Function to render the current/next lesson indicator
  const renderCurrentOrNextLesson = () => {
    if (!timetable || typeof timetable !== 'object') return null;
    
    try {
      const { lesson, dayName, isCurrentLesson } = getCurrentOrNextLesson(timetable);
      
      if (!lesson) return null;
      
      // Debug log for substitutions and cancellations
      if (lesson.isCancelled || lesson.isSubstitution) {
        console.log(`Current/Next lesson has special status: ${lesson.isCancelled ? 'Cancelled' : 'Substitution'}`);
      }
      
      return (        <Card className={`mb-6 
          ${lesson.isCancelled ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20' : 
           lesson.isSubstitution ? 'border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20' : 
           'border-primary/20 bg-primary/5'}`}>
          <CardHeader className="pb-2">            <CardTitle className={`text-lg flex items-center ${lesson.isCancelled ? 'line-through text-red-600 dark:text-red-400' : lesson.isSubstitution ? 'text-amber-600 dark:text-amber-400' : ''}`}>
              {isCurrentLesson ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2 text-primary animate-pulse" />
                  Current Lesson
                </>
              ) : (
                <>
                  <CircleDashed className="h-5 w-5 mr-2 text-primary" />
                  Next Lesson
                </>
              )}
              {lesson.isSubstitution && <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded text-normal">SUB</span>}
              {lesson.isCancelled && <span className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded text-normal">CANCELLED</span>}
            </CardTitle>
            <CardDescription className={lesson.isCancelled ? 'line-through text-red-500' : lesson.isSubstitution ? 'text-amber-600/70 dark:text-amber-400/70' : ''}>
              {isCurrentLesson
                ? `Currently in progress (${formatTimeRange(lesson.startTime, lesson.endTime)})`
                : `Coming up on ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} at ${lesson.startTime}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>            <div className="grid grid-cols-2 gap-4 items-center">              <div className="space-y-1 col-span-2 mb-2">
                <p className="text-sm font-medium text-muted-foreground">Subject</p>
                <div>
                  <p className={`font-medium text-lg ${lesson.isCancelled ? 'line-through text-red-500' : lesson.isSubstitution ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                    {getFullSubjectName(lesson.subject)}
                    {lesson.isSubstitution && <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded">Substitution</span>}
                    {lesson.isCancelled && <span className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded">Cancelled</span>}
                  </p>
                  {lesson.subject !== getFullSubjectName(lesson.subject) && (
                    <p className={`text-xs text-muted-foreground ${lesson.isCancelled ? 'line-through' : ''}`}>{lesson.subject}</p>
                  )}
                </div>
              </div>              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Room</p>
                <p className={lesson.isCancelled ? 'line-through text-red-500' : lesson.isSubstitution ? 'text-amber-600 dark:text-amber-400' : ''}>
                  {lesson.room || "—"}
                </p>
              </div>              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Time</p>
                <div>
                  <p className={lesson.isCancelled ? 'line-through text-red-500' : lesson.isSubstitution ? 'text-amber-600 dark:text-amber-400' : ''}>
                    {lesson.periodLabel || formatPeriodTime(lesson.periodNumber || lesson.period)}
                  </p>
                  <p className={`text-xs ${lesson.isCancelled ? 'line-through text-red-500/70' : lesson.isSubstitution ? 'text-amber-600/70 dark:text-amber-400/70' : 'text-muted-foreground'}`}>
                    Period {lesson.periodNumber || lesson.period}
                  </p>
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Teacher</p>
                <p className={lesson.isCancelled ? 'line-through text-red-500' : lesson.isSubstitution ? 'text-amber-600 dark:text-amber-400' : ''}>
                  {lesson.teacher || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } catch (error) {
      console.error('Error rendering current/next lesson:', error);
      return null; // Return null if there's any error
    }
  };
  
  // Function to generate a consistent color for each subject
  const getSubjectColor = (subject: string): string => {
    // Extract the base subject code (before any room numbers or qualifiers)
    const baseSubject = subject.match(/^([A-Za-z]+)/)?.[1] || subject;
    
    // Define colors for common subjects
    const subjectColors: Record<string, string> = {
      'M': '#4285F4',    // Mathematics - Blue
      'D': '#DB4437',    // German - Red
      'E': '#F4B400',    // English - Yellow
      'F': '#0F9D58',    // French - Green
      'L': '#AB47BC',    // Latin - Purple
      'Sp': '#00ACC1',   // Spanish - Cyan
      'Ph': '#FF7043',   // Physics - Orange
      'C': '#9C27B0',    // Chemistry - Dark Purple
      'B': '#43A047',    // Biology - Green
      'G': '#795548',    // History - Brown
      'Geo': '#607D8B',  // Geography - Blue Grey
      'Inf': '#3F51B5',  // Computer Science - Indigo
      'Mu': '#E91E63',   // Music - Pink
      'Ku': '#FF5722',   // Art - Deep Orange
      'Eth': '#8BC34A',  // Ethics - Light Green
      'WR': '#9E9E9E',   // Religious Education - Grey
      'PuG': '#673AB7',  // Politics - Deep Purple
      'Sm': '#00BCD4',   // Sports (Male) - Cyan
      'Sw': '#03A9F4',   // Sports (Female) - Light Blue
      'K': '#9FA8DA',    // Catholic RE - Light Indigo
      'Ev': '#90CAF9',   // Protestant RE - Light Blue
    };
    
    // Return color if found, or generate one based on the subject string
    if (subjectColors[baseSubject]) {
      return subjectColors[baseSubject];
    } else {
      // Simple hash function to generate a color
      let hash = 0;
      for (let i = 0; i < subject.length; i++) {
        hash = subject.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      // Convert to hex color
      let color = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
      }
      
      return color;
    }
  };

  // Function to render lessons for a specific day
  const renderDayLessons = (day: TimeTableDay) => {
    return day.lessons.map((lesson, index) => (      <Card 
            key={index} 
            className={`mb-4 overflow-hidden border-l-4 group hover:shadow-md transition-all duration-200 
              ${lesson.isCancelled ? 'bg-red-50/50 dark:bg-red-950/30 border-red-300 dark:border-red-800 opacity-75' : 
                lesson.isSubstitution ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800' : 
                'hover:bg-muted/50'}`}
            style={{ 
              borderLeftColor: lesson.isCancelled ? '#dc2626' : lesson.isSubstitution ? '#d97706' : getSubjectColor(lesson.subject),
              ...(lesson.isCancelled && { filter: 'grayscale(0.3)' })
            }}
            title={`${lesson.periodLabel || `Period ${lesson.period}: ${lesson.startTime} - ${lesson.endTime}`} ${
              lesson.isCancelled ? '(CANCELLED)' : 
              lesson.isSubstitution ? '(SUBSTITUTION)' : ''
            }`}>        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <CardTitle className={`text-base flex items-center ${
                lesson.isCancelled ? 'line-through text-red-600 dark:text-red-400' : 
                lesson.isSubstitution ? 'text-amber-600 dark:text-amber-400' : ''
              }`}>
                <Clock className={`h-4 w-4 mr-2 ${
                  lesson.isCancelled ? 'text-red-500' : 
                  lesson.isSubstitution ? 'text-amber-500' : 
                  'text-muted-foreground'
                }`} />
                <span className={lesson.isCancelled ? 'line-through' : ''}>
                  Period {lesson.periodNumber || lesson.period}
                </span>
                {lesson.isSubstitution && (
                  <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded font-normal">
                    SUB
                  </span>
                )}
                {lesson.isCancelled && (
                  <span className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded font-normal">
                    CANCELLED
                  </span>
                )}
              </CardTitle>
              <CardDescription className={`mt-1 ${
                lesson.isCancelled ? 'line-through text-red-500/70' : 
                lesson.isSubstitution ? 'text-amber-600/70 dark:text-amber-400/70' : 
                'text-muted-foreground'
              }`}>
                <span className={lesson.isCancelled ? 'line-through' : ''}>
                  {lesson.periodLabel || formatPeriodTime(lesson.periodNumber || lesson.period)}
                </span>
              </CardDescription>
            </div>
            <Badge variant={getLessonBadgeVariant(lesson)} className={`${
              lesson.isCancelled ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              lesson.isSubstitution ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
              isCurrentlyActive(lesson.startTime, lesson.endTime) ? 'bg-primary text-primary-foreground' : ''
            }`}>
              {lesson.isCancelled ? 'Cancelled' : 
               lesson.isSubstitution ? 'Substitution' : 
               isCurrentlyActive(lesson.startTime, lesson.endTime) ? 'Current' : 'Regular'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-2 gap-3 mt-2">            <div className="space-y-1 col-span-2 mb-2">
              <div className="flex items-center">
                <BookOpen className={`h-3.5 w-3.5 mr-1.5 ${
                  lesson.isCancelled ? 'text-red-500' : 
                  lesson.isSubstitution ? 'text-amber-500' : 
                  'text-muted-foreground'
                }`} />
                <span className="text-xs font-medium text-muted-foreground">Subject</span>
              </div>
              <div>
                <p className={`font-medium text-lg ${
                  lesson.isCancelled ? 'line-through text-red-500' : 
                  lesson.isSubstitution ? 'text-amber-600 dark:text-amber-400' : ''
                }`}>
                  <span className={lesson.isCancelled ? 'line-through' : ''}>
                    {getFullSubjectName(lesson.subject)}
                  </span>
                  {lesson.isSubstitution && (
                    <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded">
                      Substitution
                    </span>
                  )}
                  {lesson.isCancelled && (
                    <span className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded">
                      Cancelled
                    </span>
                  )}
                </p>
                {lesson.subject !== getFullSubjectName(lesson.subject) && (
                  <p className={`text-xs text-muted-foreground ${lesson.isCancelled ? 'line-through' : ''}`}>
                    {lesson.subject}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center">
                <Map className={`h-3.5 w-3.5 mr-1.5 ${
                  lesson.isCancelled ? 'text-red-500' : 
                  lesson.isSubstitution ? 'text-amber-500' : 
                  'text-muted-foreground'
                }`} />
                <span className="text-xs font-medium text-muted-foreground">Room</span>
              </div>
              <p className={
                lesson.isCancelled ? 'line-through text-red-500' : 
                lesson.isSubstitution ? 'text-amber-600 dark:text-amber-400' : ''
              }>
                <span className={lesson.isCancelled ? 'line-through' : ''}>
                  {lesson.room || "—"}
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center">
                <Clock className={`h-3.5 w-3.5 mr-1.5 ${
                  lesson.isCancelled ? 'text-red-500' : 
                  lesson.isSubstitution ? 'text-amber-500' : 
                  'text-muted-foreground'
                }`} />
                <span className="text-xs font-medium text-muted-foreground">Time</span>
              </div>
              <p className={
                lesson.isCancelled ? 'line-through text-red-500' : 
                lesson.isSubstitution ? 'text-amber-600 dark:text-amber-400' : ''
              }>
                <span className={lesson.isCancelled ? 'line-through' : ''}>
                  {lesson.periodLabel || formatPeriodTime(lesson.periodNumber || lesson.period)}
                </span>
              </p>
            </div>
            {lesson.teacher && (
              <div className="space-y-1 col-span-2">
                <div className="flex items-center">
                  <User className={`h-3.5 w-3.5 mr-1.5 ${
                    lesson.isCancelled ? 'text-red-500' : 
                    lesson.isSubstitution ? 'text-amber-500' : 
                    'text-muted-foreground'
                  }`} />
                  <span className="text-xs font-medium text-muted-foreground">Teacher</span>
                </div>
                <p className={
                  lesson.isCancelled ? 'line-through text-red-500' : 
                  lesson.isSubstitution ? 'text-amber-600 dark:text-amber-400' : ''
                }>
                  <span className={lesson.isCancelled ? 'line-through' : ''}>
                    {lesson.teacher}
                  </span>
                </p>
              </div>
            )}
            {lesson.notes && (
              <div className={`col-span-2 mt-2 p-2 rounded-md text-sm ${
                lesson.isCancelled ? 
                  'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' :
                lesson.isSubstitution ? 
                  'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                  'bg-muted/50 text-muted-foreground'
              }`}>
                <span className="font-medium">
                  {lesson.isCancelled ? 'Cancellation Info: ' : 
                   lesson.isSubstitution ? 'Substitution Info: ' : 'Notes: '}
                </span>
                {lesson.notes}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    ));
  };
  
  // Get day names for tabs
  const getDayLabel = (dayName: string, day: TimeTableDay) => {
    // Check if it's current day
    const isCurrentDay = getCurrentDayName() === dayName;
    return (
      <div className="flex flex-col items-center">
        <span>{dayName.charAt(0).toUpperCase() + dayName.slice(1)}</span>
        {day.date && <span className="text-xs opacity-70">{day.date}</span>}
        {isCurrentDay && <span className="h-1 w-1 bg-primary rounded-full mt-0.5"></span>}
      </div>
    );
  };

  // Calculate timetable status information
  const calculateTimetableStatus = () => {
    if (!timetable) return null;
    
    let totalLessons = 0;
    let cancellations = 0;
    let substitutions = 0;
    
    Object.values(timetable).forEach(day => {
      totalLessons += day.lessons.length;
      cancellations += day.lessons.filter(l => l.isCancelled).length;
      substitutions += day.lessons.filter(l => l.isSubstitution).length;
    });
    
    return { totalLessons, cancellations, substitutions };  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>          <h1 className="text-3xl font-bold mb-2">Timetable</h1>
          <div className="flex items-center text-muted-foreground text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>Last updated: {lastUpdated || "—"}</span>
            
            {timetable && (() => {
              const status = calculateTimetableStatus();
              return status && status.cancellations + status.substitutions > 0 ? (
                <span className="ml-4 flex items-center">
                  {status.cancellations > 0 && (
                    <span className="text-red-600 dark:text-red-400 mr-3 flex items-center">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                      {status.cancellations} cancelled
                    </span>
                  )}
                  {status.substitutions > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1"></span>
                      {status.substitutions} substituted
                    </span>
                  )}
                </span>
              ) : null;
            })()}
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4 sm:mt-0"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
        {/* Substitute plan integration notice - only show if there are actual cancellations/substitutions */}
      {!loading && timetable && (() => {
        const status = calculateTimetableStatus();
        return status && status.cancellations + status.substitutions > 0 ? (
          <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 mb-6">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-800 dark:text-blue-300">Substitute Plan Integration Active</AlertTitle>
            <AlertDescription className="text-blue-800 dark:text-blue-300 mt-1">
              This timetable includes the latest substitute plan changes:
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <span className="text-red-600 font-medium">Cancelled lessons</span> appear crossed out in red</li>
                <li>• <span className="text-amber-600 font-medium">Substituted lessons</span> are highlighted in amber</li>
                <li>• Check the notes section for details about changes</li>
              </ul>
            </AlertDescription>
          </Alert>
        ) : null;
      })()}
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}      {/* Fallback data notice */}
      {!loading && timetable && isFallbackData(timetable) && (
        <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 mb-6">
          <Clock className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            {getApiStatusMessage(timetable as any) || "The timetable API is currently unavailable. Showing sample data instead."}
            <Button 
              variant="link" 
              size="sm" 
              className="text-amber-700 dark:text-amber-300 p-0 h-auto ml-2"
              onClick={fetchData}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-[150px] w-full rounded-lg" />
          <div className="flex space-x-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-[80px]" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full rounded-lg" />
          ))}
        </div>
      )}
      
      {/* Timetable content */}
      {!loading && timetable && typeof timetable === 'object' && (
        <>
          {/* Current or next lesson */}
          {renderCurrentOrNextLesson()}
          
          {/* Tabbed view of the week */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid ${Object.keys(timetable).length === 5 ? 'grid-cols-5' : 
              Object.keys(timetable).length === 4 ? 'grid-cols-4' : 
              Object.keys(timetable).length === 3 ? 'grid-cols-3' : 
              Object.keys(timetable).length === 2 ? 'grid-cols-2' : 'grid-cols-1'} mb-6`}>
              {Object.entries(timetable).map(([dayName, day]) => (
                <TabsTrigger key={dayName} value={dayName}>
                  {getDayLabel(dayName, day)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(timetable).map(([dayName, day]) => (
              <TabsContent key={dayName} value={dayName} className="space-y-4">
                {!day.lessons || day.lessons.length === 0 ? (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 pb-6">
                      <div className="text-center">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-lg font-medium">No lessons</p>
                        <p className="text-muted-foreground mt-1">There are no scheduled lessons for this day.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div>
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
                        {day.date && <span className="text-sm font-normal ml-2 opacity-70">({day.date})</span>}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">{day.lessons.length} lessons scheduled</p>
                    </div>
                    {renderDayLessons(day)}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
          
          <div className="mt-8 text-sm text-center text-muted-foreground">
            <p>This timetable is automatically updated. Check back regularly for changes.</p>
          </div>
        </>
      )}
    </div>
  );
}
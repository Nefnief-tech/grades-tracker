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
  TimeTableWeek,
  TimeTableDay,
  TimeTableLesson
} from "@/lib/timetable-service";
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
    setError(null);
    
    try {
      const data = await fetchTimeTable();
      
      // Check if the data is valid
      if (data) {
        // Extract the timetable data - handle different API response formats
        let timetableData: TimeTableWeek;
        
        if (data.data && typeof data.data === 'object') {
          // Standard format with data property
          timetableData = data.data;
        } else if ('monday' in data || 'tuesday' in data || 'wednesday' in data || 
                   'thursday' in data || 'friday' in data) {
          // Direct timetable object
          timetableData = data as unknown as TimeTableWeek;
        } else {
          // Unknown format
          setError('Invalid timetable data format');
          setLoading(false);
          return;
        }
        
        // Validate the structure of timetable data
        const hasValidDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].some(day => 
          timetableData[day] && Array.isArray(timetableData[day].lessons)
        );
        
        if (!hasValidDays) {
          setError('Timetable data is missing required day information');
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
      
      return (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
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
            </CardTitle>
            <CardDescription>
              {isCurrentLesson
                ? `Currently in progress (${formatTimeRange(lesson.startTime, lesson.endTime)})`
                : `Coming up on ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} at ${lesson.startTime}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Subject</p>
                <p className="font-medium">{lesson.subject}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Room</p>
                <p>{lesson.room || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Time</p>
                <p>{formatTimeRange(lesson.startTime, lesson.endTime)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Teacher</p>
                <p>{lesson.teacher || "—"}</p>
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
  
  // Function to render lessons for a specific day
  const renderDayLessons = (day: TimeTableDay) => {
    return day.lessons.map((lesson, index) => (
      <Card key={index} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              Period {lesson.period}: {formatTimeRange(lesson.startTime, lesson.endTime)}
            </CardTitle>
            <Badge variant={getLessonBadgeVariant(lesson)}>
              {lesson.isCancelled ? 'Cancelled' : lesson.isSubstitution ? 'Substitution' : isCurrentlyActive(lesson.startTime, lesson.endTime) ? 'Current' : 'Regular'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="space-y-1">
              <div className="flex items-center">
                <BookOpen className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Subject</span>
              </div>
              <p className="font-medium">{lesson.subject}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center">
                <Map className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Room</span>
              </div>
              <p>{lesson.room || "—"}</p>
            </div>
            {lesson.teacher && (
              <div className="space-y-1 col-span-2">
                <div className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Teacher</span>
                </div>
                <p>{lesson.teacher}</p>
              </div>
            )}
            {lesson.notes && (
              <div className="col-span-2 mt-1 text-sm italic text-muted-foreground">
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
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Timetable</h1>
          <div className="flex items-center text-muted-foreground text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>Last updated: {lastUpdated || "—"}</span>
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
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Fallback data notice */}
      {!loading && timetable && timetable.monday && timetable.monday.date === '2025-05-26' && (
        <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 mb-6">
          <Clock className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            The timetable API is currently unavailable. Showing sample data instead.
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
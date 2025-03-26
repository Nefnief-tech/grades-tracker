"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  parseISO,
} from "date-fns";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PenLine,
  Layers,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useSubjects } from "@/hooks/useSubjects";
import { useTests } from "@/hooks/useTests";
import { Subject, TimetableEntry, Grade, Test } from "@/types/grades";
import { useAuth } from "@/contexts/AuthContext";
import { getTimetableEntries } from "@/utils/storageUtils";
import { Badge } from "@/components/ui/badge";
import { formatTimeDisplay } from "@/utils/formatUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface CalendarReworkProps {
  onDaySelect?: (date: Date) => void;
  showTimetable?: boolean;
  onGradeSelect?: (grade: Grade, subject: Subject) => void;
  onTestSelect?: (test: Test, subject: Subject) => void;
}

export function CalendarRework({
  onDaySelect = () => {},
  showTimetable = true,
  onGradeSelect,
  onTestSelect,
}: CalendarReworkProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<string[]>([
    "classes",
    "grades",
    "tests",
  ]);
  const { subjects, isLoading: isLoadingSubjects } = useSubjects();
  const { tests, isLoading: isLoadingTests } = useTests();
  const { user } = useAuth();
  const { toast } = useToast();

  // Load timetable entries
  useEffect(() => {
    async function loadTimetableEntries() {
      if (!showTimetable) {
        setTimetableEntries([]);
        return;
      }

      setLoading(true);
      try {
        const entries = await getTimetableEntries(user?.id, user?.syncEnabled);
        setTimetableEntries(entries);
      } catch (error) {
        console.error("Failed to load timetable entries:", error);
        toast({
          title: "Error loading timetable",
          description: "Could not load your class schedule",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadTimetableEntries();
  }, [user, showTimetable, toast]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    const startDate = startOfWeek(firstDay, { weekStartsOn: 1 }); // Start from Monday
    const endDate = endOfWeek(lastDay, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Get all grades with dates across all subjects
  const allGradesWithDates = useMemo(() => {
    if (!subjects || filters.indexOf("grades") === -1) return [];

    const gradesWithDates: { grade: Grade; subject: Subject; date: Date }[] =
      [];

    subjects.forEach((subject) => {
      if (subject.grades && subject.grades.length > 0) {
        subject.grades.forEach((grade) => {
          if (grade.date) {
            try {
              // Parse the date string
              const date = parseISO(grade.date);
              gradesWithDates.push({ grade, subject, date });
            } catch (error) {
              console.error(`Invalid date format for grade: ${grade.date}`);
            }
          }
        });
      }
    });

    return gradesWithDates;
  }, [subjects, filters]);

  // Get all tests with dates
  const allTestsWithDates = useMemo(() => {
    if (!tests || !subjects || filters.indexOf("tests") === -1) return [];

    const testsWithDates: { test: Test; subject: Subject; date: Date }[] = [];

    tests.forEach((test) => {
      if (test.date) {
        try {
          // Find the subject for this test
          const subject = subjects.find((s) => s.id === test.subjectId);
          if (subject) {
            // Parse the date string
            const date = parseISO(test.date);
            testsWithDates.push({ test, subject, date });
          }
        } catch (error) {
          console.error(`Invalid date format for test: ${test.date}`);
        }
      }
    });

    return testsWithDates;
  }, [tests, subjects, filters]);

  // Find timetable entries for a specific day
  const getEntriesForDay = (date: Date): TimetableEntry[] => {
    if (
      !showTimetable ||
      !timetableEntries.length ||
      filters.indexOf("classes") === -1
    )
      return [];

    // Get the day of week (0-6, where 0 is Monday in our system)
    const dayOfWeek = (date.getDay() + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0, etc.

    // Filter entries for this day
    return timetableEntries.filter((entry) => {
      // Only show recurring entries or entries for today
      if (!entry.recurring && !isToday(date)) return false;
      return entry.day === dayOfWeek;
    });
  };

  // Find grades for a specific day
  const getGradesForDay = (date: Date) => {
    return allGradesWithDates.filter((item) => isSameDay(item.date, date));
  };

  // Find tests for a specific day
  const getTestsForDay = (date: Date) => {
    return allTestsWithDates.filter((item) => isSameDay(item.date, date));
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDaySelect(date);
  };

  // Handle grade click
  const handleGradeClick = (
    event: React.MouseEvent,
    grade: Grade,
    subject: Subject
  ) => {
    event.stopPropagation();
    if (onGradeSelect) {
      onGradeSelect(grade, subject);
    }
  };

  // Handle test click
  const handleTestClick = (
    event: React.MouseEvent,
    test: Test,
    subject: Subject
  ) => {
    event.stopPropagation();
    if (onTestSelect) {
      onTestSelect(test, subject);
    }
  };

  // Navigation handlers
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    onDaySelect(today);
  };

  // Get color based on test priority
  const getTestPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "#ef4444"; // Red
      case "medium":
        return "#f59e0b"; // Amber
      case "low":
        return "#22c55e"; // Green
      default:
        return "#f59e0b"; // Default amber for medium
    }
  };

  return (
    <div className="w-full">
      {/* Calendar header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="multiple"
            value={filters}
            onValueChange={(value) => {
              if (value.length > 0) setFilters(value);
            }}
            className="mr-2"
          >
            <ToggleGroupItem
              value="classes"
              aria-label="Show classes"
              title="Show classes"
            >
              <Clock className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Classes</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="grades"
              aria-label="Show grades"
              title="Show grades"
            >
              <GraduationCap className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Grades</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="tests"
              aria-label="Show tests"
              title="Show tests"
            >
              <ClipboardList className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Tests</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            size="icon"
            variant="outline"
            onClick={prevMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button
            variant="outline"
            onClick={goToToday}
            className="h-8 text-xs sm:text-sm px-2 sm:px-4"
          >
            Today
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={nextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1 text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dayEntries = getEntriesForDay(day);
          const dayGrades = getGradesForDay(day);
          const dayTests = getTestsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[100px] p-2 border rounded-md",
                "hover:bg-secondary/20 cursor-pointer transition-colors",
                !isCurrentMonth && "bg-muted/30 opacity-60",
                isSelected && "border-primary",
                isCurrentDay && "bg-primary/5"
              )}
              onClick={() => handleDateClick(day)}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    "text-sm h-6 w-6 flex items-center justify-center rounded-full",
                    isCurrentDay &&
                      "bg-primary text-primary-foreground font-medium",
                    isSelected && !isCurrentDay && "bg-primary/20 font-medium"
                  )}
                >
                  {day.getDate()}
                </span>
                {(dayEntries.length > 0 ||
                  dayGrades.length > 0 ||
                  dayTests.length > 0) && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-secondary/20 hover:bg-secondary/30"
                  >
                    {dayEntries.length + dayGrades.length + dayTests.length}
                  </Badge>
                )}
              </div>

              {/* Display content */}
              <div className="mt-1 space-y-1">
                {/* Display timetable entries */}
                {dayEntries
                  .slice(0, dayGrades.length + dayTests.length > 0 ? 1 : 2)
                  .map((entry) => {
                    const subject = subjects.find(
                      (s) => s.id === entry.subjectId
                    );
                    if (!subject) return null;

                    return (
                      <TooltipProvider key={`entry-${entry.id}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="text-xs p-1 rounded truncate flex items-center gap-1"
                              style={{
                                backgroundColor: `${
                                  subject.color || "#4f46e5"
                                }20`,
                                borderLeft: `2px solid ${
                                  subject.color || "#4f46e5"
                                }`,
                              }}
                            >
                              <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                              <span className="truncate">{subject.name}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[200px]">
                            <div className="text-xs">
                              <p className="font-medium mb-1">{subject.name}</p>
                              <p>
                                {formatTimeDisplay(entry.startTime)} -{" "}
                                {formatTimeDisplay(entry.endTime)}
                              </p>
                              {entry.room && <p>Room: {entry.room}</p>}
                              {entry.notes && (
                                <p className="mt-1">{entry.notes}</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}

                {/* Display grades */}
                {dayGrades
                  .slice(0, dayEntries.length + dayTests.length > 0 ? 1 : 2)
                  .map((item, index) => {
                    // Directly use the subject color - this is the fix!
                    const subjectColor = item.subject.color;

                    // Only fall back to grade-based color if subject has no color
                    const gradeColor =
                      subjectColor ||
                      (item.grade.value <= 1.5
                        ? "#22c55e" // Green
                        : item.grade.value <= 2.5
                        ? "#3b82f6" // Blue
                        : item.grade.value <= 3.5
                        ? "#eab308" // Yellow
                        : item.grade.value <= 4.5
                        ? "#f97316" // Orange
                        : "#ef4444"); // Red

                    return (
                      <TooltipProvider key={`grade-${item.grade.id}-${index}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="text-xs p-1 rounded truncate flex items-center gap-1 cursor-pointer"
                              style={{
                                backgroundColor: `${gradeColor}20`,
                                borderLeft: `2px solid ${gradeColor}`,
                              }}
                              onClick={(e) =>
                                handleGradeClick(e, item.grade, item.subject)
                              }
                            >
                              <GraduationCap className="h-2.5 w-2.5 flex-shrink-0" />
                              <span className="truncate">
                                {item.subject.name}
                              </span>
                              <span className="ml-auto font-medium">
                                {item.grade.value.toFixed(1)}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[200px]">
                            <div className="text-xs">
                              <p className="font-medium mb-1">
                                {item.subject.name}
                              </p>
                              <p className="font-bold">
                                Grade: {item.grade.value.toFixed(1)}
                              </p>
                              {item.grade.type && (
                                <p>Type: {item.grade.type}</p>
                              )}
                              <p>Weight: {item.grade.weight || 1}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}

                {/* Display tests */}
                {dayTests
                  .slice(0, dayEntries.length + dayGrades.length > 0 ? 1 : 2)
                  .map((item, index) => {
                    // Use subject color for the test
                    const testColor =
                      item.subject.color ||
                      getTestPriorityColor(item.test.priority);

                    return (
                      <TooltipProvider key={`test-${item.test.id}-${index}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="text-xs p-1 rounded truncate flex items-center gap-1 cursor-pointer"
                              style={{
                                backgroundColor: `${testColor}20`,
                                borderLeft: `2px solid ${testColor}`,
                              }}
                              onClick={(e) =>
                                handleTestClick(e, item.test, item.subject)
                              }
                            >
                              <ClipboardList className="h-2.5 w-2.5 flex-shrink-0" />
                              <span className="truncate">
                                {item.test.title}
                              </span>
                              {item.test.completed && (
                                <span className="ml-auto">✓</span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[200px]">
                            <div className="text-xs">
                              <p className="font-medium mb-1">
                                {item.test.title}
                              </p>
                              <p>Subject: {item.subject.name}</p>
                              {item.test.priority && (
                                <p>Priority: {item.test.priority}</p>
                              )}
                              {item.test.description && (
                                <p className="mt-1 line-clamp-2">
                                  {item.test.description}
                                </p>
                              )}
                              {item.test.completed && (
                                <p className="text-green-600 font-medium">
                                  Completed
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}

                {/* Show counts if too many items */}
                {dayEntries.length + dayGrades.length + dayTests.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +
                    {dayEntries.length + dayGrades.length + dayTests.length - 3}{" "}
                    more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading indicator */}
      {(loading || isLoadingSubjects || isLoadingTests) && (
        <div className="flex items-center justify-center mt-4 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          Loading data...
        </div>
      )}
    </div>
  );
}

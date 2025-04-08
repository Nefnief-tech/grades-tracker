"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  format,
  isToday,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isBefore,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardList,
  GraduationCap,
  Loader2,
  X,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/contexts/AuthContext";
import { useSubjects } from "@/hooks/useSubjects";
import { useTests } from "@/hooks/useTests";
import { useToast } from "@/components/ui/use-toast";
import { getTimetableEntries } from "@/utils/timetableUtils";
import { TimetableEntry, Subject, Grade, Test } from "@/types/grades";
import { formatTimeDisplay, getContrastColor } from "@/utils/formatUtils";

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

  // Add responsive state to track screen size
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

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
    <div className="w-full calendar-container">
      {/* Calendar header - More modern styling */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto bg-muted/30 p-1.5 rounded-lg">
          <ToggleGroup
            type="multiple"
            value={filters}
            onValueChange={(value) => {
              if (value.length > 0) setFilters(value);
            }}
            className="mr-1.5"
          >
            <ToggleGroupItem
              value="classes"
              aria-label="Show classes"
              title="Show classes"
              className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 rounded-md data-[state=on]:shadow-inner data-[state=on]:bg-primary/20"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5 text-sm">Classes</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="grades"
              aria-label="Show grades"
              title="Show grades"
              className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 rounded-md data-[state=on]:shadow-inner data-[state=on]:bg-primary/20"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5 text-sm">Grades</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="tests"
              aria-label="Show tests"
              title="Show tests"
              className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 rounded-md data-[state=on]:shadow-inner data-[state=on]:bg-primary/20"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5 text-sm">Tests</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="flex items-center rounded-md bg-background h-8 border shadow-sm">
            <Button
              size="icon"
              variant="ghost"
              onClick={prevMonth}
              className="h-8 w-8 rounded-r-none"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous month</span>
            </Button>
            <Button
              variant="ghost"
              onClick={goToToday}
              className="h-8 text-xs px-2 rounded-none border-x"
            >
              Today
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={nextMonth}
              className="h-8 w-8 rounded-l-none"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Day headers - Modernized with better contrast */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center bg-muted/20 rounded-lg p-1">
        {isMobile
          ? // One-letter day headers for mobile
            ["M", "T", "W", "T", "F", "S", "S"].map((day) => (
              <div
                key={day}
                className="text-xs font-semibold text-muted-foreground py-1 sm:py-2"
              >
                {day}
              </div>
            ))
          : // Three-letter day headers for desktop
            ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="text-xs font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
      </div>

      {/* Calendar grid - Improved styling */}
      <div className="grid grid-cols-7 gap-1.5 relative">
        {calendarDays.map((day) => {
          const dayEntries = getEntriesForDay(day);
          const dayGrades = getGradesForDay(day);
          const dayTests = getTestsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              className={cn(
                "relative border overflow-hidden transition-all duration-150",
                isMobile ? "h-14 p-0.5" : "h-28 p-1.5",
                isCurrentMonth
                  ? "bg-card shadow-sm"
                  : "bg-muted/30 text-muted-foreground",
                isSelected
                  ? "border-primary ring-1 ring-primary/30"
                  : isCurrentDay
                  ? "border-primary/50"
                  : "border-border",
                "hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] focus:scale-[1.02] active:scale-100",
                "rounded-lg"
              )}
            >
              {/* Day number - Modernized with badge-like today indicator */}
              <div
                className={cn(
                  "text-xs sm:text-sm font-medium",
                  !isCurrentMonth && "text-muted-foreground/70",
                  isCurrentDay &&
                    "bg-primary text-primary-foreground h-5 sm:h-6 w-5 sm:w-6 rounded-full flex items-center justify-center mx-auto sm:mx-0 shadow-sm"
                )}
              >
                {format(day, "d")}
              </div>

              {/* Content container - Different presentation for mobile */}
              <div
                className={cn(
                  "mt-1 flex flex-col gap-0.5 overflow-hidden",
                  isMobile ? "max-h-7" : "max-h-[calc(100%-20px)]"
                )}
              >
                {/* Timetable entries with subject colors */}
                {dayEntries.length > 0 &&
                  filters.includes("classes") &&
                  (isMobile ? (
                    // Mobile: Just show indicator dots for classes
                    <div className="flex gap-0.5 flex-wrap">
                      {dayEntries.slice(0, 2).map((entry, idx) => {
                        // Find subject to get its color
                        const subject = subjects.find(
                          (s) => s.id === entry.subjectId
                        );
                        return (
                          <div
                            key={idx}
                            className="h-1.5 w-1.5 rounded-full shadow-sm"
                            style={{
                              backgroundColor:
                                entry.color || subject?.color || "#3b82f6",
                            }}
                          />
                        );
                      })}
                      {dayEntries.length > 2 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      )}
                    </div>
                  ) : (
                    // Desktop: Show entry details
                    <div className="space-y-1 mt-1">
                      {dayEntries.slice(0, 3).map((entry, idx) => {
                        const subject = subjects.find(
                          (s) => s.id === entry.subjectId
                        );
                        return (
                          <div
                            key={idx}
                            className="text-[9px] leading-tight truncate rounded-md px-1.5 py-0.5 shadow-sm flex items-center transition-all hover:translate-x-0.5"
                            style={{
                              backgroundColor:
                                entry.color || subject?.color || "#3b82f6",
                              color: getContrastColor(
                                entry.color || subject?.color
                              ),
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="font-medium">
                              {formatTimeDisplay(entry.startTime)}
                            </span>
                            <span className="mx-0.5">·</span>
                            <span className="truncate">
                              {subject?.name || "Class"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                {/* Grades - Mobile optimized */}
                {dayGrades.length > 0 &&
                  filters.includes("grades") &&
                  (isMobile ? (
                    // Mobile: Show grade indicators
                    <div className="flex gap-0.5 flex-wrap">
                      {dayGrades.slice(0, 2).map((item, idx) => (
                        <div
                          key={idx}
                          className="h-1.5 w-1.5 rounded-full shadow-sm"
                          style={{
                            backgroundColor:
                              item.grade.value <= 2
                                ? "#22c55e" // green
                                : item.grade.value <= 3
                                ? "#3b82f6" // blue
                                : item.grade.value <= 4
                                ? "#eab308" // yellow
                                : "#ef4444", // red
                          }}
                        />
                      ))}
                      {dayGrades.length > 2 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      )}
                    </div>
                  ) : (
                    // Desktop: Show grade details
                    <div className="space-y-1 mt-1">
                      {dayGrades.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "text-[9px] leading-tight truncate rounded-md px-1.5 py-0.5 shadow-sm flex items-center transition-all hover:translate-x-0.5",
                            item.grade.value <= 2
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : item.grade.value <= 3
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : item.grade.value <= 4
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}
                          onClick={(e) =>
                            handleGradeClick(e, item.grade, item.subject)
                          }
                        >
                          <span>{item.grade.value}</span>
                          <span className="truncate">{item.subject.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}

                {/* Tests - Mobile optimized */}
                {dayTests.length > 0 &&
                  filters.includes("tests") &&
                  (isMobile ? (
                    // Mobile: Show test indicators
                    <div className="flex gap-0.5 flex-wrap">
                      {dayTests.slice(0, 2).map((item, idx) => (
                        <div
                          key={idx}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: getTestPriorityColor(
                              item.test.priority
                            ),
                          }}
                        />
                      ))}
                      {dayTests.length > 2 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      )}
                    </div>
                  ) : (
                    // Desktop: Show test details
                    dayTests.slice(0, 2).map((item, idx) => {
                      const subject = subjects.find(
                        (s) => s.id === item.test.subjectId
                      );
                      return (
                        <div
                          key={idx}
                          className="text-[8px] leading-tight truncate rounded px-1 border-l-2 bg-background"
                          style={{
                            borderColor: getTestPriorityColor(
                              item.test.priority
                            ),
                          }}
                          onClick={(e) =>
                            handleTestClick(e, item.test, item.subject)
                          }
                        >
                          <span className="truncate">{item.test.title}</span>
                        </div>
                      );
                    })
                  ))}

                {/* More indicator when there are too many items */}
                {!isMobile &&
                  ((dayEntries.length > 3 && filters.includes("classes")) ||
                    (dayGrades.length > 2 && filters.includes("grades")) ||
                    (dayTests.length > 2 && filters.includes("tests"))) && (
                    <div className="text-[8px] text-muted-foreground truncate">
                      + more
                    </div>
                  )}
              </div>
            </button>
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

      {/* Mobile day detail drawer - Shows when a date is selected */}
      {isMobile && selectedDate && (
        <div className="fixed inset-x-0 bottom-0 bg-background border-t border-border rounded-t-xl shadow-lg p-4 z-50 animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">
              {format(selectedDate, "EEEE, MMMM d")}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedDate(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto pb-safe">
            {/* Timetable entries for selected day */}
            {getEntriesForDay(selectedDate).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Classes
                </h4>
                <div className="space-y-2">
                  {getEntriesForDay(selectedDate).map((entry, idx) => {
                    const subject = subjects.find(
                      (s) => s.id === entry.subjectId
                    );
                    return (
                      <div
                        key={idx}
                        className="text-sm p-2 rounded-md flex items-center"
                        style={{
                          backgroundColor:
                            entry.color || subject?.color
                              ? `${entry.color || subject?.color}20`
                              : "var(--muted)",
                          borderLeft: `3px solid ${
                            entry.color || subject?.color || "#3b82f6"
                          }`,
                        }}
                      >
                        <div className="mr-3">
                          <div className="font-medium">
                            {formatTimeDisplay(entry.startTime)} -{" "}
                            {formatTimeDisplay(entry.endTime)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {subject?.name || "Class"}{" "}
                            {entry.room && `(${entry.room})`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grades for selected day */}
            {getGradesForDay(selectedDate).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Grades
                </h4>
                <div className="space-y-2">
                  {getGradesForDay(selectedDate).map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "text-sm p-2 rounded-md",
                        item.grade.value <= 2
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : item.grade.value <= 3
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : item.grade.value <= 4
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      )}
                      onClick={() =>
                        onGradeSelect && onGradeSelect(item.grade, item.subject)
                      }
                    >
                      <div className="font-medium flex justify-between">
                        <span>{item.subject.name}</span>
                        <span>{item.grade.value}</span>
                      </div>
                      <div className="text-xs opacity-80">
                        {item.grade.type} ({item.grade.weight}x)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tests for selected day */}
            {getTestsForDay(selectedDate).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Tests
                </h4>
                <div className="space-y-2">
                  {getTestsForDay(selectedDate).map((item, idx) => {
                    // Find subject to get its color
                    const subject = subjects.find(
                      (s) => s.id === item.test.subjectId
                    );
                    return (
                      <div
                        key={idx}
                        className="text-sm p-2 rounded-md bg-muted"
                        style={{
                          borderLeft: `3px solid ${getTestPriorityColor(
                            item.test.priority
                          )}`,
                          backgroundColor: subject?.color
                            ? `${subject.color}10`
                            : undefined,
                        }}
                        onClick={() =>
                          onTestSelect && onTestSelect(item.test, item.subject)
                        }
                      >
                        <div className="font-medium">{item.test.title}</div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{item.subject.name}</span>
                          <span>
                            {item.test.priority === "high"
                              ? "High priority"
                              : item.test.priority === "medium"
                              ? "Medium priority"
                              : "Low priority"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No events message */}
            {getEntriesForDay(selectedDate).length === 0 &&
              getGradesForDay(selectedDate).length === 0 &&
              getTestsForDay(selectedDate).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No events for this day
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

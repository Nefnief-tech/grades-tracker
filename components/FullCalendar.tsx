"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  isWithinInterval,
  getDay,
} from "date-fns";
import { Subject, Grade, TimetableEntry } from "@/types/grades";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/SettingsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

interface FullCalendarProps {
  subjects: Subject[];
  timetableEntries?: TimetableEntry[];
  onGradeClick?: (grade: Grade, subject: Subject) => void;
  onTimetableEntryClick?: (entry: TimetableEntry, subject: Subject) => void;
  view?: "month" | "week" | "day";
  showTimetable?: boolean;
}

export function FullCalendar({
  subjects,
  timetableEntries = [],
  onGradeClick,
  onTimetableEntryClick,
  view = "month",
  showTimetable = true,
}: FullCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">(
    view
  );
  const { settings } = useSettings();

  // Get days for the current view
  const viewDays = useMemo(() => {
    if (calendarView === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      // Get all days in month including padding days from previous/next months
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else if (calendarView === "week") {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      // Day view - just return the current day
      return [currentDate];
    }
  }, [currentDate, calendarView]);

  // Map of day string to timetable entries
  const timetableByDay = useMemo(() => {
    const mapped: Record<
      string,
      Array<TimetableEntry & { subject: Subject }>
    > = {};

    timetableEntries.forEach((entry) => {
      const subject = subjects.find((s) => s.id === entry.subjectId);
      if (subject) {
        if (!mapped[entry.day]) {
          mapped[entry.day] = [];
        }
        mapped[entry.day].push({ ...entry, subject });
      }
    });

    return mapped;
  }, [timetableEntries, subjects]);

  // Collect all grades with dates for the calendar
  const gradesWithDates = useMemo(() => {
    const gradesByDate: Record<string, { grade: Grade; subject: Subject }[]> =
      {};

    subjects.forEach((subject) => {
      if (subject.grades && subject.grades.length > 0) {
        subject.grades.forEach((grade) => {
          if (grade.date) {
            try {
              // Format the date to YYYY-MM-DD for consistency
              const dateStr =
                typeof grade.date === "string"
                  ? grade.date.split("T")[0]
                  : new Date(grade.date).toISOString().split("T")[0];

              if (!gradesByDate[dateStr]) {
                gradesByDate[dateStr] = [];
              }

              gradesByDate[dateStr].push({ grade, subject });
            } catch (e) {
              // Skip invalid dates
              console.warn("Invalid date format:", grade.date);
            }
          }
        });
      }
    });

    return gradesByDate;
  }, [subjects]);

  // Navigation functions
  const navigatePrevious = () => {
    if (calendarView === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (calendarView === "week") {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const navigateNext = () => {
    if (calendarView === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (calendarView === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  // Get weekday name from day number
  const getWeekDayName = (day: number): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[day];
  };

  // Convert time string (HH:MM) to minutes since midnight for sorting
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Function to render timetable entries for a specific day
  const renderTimetableEntries = (day: Date) => {
    const weekday = getWeekDayName(
      getDay(day)
    ).toLowerCase() as keyof typeof timetableByDay;
    const entries = timetableByDay[weekday] || [];

    // Sort entries by start time
    const sortedEntries = [...entries].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    if (sortedEntries.length === 0) return null;

    return (
      <div className="mt-1 space-y-1">
        {sortedEntries.map((entry) => {
          // Use entry color if available, otherwise fall back to subject color
          const entryColor = entry.color || entry.subject.color;
          
          return (
            <div
              key={entry.id}
              className="text-xs p-1 rounded-sm cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-1"
              style={{
                backgroundColor: entryColor
                  ? `${entryColor}20`
                  : undefined,
                borderLeft: entryColor
                  ? `2px solid ${entryColor}`
                  : undefined,
              }}
              onClick={() => onTimetableEntryClick?.(entry, entry.subject)}
            >
              <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 truncate">
                <span className="font-medium">{entry.startTime}</span>
                <span className="mx-1">-</span>
                <span>{entry.endTime}</span>
                <div className="font-medium truncate">{entry.subject.name}</div>
                {entry.room && (
                  <div className="text-muted-foreground truncate">
                    Room: {entry.room}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Function to render grades for a specific day
  const renderGradesForDay = (day: Date) => {
    const dateStr = day.toISOString().split("T")[0];
    const gradesForDay = gradesWithDates[dateStr] || [];

    if (gradesForDay.length === 0) return null;

    return (
      <div className="mt-1 space-y-1">
        {gradesForDay.map(({ grade, subject }) => (
          <div
            key={grade.id}
            className="text-xs p-1 rounded-sm cursor-pointer hover:bg-muted/50 transition-colors flex items-center"
            style={{
              backgroundColor: subject.color ? `${subject.color}20` : undefined,
              borderLeft: subject.color
                ? `2px solid ${subject.color}`
                : undefined,
            }}
            onClick={() => onGradeClick?.(grade, subject)}
          >
            <GraduationCap className="h-3 w-3 text-muted-foreground mr-1 flex-shrink-0" />
            <div className="flex-1 truncate">
              <span className="font-medium">{subject.name}</span>
              <Badge
                variant="outline"
                className="ml-1 text-xs h-4 min-w-4 px-1 inline-flex items-center justify-center"
                style={{
                  backgroundColor: getGradeColor(grade.value, true),
                  color: getGradeColor(grade.value, false),
                  borderColor: getGradeColor(grade.value, true),
                }}
              >
                {grade.value.toFixed(1)}
              </Badge>
              {grade.type && (
                <div className="text-muted-foreground truncate">
                  {grade.type}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to generate color for grade values
  const getGradeColor = (grade: number, background: boolean = false) => {
    if (background) {
      if (grade <= 1.5) return "rgba(34, 197, 94, 0.2)";
      if (grade <= 2.5) return "rgba(59, 130, 246, 0.2)";
      if (grade <= 3.5) return "rgba(234, 179, 8, 0.2)";
      if (grade <= 4.5) return "rgba(249, 115, 22, 0.2)";
      return "rgba(239, 68, 68, 0.2)";
    } else {
      if (grade <= 1.5) return "#166534";
      if (grade <= 2.5) return "#1e40af";
      if (grade <= 3.5) return "#854d0e";
      if (grade <= 4.5) return "#9a3412";
      return "#b91c1c";
    }
  };

  return (
    <div className="w-full">
      {/* Calendar Header with navigation and view options */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <span>
            {calendarView === "month"
              ? format(currentDate, "MMMM yyyy")
              : calendarView === "week"
              ? `Week of ${format(
                  startOfWeek(currentDate),
                  "MMM d"
                )} - ${format(endOfWeek(currentDate), "MMM d, yyyy")}`
              : format(currentDate, "EEEE, MMMM d, yyyy")}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {calendarView === "month"
                  ? "Month"
                  : calendarView === "week"
                  ? "Week"
                  : "Day"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCalendarView("month")}>
                Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCalendarView("week")}>
                Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCalendarView("day")}>
                Day
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {calendarView === "month" && (
        <>
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-sm font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {viewDays.map((day) => {
              const dateStr = day.toISOString().split("T")[0];
              const hasGrades =
                gradesWithDates[dateStr] && gradesWithDates[dateStr].length > 0;
              const weekday = getWeekDayName(getDay(day)).toLowerCase();
              const hasTimetable =
                showTimetable &&
                timetableByDay[weekday as keyof typeof timetableByDay]?.length >
                  0;

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "p-1 border rounded-md relative min-h-24 transition-all",
                    isSameMonth(day, currentDate)
                      ? "border-border/50 hover:border-primary/50 bg-card"
                      : "border-border/20 bg-muted/10 text-muted-foreground",
                    isSameDay(day, new Date()) && "ring-1 ring-primary"
                  )}
                >
                  <div className="text-right text-sm p-1 font-medium">
                    {format(day, "d")}
                  </div>

                  {/* Render timetable entries */}
                  {hasTimetable && showTimetable && renderTimetableEntries(day)}

                  {/* Render grades */}
                  {hasGrades && renderGradesForDay(day)}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Week View */}
      {calendarView === "week" && (
        <div className="space-y-2">
          {viewDays.map((day) => (
            <Card
              key={day.toString()}
              className={cn(
                "p-3 border",
                isSameDay(day, new Date()) && "ring-1 ring-primary"
              )}
            >
              <div className="font-medium mb-2">
                {format(day, "EEEE, MMMM d")}
              </div>

              {/* Timetable entries */}
              {showTimetable && renderTimetableEntries(day)}

              {/* Grades */}
              {renderGradesForDay(day)}

              {/* Empty state */}
              {!renderTimetableEntries(day) && !renderGradesForDay(day) && (
                <div className="text-sm text-muted-foreground italic py-2">
                  No events or grades
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Day View */}
      {calendarView === "day" && (
        <Card className={cn("p-4 border")}>
          <div className="font-bold text-lg mb-4">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </div>

          {/* Timetable entries */}
          {showTimetable && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Schedule
              </h3>
              {renderTimetableEntries(currentDate) || (
                <div className="text-sm text-muted-foreground italic py-2">
                  No classes scheduled for today
                </div>
              )}
            </div>
          )}

          {/* Grades */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              Grades
            </h3>
            {renderGradesForDay(currentDate) || (
              <div className="text-sm text-muted-foreground italic py-2">
                No grades for today
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

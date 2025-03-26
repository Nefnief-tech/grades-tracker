import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit,
  Clock,
  BookOpen,
  Check,
  BookMarked,
  CalendarDays,
  CalendarClock,
  Info,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getTimetableEntries,
  getSubjectsFromStorage,
} from "@/utils/storageUtils";
import {
  format,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  getDay,
  eachDayOfInterval,
  parseISO,
} from "date-fns";

// Types
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "assignment" | "exam" | "reminder" | "class";
  description?: string;
  subjectId?: string;
  completed?: boolean;
  color?: string;
  time?: string;
}

interface Subject {
  id: string;
  name: string;
  color?: string;
  grades?: any[];
}

interface TimetableEntry {
  id: string;
  subjectId: string;
  day: number;
  startTime: number;
  endTime: number;
  room?: string;
  notes?: string;
  recurring: boolean;
  color?: string;
}

// Event colors by type
const EVENT_COLORS = {
  assignment: "#eab308",
  exam: "#ef4444",
  reminder: "#8b5cf6",
  class: "#3b82f6",
};

// Sample data generator (replace with actual data fetching later)
const generateSampleEvents = (subjects: Subject[]): CalendarEvent[] => {
  if (!subjects.length) return [];

  const events: CalendarEvent[] = [];
  const today = new Date();

  // Add some sample assignments based on real subjects
  if (subjects[0]) {
    events.push({
      id: "evt-" + Date.now() + "-1",
      title: `${subjects[0].name} Assignment`,
      date: addDays(today, 3),
      type: "assignment",
      subjectId: subjects[0].id,
      description: "Complete practice problems",
      color: subjects[0].color,
      time: "11:59 PM",
    });
  }

  // Add an exam
  const mathSubject =
    subjects.find((s) => s.name.toLowerCase().includes("math")) || subjects[0];
  if (mathSubject) {
    events.push({
      id: "evt-" + Date.now() + "-2",
      title: `${mathSubject.name} Midterm`,
      date: addDays(today, 7),
      type: "exam",
      subjectId: mathSubject.id,
      description: "Covers all recent topics",
      color: mathSubject.color || EVENT_COLORS.exam,
    });
  }

  // Add a reminder
  events.push({
    id: "evt-" + Date.now() + "-3",
    title: "Study Group",
    date: addDays(today, 2),
    type: "reminder",
    description: "Meet in library",
    color: EVENT_COLORS.reminder,
    time: "4:00 PM",
  });

  return events;
};

// Components
const EventBadge = ({ type, mini = false }) => {
  let icon;
  switch (type) {
    case "exam":
      icon = <BookMarked className={mini ? "h-3 w-3" : "h-4 w-4"} />;
      break;
    case "assignment":
      icon = <Edit className={mini ? "h-3 w-3" : "h-4 w-4"} />;
      break;
    case "reminder":
      icon = <CalendarClock className={mini ? "h-3 w-3" : "h-4 w-4"} />;
      break;
    case "class":
      icon = <Clock className={mini ? "h-3 w-3" : "h-4 w-4"} />;
      break;
    default:
      icon = <CalendarIcon className={mini ? "h-3 w-3" : "h-4 w-4"} />;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-normal",
        mini ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs"
      )}
      style={{
        backgroundColor: `${EVENT_COLORS[type]}20`,
        color: EVENT_COLORS[type],
        borderColor: `${EVENT_COLORS[type]}40`,
      }}
    >
      {icon}
      {!mini && <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>}
    </Badge>
  );
};

const CalendarDay = ({
  date,
  events,
  isCurrentMonth,
  onClick,
  onEventClick,
}) => {
  const isCurrentDay = isToday(date);
  const dayEvents = events.filter((event) =>
    isSameDay(new Date(event.date), date)
  );

  return (
    <div
      className={cn(
        "min-h-[110px] p-2 border rounded-md",
        "hover:bg-secondary/20 cursor-pointer transition-colors",
        !isCurrentMonth && "bg-muted/30 opacity-60",
        isCurrentDay && "border-primary bg-primary/5"
      )}
      onClick={() => onClick(date)}
    >
      <div className="flex justify-between items-center">
        <span
          className={cn(
            "text-sm h-6 w-6 flex items-center justify-center rounded-full",
            isCurrentDay && "bg-primary text-primary-foreground font-medium"
          )}
        >
          {date.getDate()}
        </span>
        {dayEvents.length > 0 && (
          <Badge variant="outline" className="text-xs bg-background">
            {dayEvents.length}
          </Badge>
        )}
      </div>

      <div className="space-y-1 mt-1">
        {dayEvents.length > 0 ? (
          <>
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={cn(
                  "text-xs p-1 rounded-sm truncate flex items-center gap-1",
                  "hover:bg-secondary/30",
                  event.completed && "opacity-70"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      event.color || EVENT_COLORS[event.type] || "#888888",
                  }}
                />
                <span className="truncate">{event.title}</span>
                {event.time && (
                  <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">
                    {event.time}
                  </span>
                )}
                {event.completed && (
                  <Check className="ml-auto h-3 w-3 text-green-500" />
                )}
              </div>
            ))}

            {dayEvents.length > 3 && (
              <div className="text-xs text-muted-foreground px-1">
                +{dayEvents.length - 3} more
              </div>
            )}
          </>
        ) : (
          <div className="h-6"></div> // Empty placeholder for days with no events
        )}
      </div>
    </div>
  );
};

const EventItem = ({ event, onClick, onDelete }) => {
  return (
    <Card
      className={cn(
        "mb-2 overflow-hidden cursor-pointer transition-all hover:shadow-md border-l-4",
        event.completed && "opacity-70"
      )}
      onClick={() => onClick(event)}
      style={{
        borderLeftColor: event.color || EVENT_COLORS[event.type] || "#888888"
      }}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium">{event.title}</div>
              {event.time && (
                <div className="text-xs flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <EventBadge type={event.type} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <span className="sr-only">Open menu</span>
                  <Edit className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(event);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {event.description && (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Month view component
const MonthView = ({
  events,
  currentDate,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  onEventClick,
}) => {
  const startOfMonthDate = startOfMonth(currentDate);
  const endOfMonthDate = endOfMonth(currentDate);
  const startDate = startOfWeek(startOfMonthDate, { weekStartsOn: 1 }); // 1 = Monday
  const endDate = endOfWeek(endOfMonthDate, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-1 md:gap-2">
          <Button variant="outline" size="icon" onClick={onPrevMonth} className="h-8 w-8 md:h-9 md:w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => onDayClick(new Date())} className="h-8 md:h-9 text-xs md:text-sm">
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={onNextMonth} className="h-8 w-8 md:h-9 md:w-9">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <div key={i} className="text-center py-1 md:py-2 font-medium text-xs md:text-sm text-muted-foreground">
            {day}
          </div>
        ))}

        {calendarDays.map((date, i) => (
          <CalendarDay
            key={i}
            date={date}
            events={events}
            isCurrentMonth={isSameMonth(date, currentDate)}
            onClick={onDayClick}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
};

// Day view component 
const DayView = ({
  events,
  currentDate,
  onPrevDay,
  onNextDay,
  onEventClick,
  onAddEvent,
  onDeleteEvent,
}) => {
  const dayEvents = events.filter((event) =>
    isSameDay(new Date(event.date), currentDate)
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base md:text-xl font-medium">
          <span className="hidden md:inline">{format(currentDate, "EEEE, ")}</span>
          {format(currentDate, "d MMM yyyy")}
        </h2>
        <div className="flex gap-1 md:gap-2">
          <Button variant="outline" size="icon" onClick={onPrevDay} className="h-8 w-8 md:h-9 md:w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => onNextDay(new Date())} className="h-8 md:h-9 text-xs md:text-sm">
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={onNextDay} className="h-8 w-8 md:h-9 md:w-9">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {dayEvents.length > 0 ? (
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-2 pb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{dayEvents.length} event{dayEvents.length > 1 ? 's' : ''} scheduled</h3>
            {dayEvents.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                onClick={onEventClick}
                onDelete={onDeleteEvent}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">
              No events scheduled for today
            </p>
            <Button onClick={() => onAddEvent(currentDate)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Main calendar component
const CalendarView = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [showTimetableEvents, setShowTimetableEvents] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const isDesktop = window.innerWidth >= 768;

  // Load data on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load subjects
        const subjectsData = await getSubjectsFromStorage(
          user?.id,
          user?.syncEnabled
        );
        setSubjects(subjectsData);

        // Load timetable entries
        const timetableData = await getTimetableEntries(
          user?.id,
          user?.syncEnabled
        );
        setTimetableEntries(timetableData);

        // Generate sample events (replace with actual events API later)
        setEvents(generateSampleEvents(subjectsData));
      } catch (error) {
        console.error("Error loading calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Generate timetable events for the calendar
  const getTimetableEventsForCalendar = () => {
    if (!showTimetableEvents || !timetableEntries.length) return [];

    const timetableEvents: CalendarEvent[] = [];

    // For month view - add recurring classes for the whole month
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);

    // Loop through each day of the month
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    for (const date of days) {
      const dayOfWeek = getDay(date);
      // Convert Sunday (0) to 6, and other days to 0-5
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      // Find timetable entries for this day
      const dayEntries = timetableEntries.filter(
        (entry) => entry.day === adjustedDay
      );

      // Create events for each entry
      for (const entry of dayEntries) {
        // Skip entries that aren't recurring if not on current date
        if (!entry.recurring && !isSameDay(date, new Date())) continue;

        const subject = subjects.find((s) => s.id === entry.subjectId);
        if (!subject) continue;

        // Format time for display - include minutes if available
        let startTimeDisplay, endTimeDisplay;
        
        // Handle string format with potential minutes (e.g. "09:30")  
        if (typeof entry.startTime === 'string' && entry.startTime.includes(':')) {
          const [hours, minutes] = entry.startTime.split(':').map(Number);
          const h = hours % 12 || 12;
          const ampm = hours < 12 ? "AM" : "PM";
          startTimeDisplay = `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        } else {
          // Handle number format (e.g. 9)
          const startHour = typeof entry.startTime === 'string' ? 
            parseInt(entry.startTime) : entry.startTime;
          startTimeDisplay = `${startHour % 12 || 12}:00 ${startHour < 12 ? "AM" : "PM"}`;
        }
        
        // Same for end time
        if (typeof entry.endTime === 'string' && entry.endTime.includes(':')) {
          const [hours, minutes] = entry.endTime.split(':').map(Number);
          const h = hours % 12 || 12;
          const ampm = hours < 12 ? "AM" : "PM";
          endTimeDisplay = `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        } else {
          const endHour = typeof entry.endTime === 'string' ? 
            parseInt(entry.endTime) : entry.endTime;
          endTimeDisplay = `${endHour % 12 || 12}:00 ${endHour < 12 ? "AM" : "PM"}`;
        }

        timetableEvents.push({
          id: `timetable-${entry.id}-${format(date, "yyyy-MM-dd")}`,
          title: `${subject.name} ${entry.room ? `(${entry.room})` : ""}`,
          date: date,
          type: "class",
          subjectId: entry.subjectId,
          description: entry.notes,
          color: subject.color,
          time: `${startTimeDisplay} - ${endTimeDisplay}`,
        });
      }
    }

    return timetableEvents;
  };

  // Combine regular events with timetable events
  const allEvents = [...events, ...getTimetableEventsForCalendar()];

  // Navigation functions
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrevDay = () => setCurrentDate(addDays(currentDate, -1));
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const handleDayClick = (date) => {
    setCurrentDate(date);
    setView("day");
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    // Don't allow editing timetable events
    if (event.id.startsWith("timetable-")) {
      return;
    }

    setSelectedEvent(event);
    setIsNewEvent(false);
    setIsEventModalOpen(true);
  };

  // Handle add event
  const handleAddEvent = (date: Date = currentDate) => {
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: "",
      date: date,
      type: "assignment",
      completed: false,
    };

    setSelectedEvent(newEvent);
    setIsNewEvent(true);
    setIsEventModalOpen(true);
  };

  // Save event
  const handleSaveEvent = () => {
    if (!selectedEvent || !selectedEvent.title.trim()) {
      setIsEventModalOpen(false);
      return;
    }

    let updatedEvents;

    if (isNewEvent) {
      updatedEvents = [...events, selectedEvent];
    } else {
      updatedEvents = events.map((event) =>
        event.id === selectedEvent.id ? selectedEvent : event
      );
    }

    setEvents(updatedEvents);
    setIsEventModalOpen(false);

    // Future enhancement: Save events to storage
    // saveEventsToStorage(updatedEvents, user?.id, user?.syncEnabled);
  };

  // Delete event
  const handleDeleteEvent = (eventToDelete: CalendarEvent) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((event) => event.id !== eventToDelete.id));
    }
  };

  if (loading) {
    return (
      <Card className="container mx-auto p-0 border-none shadow-none">
        <CardHeader className="px-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" /> Academic Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="container mx-auto p-0 border-none shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" /> Academic Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              variant={view === "month" ? "default" : "outline"}
              onClick={() => setView("month")}
            >
              Month
            </Button>
            <Button
              variant={view === "day" ? "default" : "outline"}
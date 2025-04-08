import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { useTheme } from "next-themes";
import {
  getTimetableEntries,
  saveTimetableEntries,
  getSubjectsFromStorage,
} from "@/utils/storageUtils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Clock,
  Calendar,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  X,
  Info,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => ({
  label: `${(i + 7) % 12 === 0 ? 12 : (i + 7) % 12}:00 ${
    i + 7 < 12 ? "AM" : "PM"
  }`,
  value: i + 7,
}));

// Type for a timetable entry
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

// Type for the subject info
interface Subject {
  id: string;
  name: string;
  color?: string;
}

const TimetableSlot = ({ entry, subjects, onEdit, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "TIMETABLE_ENTRY",
    item: { id: entry.id, type: "TIMETABLE_ENTRY" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Find subject info
  const subject = subjects.find((s) => s.id === entry.subjectId);
  const duration = entry.endTime - entry.startTime;

  // Calculate a slightly darker color for the border
  const borderColor = subject?.color
    ? darkenColor(subject.color, 20)
    : darkenColor("#4f46e5", 20);

  return (
    <div
      ref={drag}
      className={cn(
        "absolute rounded-md p-1.5 md:p-2 cursor-move flex flex-col",
        "transition-all hover:shadow-lg hover:z-10",
        "border-l-4",
        isDragging ? "opacity-50 scale-105" : "opacity-100",
        "backdrop-blur-sm touch-manipulation"
      )}
      style={{
        top: `${(entry.startTime - 7) * 60}px`,
        height: `${duration * 60}px`,
        left: "2%",
        width: "96%",
        backgroundColor: `${subject?.color || "#4f46e5"}CC`,
        borderLeftColor: borderColor,
        color: getContrastColor(subject?.color || "#4f46e5"),
        boxShadow: isDragging
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-1">
          <GripVertical className="h-2.5 w-2.5 md:h-3 md:w-3 opacity-70" />
          <span className="font-semibold text-xs md:text-sm truncate">
            {subject?.name || "Unknown"}
          </span>
        </div>
        <div className="flex gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entry);
            }}
            className="p-1 rounded-full hover:bg-white/20"
            aria-label="Edit"
          >
            <Edit size={10} className="md:w-3 md:h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
            className="p-1 rounded-full hover:bg-white/20"
            aria-label="Delete"
          >
            <Trash2 size={10} className="md:w-3 md:h-3" />
          </button>
        </div>
      </div>

      {entry.room && (
      )}

      <div className="text-xs mt-auto flex items-center gap-1">
        <Clock className="h-3 w-3 opacity-70" />
        {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
      </div>

      {entry.recurring && (
        <Badge variant="outline" className="mt-1 text-xs bg-white/20 w-fit">
          Recurring
        </Badge>
      )}

      {entry.notes && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-2 bottom-2">
                <Info size={12} className="opacity-70" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-56 text-xs">{entry.notes}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

const TimetableDay = ({
  day,
  dayIndex,
  entries,
  subjects,
  timeHeight,
  onDropEntry,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: "TIMETABLE_ENTRY",
    drop: (item, monitor) => {
      const dropPosition = monitor.getClientOffset();
      const relativeY = dropPosition.y - monitor.getSourceClientOffset().y;
      onDropEntry(item.id, dayIndex, relativeY, timeHeight);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const dayEntries = entries.filter((entry) => entry.day === dayIndex);

  return (
    <div className="w-full min-w-[200px] flex flex-col">
      <div className="p-2 text-center font-semibold bg-muted sticky top-0 z-10">
        {day}
      </div>
      <div
        ref={drop}
        className={cn(
          "relative flex-1 border-r border-border min-h-[840px]",
          isOver && "bg-primary/5"
        )}
        onClick={(e) => {
          // Calculate time from click position
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const hour = Math.floor(y / timeHeight) + 7;

          // Only handle direct clicks on the background
          if (e.target === e.currentTarget) {
            onAddEntry(dayIndex, hour);
          }
        }}
      >
        {TIME_SLOTS.map((slot, i) => (
          <div
            key={i}
            className="absolute w-full border-t border-border opacity-50"
            style={{ top: `${i * timeHeight}px`, height: `${timeHeight}px` }}
          />
        ))}

        {dayEntries.map((entry) => (
          <TimetableSlot
            key={entry.id}
            entry={entry}
            subjects={subjects}
            onEdit={onEditEntry}
            onDelete={onDeleteEntry}
          />
        ))}
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (hour) => {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
};

// Helper function to get contrasting text color
const getContrastColor = (hexColor) => {
  // Default to white if no color
  if (!hexColor) return "#ffffff";

  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? "#000000" : "#ffffff";
};

// Helper function to darken a color
const darkenColor = (hex, percent) => {
  hex = hex.replace("#", "");
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;

  return (
    "#" +
    (
      0x1000000 +
      (R < 0 ? 0 : R) * 0x10000 +
      (G < 0 ? 0 : G) * 0x100 +
      (B < 0 ? 0 : B)
    )
      .toString(16)
      .slice(1)
  );
};

const TimetableView = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimetableEntry | null>(null);
  const [timeHeight, setTimeHeight] = useState(60); // 60px per hour
  const [viewMode, setViewMode] = useState("week"); // 'week' or 'day'
  const [selectedDay, setSelectedDay] = useState(0); // Monday
  const [compactView, setCompactView] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showGuides, setShowGuides] = useState(true);

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        setLoading(true);
        const timetableData = await getTimetableEntries(
          user?.id,
          user?.syncEnabled
        );

        // Also get subjects for display
        const subjectsData = await getSubjectsFromStorage(
          user?.id,
          user?.syncEnabled
        );

        setEntries(timetableData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error loading timetable:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();

    // Adjust time slot height based on screen size
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setTimeHeight(40);
      } else {
        setTimeHeight(60);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [user]);

  useEffect(() => {
    // Update time every minute for the current time indicator
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleAddEntry = (day, hour) => {
    // Create a new entry with default values
    const newEntry: TimetableEntry = {
      id: `entry-${Date.now()}`,
      subjectId: subjects[0]?.id || "",
      day,
      startTime: hour,
      endTime: hour + 1,
      recurring: true,
    };

    setCurrentEntry(newEntry);
    setIsEntryModalOpen(true);
  };

  const handleEditEntry = (entry) => {
    setCurrentEntry(entry);
    setIsEntryModalOpen(true);
  };

  const handleDeleteEntry = async (entryId) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      const updatedEntries = entries.filter((e) => e.id !== entryId);
      setEntries(updatedEntries);

      try {
        await saveTimetableEntries(updatedEntries, user?.id, user?.syncEnabled);
      } catch (error) {
        console.error("Error saving timetable:", error);
      }
    }
  };

  const handleDropEntry = (entryId, newDay, relativeY, timeHeight) => {
    // Find the entry
    const entryIndex = entries.findIndex((e) => e.id === entryId);
    if (entryIndex === -1) return;

    // Calculate new time
    const oldEntry = entries[entryIndex];
    const duration = oldEntry.endTime - oldEntry.startTime;

    // Calculate new start time based on drop position
    const newStartTime = Math.max(
      7,
      Math.min(19, Math.floor(relativeY / timeHeight) + 7)
    );

    // Create updated entry
    const updatedEntry = {
      ...oldEntry,
      day: newDay,
      startTime: newStartTime,
      endTime: Math.min(21, newStartTime + duration),
    };

    // Update entries
    const updatedEntries = [...entries];
    updatedEntries[entryIndex] = updatedEntry;
    setEntries(updatedEntries);

    // Save changes
    saveTimetableEntries(updatedEntries, user?.id, user?.syncEnabled).catch(
      (error) => {
        console.error("Error saving timetable:", error);
      }
    );
  };

  const handleSaveEntry = async () => {
    if (!currentEntry || !currentEntry.subjectId) return;

    let updatedEntries;
    const existingIndex = entries.findIndex((e) => e.id === currentEntry.id);

    if (existingIndex >= 0) {
      // Update existing entry
      updatedEntries = [...entries];
      updatedEntries[existingIndex] = currentEntry;
    } else {
      // Add new entry
      updatedEntries = [...entries, currentEntry];
    }

    setEntries(updatedEntries);
    setIsEntryModalOpen(false);

    try {
      await saveTimetableEntries(updatedEntries, user?.id, user?.syncEnabled);
    } catch (error) {
      console.error("Error saving timetable:", error);
    }
  };

  if (loading) {
    return (
      <Card className="container mx-auto p-0 border-none shadow-none">
        <CardHeader className="px-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Class Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-end px-4 mb-4 gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="flex overflow-x-auto">
            <Skeleton className="w-16 h-[600px] flex-shrink-0" />
            {viewMode === "week" ? (
              Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="min-w-40 flex-1">
                  <Skeleton className="h-10 mb-2" />
                  <div className="px-1">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-24 my-2 w-[98%] mx-auto" />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="min-w-full flex-1">
                <Skeleton className="h-10 mb-2" />
                <div className="px-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-24 my-2 w-[98%] mx-auto" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate current time position for the time indicator
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const todayDayIndex = (currentTime.getDay() + 6) % 7; // Convert to 0-6 where 0 is Monday
  const timePosition = (currentHour - 7) * 60 + currentMinute;
  const showCurrentTimeLine =
    currentHour >= 7 &&
    currentHour < 21 &&
    (viewMode === "week" ||
      (viewMode === "day" && selectedDay === todayDayIndex));

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="container mx-auto p-0 border-none shadow-none">
        <CardHeader className="px-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-5 w-5" /> Class Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-4 gap-2">
            <div className="flex flex-wrap gap-2">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="day">Day View</SelectItem>
                </SelectContent>
              </Select>

              {viewMode === "day" && (
                <Select
                  value={selectedDay.toString()}
                  onValueChange={(v) => setSelectedDay(parseInt(v))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <div className="flex items-center gap-2 mr-2">
                <Label htmlFor="compact-view" className="text-xs">
                  Compact
                </Label>
                <Switch
                  id="compact-view"
                  checked={compactView}
                  onCheckedChange={setCompactView}
                  size="sm"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() =>
                  handleAddEntry(viewMode === "day" ? selectedDay : 0, 9)
                }
              >
                <Plus className="mr-1" size={16} /> Add Class
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden mb-4 mx-4">
            <div className="flex overflow-x-auto relative">
              {/* Time indicators */}
              <div className="sticky left-0 z-10 w-16 bg-card">
                <div className="p-2 text-center font-semibold bg-muted">
                  <span className="sr-only">Time</span>
                  <Clock className="mx-auto h-4 w-4 opacity-70" />
                </div>
                <div
                  className="relative min-h-[840px]"
                  style={{ minHeight: compactView ? "560px" : "840px" }}
                >
                  {TIME_SLOTS.map((slot, i) => (
                    <div
                      key={i}
                      className="absolute w-full pl-1 text-xs border-t border-border flex items-center"
                      style={{
                        top: `${i * (compactView ? 40 : 60)}px`,
                        height: `${compactView ? 40 : 60}px`,
                      }}
                    >
                      {slot.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Days and schedule */}
              {viewMode === "week" ? (
                DAYS.map((day, i) => (
                  <TimetableDay
                    key={i}
                    day={day}
                    dayIndex={i}
                    entries={entries}
                    subjects={subjects}
                    timeHeight={compactView ? 40 : 60}
                    onDropEntry={handleDropEntry}
                    onAddEntry={handleAddEntry}
                    onEditEntry={handleEditEntry}
                    onDeleteEntry={handleDeleteEntry}
                  />
                ))
              ) : (
                <TimetableDay
                  day={DAYS[selectedDay]}
                  dayIndex={selectedDay}
                  entries={entries}
                  subjects={subjects}
                  timeHeight={compactView ? 40 : 60}
                  onDropEntry={handleDropEntry}
                  onAddEntry={handleAddEntry}
                  onEditEntry={handleEditEntry}
                  onDeleteEntry={handleDeleteEntry}
                />
              )}

              {/* Current time indicator */}
              {showCurrentTimeLine && (
                <div
                  className="absolute left-16 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                  style={{
                    top: `${timePosition * (compactView ? 40 / 60 : 1)}px`,
                  }}
                >
                  <div className="absolute -left-2 -top-1 w-2 h-2 rounded-full bg-red-500"></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end px-4 mb-4">
            <p className="text-xs text-muted-foreground">
              Tip: Drag and drop classes to reschedule them
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Entry edit dialog */}
      <Dialog open={isEntryModalOpen} onOpenChange={setIsEntryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentEntry && entries.some((e) => e.id === currentEntry.id)
                ? "Edit Class Schedule"
                : "Add Class Schedule"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for this class schedule.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={currentEntry?.subjectId || ""}
                onValueChange={(v) =>
                  setCurrentEntry({ ...currentEntry!, subjectId: v })
                }
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        {subject.color && (
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          ></span>
                        )}
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="day">Day</Label>
                <Select
                  value={currentEntry?.day?.toString() || "0"}
                  onValueChange={(v) =>
                    setCurrentEntry({ ...currentEntry!, day: parseInt(v) })
                  }
                >
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="recurring">Recurring</Label>
                <div className="flex h-9 items-center space-x-2 border rounded-md px-3">
                  <Switch
                    id="recurring"
                    checked={currentEntry?.recurring ?? true}
                    onCheckedChange={(checked) =>
                      setCurrentEntry({ ...currentEntry!, recurring: checked })
                    }
                  />
                  <Label htmlFor="recurring" className="cursor-pointer">
                    Weekly
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Select
                  value={currentEntry?.startTime?.toString() || "9"}
                  onValueChange={(v) => {
                    const startTime = parseInt(v);
                    const endTime = Math.max(
                      startTime + 1,
                      currentEntry?.endTime || 0
                    );
                    setCurrentEntry({ ...currentEntry!, startTime, endTime });
                  }}
                >
                  <SelectTrigger id="startTime">
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem
                        key={slot.value}
                        value={slot.value.toString()}
                      >
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Select
                  value={currentEntry?.endTime?.toString() || "10"}
                  onValueChange={(v) =>
                    setCurrentEntry({ ...currentEntry!, endTime: parseInt(v) })
                  }
                >
                  <SelectTrigger id="endTime">
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.filter(
                      (slot) => slot.value > (currentEntry?.startTime || 0)
                    ).map((slot) => (
                      <SelectItem
                        key={slot.value}
                        value={slot.value.toString()}
                      >
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="room">Room (optional)</Label>
              <Input
                id="room"
                value={currentEntry?.room || ""}
                onChange={(e) =>
                  setCurrentEntry({ ...currentEntry!, room: e.target.value })
                }
                placeholder="e.g., Room 101"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={currentEntry?.notes || ""}
                onChange={(e) =>
                  setCurrentEntry({ ...currentEntry!, notes: e.target.value })
                }
                placeholder="Additional information"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEntryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEntry}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
};

export default TimetableView;

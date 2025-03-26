"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimetableEntry } from "@/types/grades";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ColorPicker, SUBJECT_COLORS } from "@/components/ColorPicker";

interface TimetableFormProps {
  onSubmit: (entry: Omit<TimetableEntry, "id" | "subjectId">) => void;
  onCancel: () => void;
  initialEntry?: Omit<TimetableEntry, "id" | "subjectId">;
  isEditing?: boolean;
}

export function TimetableForm({
  onSubmit,
  onCancel,
  initialEntry,
  isEditing = false,
}: TimetableFormProps) {
  // Initialize startTime/endTime properly handling both string and number formats
  const [day, setDay] = useState<number>(initialEntry?.day ?? 0);
  const [startTime, setStartTime] = useState(() => {
    if (initialEntry?.startTime) {
      // If it's a number, convert to time string format
      if (typeof initialEntry.startTime === "number") {
        const hour = initialEntry.startTime;
        return `${hour.toString().padStart(2, "0")}:00`;
      }
      // Otherwise assume it's already a properly formatted time string
      return initialEntry.startTime;
    }
    return "08:00"; // Default
  });

  const [endTime, setEndTime] = useState(() => {
    if (initialEntry?.endTime) {
      if (typeof initialEntry.endTime === "number") {
        const hour = initialEntry.endTime;
        return `${hour.toString().padStart(2, "0")}:00`;
      }
      return initialEntry.endTime;
    }
    return "08:45"; // Default
  });
  const [room, setRoom] = useState(initialEntry?.room || "");
  const [notes, setNotes] = useState(initialEntry?.notes || "");
  const [recurring, setRecurring] = useState(initialEntry?.recurring ?? true);
  const [color, setColor] = useState(initialEntry?.color || SUBJECT_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically calculate end time when start time changes (45-minute lessons)
  useEffect(() => {
    if (!startTime) return;

    try {
      const [hours, minutes] = startTime.split(":").map(Number);

      // Add 45 minutes
      let newMinutes = minutes + 45;
      let newHours = hours;

      // Handle overflow
      if (newMinutes >= 60) {
        newHours = (newHours + 1) % 24;
        newMinutes = newMinutes % 60;
      }

      // Format as HH:MM
      const newEndTime = `${newHours.toString().padStart(2, "0")}:${newMinutes
        .toString()
        .padStart(2, "0")}`;
      setEndTime(newEndTime);
    } catch (error) {
      console.error("Error calculating end time:", error);
    }
  }, [startTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Fix validation - day can be 0 which is falsy but valid
    if (day === undefined || day === null || !startTime || !endTime) {
      alert("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Create entry object
    const entry: Omit<TimetableEntry, "id" | "subjectId"> = {
      day,
      startTime,
      endTime,
      room: room || undefined,
      notes: notes || undefined,
      recurring,
      color, // Include color in the entry
    };

    onSubmit(entry);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="day">Day of Week</Label>
        <Select
          value={day.toString()}
          onValueChange={(v) => setDay(parseInt(v))}
        >
          <SelectTrigger id="day">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Monday</SelectItem>
            <SelectItem value="1">Tuesday</SelectItem>
            <SelectItem value="2">Wednesday</SelectItem>
            <SelectItem value="3">Thursday</SelectItem>
            <SelectItem value="4">Friday</SelectItem>
            <SelectItem value="5">Saturday</SelectItem>
            <SelectItem value="6">Sunday</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="room">Room (Optional)</Label>
          <ColorPicker color={color} onChange={setColor} />
        </div>
        <Input
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="e.g., Room 101"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={recurring}
          onCheckedChange={setRecurring}
        />
        <Label htmlFor="recurring">Recurring weekly class</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update" : "Add"} Class
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
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
  const [day, setDay] = useState<TimetableEntry["day"]>(
    initialEntry?.day || "monday"
  );
  const [startTime, setStartTime] = useState(
    initialEntry?.startTime || "09:00"
  );
  const [endTime, setEndTime] = useState(initialEntry?.endTime || "10:30");
  const [room, setRoom] = useState(initialEntry?.room || "");
  const [notes, setNotes] = useState(initialEntry?.notes || "");
  const [recurring, setRecurring] = useState(initialEntry?.recurring ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!day || !startTime || !endTime) {
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
    };

    onSubmit(entry);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="day">Day of Week</Label>
        <Select
          value={day}
          onValueChange={(value) => setDay(value as TimetableEntry["day"])}
        >
          <SelectTrigger id="day">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monday">Monday</SelectItem>
            <SelectItem value="tuesday">Tuesday</SelectItem>
            <SelectItem value="wednesday">Wednesday</SelectItem>
            <SelectItem value="thursday">Thursday</SelectItem>
            <SelectItem value="friday">Friday</SelectItem>
            <SelectItem value="saturday">Saturday</SelectItem>
            <SelectItem value="sunday">Sunday</SelectItem>
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
        <Label htmlFor="room">Room (Optional)</Label>
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

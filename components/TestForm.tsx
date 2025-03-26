"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Subject, Test } from "@/types/grades";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SimpleDatePicker } from "@/components/SimpleDatePicker";

interface TestFormProps {
  onSubmit: (test: Omit<Test, "id">) => void;
  onCancel: () => void;
  subjects: Subject[];
  initialTest?: Partial<Test>;
  isEditing?: boolean;
}

export function TestForm({
  onSubmit,
  onCancel,
  subjects,
  initialTest,
  isEditing = false,
}: TestFormProps) {
  // Parse dates properly to avoid invalid date objects
  const parseDate = (dateString?: string): Date | undefined => {
    if (!dateString) return new Date();

    try {
      const parsedDate = parseISO(dateString);
      return isValid(parsedDate) ? parsedDate : new Date();
    } catch {
      return new Date();
    }
  };

  const [title, setTitle] = useState(initialTest?.title || "");
  const [description, setDescription] = useState(
    initialTest?.description || ""
  );
  const [date, setDate] = useState<Date | undefined>(
    parseDate(initialTest?.date)
  );
  const [subjectId, setSubjectId] = useState(initialTest?.subjectId || "");
  const [completed, setCompleted] = useState(initialTest?.completed || false);
  const [priority, setPriority] = useState<"high" | "medium" | "low">(
    initialTest?.priority || "medium"
  );
  const [reminderEnabled, setReminderEnabled] = useState(
    initialTest?.reminderEnabled || false
  );
  const [reminderDate, setReminderDate] = useState<Date | undefined>(
    initialTest?.reminderDate ? parseDate(initialTest.reminderDate) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title || !date || !subjectId) {
      alert("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Create test object
    const test: Omit<Test, "id"> = {
      title,
      description: description || undefined,
      date: date.toISOString(),
      subjectId,
      completed,
      priority,
      reminderEnabled,
      reminderDate: reminderDate ? reminderDate.toISOString() : undefined,
    };

    onSubmit(test);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="required">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Test title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="required">
          Subject
        </Label>
        <Select value={subjectId} onValueChange={setSubjectId} required>
          <SelectTrigger id="subject">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                <div className="flex items-center gap-2">
                  {subject.color && (
                    <span
                      className="h-3 w-3 rounded-full"
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

      <div className="space-y-2">
        <Label htmlFor="date" className="required">
          Test Date
        </Label>
        <SimpleDatePicker
          date={date}
          onDateChange={(newDate) => newDate && setDate(newDate)}
          placeholder="Pick a test date"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <RadioGroup
          value={priority}
          onValueChange={(value) =>
            setPriority(value as "high" | "medium" | "low")
          }
          className="flex space-x-2"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="high" id="high" />
            <Label htmlFor="high" className="text-red-500">
              High
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium" className="text-amber-500">
              Medium
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="low" id="low" />
            <Label htmlFor="low" className="text-green-500">
              Low
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details about the test"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="reminder"
            checked={reminderEnabled}
            onCheckedChange={setReminderEnabled}
          />
          <Label htmlFor="reminder">Enable Reminder</Label>
        </div>

        {reminderEnabled && (
          <div className="mt-2">
            <Label htmlFor="reminder-date">Reminder Date</Label>
            <SimpleDatePicker
              date={reminderDate}
              onDateChange={setReminderDate}
              placeholder="Pick a reminder date"
              disabledDates={(date) => date < new Date()}
              className="mt-1"
            />
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center space-x-2">
          <Switch
            id="completed"
            checked={completed}
            onCheckedChange={setCompleted}
          />
          <Label htmlFor="completed">Mark as Completed</Label>
        </div>
      )}

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
          {isSubmitting ? "Saving..." : isEditing ? "Update Test" : "Add Test"}
        </Button>
      </div>
    </form>
  );
}

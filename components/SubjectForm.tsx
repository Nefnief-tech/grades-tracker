"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { addNewSubject } from "@/utils/storageUtils";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker, SUBJECT_COLORS } from "@/components/ColorPicker";

interface SubjectFormProps {
  onSubjectAdded: () => void;
}

export function SubjectForm({ onSubjectAdded }: SubjectFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastSubmissionRef = useRef<{ name: string; time: number } | null>(null);
  const [description, setDescription] = useState("");
  const [teacher, setTeacher] = useState("");
  const [room, setRoom] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);

  // Keep track of form submission status for instant feedback
  const formSubmissionRef = useRef<{ name: string; timestamp: number } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }

    // Prevent duplicate submissions within 5 seconds
    const now = Date.now();
    if (
      lastSubmissionRef.current &&
      lastSubmissionRef.current.name === trimmedName &&
      now - lastSubmissionRef.current.time < 5000
    ) {
      toast({
        title: "Info",
        description:
          "This subject was just added. Please wait a moment before trying again.",
      });
      return;
    }

    if (isSubmitting || isProcessing) return;
    setIsSubmitting(true);
    setIsProcessing(true);

    // Update submission tracking
    lastSubmissionRef.current = {
      name: trimmedName,
      time: now,
    };

    // Store submission info for optimistic updates
    formSubmissionRef.current = {
      name: trimmedName,
      timestamp: now,
    };

    // Clear input immediately for better UX
    setName("");

    // Show optimistic toast immediately
    const toastId = toast({
      title: "Creating subject...",
      description: trimmedName,
    });

    try {
      // Create a new subject with color
      const newSubject = {
        name: trimmedName,
        description: description || undefined,
        teacher: teacher || undefined,
        room: room || undefined,
        color: color,
      };

      // Use addNewSubject instead of saveSubjectToStorage
      await addNewSubject(newSubject, user?.id, user?.syncEnabled);

      // Callback for UI refresh
      onSubjectAdded();

      // Update success toast - uses same toast ID to replace
      toast({
        id: toastId,
        title: "Success",
        description: `${trimmedName} added successfully`,
        variant: "default",
      });
    } catch (error: any) {
      // Restore form state on error
      if (formSubmissionRef.current?.timestamp === now) {
        setName(trimmedName);
      }

      // Show error toast
      toast({
        id: toastId,
        title: "Error",
        description:
          error.message || "Failed to add subject. Please try again.",
        variant: "destructive",
      });

      console.error("Error adding subject:", error);
    } finally {
      setIsSubmitting(false);

      // Add a delay before allowing new submissions
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);

      formSubmissionRef.current = null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="name">Subject Name</Label>

          {/* Use the ColorPicker component */}
          <ColorPicker color={color} onChange={setColor} />
        </div>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Mathematics"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the subject"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="teacher">Teacher (Optional)</Label>
          <Input
            id="teacher"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            placeholder="Teacher's name"
          />
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
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {}}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Add Subject"}
        </Button>
      </div>
    </form>
  );
}

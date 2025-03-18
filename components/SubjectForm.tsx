"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { addNewSubject } from "@/utils/storageUtils";
import { useToast } from "@/components/ui/use-toast";

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
      // Use addNewSubject instead of saveSubjectToStorage
      await addNewSubject(trimmedName, user?.id, user?.syncEnabled);

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
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          placeholder="Enter subject name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Subject"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveGradeToSubject } from "@/utils/storageUtils";
import { useToast } from "@/components/ui/use-toast";
import { ID } from "appwrite";

interface GradeFormProps {
  subjectId: string;
  onGradeAdded: () => void;
}

export function GradeForm({ subjectId, onGradeAdded }: GradeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [type, setType] = useState("assignment");
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optimisticGrades, setOptimisticGrades] = useState<any[]>([]);

  // Set current date when component mounts
  useEffect(() => {
    // Format the current date as YYYY-MM-DD for the date input
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, "0");

    setDate(`${year}-${month}-${day}`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const gradeValue = parseFloat(value);

    if (isNaN(gradeValue) || gradeValue < 1 || gradeValue > 6) {
      toast({
        title: "Error",
        description: "Please enter a valid grade between 1 and 6",
        variant: "destructive",
      });
      return;
    }

    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const weight = type === "test" ? 2.0 : 1.0;
      const gradeId = ID.unique();

      // Create the grade object
      const newGrade = {
        id: gradeId,
        value: gradeValue,
        type,
        date,
        weight,
      };

      // Show optimistic update immediately
      setOptimisticGrades((prev) => [...prev, newGrade]);

      // Show success toast immediately for responsive feedback
      toast({
        title: "Grade added",
        description: "Your grade has been recorded",
      });

      // Reset form right away
      setValue("");
      setType("assignment");

      // Trigger callback to update UI (parent components)
      onGradeAdded();

      // Perform the actual save operation asynchronously
      await saveGradeToSubject(
        subjectId,
        newGrade,
        user?.id,
        user?.syncEnabled
      );

      // Clear the optimistic grade after successful save
      setOptimisticGrades((prev) => prev.filter((g) => g.id !== gradeId));
    } catch (error) {
      console.error("Error adding grade:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add grade. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Always ensure we clear the submitting state
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardContent className="pt-4 transition-all">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="grade"
                  className="block text-sm font-medium mb-1"
                >
                  Grade Value
                </label>
                <Input
                  id="grade"
                  type="number"
                  min="1"
                  max="6"
                  step="0.1"
                  placeholder="1.0 - 6.0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  className="transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium mb-1"
                >
                  Grade Type
                </label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="transition-all">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test (x2)</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="homework">Homework</SelectItem>
                    <SelectItem value="participation">Participation</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium mb-1"
                >
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="transition-all"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="transition-all relative"
          >
            <span className={isSubmitting ? "opacity-0" : "opacity-100"}>
              Add Grade
            </span>
            {isSubmitting && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

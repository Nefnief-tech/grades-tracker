"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveGradeToSubject, debugSubjects } from "@/utils/storageUtils";
import { format } from "date-fns";
import type { GradeType, Grade } from "@/types/grades";

interface GradeFormProps {
  subjectId: string;
  onGradeAdded: () => void;
}

export function GradeForm({ subjectId, onGradeAdded }: GradeFormProps) {
  const { user } = useAuth();
  const [value, setValue] = useState<number | "">("");
  const [type, setType] = useState<GradeType>("Test");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (value === "" || value < 1 || value > 6) {
      setError("Grade must be between 1 and 6");
      return;
    }

    // Use fixed weights only
    const weight = type === "Test" ? 2.0 : 1.0;

    setIsLoading(true);

    try {
      console.log("Creating new grade:", {
        value: Number(value),
        type,
        weight,
      });

      // Generate a truly unique ID
      const randomId = `grade_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const newGrade: Grade = {
        id: randomId,
        value: Number(value),
        type: type,
        date: format(new Date(), "yyyy-MM-dd"),
        weight: weight,
      };

      // Save the grade
      await saveGradeToSubject(
        subjectId,
        newGrade,
        user?.id,
        user?.syncEnabled
      );

      console.log("Grade saved successfully:", newGrade);

      // Clear form
      setValue("");
      setType("Test");

      // Force a refresh
      setTimeout(() => {
        onGradeAdded();
        console.log("Grade add callback triggered");
      }, 100);
    } catch (err: any) {
      console.error("Error saving grade:", err);
      setError("Failed to save grade. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="grade-value">Grade Value (1-6)</Label>
          <Input
            id="grade-value"
            type="number"
            min="1"
            max="6"
            step="0.1"
            placeholder="4.5"
            value={value}
            onChange={(e) =>
              setValue(e.target.value ? Number(e.target.value) : "")
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade-type">Grade Type</Label>
          <Select
            value={type}
            onValueChange={(val) => setType(val as GradeType)}
          >
            <SelectTrigger id="grade-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Test">Test (Weight: 2.0)</SelectItem>
              <SelectItem value="Oral Exam">Oral Exam (Weight: 1.0)</SelectItem>
              <SelectItem value="Homework">Homework (Weight: 1.0)</SelectItem>
              <SelectItem value="Project">Project (Weight: 1.0)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Tests are weighted 2.0, all other assignments 1.0
          </p>
        </div>

        <div className="p-3 bg-muted/20 rounded-md">
          <div className="text-sm flex justify-between">
            <span>Selected Weight:</span>
            <span className="font-medium">
              {type === "Test" ? "2.0" : "1.0"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Add Grade"}
        </Button>
      </CardFooter>
    </form>
  );
}

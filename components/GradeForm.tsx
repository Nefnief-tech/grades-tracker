"use client";

import React, { useState } from "react";
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
import { saveGradeToSubject } from "@/utils/storageUtils";
import { format } from "date-fns";
import type { GradeType, Grade } from "@/types/grades"; // Import from types/grades.ts

// Define a proper Grade interface that matches what's in types/grades.ts
interface GradeFormProps {
  subjectId: string;
  onGradeAdded: () => void;
}

export function GradeForm({ subjectId, onGradeAdded }: GradeFormProps) {
  const { user } = useAuth();
  const [value, setValue] = useState<number | "">("");
  const [type, setType] = useState<GradeType>("Test"); // Use the imported GradeType
  const [weight, setWeight] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (value === "" || value < 1 || value > 6) {
      setError("Grade must be between 1 and 6");
      return;
    }

    setIsLoading(true);

    try {
      const newGrade: Grade = {
        id: Math.random().toString(36).substring(2, 9),
        value: Number(value),
        type: type, // Now this is compatible with types/grades.ts
        date: format(new Date(), "yyyy-MM-dd"),
        weight: Number(weight),
      };

      await saveGradeToSubject(
        subjectId,
        newGrade,
        user?.id,
        user?.syncEnabled
      );

      // Clear form after successful submission
      setValue("");
      setType("Test"); // Update to match imported GradeType
      setWeight(1);

      // Notify parent component
      onGradeAdded();

      // Dispatch event for listeners
      window.dispatchEvent(
        new CustomEvent("gradeAdded", { detail: { subjectId } })
      );
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
              <SelectItem value="Test">Test</SelectItem>
              <SelectItem value="Oral Exam">Oral Exam</SelectItem>
              <SelectItem value="Homework">Homework</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade-weight">Weight</Label>
          <Input
            id="grade-weight"
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            placeholder="1.0"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            required
          />
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

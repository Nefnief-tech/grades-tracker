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
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate input
    if (value === "" || value < 1 || value > 6) {
      setError("Grade must be between 1 and 6");
      return;
    }

    console.clear(); // Clear console for easier debugging
    console.log("=== MANUAL GRADE SAVE PROCESS STARTED ===");
    console.log("Subject ID:", subjectId);
    console.log("Grade Value:", value);
    console.log("Grade Type:", type);

    setIsLoading(true);

    try {
      // Create a unique grade ID
      const uniqueId = `grade_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 11)}`;

      // Create the grade object
      const newGrade: Grade = {
        id: uniqueId,
        value: Number(value),
        type: type,
        date: format(new Date(), "yyyy-MM-dd"),
        weight: type === "Test" ? 2.0 : 1.0,
      };

      console.log("New Grade Object:", newGrade);

      // DIRECT STORAGE - No API calls, no utility functions
      const STORAGE_KEY = "gradeCalculator";

      // Get existing data from localStorage
      const localStorageData = localStorage.getItem(STORAGE_KEY);
      console.log("Found data in localStorage:", !!localStorageData);

      if (!localStorageData) {
        throw new Error("No data found in localStorage!");
      }

      // Parse the data
      const allSubjects = JSON.parse(localStorageData);
      console.log("Total subjects in storage:", allSubjects?.length || 0);

      if (!Array.isArray(allSubjects)) {
        throw new Error("Invalid data format in localStorage!");
      }

      // Find the subject
      const subjectIndex = allSubjects.findIndex((s) => s.id === subjectId);
      console.log("Subject index:", subjectIndex);

      if (subjectIndex === -1) {
        throw new Error(`Subject with ID ${subjectId} not found!`);
      }

      // Add the grade
      if (!allSubjects[subjectIndex].grades) {
        allSubjects[subjectIndex].grades = [];
      }

      // Push the new grade
      allSubjects[subjectIndex].grades.push(newGrade);
      console.log(
        "Added grade to subject. New total grades:",
        allSubjects[subjectIndex].grades.length
      );

      // Calculate new average
      const grades = allSubjects[subjectIndex].grades;
      let weightedSum = 0;
      let totalWeight = 0;

      for (const g of grades) {
        const w = g.weight || 1.0;
        weightedSum += g.value * w;
        totalWeight += w;
      }

      allSubjects[subjectIndex].averageGrade =
        totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;

      console.log("New average grade:", allSubjects[subjectIndex].averageGrade);

      // Save back to localStorage
      const updatedData = JSON.stringify(allSubjects);
      localStorage.setItem(STORAGE_KEY, updatedData);
      console.log("Successfully saved to localStorage");

      // EXPLICITLY TRIGGER CLOUD SYNC
      if (user?.syncEnabled) {
        try {
          console.log("🔄 EXPLICITLY SYNCING TO CLOUD");

          try {
            // Import directly from file to avoid circular dependencies
            const { syncSubjectsToCloud } = await import("@/lib/appwrite");

            // Execute explicit cloud sync
            const syncResult = await syncSubjectsToCloud(user.id, allSubjects);
            console.log(
              "☁️ CLOUD SYNC RESULT:",
              syncResult ? "Success" : "Failed"
            );

            // Manually update last sync timestamp
            localStorage.setItem("lastSyncTimestamp", new Date().toISOString());
          } catch (syncError) {
            console.error("💥 CLOUD SYNC ERROR:", syncError);
            // Continue anyway - we already saved to localStorage
          }
        } catch (importError) {
          console.error("Failed to import cloud sync function:", importError);
        }
      }

      // Clear form
      setValue("");
      setType("Test");

      // Show success message
      setSuccess(`Grade ${value} added successfully! Page will reload.`);

      // Wait for user to see success message, then reload page
      setTimeout(() => {
        console.log("Reloading page to show updated data...");
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error("ERROR SAVING GRADE:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save grade. Please try again."
      );
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

        {success && (
          <Alert
            variant="default"
            className="bg-green-50 border-green-200 text-green-800"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
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
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !!success}
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
              Saving...
            </span>
          ) : success ? (
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Saved!
            </span>
          ) : (
            "Add Grade"
          )}
        </Button>
      </CardFooter>
    </form>
  );
}

"use client";

import { useState } from "react";
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
import { addGradeToSubject } from "@/utils/storageUtils";

interface GradeFormProps {
  subjectId: string;
  onSuccess?: () => void;
}

export function GradeForm({ subjectId, onSuccess }: GradeFormProps) {
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [type, setType] = useState("Test");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!value) {
      setError("Please enter a grade value");
      return;
    }

    const gradeValue = parseFloat(value);
    if (isNaN(gradeValue) || gradeValue < 1 || gradeValue > 6) {
      setError("Grade must be between 1 and 6");
      return;
    }

    setSubmitting(true);
    try {
      const weight = type === "Test" ? 2.0 : 1.0; // Tests count double

      const success = await addGradeToSubject(
        subjectId,
        {
          value: gradeValue,
          type,
          date: new Date().toISOString(),
          weight,
        },
        user?.id,
        user?.syncEnabled
      );

      if (success) {
        setValue("");
        setType("Test");
        if (onSuccess) onSuccess();
      } else {
        setError("Failed to add grade");
      }
    } catch (error) {
      console.error("Error adding grade:", error);
      setError("Failed to add grade");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-card">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4">
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Test">Test (x2)</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Homework">Homework</SelectItem>
                    <SelectItem value="Participation">Participation</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Grade"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

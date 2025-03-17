"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GradeInput } from "./GradeInput";
import type { Grade, Subject } from "../types/grades";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getSubjectById,
  addGradeToSubject,
  deleteGradeFromSubject,
} from "../utils/storageUtils";
import { Trash2, BookOpen, AlertCircle, LineChart, Info } from "lucide-react";
import { GradeHistoryChart } from "./GradeHistoryChart";

interface SubjectPageProps {
  subjectId: string;
}

function getGradeColor(grade: number): string {
  if (grade <= 1.5) return "bg-green-500";
  if (grade <= 2.5) return "bg-yellow-500";
  if (grade <= 3.5) return "bg-orange-500";
  return "bg-red-500";
}

export function SubjectPage({ subjectId }: SubjectPageProps) {
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Load subject data
  useEffect(() => {
    const loadSubject = async () => {
      try {
        const loadedSubject = await getSubjectById(
          subjectId,
          user?.id,
          user?.syncEnabled
        );
        setSubject(loadedSubject);
      } catch (error) {
        console.error("Error loading subject:", error);
        setSubject(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubject();
    // Retry mechanism for newly created subjects
    if (!subject && retryCount < 3) {
      const retryTimer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(retryTimer);
    }
  }, [subjectId, retryCount, user?.id, user?.syncEnabled]);

  // Listen for sync preference changes
  useEffect(() => {
    const handleSyncChange = async () => {
      const loadedSubject = await getSubjectById(subjectId);
      setSubject(loadedSubject);
    };

    window.addEventListener("syncPreferenceChanged", handleSyncChange);
    return () => {
      window.removeEventListener("syncPreferenceChanged", handleSyncChange);
    };
  }, [subjectId]);

  // Add a new grade
  const handleAddGrade = async (newGrade: Grade) => {
    console.log("SubjectPage received grade:", newGrade);
    if (subject) {
      console.log("Adding grade to subject:", subject.id);
      try {
        const success = await addGradeToSubject(
          subject.id,
          newGrade,
          user?.id,
          user?.syncEnabled
        );
        console.log("Grade added successfully:", success);
        if (success) {
          // Reload the subject to get updated data
          const updatedSubject = await getSubjectById(subject.id);
          console.log("Updated subject:", updatedSubject);
          setSubject(updatedSubject);
        }
      } catch (error) {
        console.error("Error adding grade:", error);
      }
    }
  };

  // Delete a grade
  const handleDeleteGrade = async (index: number) => {
    if (subject) {
      console.log("Deleting grade at index:", index);
      try {
        const success = await deleteGradeFromSubject(
          subject.id,
          index,
          user?.id,
          user?.syncEnabled
        );
        console.log("Grade deleted successfully:", success);
        if (success) {
          // Reload the subject to get updated data
          const updatedSubject = await getSubjectById(subject.id);
          setSubject(updatedSubject);
        }
      } catch (error) {
        console.error("Error deleting grade:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="mb-2">Loading subject data...</p>
          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Attempt {retryCount} of 5
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">Subject Not Found</h2>
        <p className="text-muted-foreground">
          The requested subject could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full px-4 sm:px-6 md:px-8 py-4 md:py-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          {subject.name}
        </h1>
        <div className="text-sm md:text-base text-muted-foreground">
          Manage grades for {subject.name}. Current average:
          {subject.averageGrade !== undefined && subject.averageGrade > 0 ? (
            <Badge
              className={`${getGradeColor(
                subject.averageGrade
              )} text-white ml-2`}
            >
              {subject.averageGrade.toFixed(2)}
            </Badge>
          ) : (
            <span className="ml-2">No grades yet</span>
          )}
        </div>
      </div>

      {/* Grade History Chart */}
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <LineChart className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Grade History
          </CardTitle>
          <CardDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs md:text-sm">
            <span>Visualization of your grade progression over time</span>
            <div className="inline-flex items-center text-xs bg-muted/40 px-2 py-1 rounded-md">
              <Info className="h-3 w-3 mr-1 text-primary" />
              <span>Up = Good (1), Down = Poor (6)</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-[200px] sm:h-[250px] md:h-[300px]">
            <GradeHistoryChart
              grades={subject.grades}
              height={200}
              className="sm:h-[250px] md:h-[300px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg md:text-xl">Add New Grade</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Enter a grade between 1 and 6 (1 is best, 6 is worst)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <GradeInput onAddGrade={handleAddGrade} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold">Grade History</h2>

        {subject.grades.length > 0 ? (
          <Card className="bg-card border-border shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/70">
                    <TableHead>Type</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subject.grades.map((grade, index) => (
                    <TableRow key={index} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-xs md:text-sm">
                        {grade.type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getGradeColor(
                            grade.value
                          )} text-white text-xs`}
                        >
                          {grade.value}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">
                        {grade.weight || 1.0}x
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">
                        {grade.date}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGrade(index)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-7 w-7 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <Card className="bg-card border-border p-4 sm:p-8 text-center">
            <p className="text-sm md:text-base text-muted-foreground">
              No grades recorded yet. Add your first grade above.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

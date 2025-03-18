"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { deleteGradeFromSubject } from "@/utils/storageUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GradeTableProps {
  grades: Array<{
    id: string;
    value: number;
    type: string;
    date: string;
    weight: number;
  }>;
  subjectId: string;
  onGradeDeleted: () => void;
}

export function GradeTable({
  grades,
  subjectId,
  onGradeDeleted,
}: GradeTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // Sort grades by date, most recent first
  const sortedGrades = [...grades].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleDeleteGrade = async (index: number) => {
    setIsDeleting(true);
    setDeletingIndex(index);

    try {
      const success = await deleteGradeFromSubject(
        subjectId,
        index,
        user?.id,
        user?.syncEnabled
      );

      if (success) {
        toast({
          title: "Grade deleted",
          description: "The grade has been successfully deleted.",
        });

        // Call the callback to refresh the data
        onGradeDeleted();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the grade. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting grade:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingIndex(null);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get grade color class
  const getGradeColorClass = (value: number) => {
    if (value <= 1.5) return "text-green-600 dark:text-green-400";
    if (value <= 2.5) return "text-blue-600 dark:text-blue-400";
    if (value <= 3.5) return "text-yellow-600 dark:text-yellow-400";
    if (value <= 4.5) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  // Helper function to format grade type
  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableCaption>
          {grades.length === 0
            ? "No grades recorded yet. Add your first grade above."
            : `A list of all grades for this subject. Total: ${grades.length}`}
        </TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Grade</TableHead>
            <TableHead className="text-center">Weight</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedGrades.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No grades recorded yet
              </TableCell>
            </TableRow>
          ) : (
            sortedGrades.map((grade, index) => (
              <TableRow
                key={`${grade.date}-${grade.type}-${grade.value}-${index}`}
              >
                <TableCell>{formatDate(grade.date)}</TableCell>
                <TableCell>{formatType(grade.type)}</TableCell>
                <TableCell
                  className={`text-center font-medium ${getGradeColorClass(
                    grade.value
                  )}`}
                >
                  {grade.value.toFixed(1)}
                </TableCell>
                <TableCell className="text-center">
                  {grade.weight === 2 ? (
                    <span className="font-semibold">{grade.weight}x</span>
                  ) : (
                    <span>{grade.weight}x</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={isDeleting && deletingIndex === index}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Grade</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this grade? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteGrade(index)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

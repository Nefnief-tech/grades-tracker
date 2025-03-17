"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { deleteGradeFromSubject } from "@/utils/storageUtils";
import type { Grade } from "@/types/grades";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GradeListProps {
  subjectId: string;
  grades: Grade[];
  onGradeDeleted?: () => void;
}

export function GradeList({
  subjectId,
  grades,
  onGradeDeleted,
}: GradeListProps) {
  const { user } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [gradeIndexToDelete, setGradeIndexToDelete] = useState<number | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Sort grades by date (newest first)
  const sortedGrades = [...grades].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const confirmDelete = (index: number) => {
    setGradeIndexToDelete(index);
    setIsConfirmOpen(true);
  };

  const handleDeleteGrade = async () => {
    if (gradeIndexToDelete === null) return;

    setIsDeleting(true);
    try {
      const success = await deleteGradeFromSubject(
        subjectId,
        gradeIndexToDelete,
        user?.id,
        user?.syncEnabled
      );

      if (success && onGradeDeleted) {
        onGradeDeleted();
      }
    } catch (error) {
      console.error("Error deleting grade:", error);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setGradeIndexToDelete(null);
    }
  };

  if (grades.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">No grades yet</p>
    );
  }

  return (
    <>
      <div className="max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grade</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGrades.map((grade, index) => (
              <TableRow key={`${grade.date}-${index}`}>
                <TableCell className="font-medium">
                  {grade.value.toFixed(1)}
                </TableCell>
                <TableCell>{grade.type}</TableCell>
                <TableCell>
                  {new Date(grade.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDelete(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this grade? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGrade}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

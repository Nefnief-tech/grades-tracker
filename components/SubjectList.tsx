"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { deleteSubject } from "@/utils/storageUtils";
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
import type { Subject } from "@/types/grades";
import { GradeHistoryChart } from "./GradeHistoryChart";

interface SubjectListProps {
  subjects: Subject[];
  onSubjectDeleted: () => void;
}

export function SubjectList({ subjects, onSubjectDeleted }: SubjectListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteSubject(
        subjectToDelete,
        user?.id,
        user?.syncEnabled
      );

      if (success) {
        onSubjectDeleted();
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setSubjectToDelete(null);
    }
  };

  const confirmDelete = (subjectId: string) => {
    setSubjectToDelete(subjectId);
    setIsConfirmOpen(true);
  };

  function getGradeColor(grade: number): string {
    if (grade <= 1.5) return "bg-green-500";
    if (grade <= 2.5) return "bg-yellow-500";
    if (grade <= 3.5) return "bg-orange-500";
    return "bg-red-500";
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card
            key={subject.id}
            className="bg-card border-border overflow-hidden hover:shadow-lg transition-all duration-300 group rounded-2xl relative"
          >
            <CardHeader className="p-6 pb-3">
              <div className="flex justify-between items-center">
                <CardTitle
                  className="text-lg md:text-xl cursor-pointer hover:text-primary"
                  onClick={() => router.push(`/subjects/${subject.id}`)}
                >
                  {subject.name}
                </CardTitle>
                {subject.averageGrade !== undefined &&
                  subject.averageGrade > 0 && (
                    <Badge
                      className={`${getGradeColor(
                        subject.averageGrade
                      )} text-white`}
                    >
                      {subject.averageGrade.toFixed(1)}
                    </Badge>
                  )}
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-muted-foreground">
                  {subject.grades.length}{" "}
                  {subject.grades.length === 1 ? "grade" : "grades"}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => confirmDelete(subject.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Add small graph chart */}
            <CardContent className="pb-4 pt-1">
              <div className="h-24 w-full">
                <GradeHistoryChart
                  grades={subject.grades}
                  height={80}
                  showAxis={false}
                  showGrid={false}
                  className="h-full"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this subject and all its grades. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubject}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Subject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

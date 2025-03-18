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
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface SubjectListProps {
  subjects: Array<{
    id: string;
    name: string;
    averageGrade: number;
    grades: Array<any>;
  }>;
  onSubjectDeleted?: (id: string) => void;
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

  // Sort subjects alphabetically
  const sortedSubjects = [...subjects].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSubjects.map((subject) => {
          // Generate a unique key combining id with a hash of the name
          const uniqueKey = `${subject.id}-${hashString(subject.name)}`;

          return (
            <Link href={`/subjects/${subject.id}`} key={uniqueKey}>
              <Card
                className={cn(
                  "h-full transition-all hover:border-primary/50 hover:shadow-md cursor-pointer",
                  "bg-card"
                )}
              >
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-lg font-semibold truncate mb-1">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {subject.grades.length} grades
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        subject.averageGrade <= 1.5
                          ? "text-green-600 dark:text-green-400"
                          : subject.averageGrade <= 2.5
                          ? "text-blue-600 dark:text-blue-400"
                          : subject.averageGrade <= 3.5
                          ? "text-yellow-600 dark:text-yellow-400"
                          : subject.averageGrade <= 4.5
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {subject.averageGrade
                        ? subject.averageGrade.toFixed(1)
                        : "N/A"}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
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

// Helper function to create a simple hash from a string
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 6);
}

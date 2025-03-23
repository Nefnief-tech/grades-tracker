"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradeTable } from "@/components/GradeTable";
import { GradeForm } from "@/components/GradeForm";
import { GradeHistoryChart } from "@/components/GradeHistoryChart";
import { ArrowLeft, BarChart2, Award, Trash2 } from "lucide-react";
import Link from "next/link";
import { debugSubjects, deleteSubject } from "@/utils/storageUtils";
import { DebugPanel } from "@/components/DebugPanel";
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
import { ColorPicker, SUBJECT_COLORS } from "@/components/ColorPicker";

// SUPER SIMPLE COMPONENT - MAXIMUM RELIABILITY
export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [subject, setSubject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const subjectId = params.id as string;

  // MAXIMUM RELIABILITY LOADING - using direct localStorage access
  useEffect(() => {
    console.log("🚨 Loading subject:", subjectId);

    // First, try to get the subject from localStorage
    try {
      if (typeof window !== "undefined") {
        const storageKey = "gradeCalculator";
        const storageData = localStorage.getItem(storageKey);
        if (storageData) {
          const allSubjects = JSON.parse(storageData);
          if (Array.isArray(allSubjects)) {
            const foundSubject = allSubjects.find((s) => s.id === subjectId);
            if (foundSubject) {
              console.log(
                "✅ Found subject in localStorage:",
                foundSubject.name
              );
              setSubject(foundSubject);
              return;
            }
          }
        }
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }

    // Fallback - create an empty subject
    console.log("⚠️ Creating fallback subject");
    setSubject({
      id: subjectId,
      name: "Subject " + subjectId.split("-")[0],
      grades: [],
      averageGrade: 0,
    });
  }, [subjectId]);

  // Add event listeners for BOTH standard and custom grade events
  useEffect(() => {
    const handleGradeAdded = (event: Event | CustomEvent) => {
      // For CustomEvent with detail
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.subjectId !== subjectId) {
        return;
      }
      console.log("⚡ Grade added event detected, refreshing...");
      handleRefresh();
    };

    const handleManualGradeAdded = (event: CustomEvent) => {
      if (event.detail?.subjectId !== subjectId) {
        return;
      }
      console.log("⚡ Manual grade added event detected, refreshing...");
      handleRefresh();
    };

    window.addEventListener("gradeAdded", handleGradeAdded);
    window.addEventListener(
      "manualGradeAdded",
      handleManualGradeAdded as EventListener
    );
    window.addEventListener("subjectsUpdated", handleRefresh);

    return () => {
      window.removeEventListener("gradeAdded", handleGradeAdded);
      window.removeEventListener(
        "manualGradeAdded",
        handleManualGradeAdded as EventListener
      );
      window.removeEventListener("subjectsUpdated", handleRefresh);
    };
  }, [subjectId]);

  // FORCE RELOAD WHEN GRADES CHANGE
  useEffect(() => {
    const handleForceRefresh = (event: CustomEvent) => {
      console.log("⚡ Force refresh event detected");
      // Force reload the page as a last resort for grade changes
      window.location.reload();
    };

    window.addEventListener(
      "forceRefresh",
      handleForceRefresh as EventListener
    );

    return () => {
      window.removeEventListener(
        "forceRefresh",
        handleForceRefresh as EventListener
      );
    };
  }, []);

  // Make refresh more reliable by listening to all possible events
  useEffect(() => {
    const refreshHandler = () => handleRefresh();

    // Listen to many events to ensure we catch the update
    window.addEventListener("gradeAdded", refreshHandler);
    window.addEventListener("manualGradeAdded", refreshHandler);
    window.addEventListener("subjectsUpdated", refreshHandler);
    window.addEventListener("gradesChanged", refreshHandler);

    return () => {
      window.removeEventListener("gradeAdded", refreshHandler);
      window.removeEventListener("manualGradeAdded", refreshHandler);
      window.removeEventListener("subjectsUpdated", refreshHandler);
      window.removeEventListener("gradesChanged", refreshHandler);
    };
  }, []);

  // ULTRA RELIABLE REFRESH FUNCTION
  const handleRefresh = () => {
    console.log("🔄 REFRESH: Reloading subject data");

    try {
      // CRITICAL: Ensure we're working with the latest data
      const storageKey = "gradeCalculator";
      const storageData = localStorage.getItem(storageKey);

      if (storageData) {
        try {
          const parsedData = JSON.parse(storageData);
          if (Array.isArray(parsedData)) {
            const latestSubject = parsedData.find((s) => s.id === subjectId);

            if (latestSubject) {
              console.log(
                `💾 REFRESH: Found subject with ${
                  latestSubject.grades?.length || 0
                } grades`
              );

              // ULTRA RELIABLE UPDATE: Create a completely new object reference
              setSubject(JSON.parse(JSON.stringify(latestSubject)));

              // Tell user data was updated
              console.log("✅ REFRESH: Subject data updated from localStorage");
              return;
            }
          }
        } catch (parseError) {
          console.error("Error parsing localStorage data:", parseError);
        }
      }

      // If we got here, direct lookup failed - force a page reload
      console.log("⚠️ REFRESH: Direct refresh failed, will reload page");
      window.location.reload();
    } catch (error) {
      console.error("Critical error during refresh:", error);
      // As last resort, reload the whole page
      window.location.reload();
    }
  };

  // FORCE PAGE RELOAD AFTER NEW GRADE IS ADDED
  const handleGradeAdded = () => {
    console.log("🔄 Grade added - forcing page reload");
    // First try to refresh directly
    handleRefresh();

    // Then force a complete page reload after a delay to ensure everything is updated
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Handle subject deletion
  const handleDeleteSubject = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteSubject(
        subjectId,
        user?.id,
        user?.syncEnabled
      );

      if (success) {
        // Redirect to the dashboard after deletion
        router.push("/");
      } else {
        console.error("Failed to delete subject");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      setIsDeleting(false);
    }
  };

  // Debug helper
  const handleDebug = () => {
    console.log("🔍 Current subject:", subject);
    if (user) debugSubjects(user.id);
  };

  // Helper functions for grade colors
  const getGradeColor = (grade: number): string => {
    if (grade <= 1.5) return "text-green-600 dark:text-green-400";
    if (grade <= 2.5) return "text-blue-600 dark:text-blue-400";
    if (grade <= 3.5) return "text-yellow-600 dark:text-yellow-400";
    if (grade <= 4.5) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeBadgeColor = (grade: number): string => {
    if (grade <= 1.5) return "bg-green-500/10";
    if (grade <= 2.5) return "bg-blue-500/10";
    if (grade <= 3.5) return "bg-yellow-500/10";
    if (grade <= 4.5) return "bg-orange-500/10";
    return "bg-red-500/10";
  };

  // Loading state
  if (!subject) {
    return <SubjectSkeleton />;
  }

  // Render the UI
  return (
    <div className="container py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to dashboard
        </Link>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>

          {/* Add delete subject button with confirmation dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Subject"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{subject?.name}"? This action
                  cannot be undone. All grades associated with this subject will
                  also be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSubject}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">{subject.name}</h1>
          <div
            className={`${getGradeBadgeColor(
              subject.averageGrade
            )} rounded-xl p-4 flex items-center gap-3`}
          >
            <Award
              className={`h-7 w-7 ${getGradeColor(subject.averageGrade)}`}
            />
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Average Grade
              </div>
              <div
                className={`text-3xl font-bold ${getGradeColor(
                  subject.averageGrade
                )}`}
              >
                {subject.averageGrade.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-muted/40 border-muted mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">
                  Total Grades:
                </div>
                <div className="text-2xl font-semibold">
                  {subject.grades?.length || 0}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">
                  Average Grade:
                </div>
                <div
                  className={`text-4xl font-bold ${getGradeColor(
                    subject.averageGrade
                  )}`}
                >
                  {subject.averageGrade.toFixed(1)}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">
                  Last Grade:
                </div>
                <div className="text-2xl font-semibold">
                  {subject.grades?.length > 0
                    ? subject.grades[subject.grades.length - 1].value.toFixed(1)
                    : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Grade History
              </CardTitle>
              <CardDescription>
                Visual representation of your grade history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <GradeHistoryChart grades={subject.grades || []} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add New Grade</CardTitle>
              <CardDescription>
                Record a new grade for this subject
              </CardDescription>
            </CardHeader>
            <GradeForm subjectId={subject.id} onGradeAdded={handleGradeAdded} />
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Grade History</CardTitle>
              <CardDescription>
                All grades recorded for this subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GradeTable
                grades={subject.grades || []}
                subjectId={subject.id}
                onGradeDeleted={handleRefresh}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SubjectSkeleton() {
  return (
    <div className="container py-8 animate-pulse">
      <div className="mb-6">
        <div className="h-6 bg-muted w-32 rounded"></div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="h-10 bg-muted w-64 rounded"></div>
          <div className="h-20 w-36 bg-muted/30 rounded-xl"></div>
        </div>

        <div className="h-24 bg-muted/40 rounded-lg mb-8"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-80 bg-muted/40 border border-muted rounded-lg"></div>
        </div>
        <div>
          <div className="h-64 bg-muted/40 border border-muted rounded-lg"></div>
        </div>
        <div className="lg:col-span-3">
          <div className="h-80 bg-muted/40 border border-muted rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

// Add color state in the EditSubjectDialog component
function EditSubjectDialog({
  subject,
  isOpen,
  onClose,
  onSave,
}: {
  subject: Subject;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSubject: Subject) => void;
}) {
  const [name, setName] = useState(subject.name);
  const [description, setDescription] = useState(subject.description || "");
  const [teacher, setTeacher] = useState(subject.teacher || "");
  const [room, setRoom] = useState(subject.room || "");
  const [color, setColor] = useState(subject.color || SUBJECT_COLORS[0]); // Add color state

  // ...existing code...

  const handleSave = () => {
    if (!name.trim()) {
      // Show error
      return;
    }

    const updatedSubject = {
      ...subject,
      name,
      description: description || undefined,
      teacher: teacher || undefined,
      room: room || undefined,
      color: color || undefined, // Add color to updated subject
    };

    onSave(updatedSubject);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>
            Make changes to the subject details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="subject-name">Subject Name</Label>

              {/* Add ColorPicker component */}
              <ColorPicker color={color} onChange={setColor} />
            </div>
            <Input
              id="subject-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* ...existing form fields... */}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Update the subject header to show the color
function SubjectHeader({
  subject,
  onEdit,
}: {
  subject: Subject;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          {/* Add a colored dot based on the subject's color */}
          {subject.color && (
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: subject.color }}
            ></div>
          )}
          {subject.name}
        </h1>

        {/* ...existing code... */}
      </div>

      {/* ...existing code... */}
    </div>
  );
}

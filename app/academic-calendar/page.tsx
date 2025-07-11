"use client";

import { useEffect, useState } from "react";
import { CalendarRework } from "@/components/CalendarRework";
import { useSubjects } from "@/hooks/useSubjects";
import { useTests } from "@/hooks/useTests";
import { TestForm } from "@/components/TestForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Plus,
  FileEdit,
  Trash2,
  Clock,
  PenLine,
  CheckCircle,
  Circle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { Subject, Grade, TimetableEntry, Test } from "@/types/grades";
import { useSettings } from "@/contexts/SettingsContext";
import { format, parseISO } from "date-fns";
import { CalendarGradeForm } from "@/components/CalendarGradeForm";
import { TimetableForm } from "@/components/TimetableForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { generateId } from "@/utils/idUtils";
import {
  addGradeToSubject,
  saveTimetableEntries,
  getTimetableEntries,
} from "@/utils/storageUtils";
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
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { initializeAppwrite } from "@/lib/appwrite";
import { formatTimeDisplay as formatTimeFromUtils } from "@/utils/formatUtils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // Add this import

export default function AcademicCalendarPage() {
  const { subjects, isLoading, error, refreshSubjects } = useSubjects();
  const { tests, editTest, removeTest, addTest } = useTests(); // Add removeTest and addTest here
  const [selectedGrade, setSelectedGrade] = useState<{
    grade: Grade;
    subject: Subject;
  } | null>(null);
  const [selectedTest, setSelectedTest] = useState<{
    test: Test;
    subject: Subject;
  } | null>(null);
  const [selectedTimetableEntry, setSelectedTimetableEntry] = useState<{
    entry: TimetableEntry;
    subject: Subject;
  } | null>(null);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(
    []
  );
  const [addGradeOpen, setAddGradeOpen] = useState(false);
  const [addTestOpen, setAddTestOpen] = useState(false);
  const [addTimetableOpen, setAddTimetableOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTestConfirmOpen, setDeleteTestConfirmOpen] = useState(false);
  const [deleteTimetableConfirmOpen, setDeleteTimetableConfirmOpen] =
    useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(true);
  const [showTimetable, setShowTimetable] = useState(true);
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const router = useRouter();
  const { settings } = useSettings();
  const { toast } = useToast();
  const { user } = useAuth();

  // Load timetable entries
  useEffect(() => {
    initializeAppwrite(); // Ensure Appwrite is initialized
    const loadTimetable = async () => {
      setLoadingTimetable(true);
      try {
        console.log("Loading timetable entries with user:", user);
        const entries = await getTimetableEntries(user?.id, user?.syncEnabled);
        console.log(`Loaded ${entries.length} timetable entries`);
        setTimetableEntries(entries || []);
      } catch (error) {
        console.error("Failed to load timetable:", error);
        toast({
          title: "Failed to load timetable",
          description: "There was an error loading your timetable data",
          variant: "destructive",
        });
      } finally {
        setLoadingTimetable(false);
      }
    };

    loadTimetable();

    // Listen for sync preference changes
    const handleSyncPreferenceChanged = () => {
      loadTimetable();
    };

    // Listen for timetable updates
    const handleTimetableUpdated = () => {
      loadTimetable();
    };

    window.addEventListener(
      "syncPreferenceChanged",
      handleSyncPreferenceChanged
    );
    window.addEventListener("timetableEntriesUpdated", handleTimetableUpdated);

    return () => {
      window.removeEventListener(
        "syncPreferenceChanged",
        handleSyncPreferenceChanged
      );
      window.removeEventListener(
        "timetableEntriesUpdated",
        handleTimetableUpdated
      );
    };
  }, [toast, user]);

  // Format date based on user settings
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";

    try {
      const date = parseISO(dateString);
      const dateFormat =
        settings?.dateFormat === "DD/MM/YYYY"
          ? "dd/MM/yyyy"
          : settings?.dateFormat === "MM/DD/YYYY"
          ? "MM/dd/yyyy"
          : "yyyy-MM-dd"; // Default to ISO format

      return format(date, dateFormat);
    } catch (e) {
      return dateString;
    }
  };

  // Handle add grade submit
  const handleAddGrade = async (grade: Grade) => {
    if (!selectedSubjectId) {
      toast({
        title: "No subject selected",
        description: "Please select a subject for this grade",
        variant: "destructive",
      });
      return;
    }

    const subject = subjects.find((s) => s.id === selectedSubjectId);
    if (!subject) {
      toast({
        title: "Subject not found",
        description: "The selected subject could not be found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Ensure the grade has a date
      if (!grade.date) {
        grade.date = new Date().toISOString().split("T")[0];
      }      // Add the grade to the subject
      await addGradeToSubject(subject.id, grade);

      // Refresh data
      refreshSubjects();

      toast({
        title: "Grade added",
        description: `Grade ${grade.value.toFixed(1)} added to ${subject.name}`,
      });

      setAddGradeOpen(false);
    } catch (error) {
      console.error("Failed to add grade:", error);
      toast({
        title: "Failed to add grade",
        description: "There was an error adding your grade",
        variant: "destructive",
      });
    }
  };

  // Handle add timetable entry
  const handleAddTimetableEntry = async (entry: TimetableEntry) => {
    try {
      console.log("Adding timetable entry with user:", user);
      // Add to list and save with cloud sync
      const updatedEntries = [...timetableEntries, entry];
      await saveTimetableEntries(updatedEntries, user?.id, user?.syncEnabled);
      setTimetableEntries(updatedEntries);

      toast({
        title: "Timetable entry added",
        description: "Your timetable has been updated",
      });

      setAddTimetableOpen(false);
    } catch (error) {
      console.error("Failed to add timetable entry:", error);
      toast({
        title: "Failed to add timetable entry",
        description: "There was an error updating your timetable",
        variant: "destructive",
      });
    }
  };

  // Handle delete timetable entry
  const handleDeleteTimetableEntry = async () => {
    if (!selectedTimetableEntry) return;

    try {
      console.log("Deleting timetable entry with user:", user);
      const updatedEntries = timetableEntries.filter(
        (entry) => entry.id !== selectedTimetableEntry.entry.id
      );

      await saveTimetableEntries(updatedEntries, user?.id, user?.syncEnabled);
      setTimetableEntries(updatedEntries);

      toast({
        title: "Timetable entry deleted",
        description: "Your timetable has been updated",
      });

      setSelectedTimetableEntry(null);
      setDeleteTimetableConfirmOpen(false);
    } catch (error) {
      console.error("Failed to delete timetable entry:", error);
      toast({
        title: "Failed to delete timetable entry",
        description: "There was an error updating your timetable",
        variant: "destructive",
      });
    }
  };

  // Handle delete test confirmation
  const handleDeleteTest = async () => {
    if (selectedTest) {
      try {
        await removeTest(selectedTest.test.id);
        setDeleteTestConfirmOpen(false);
        setSelectedTest(null);
        toast({
          title: "Test deleted",
          description: "Your test has been deleted",
        });
      } catch (error) {
        console.error("Failed to delete test:", error);
        toast({
          title: "Failed to delete test",
          description: "There was a problem deleting your test",
          variant: "destructive",
        });
      }
    }
  };

  // Get color for grade value
  const getGradeColor = (grade: number) => {
    if (grade <= 1.5) return "text-green-600 dark:text-green-400";
    if (grade <= 2.5) return "text-blue-600 dark:text-blue-400";
    if (grade <= 3.5) return "text-yellow-600 dark:text-yellow-400";
    if (grade <= 4.5) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  // Initialize selected subject when opening dialog
  useEffect(() => {
    if (
      (addGradeOpen || addTimetableOpen) &&
      subjects.length > 0 &&
      !selectedSubjectId
    ) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [addGradeOpen, addTimetableOpen, subjects, selectedSubjectId]);

  // Handle grade selection from calendar
  const handleGradeSelect = (grade: Grade, subject: Subject) => {
    setSelectedGrade({ grade, subject });
  };

  // Handle test selection from calendar
  const handleTestSelect = (test: Test, subject: Subject) => {
    setSelectedTest({ test, subject });
  };

  // Update test date
  const handleUpdateTestDate = async (date: Date) => {
    if (!selectedTest) return;

    try {
      await editTest(selectedTest.test.id, {
        date: date.toISOString(),
      });

      toast({
        title: "Test date updated",
        description: `Test date updated to ${format(date, "PPP")}`,
      });

      setSelectedTest(null);
    } catch (error) {
      console.error("Failed to update test date", error);
      toast({
        title: "Error updating test date",
        description: "There was a problem updating the test date",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoading || loadingTimetable) {
    return (
      <div className="container py-10 max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <CalendarIcon className="h-7 w-7" />
          <span>Academic Calendar</span>
        </h1>
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-10 max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8">Academic Calendar</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load your data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-7 w-7" />
          <span>Academic Calendar</span>
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setAddGradeOpen(true)}
            disabled={subjects.length === 0}
            className="gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Add Grade
          </Button>
          <Button
            onClick={() => setAddTestOpen(true)}
            disabled={subjects.length === 0}
            className="gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Add Test
          </Button>
          <Button
            onClick={() => setAddTimetableOpen(true)}
            disabled={subjects.length === 0}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
          </TabsList>

          {activeTab === "calendar" && (
            <div className="flex items-center gap-2">
              <Label htmlFor="show-timetable" className="text-sm">
                Show Classes
              </Label>
              <Switch
                id="show-timetable"
                checked={showTimetable}
                onCheckedChange={setShowTimetable}
              />
            </div>
          )}
        </div>

        <TabsContent value="calendar" className="mt-0">
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6 sm:p-8">
              <CalendarRework
                onDaySelect={(date) => setSelectedDate(date)}
                showTimetable={showTimetable}
                onGradeSelect={handleGradeSelect}
                onTestSelect={handleTestSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable" className="mt-0">
          <WeeklyTimetable
            timetableEntries={timetableEntries}
            subjects={subjects}
            onEntryClick={(entry, subject) =>
              setSelectedTimetableEntry({ entry, subject })
            }
          />
        </TabsContent>
      </Tabs>

      {/* Detail view for selected grade */}
      <Sheet
        open={Boolean(selectedGrade)}
        onOpenChange={() => setSelectedGrade(null)}
      >
        <SheetContent className="sm:max-w-md p-6">
          {selectedGrade && (
            <>
              <SheetHeader>
                <SheetTitle>Grade Details</SheetTitle>
                <SheetDescription>
                  From {selectedGrade.subject.name}
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div
                    className="bg-muted/50 p-4 rounded-lg border"
                  style={{
                      borderLeft: (selectedGrade.subject as any).color
                        ? `4px solid ${(selectedGrade.subject as any).color}`
                        : undefined,
                    }}
                  >
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Subject
                    </h3>
                    <p className="text-lg font-medium">
                      {selectedGrade.subject.name}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Grade
                      </h3>
                      <p
                        className={`text-3xl font-bold ${getGradeColor(
                          selectedGrade.grade.value
                        )}`}
                      >
                        {selectedGrade.grade.value.toFixed(1)}
                      </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Type
                      </h3>
                      <p className="text-lg">
                        {selectedGrade.grade.type || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Date
                      </h3>
                      <p className="text-lg font-medium">
                        {selectedGrade.grade.date
                          ? formatDate(selectedGrade.grade.date)
                          : "Not specified"}
                      </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Weight
                      </h3>
                      <p className="text-lg">
                        {selectedGrade.grade.weight || 1}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    className="flex-1 gap-2"
                    variant="outline"
                    onClick={() => {
                      router.push(`/subjects/${selectedGrade.subject.id}`);
                      setSelectedGrade(null);
                    }}
                  >
                    View Subject
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    variant="destructive"
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Detail view for selected test */}
      <Sheet
        open={Boolean(selectedTest)}
        onOpenChange={() => setSelectedTest(null)}
      >
        <SheetContent className="sm:max-w-md p-6">
          {selectedTest && (
            <>
              <SheetHeader>
                <SheetTitle>Test Details</SheetTitle>
                <SheetDescription>
                  From {selectedTest.subject.name}
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div
                    className="bg-muted/50 p-4 rounded-lg border"                    style={{
                      borderLeft: (selectedTest.subject as any).color
                        ? `4px solid ${(selectedTest.subject as any).color}`
                        : undefined,
                    }}
                  >
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Subject
                    </h3>
                    <p className="text-lg font-medium">
                      {selectedTest.subject.name}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-1 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Title
                      </h3>
                      <p className="text-lg font-medium">
                        {selectedTest.test.title}
                      </p>
                      {selectedTest.test.description && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          {selectedTest.test.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg border relative group">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Date
                      </h3>
                      <p className="text-lg font-medium">
                        {selectedTest.test.date
                          ? formatDate(selectedTest.test.date)
                          : "Not specified"}
                      </p>

                      {/* Edit date button */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <PenLine className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              selectedTest.test.date
                                ? parseISO(selectedTest.test.date)
                                : undefined
                            }
                            onSelect={(date) =>
                              date && handleUpdateTestDate(date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Priority
                      </h3>
                      <p className="text-lg capitalize">
                        {selectedTest.test.priority || "Medium"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Status
                    </h3>
                    <p className="text-lg flex items-center gap-2">
                      {selectedTest.test.completed ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-green-500">Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-5 w-5 text-amber-500" />
                          <span className="text-amber-500">Pending</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    className="flex-1 gap-2"
                    variant="outline"
                    onClick={() => {
                      router.push(`/tests`);
                      setSelectedTest(null);
                    }}
                  >
                    View All Tests
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    variant="destructive"
                    onClick={() => setDeleteTestConfirmOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Detail view for selected timetable entry */}
      <Sheet
        open={Boolean(selectedTimetableEntry)}
        onOpenChange={() => setSelectedTimetableEntry(null)}
      >
        <SheetContent className="sm:max-w-md p-6">
          {selectedTimetableEntry && (
            <>
              <SheetHeader>
                <SheetTitle>Class Details</SheetTitle>
                <SheetDescription>
                  {selectedTimetableEntry.subject.name}
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div
                    className="bg-muted/50 p-4 rounded-lg border"                    style={{
                      borderLeft: (selectedTimetableEntry.subject as any).color
                        ? `4px solid ${(selectedTimetableEntry.subject as any).color}`
                        : undefined,
                    }}
                  >
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Subject
                    </h3>
                    <p className="text-lg font-medium">
                      {selectedTimetableEntry.subject.name}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Day
                      </h3>
                      <p className="text-lg capitalize">
                        {selectedTimetableEntry.entry.day}
                      </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Time
                      </h3>
                      <p className="text-lg">
                        {selectedTimetableEntry.entry.startTime} -{" "}
                        {selectedTimetableEntry.entry.endTime}
                      </p>
                    </div>
                  </div>

                  {selectedTimetableEntry.entry.room && (
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Room
                      </h3>
                      <p className="text-lg">
                        {selectedTimetableEntry.entry.room}
                      </p>
                    </div>
                  )}

                  {selectedTimetableEntry.entry.notes && (
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Notes
                      </h3>
                      <p className="text-lg">
                        {selectedTimetableEntry.entry.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    className="flex-1 gap-2"
                    variant="outline"
                    onClick={() => {
                      router.push(
                        `/subjects/${selectedTimetableEntry.subject.id}`
                      );
                      setSelectedTimetableEntry(null);
                    }}
                  >
                    View Subject
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    variant="destructive"
                    onClick={() => setDeleteTimetableConfirmOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Grade Dialog */}
      <Dialog open={addGradeOpen} onOpenChange={setAddGradeOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>Add New Grade</DialogTitle>
            <DialogDescription>
              Add a grade with a specific date to display on the calendar
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">            <div className="space-y-4 mb-4">
              <Label htmlFor="subject-select">Subject</Label>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
              >
                <SelectTrigger id="subject-select" className="w-full">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        {(subject as any).color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: (subject as any).color }}
                          ></div>
                        )}
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>            <CalendarGradeForm
              onSubmit={handleAddGrade}              initialGrade={{
                id: generateId(),
                value: 1.0,
                date: new Date().toISOString().split("T")[0],
                weight: 1.0,
                type: "Test",
              }}
              requireDate={true}
              onCancel={() => setAddGradeOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Test Dialog */}
      <Dialog open={addTestOpen} onOpenChange={setAddTestOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>Add New Test</DialogTitle>
            <DialogDescription>
              Add a test with a specific date to display on the calendar
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">            <div className="space-y-4 mb-4">
              <Label htmlFor="subject-select-test">Subject</Label>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
              >
                <SelectTrigger id="subject-select-test" className="w-full">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        {(subject as any).color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: (subject as any).color }}
                          ></div>
                        )}
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TestForm
              onSubmit={(test) => {
                const newTest = {
                  ...test,
                  subjectId: selectedSubjectId,
                };
                addTest(newTest).then(() => {
                  setAddTestOpen(false);
                  toast({
                    title: "Test added",
                    description: "Your test has been added to the calendar",
                  });
                });
              }}
              onCancel={() => setAddTestOpen(false)}
              subjects={subjects}
              initialTest={{
                title: "",
                date: new Date().toISOString(),
                subjectId: selectedSubjectId,
                completed: false,
                priority: "medium",
              }}
              isEditing={false}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Timetable Entry Dialog */}
      <Dialog open={addTimetableOpen} onOpenChange={setAddTimetableOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>Add Class to Timetable</DialogTitle>
            <DialogDescription>
              Schedule a recurring class for your timetable
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">            <div className="space-y-4 mb-4">
              <Label htmlFor="subject-select-timetable">Subject</Label>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
              >
                <SelectTrigger id="subject-select-timetable" className="w-full">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        {(subject as any).color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: (subject as any).color }}
                          ></div>
                        )}
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TimetableForm
              onSubmit={(formData) => {
                const entry: TimetableEntry = {
                  ...formData,
                  id: generateId(),
                  subjectId: selectedSubjectId,
                };
                handleAddTimetableEntry(entry);
              }}
              onCancel={() => setAddTimetableOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Grade Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this grade? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Test Confirmation Dialog */}
      <AlertDialog
        open={deleteTestConfirmOpen}
        onOpenChange={setDeleteTestConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest} // Use the handleDeleteTest function instead of inline removeTest
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Timetable Entry Confirmation Dialog */}
      <AlertDialog
        open={deleteTimetableConfirmOpen}
        onOpenChange={setDeleteTimetableConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this class from your timetable?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTimetableEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper function to format time with minutes
const formatTimeDisplay = (time: string | number): string => {
  // Handle string format with minutes (e.g., "09:30")
  if (typeof time === "string" && time.includes(":")) {
    const [hours, minutes] = time.split(":").map(Number);
    const h = hours % 12 || 12;
    const ampm = hours < 12 ? "AM" : "PM";
    return `${h}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }

  // Handle numeric format (e.g., 9)
  const hour = typeof time === "string" ? parseInt(time) : time;
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
};

// Weekly timetable display component
function WeeklyTimetable({
  timetableEntries,
  subjects,
  onEntryClick,
}: {
  timetableEntries: TimetableEntry[];
  subjects: Subject[];
  onEntryClick?: (entry: TimetableEntry, subject: Subject) => void;
}) {
  const days = [
    { name: "Monday", value: 0 }, // Changed from "monday" to 0
    { name: "Tuesday", value: 1 }, // Changed from "tuesday" to 1
    { name: "Wednesday", value: 2 }, // Changed from "wednesday" to 2
    { name: "Thursday", value: 3 }, // Changed from "thursday" to 3
    { name: "Friday", value: 4 }, // Changed from "friday" to 4
    { name: "Saturday", value: 5 }, // Changed from "saturday" to 5
    { name: "Sunday", value: 6 }, // Changed from "sunday" to 6
  ];

  const entriesByDay = days.map((day) => {
    return {
      ...day,
      entries: timetableEntries
        .filter((entry) => entry.day === day.value) // Now correctly comparing number to number
        .sort((a, b) => {
          // Fix time sorting (startTime is a number now, not a string)
          return a.startTime - b.startTime;
        }),
    };
  });

  if (timetableEntries.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl mb-2">No Classes Scheduled</h2>
        <p className="text-muted-foreground mb-4">
          Add classes to your timetable to see them here.
        </p>
        <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <Button
          onClick={() =>
            document.getElementById("add-timetable-entry-btn")?.click()
          }
        >
          Add Your First Class
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {entriesByDay.map((day) => (
        <Card
          key={day.value}
          className={day.entries.length > 0 ? "" : "border-dashed opacity-70"}
        >
          <CardHeader className="pb-2">
            <CardTitle>{day.name}</CardTitle>
            {day.entries.length === 0 && (
              <CardDescription>No classes scheduled</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {day.entries.map((entry) => {
                const subject = subjects.find((s) => s.id === entry.subjectId);
                if (!subject) return null;                // Use entry color if available, otherwise fall back to subject color
                const entryColor = (entry as any).color || (subject as any).color;

                return (
                  <div
                    key={entry.id}
                    className="p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{
                      borderLeft: entryColor
                        ? `4px solid ${entryColor}`
                        : undefined,
                      backgroundColor: entryColor
                        ? `${entryColor}10`
                        : undefined,
                    }}
                    onClick={() => onEntryClick?.(entry, subject)}
                  >
                    <div className="font-medium">{subject.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {formatTimeDisplay(entry.startTime)} -{" "}
                      {formatTimeDisplay(entry.endTime)}
                    </div>
                    {entry.room && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Room: {entry.room}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

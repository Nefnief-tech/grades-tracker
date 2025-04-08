"use client";

import { useState, useEffect } from "react";
import { useTests } from "@/hooks/useTests";
import { useSubjects } from "@/hooks/useSubjects";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";
import { generateId } from "@/utils/idUtils";
import { Test, Subject } from "@/types/grades";
import { TestForm } from "@/components/TestForm";
import {
  ClipboardList,
  Plus,
  Calendar,
  Check,
  X,
  BookOpen,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  ChevronDown,
  Filter,
  CalendarRange,
  FileText,
  MoreHorizontal,
  CheckCircle,
  Circle,
  SortAsc,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useToast } from "@/components/ui/use-toast";
import { Empty } from "@/components/Empty";

export default function TestsPage() {
  const { user } = useAuth();
  const {
    tests,
    isLoading,
    error,
    addTest,
    editTest,
    removeTest,
    toggleTestCompleted,
    refetch,
  } = useTests();
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { toast } = useToast();

  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "upcoming"
  >("all");
  const [filterTimeframe, setFilterTimeframe] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<
    "date-asc" | "date-desc" | "priority"
  >("date-asc");

  // Handle adding a new test
  const handleAddTest = (test: Omit<Test, "id">) => {
    addTest(test).then(() => {
      setIsTestDialogOpen(false);
      refetch();
      toast({
        title: "Test added",
        description: "Your test has been successfully added to your calendar",
      });
    });
  };

  // Handle editing an existing test
  const handleEditTest = (test: Omit<Test, "id">) => {
    if (selectedTest) {
      editTest(selectedTest.id, test).then(() => {
        setIsTestDialogOpen(false);
        setSelectedTest(null);
        setIsEditing(false);
        refetch();
        toast({
          title: "Test updated",
          description: "Your test has been updated successfully",
        });
      });
    }
  };

  // Handle deleting a test
  const handleDeleteTest = () => {
    if (testToDelete) {
      removeTest(testToDelete).then(() => {
        setDeleteConfirmOpen(false);
        setTestToDelete(null);
        refetch();
        toast({
          title: "Test deleted",
          description: "Your test has been deleted",
        });
      });
    }
  };

  // Handle toggling a test's completion status
  const handleToggleComplete = (id: string, completed: boolean) => {
    toggleTestCompleted(id, completed).then(() => {
      refetch();
    });
  };

  // Open the edit dialog for a test
  const openEditDialog = (test: Test) => {
    setSelectedTest(test);
    setIsEditing(true);
    setIsTestDialogOpen(true);
  };

  // Open the delete confirmation dialog
  const confirmDelete = (test: Test) => {
    setTestToDelete(test.id);
    setDeleteConfirmOpen(true);
  };

  // Filter tests based on search query, status, timeframe, and subject
  const filteredTests = tests.filter((test) => {
    // Search query filter
    const matchesSearch =
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (test.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "completed"
        ? test.completed
        : filterStatus === "upcoming"
        ? !test.completed
        : true;

    // Subject filter
    const matchesSubject = selectedSubject
      ? test.subjectId === selectedSubject
      : true;

    // Timeframe filter
    let matchesTimeframe = true;
    if (filterTimeframe !== "all") {
      const testDate = parseISO(test.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterTimeframe === "today") {
        matchesTimeframe =
          format(testDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
      } else if (filterTimeframe === "week") {
        const endOfWeek = addDays(today, 7);
        matchesTimeframe =
          isAfter(testDate, today) && isBefore(testDate, endOfWeek);
      } else if (filterTimeframe === "month") {
        const endOfMonth = addDays(today, 30);
        matchesTimeframe =
          isAfter(testDate, today) && isBefore(testDate, endOfMonth);
      }
    }

    return matchesSearch && matchesStatus && matchesSubject && matchesTimeframe;
  });

  // Sort tests
  const sortedTests = [...filteredTests].sort((a, b) => {
    if (sortOrder === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const aPriority = a.priority || "medium";
      const bPriority = b.priority || "medium";
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    }

    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    return sortOrder === "date-asc" ? dateA - dateB : dateB - dateA;
  });

  // Get priority badge style
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 hover:bg-amber-100"
          >
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Low
          </Badge>
        );
      default:
        return <Badge variant="secondary">Medium</Badge>;
    }
  };

  // Get subject name by ID
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  // Get subject color by ID
  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.color;
  };

  // Calculate time remaining
  const getTimeRemaining = (dateStr: string) => {
    const testDate = parseISO(dateStr);
    const now = new Date();

    // If it's in the past
    if (isBefore(testDate, now)) {
      return "Overdue";
    }

    const diffTime = testDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks left`;
    return `${Math.floor(diffDays / 30)} months left`;
  };

  // Loading state
  if (isLoading || subjectsLoading) {
    return (
      <div className="container py-10 max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <ClipboardList className="h-7 w-7" />
          <span>Tests & Exams</span>
        </h1>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Skeleton className="h-10 w-full sm:w-1/3" />
            <Skeleton className="h-10 w-full sm:w-1/3" />
            <Skeleton className="h-10 w-full sm:w-1/3" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardList className="h-7 w-7" />
          <span>Tests & Exams</span>
        </h1>
        <Button
          onClick={() => {
            setSelectedTest(null);
            setIsEditing(false);
            setIsTestDialogOpen(true);
          }}
          className="gap-2"
          disabled={subjects.length === 0}
        >
          <Plus className="h-4 w-4" />
          Add Test
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterStatus === "all"}
                onCheckedChange={() => setFilterStatus("all")}
              >
                All Tests
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus === "upcoming"}
                onCheckedChange={() => setFilterStatus("upcoming")}
              >
                Upcoming Tests
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus === "completed"}
                onCheckedChange={() => setFilterStatus("completed")}
              >
                Completed Tests
              </DropdownMenuCheckboxItem>

              <DropdownMenuLabel className="mt-2">Timeframe</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterTimeframe === "all"}
                onCheckedChange={() => setFilterTimeframe("all")}
              >
                All Time
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTimeframe === "today"}
                onCheckedChange={() => setFilterTimeframe("today")}
              >
                Today
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTimeframe === "week"}
                onCheckedChange={() => setFilterTimeframe("week")}
              >
                This Week
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTimeframe === "month"}
                onCheckedChange={() => setFilterTimeframe("month")}
              >
                This Month
              </DropdownMenuCheckboxItem>

              {subjects.length > 0 && (
                <>
                  <DropdownMenuLabel className="mt-2">
                    Subjects
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={selectedSubject === null}
                    onCheckedChange={() => setSelectedSubject(null)}
                  >
                    All Subjects
                  </DropdownMenuCheckboxItem>
                  {subjects.map((subject) => (
                    <DropdownMenuCheckboxItem
                      key={subject.id}
                      checked={selectedSubject === subject.id}
                      onCheckedChange={() => setSelectedSubject(subject.id)}
                    >
                      <div className="flex items-center gap-2">
                        {subject.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          ></div>
                        )}
                        {subject.name}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SortAsc className="h-4 w-4" />
                Sort
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={sortOrder === "date-asc"}
                onCheckedChange={() => setSortOrder("date-asc")}
              >
                Date (Earliest First)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOrder === "date-desc"}
                onCheckedChange={() => setSortOrder("date-desc")}
              >
                Date (Latest First)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOrder === "priority"}
                onCheckedChange={() => setSortOrder("priority")}
              >
                Priority (Highest First)
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            onClick={() => refetch()}
            className="gap-1"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* No subjects message */}
      {subjects.length === 0 ? (
        <Empty
          icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
          title="No Subjects Found"
          description="Add subjects before creating tests"
          action={
            <Button
              onClick={() => {
                window.location.href = "/subjects";
              }}
            >
              Go to Subjects
            </Button>
          }
        />
      ) : sortedTests.length === 0 ? (
        <Empty
          icon={<ClipboardList className="h-12 w-12 text-muted-foreground" />}
          title={searchQuery ? "No matching tests found" : "No Tests Added Yet"}
          description={
            searchQuery
              ? "Try adjusting your search or filters"
              : "Add your first test to keep track of upcoming exams"
          }
          action={
            <Button
              onClick={() => {
                setSelectedTest(null);
                setIsEditing(false);
                setIsTestDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Test
            </Button>
          }
        />
      ) : (
        <ScrollArea className="h-[calc(100vh-240px)]">
          <div className="space-y-4 pb-4">
            {sortedTests.map((test) => {
              const isPast = isBefore(parseISO(test.date), new Date());
              const isToday =
                format(parseISO(test.date), "yyyy-MM-dd") ===
                format(new Date(), "yyyy-MM-dd");
              const subjectColor = getSubjectColor(test.subjectId);

              return (
                <Card
                  key={test.id}
                  className={cn(
                    "transition-all hover:shadow-md",
                    test.completed && "opacity-70"
                  )}
                >
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                    <div>
                      <Checkbox
                        checked={test.completed}
                        onCheckedChange={(checked) =>
                          handleToggleComplete(test.id, checked === true)
                        }
                        className="h-5 w-5"
                        aria-label={
                          test.completed
                            ? "Mark as incomplete"
                            : "Mark as complete"
                        }
                      />
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            className={cn(
                              "text-lg font-semibold flex items-center gap-2",
                              test.completed &&
                                "line-through decoration-1 opacity-70"
                            )}
                          >
                            {test.title}
                            {getPriorityBadge(test.priority || "medium")}
                          </h3>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: subjectColor || "#888",
                              }}
                            ></div>
                            {getSubjectName(test.subjectId)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              isToday
                                ? "default"
                                : isPast && !test.completed
                                ? "destructive"
                                : "outline"
                            }
                            className={
                              !isToday && !isPast && !test.completed
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : ""
                            }
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(parseISO(test.date), "MMM d, yyyy")}
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditDialog(test)}
                              >
                                Edit Test
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => confirmDelete(test)}
                              >
                                Delete Test
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {test.description && (
                        <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {test.description}
                        </div>
                      )}

                      <div className="mt-2 flex justify-between items-center">
                        <div className="text-sm font-medium">
                          {!test.completed && (
                            <span
                              className={cn(
                                isPast && !test.completed
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              )}
                            >
                              {getTimeRemaining(test.date)}
                            </span>
                          )}
                          {test.completed && (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Completed
                            </span>
                          )}
                        </div>

                        {test.reminderEnabled && test.reminderDate && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Reminder:{" "}
                            {format(parseISO(test.reminderDate), "MMM d")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Add/Edit Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Test" : "Add New Test"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details of your test or exam"
                : "Track your upcoming tests and exams"}
            </DialogDescription>
          </DialogHeader>

          <TestForm
            onSubmit={isEditing ? handleEditTest : handleAddTest}
            onCancel={() => setIsTestDialogOpen(false)}
            subjects={subjects}
            initialTest={selectedTest || undefined}
            isEditing={isEditing}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Test Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
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
              onClick={handleDeleteTest}
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

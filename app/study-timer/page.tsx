"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudySession } from "@/hooks/useStudySession";
import { useSubjects } from "@/hooks/useSubjects";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Clock,
  CheckCircle2,
  Trash2,
  BarChart4,
  CalendarClock,
  Bell,
  AlertTriangle,
  Flame,
  Trophy,
  ChevronDown,
  FileText, // Changed from Notepad to FileText
  Award,
  TrendingUp,
  Timer,
  BarChart2,
  Zap,
  BookOpen,
  Target,
  Medal,
} from "lucide-react";
import { Empty } from "@/components/Empty";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Form schemas
const sessionNotesSchema = z.object({
  notes: z.string().optional(),
});

const settingsSchema = z.object({
  workDuration: z.number().min(1).max(120),
  shortBreakDuration: z.number().min(1).max(30),
  longBreakDuration: z.number().min(5).max(60),
  sessionsBeforeLongBreak: z.number().min(1).max(10),
  autoStartBreaks: z.boolean(),
  autoStartPomodoros: z.boolean(),
  alarmSound: z.string(),
  alarmVolume: z.number().min(0).max(100),
});

// Timer modes
type TimerMode = "work" | "shortBreak" | "longBreak";

export default function StudyTimerPage() {
  const { user } = useAuth();
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const {
    sessions,
    currentSession,
    isLoading,
    settings,
    stats,
    startSession,
    endSession,
    removeSession,
    updateSettings,
    fetchSessions,
  } = useStudySession();

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [sessionNotes, setSessionNotes] = useState("");

  // Dialogs state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Session details dialog state - MOVED HERE to fix hooks order
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(
    null
  );
  const [sessionDetailOpen, setSessionDetailOpen] = useState(false);

  // Audio references
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<HTMLAudioElement | null>(null);

  // Timer interval reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Form
  const notesForm = useForm<z.infer<typeof sessionNotesSchema>>({
    resolver: zodResolver(sessionNotesSchema),
    defaultValues: { notes: "" },
  });

  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      workDuration: settings.workDuration,
      shortBreakDuration: settings.shortBreakDuration,
      longBreakDuration: settings.longBreakDuration,
      sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
      autoStartBreaks: settings.autoStartBreaks,
      autoStartPomodoros: settings.autoStartPomodoros,
      alarmSound: settings.alarmSound,
      alarmVolume: settings.alarmVolume,
    },
  });

  // Reset settings form when settings change
  useEffect(() => {
    settingsForm.reset({
      workDuration: settings.workDuration,
      shortBreakDuration: settings.shortBreakDuration,
      longBreakDuration: settings.longBreakDuration,
      sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
      autoStartBreaks: settings.autoStartBreaks,
      autoStartPomodoros: settings.autoStartPomodoros,
      alarmSound: settings.alarmSound,
      alarmVolume: settings.alarmVolume,
    });
  }, [settings, settingsForm]);

  // Initialize timer based on mode
  useEffect(() => {
    let duration = 0;
    switch (timerMode) {
      case "work":
        duration = settings.workDuration * 60;
        break;
      case "shortBreak":
        duration = settings.shortBreakDuration * 60;
        break;
      case "longBreak":
        duration = settings.longBreakDuration * 60;
        break;
    }
    setTimeLeft(duration);
  }, [timerMode, settings]);

  // Timer logic
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up!
          clearInterval(timerRef.current as NodeJS.Timeout);
          timerRef.current = null;
          // Play alarm sound
          if (alarmRef.current) {
            alarmRef.current.volume = settings.alarmVolume / 100;
            alarmRef.current.currentTime = 0;
            alarmRef.current.play().catch((err) => {
              console.error(
                "Error playing alarm sound file, using fallback:",
                err
              );
              playAudioFallback("alarm");
            });
          }
          // Handle timer completion
          handleTimerComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, settings.alarmVolume]);

  // Update document title with timer
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    const modeEmoji = timerMode === "work" ? "📚" : "☕";
    document.title = `${modeEmoji} ${timeString} - Study Timer`;

    return () => {
      document.title = "Grade Tracker";
    };
  }, [timeLeft, timerMode]);

  // Handle timer completion
  const handleTimerComplete = () => {
    setIsRunning(false);

    if (timerMode === "work") {
      // Completed a work session
      setCompletedPomodoros((prev) => prev + 1);
      const isLongBreakDue =
        completedPomodoros > 0 &&
        (completedPomodoros + 1) % settings.sessionsBeforeLongBreak === 0;

      // Switch to appropriate break mode
      const nextMode = isLongBreakDue ? "longBreak" : "shortBreak";
      setTimerMode(nextMode);

      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setIsRunning(true);
      }

      // Show toast notification
      toast({
        title: "Work session completed!",
        description: isLongBreakDue
          ? "Time for a long break. You've earned it!"
          : "Take a short break.",
      });
    } else {
      // Completed a break
      setTimerMode("work");

      // Auto-start next work session if enabled
      if (settings.autoStartPomodoros) {
        setIsRunning(true);
      }

      // Show toast notification
      toast({
        title: "Break finished",
        description: "Ready to start another work session?",
      });
    }
  };

  // Start/resume timer
  const toggleTimer = async () => {
    // If starting a new session
    if (!currentSession && !isRunning) {
      if (!user) {
        toast({
          title: "Login required",
          description: "Please log in to track study sessions",
          variant: "destructive",
        });
        return;
      }

      // Create a new study session - Convert "none" to null
      const newSession = await startSession(
        selectedSubjectId === "none" ? null : selectedSubjectId,
        sessionNotes
      );

      // Verify session was created successfully
      if (!newSession) {
        toast({
          title: "Error starting session",
          description: "Could not start the study session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log("New session created:", newSession);
    }

    setIsRunning(!isRunning);

    // Play tick sound for feedback
    if (!isRunning && tickRef.current) {
      tickRef.current.volume = 0.3;
      tickRef.current.currentTime = 0;
      tickRef.current.play().catch((err) => {
        console.error("Error playing tick sound file, using fallback:", err);
        playAudioFallback("tick");
      });
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);

    let duration = 0;
    switch (timerMode) {
      case "work":
        duration = settings.workDuration * 60;
        break;
      case "shortBreak":
        duration = settings.shortBreakDuration * 60;
        break;
      case "longBreak":
        duration = settings.longBreakDuration * 60;
        break;
    }
    setTimeLeft(duration);
  };

  // End current study session
  const finishSession = async () => {
    console.log("Finish button clicked, current session:", currentSession);

    if (!currentSession) {
      console.error("No current session to finish");
      toast({
        title: "No active session",
        description: "There is no active study session to finish",
        variant: "destructive",
      });
      return;
    }

    try {
      // Always open the notes dialog to avoid race conditions
      setNotesDialogOpen(true);
    } catch (error) {
      console.error("Error finishing session:", error);
      toast({
        title: "Error preparing to save session",
        description: "Please try again or refresh the page",
        variant: "destructive",
      });
    }
  };

  // Handle saving session notes
  const onNotesSubmit = async (data: z.infer<typeof sessionNotesSchema>) => {
    console.log("Submitting notes", {
      currentSession,
      completedPomodoros,
      data,
    });

    if (!currentSession) {
      console.error("No current session when submitting notes");
      toast({
        title: "Session error",
        description: "Unable to save notes, session not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Notes will be encrypted in the saveStudySession function
      // We make sure we're only passing the notes string here
      const notes = data.notes || "";
      
      // End session with notes and completed pomodoros
      const result = await endSession(completedPomodoros, notes);
      
      if (result) {
        setNotesDialogOpen(false);
        setCompletedPomodoros(0);
        setSessionNotes("");
        notesForm.reset();

        toast({
          title: "Session saved",
          description: "Your notes have been securely saved and encrypted",
        });

        // Force refresh sessions list
        await fetchSessions();
      } else {
        throw new Error("Failed to end session");
      }
    } catch (error) {
      console.error("Error submitting notes:", error);
      toast({
        title: "Error saving notes",
        description:
          "There was a problem saving your session notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle saving settings
  const onSettingsSubmit = async (data: z.infer<typeof settingsSchema>) => {
    await updateSettings(data);
    setSettingsOpen(false);

    toast({
      title: "Settings updated",
      description: "Your preferences have been saved",
    });
  };

  // Handle session deletion
  const confirmDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const deleteSession = async () => {
    if (!sessionToDelete) return;

    await removeSession(sessionToDelete);
    setDeleteDialogOpen(false);
    setSessionToDelete(null);

    toast({
      title: "Session deleted",
      description: "Study session has been removed",
    });
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Format duration for display
  const formatDuration = (minutes: number | null) => {
    if (minutes === null || minutes === undefined) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins} min`;
    }
    return `${hours}h ${mins}m`;
  };

  // Calculate progress percentage for timer
  const progressPercentage = () => {
    let totalDuration = 0;
    switch (timerMode) {
      case "work":
        totalDuration = settings.workDuration * 60;
        break;
      case "shortBreak":
        totalDuration = settings.shortBreakDuration * 60;
        break;
      case "longBreak":
        totalDuration = settings.longBreakDuration * 60;
        break;
    }
    return Math.max(
      0,
      Math.min(100, ((totalDuration - timeLeft) / totalDuration) * 100)
    );
  };

  // Get the subject name by ID
  const getSubjectName = (subjectId: string | null) => {
    if (!subjectId) return "No subject";
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : "Unknown subject";
  };

  // Determine color based on timer mode
  const getModeColor = () => {
    switch (timerMode) {
      case "work":
        return "bg-blue-500";
      case "shortBreak":
        return "bg-green-500";
      case "longBreak":
        return "bg-purple-500";
    }
  };

  const getModeTextColor = () => {
    switch (timerMode) {
      case "work":
        return "text-blue-500";
      case "shortBreak":
        return "text-green-500";
      case "longBreak":
        return "text-purple-500";
    }
  };

  // Loading state
  if (isLoading || subjectsLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Study Timer</h1>
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-12 w-1/3" />
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Format elapsed time - moved inside the component to access currentSession
  const formatElapsedTime = () => {
    if (!currentSession) return "00:00";
    const startTime = new Date(currentSession.startTime).getTime();
    const elapsed = Math.floor((Date.now() - startTime) / 60000); // minutes
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Function to view session details
  const viewSessionDetails = (session: StudySession) => {
    setSelectedSession(session);
    setSessionDetailOpen(true);
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Add this at the beginning of the component, after other calculations
  const totalStudyHours =
    Object.values(stats?.timePerSubject || {}).reduce(
      (sum, time) => sum + time,
      0
    ) / 60;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Study Timer</h1>
      <Tabs defaultValue="timer" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="timer" className="space-y-6">
          {/* Timer Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className={getModeTextColor()}>
                    {timerMode === "work"
                      ? "Focus Time"
                      : timerMode === "shortBreak"
                      ? "Short Break"
                      : "Long Break"}
                  </span>
                  <div className="flex items-center space-x-2">
                    {completedPomodoros > 0 && (
                      <div className="flex -space-x-1 mr-2">
                        {Array.from({ length: completedPomodoros }).map(
                          (_, i) => (
                            <div
                              key={i}
                              className="h-6 w-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center border-2 border-background"
                            >
                              <CheckCircle2 className="h-3 w-3 text-orange-600 dark:text-orange-500" />
                            </div>
                          )
                        )}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSettingsOpen(true)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {timerMode === "work"
                    ? "Focus on your task until the timer ends"
                    : timerMode === "shortBreak"
                    ? "Take a short break to recharge"
                    : "Take a longer break to fully rest your mind"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-6 pb-8">
                {/* SVG circle progress timer */}
                <div className="relative w-64 h-64 mb-8">
                  <svg
                    className="w-full h-full transform -rotate-90 will-change-transform"
                    viewBox="0 0 100 100"
                  >
                    {/* Background track */}
                    <circle
                      className="opacity-20"
                      cx="50"
                      cy="50"
                      r="40"
                      strokeWidth="8"
                      fill="none"
                      stroke={
                        timerMode === "work"
                          ? "#3b82f6"
                          : timerMode === "shortBreak"
                          ? "#22c55e"
                          : "#a855f7"
                      }
                    />

                    {/* Progress indicator with proper animation */}
                    <circle
                      className="transition-all duration-500 linear"
                      cx="50"
                      cy="50"
                      r="40"
                      strokeWidth="8"
                      fill="none"
                      stroke={
                        timerMode === "work"
                          ? "#3b82f6"
                          : timerMode === "shortBreak"
                          ? "#22c55e"
                          : "#a855f7"
                      }
                      strokeDasharray="251.2"
                      strokeDashoffset={
                        251.2 - (progressPercentage() * 251.2) / 100
                      }
                    />
                  </svg>

                  {/* Inner circle with timer display */}
                  <div
                    className="absolute inset-6 rounded-full flex items-center justify-center shadow-inner gpu-accelerated"
                    style={{
                      background: `linear-gradient(135deg, 
                        ${
                          timerMode === "work"
                            ? "rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.2)"
                            : timerMode === "shortBreak"
                            ? "rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.2)"
                            : "rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.2)"
                        })`,
                      transition: "background 0.5s ease",
                    }}
                  >
                    {/* Timer Text */}
                    <div className="text-center">
                      <div
                        className={`text-6xl font-bold tracking-tighter mb-1 ${getModeTextColor()}`}
                      >
                        {formatTime(timeLeft)}
                      </div>
                      <div
                        className={`text-xs uppercase tracking-wider ${getModeTextColor()} opacity-70`}
                      >
                        {timerMode === "work"
                          ? "Focus Time"
                          : timerMode === "shortBreak"
                          ? "Short Break"
                          : "Long Break"}
                      </div>
                    </div>
                  </div>

                  {/* Pulse animation when running */}
                  {isRunning && (
                    <div
                      className="absolute inset-0 rounded-full animate-timer-pulse will-change-opacity"
                      style={{
                        backgroundColor:
                          timerMode === "work"
                            ? "rgba(59, 130, 246, 0.15)"
                            : timerMode === "shortBreak"
                            ? "rgba(34, 197, 94, 0.15)"
                            : "rgba(168, 85, 247, 0.15)",
                    ></div>
                  )}
                </div>

                {/* Timer controls */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={toggleTimer}
                    size="lg"
                    className={`min-w-28 transition-all duration-300 shadow-lg hover:shadow-xl ${
                      timerMode === "work"
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : timerMode === "shortBreak"
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-purple-500 hover:bg-purple-600 text-white"
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" /> Start
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={resetTimer}
                    className="min-w-24 border-2 hover:bg-background"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" /> Reset
                  </Button>
                  {currentSession && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={finishSession}
                      className={`min-w-24 border-2 hover:bg-background ${
                        timerMode === "work"
                          ? "text-blue-500 border-blue-200 hover:border-blue-500"
                          : timerMode === "shortBreak"
                          ? "text-green-500 border-green-200 hover:border-green-500"
                          : "text-purple-500 border-purple-200 hover:border-purple-500"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Finish
                    </Button>
                  )}
                </div>

                {/* Mode Selection */}
                <div className="w-full max-w-sm mx-auto mt-8">
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted/30 rounded-lg">
                    <Button
                      variant={timerMode === "work" ? "subtle" : "ghost"}
                      onClick={() => !isRunning && setTimerMode("work")}
                      disabled={isRunning}
                      className={`rounded-md py-2 ${
                        timerMode === "work"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : ""
                      }`}
                    >
                      Focus
                    </Button>
                    <Button
                      variant={timerMode === "shortBreak" ? "subtle" : "ghost"}
                      onClick={() => !isRunning && setTimerMode("shortBreak")}
                      disabled={isRunning}
                      className={`rounded-md py-2 ${
                        timerMode === "shortBreak"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : ""
                      }`}
                    >
                      Short Break
                    </Button>
                    <Button
                      variant={timerMode === "longBreak" ? "subtle" : "ghost"}
                      onClick={() => !isRunning && setTimerMode("longBreak")}
                      disabled={isRunning}
                      className={`rounded-md py-2 ${
                        timerMode === "longBreak"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                          : ""
                      }`}
                    >
                      Long Break
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Info Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-base">Session Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!currentSession ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">
                          Select Subject
                        </label>
                        <Select
                          value={selectedSubjectId || "none"}
                          onValueChange={setSelectedSubjectId}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Subject</SelectItem>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">
                          Study Goals
                        </label>
                        <Input
                          placeholder="What are you working on?"
                          value={sessionNotes}
                          onChange={(e) => setSessionNotes(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div className="border rounded-lg py-4">
                          <div className="font-medium">Work Duration</div>
                          <div className="text-2xl font-bold text-blue-500 mt-1">
                            {settings.workDuration}
                            <span className="text-sm text-muted-foreground">
                              min
                            </span>
                          </div>
                        </div>

                        <div className="border rounded-lg py-4">
                          <div className="font-medium">Break Duration</div>
                          <div className="text-2xl font-bold text-green-500 mt-1">
                            {settings.shortBreakDuration}
                            <span className="text-sm text-muted-foreground">
                              min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Started
                      </span>
                      <Badge variant="outline">
                        {formatDistanceToNow(
                          new Date(currentSession.startTime),
                          { addSuffix: true }
                        )}
                      </Badge>
                    </div>
                    <div className="border-b pb-3">
                      <h4 className="font-medium mb-2">Subject</h4>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                        <span>{getSubjectName(currentSession.subjectId)}</span>
                      </div>
                    </div>
                    <div className="border-b pb-3">
                      <h4 className="font-medium mb-2">Current Progress</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-background p-2 rounded-lg text-center">
                          <div className="text-xs text-muted-foreground">
                            Pomodoros
                          </div>
                          <div className="text-xl font-bold mt-1 flex items-center justify-center">
                            {completedPomodoros}{" "}
                            <CheckCircle2 className="ml-1 h-4 w-4 text-green-500" />
                          </div>
                        </div>
                        <div className="bg-background p-2 rounded-lg text-center">
                          <div className="text-xs text-muted-foreground">
                            Elapsed
                          </div>
                          <div className="text-xl font-bold mt-1">
                            {formatElapsedTime()}
                          </div>
                        </div>
                      </div>
                    </div>
                    {sessionNotes && (
                      <div>
                        <h4 className="font-medium mb-1">Study Goals</h4>
                        <p className="text-sm text-muted-foreground">
                          {sessionNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History tab content */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Study Session History</CardTitle>
                <CardDescription>
                  Your past focus sessions and achievements
                </CardDescription>
              </div>
              {sessions.length > 0 && (
                <Button variant="outline" size="sm" onClick={fetchSessions}>
                  <RotateCcw className="h-3 w-3 mr-1" /> Refresh
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <div className="space-y-6">
                  {/* Group sessions by date */}
                  {Object.entries(
                    sessions
                      .filter((session) => session.completed)
                      .reduce((acc, session) => {
                        const date = new Date(
                          session.startTime
                        ).toLocaleDateString();
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(session);
                        return acc;
                      }, {} as Record<string, StudySession[]>)
                  ).map(([date, dateSessions]) => (
                    <div key={date}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-1 w-1 rounded-full bg-primary"></div>
                        <h3 className="font-medium">{date}</h3>
                        <div className="h-px flex-1 bg-border"></div>
                        <Badge variant="outline">
                          {dateSessions.reduce(
                            (total, s) => total + (s.duration || 0),
                            0
                          )}{" "}
                          min
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {dateSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => viewSessionDetails(session)}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  session.pomodoros > 0
                                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500"
                                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                              >
                                {session.pomodoros > 0 ? (
                                  <span className="text-xs font-semibold">
                                    {session.pomodoros}x
                                  </span>
                                ) : (
                                  <Clock className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {getSubjectName(session.subjectId)}
                                  {session.notes && (
                                    <span className="ml-2">
                                      <FileText className="h-3 w-3 inline text-muted-foreground" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(
                                    session.startTime
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {" - "}
                                  {session.endTime
                                    ? new Date(
                                        session.endTime
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "In progress"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-sm font-medium">
                                {formatDuration(session.duration)}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering the parent click
                                  confirmDeleteSession(session.id);
                                }}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  icon={<Clock className="w-12 h-12 text-muted-foreground" />}
                  title="No study sessions yet"
                  description="Start the timer to track your study sessions"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats tab content */}
        <TabsContent value="stats">
          {stats ? (
            <div className="space-y-6">
              {/* Overall Stats Panel */}
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex flex-row items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                      <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {formatDuration(stats.totalTimeThisWeek)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Total study time this week
                      </p>
                    </div>
                  </div>

                  <div className="h-16 w-px bg-border hidden md:block"></div>

                  <div className="flex flex-row items-center gap-4">
                    <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full">
                      <Target className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {stats.totalSessions}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Total sessions completed
                      </p>
                    </div>
                  </div>

                  <div className="h-16 w-px bg-border hidden md:block"></div>

                  <div className="flex flex-row items-center gap-4">
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                      <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{stats.streakDays}</h3>
                      <p className="text-sm text-muted-foreground">
                        Day{stats.streakDays !== 1 ? "s" : ""} streak
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Study Summary Card */}
                <Card className="overflow-hidden border-t-4 border-t-blue-500 dark:border-t-blue-600 shadow-sm hover:shadow transition-shadow duration-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart2 className="w-5 h-5 text-blue-500" />
                      Study Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Today's Study Time */}
                      <div className="relative">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-medium flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Today
                          </span>
                          <span className="font-medium">
                            {formatDuration(stats.totalTimeToday)}
                          </span>
                        </div>
                        <div className="relative h-2 w-full bg-blue-100 dark:bg-blue-950 rounded overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded animate-expand"
                            style={{
                              width: `${Math.min(
                                100,
                                (stats.totalTimeToday / 240) * 100
                              )}%`,
                              transition:
                                "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0h</span>
                          <span>2h</span>
                          <span>4h</span>
                        </div>
                      </div>

                      {/* This Week's Study Time */}
                      <div className="relative">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-medium flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            This Week
                          </span>
                          <span className="font-medium">
                            {formatDuration(stats.totalTimeThisWeek)}
                          </span>
                        </div>
                        <div className="relative h-2 w-full bg-indigo-100 dark:bg-indigo-950 rounded overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded animate-expand"
                            style={{
                              width: `${Math.min(
                                100,
                                (stats.totalTimeThisWeek / 1200) * 100
                              )}%`,
                              transition:
                                "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              transitionDelay: "0.2s",
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0h</span>
                          <span>10h</span>
                          <span>20h</span>
                        </div>
                      </div>

                      {/* Study Quality Metrics */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground">
                            Average Session
                          </div>
                          <div className="text-xl font-semibold mt-1 flex items-center">
                            <Timer className="h-4 w-4 mr-1 text-muted-foreground" />
                            {formatDuration(
                              Math.round(stats.averageSessionLength)
                            )}
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground">
                            Last Study
                          </div>
                          <div className="text-sm font-semibold mt-1 flex items-center">
                            <CalendarClock className="h-4 w-4 mr-1 text-muted-foreground" />
                            {stats.lastStudyDate
                              ? new Date(
                                  stats.lastStudyDate
                                ).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Current Streak with Visual Indicator */}
                      {stats.streakDays > 0 && (
                        <div className="border-t pt-3 mt-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Flame
                                className={`h-5 w-5 ${
                                  stats.streakDays > 3
                                    ? "text-orange-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <span>Current Streak</span>
                            </div>
                            <Badge
                              variant={
                                stats.streakDays > 3 ? "default" : "outline"
                              }
                              className={`font-medium ${
                                stats.streakDays > 3 ? "animate-pulse-slow" : ""
                              }`}
                            >
                              {stats.streakDays} day
                              {stats.streakDays !== 1 && "s"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            {Array.from({
                              length: Math.min(stats.streakDays, 7),
                            }).map((_, idx) => (
                              <div
                                key={idx}
                                className={`h-2 flex-1 rounded-sm ${
                                  idx < Math.min(stats.streakDays, 7)
                                    ? "bg-gradient-to-r from-green-500 to-green-400"
                                    : "bg-muted"
                                }`}
                              ></div>
                            ))}
                            {stats.streakDays > 7 && (
                              <Badge
                                variant="outline"
                                size="sm"
                                className="ml-1"
                              >
                                +{stats.streakDays - 7}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Subject Breakdown */}
                <Card className="overflow-hidden border-t-4 border-t-green-500 dark:border-t-green-600 shadow-sm hover:shadow transition-shadow duration-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="w-5 h-5 text-green-500" />
                      Subject Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(stats.timePerSubject).length > 0 ? (
                      <div className="space-y-4 relative">
                        {/* Display total study time */}
                        <div className="absolute top-0 right-0">
                          <Badge variant="outline" className="font-normal">
                            Total:{" "}
                            {formatDuration(
                              Object.values(stats.timePerSubject).reduce(
                                (sum, time) => sum + time,
                                0
                              )
                            )}
                          </Badge>
                        </div>

                        {/* Enhanced subject breakdown with animations */}
                        <div className="pt-6 space-y-4">
                          {Object.entries(stats.timePerSubject)
                            .sort(([, a], [, b]) => b - a)
                            .map(([subjectId, time], index) => {
                              const totalTime = Object.values(
                                stats.timePerSubject
                              ).reduce((a, b) => a + b, 0);
                              const percentage = Math.round(
                                (time / totalTime) * 100
                              );
                              const subject = subjects.find(
                                (s) => s.id === subjectId
                              );
                              const subjectColor = subject?.color || "#94a3b8";

                              return (
                                <div
                                  key={subjectId}
                                  className="space-y-1.5 animate-fadeInUp"
                                  style={{ animationDelay: `${index * 100}ms` }}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 max-w-[70%]">
                                      <div
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                          backgroundColor:
                                            subjectId === "unassigned"
                                              ? "#94a3b8"
                                              : subjectColor,
                                        }}
                                      ></div>
                                      <span
                                        className="font-medium text-sm truncate"
                                        title={getSubjectName(subjectId)}
                                      >
                                        {getSubjectName(subjectId)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        {percentage}%
                                      </span>
                                      <span className="text-sm font-medium">
                                        {formatDuration(time)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="absolute top-0 left-0 h-full rounded-full animate-expand"
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor:
                                          subjectId === "unassigned"
                                            ? "#94a3b8"
                                            : subjectColor,
                                        transition: `width ${
                                          0.8 + index * 0.1
                                        }s cubic-bezier(0.4, 0, 0.2, 1)`,
                                        transitionDelay: `${index * 0.1}s`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>

                        {/* Session count per subject */}
                        <div className="border-t pt-4 mt-4">
                          <h4 className="text-sm font-medium mb-3">
                            Sessions per subject
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(stats.sessionsPerSubject)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 4)
                              .map(([subjectId, count]) => {
                                const subject = subjects.find(
                                  (s) => s.id === subjectId
                                );
                                const subjectColor =
                                  subject?.color || "#94a3b8";

                                return (
                                  <div
                                    key={subjectId}
                                    className="bg-muted/40 p-2 rounded-md flex items-center justify-between"
                                    style={{
                                      borderLeft: `3px solid ${
                                        subjectId === "unassigned"
                                          ? "#94a3b8"
                                          : subjectColor
                                      }`,
                                    }}
                                  >
                                    <span
                                      className="text-xs truncate max-w-[80%]"
                                      title={getSubjectName(subjectId)}
                                    >
                                      {getSubjectName(subjectId)}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {count}
                                    </Badge>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="bg-muted/50 rounded-full p-4 mb-4">
                          <BarChart4 className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          No subject data available yet.
                          <br />
                          Try selecting a subject when starting a study session.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Study Achievements Card */}
                {stats && stats.totalSessions > 0 && (
                  <Card className="md:col-span-2 overflow-hidden border-t-4 border-t-amber-500 dark:border-t-amber-600 shadow-sm hover:shadow transition-shadow duration-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Award className="w-5 h-5 text-amber-500" />
                        Study Achievements
                      </CardTitle>
                      <CardDescription>
                        Track your progress and hit new milestones
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* First Session */}
                        <div
                          className={`border rounded-lg p-4 flex flex-col items-center text-center ${
                            stats.totalSessions >= 1
                              ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                              : "opacity-50"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-full mb-3 ${
                              stats.totalSessions >= 1
                                ? "bg-amber-100 dark:bg-amber-900/30"
                                : "bg-muted"
                            }`}
                          >
                            <Medal
                              className={`h-6 w-6 ${
                                stats.totalSessions >= 1
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <h4 className="font-medium">First Session</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Started your study journey
                          </p>
                          {stats.totalSessions >= 1 && (
                            <Badge variant="outline" className="mt-2">
                              Completed
                            </Badge>
                          )}
                        </div>

                        {/* 5 Sessions */}
                        <div
                          className={`border rounded-lg p-4 flex flex-col items-center text-center ${
                            stats.totalSessions >= 5
                              ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                              : "opacity-50"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-full mb-3 ${
                              stats.totalSessions >= 5
                                ? "bg-amber-100 dark:bg-amber-900/30"
                                : "bg-muted"
                            }`}
                          >
                            <TrendingUp
                              className={`h-6 w-6 ${
                                stats.totalSessions >= 5
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <h4 className="font-medium">5 Sessions</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Building a study habit
                          </p>
                          {stats.totalSessions >= 5 ? (
                            <Badge variant="outline" className="mt-2">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-2">
                              {stats.totalSessions}/5
                            </Badge>
                          )}
                        </div>

                        {/* 3 Day Streak */}
                        <div
                          className={`border rounded-lg p-4 flex flex-col items-center text-center ${
                            stats.streakDays >= 3
                              ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                              : "opacity-50"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-full mb-3 ${
                              stats.streakDays >= 3
                                ? "bg-amber-100 dark:bg-amber-900/30"
                                : "bg-muted"
                            }`}
                          >
                            <Flame
                              className={`h-6 w-6 ${
                                stats.streakDays >= 3
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <h4 className="font-medium">3 Day Streak</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Consistent studying
                          </p>
                          {stats.streakDays >= 3 ? (
                            <Badge variant="outline" className="mt-2">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-2">
                              {stats.streakDays}/3
                            </Badge>
                          )}
                        </div>

                        {/* 10 Hours Total */}
                        <div
                          className={`border rounded-lg p-4 flex flex-col items-center text-center ${
                            totalStudyHours >= 10
                              ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                              : "opacity-50"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-full mb-3 ${
                              totalStudyHours >= 10
                                ? "bg-amber-100 dark:bg-amber-900/30"
                                : "bg-muted"
                            }`}
                          >
                            <Clock
                              className={`h-6 w-6 ${
                                totalStudyHours >= 10
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <h4 className="font-medium">10 Hour Milestone</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Dedicated learning time
                          </p>
                          {totalStudyHours >= 10 ? (
                            <Badge variant="outline" className="mt-2">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-2">
                              {totalStudyHours.toFixed(1)}/10
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart4 className="w-5 h-5 text-primary" /> Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Empty
                  icon={
                    <BarChart4 className="w-12 h-12 text-muted-foreground" />
                  }
                  title="No statistics available"
                  description="Complete study sessions to see your statistics"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Study Session</DialogTitle>
            <DialogDescription>
              Add any notes about what you accomplished during this session.
            </DialogDescription>
          </DialogHeader>

          <Form {...notesForm}>
            <form
              onSubmit={notesForm.handleSubmit(onNotesSubmit)}
              className="space-y-4 py-2"
            >
              <FormField
                control={notesForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What did you accomplish?"
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setNotesDialogOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Save Session
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this study session? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSession}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Details Dialog */}
      <Dialog open={sessionDetailOpen} onOpenChange={setSessionDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Study Session Details
            </DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">
                    {getSubjectName(selectedSession.subjectId)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {formatDuration(selectedSession.duration)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="text-sm">
                    {formatDateTime(selectedSession.startTime)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ended</p>
                  <p className="text-sm">
                    {selectedSession.endTime
                      ? formatDateTime(selectedSession.endTime)
                      : "In progress"}
                  </p>
                </div>
              </div>

              <div className="space-y-1 border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Completed Pomodoros
                  </p>
                  <Badge variant="secondary">
                    {selectedSession.pomodoros}{" "}
                    {selectedSession.pomodoros === 1 ? "cycle" : "cycles"}
                  </Badge>
                </div>
              </div>

              {selectedSession.notes && (
                <div className="space-y-1 border-t pt-4">
                  <p className="text-sm font-medium">Notes</p>
                  <div className="bg-muted/50 p-3 rounded-md text-sm">
                    {selectedSession.notes}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Session ID</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedSession.id.slice(0, 8)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (selectedSession) {
                  confirmDeleteSession(selectedSession.id);
                  setSessionDetailOpen(false);
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Session
            </Button>
            <Button onClick={() => setSessionDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden audio elements */}
      <audio ref={alarmRef} src="/sounds/bell.mp3" preload="auto" />
      <audio ref={tickRef} src="/sounds/tick.mp3" preload="auto" />
    </div>
  );
}

// Audio fallback function if sound files are missing
const playAudioFallback = (type: "alarm" | "tick") => {
  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    if (type === "alarm") {
      oscillator.type = "triangle";
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.5; // Default value if settings is unavailable
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 1000);
    } else {
      oscillator.type = "sine";
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.2;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 100);
    }
  } catch (err) {
    console.error("Error playing audio fallback:", err);
  }
};

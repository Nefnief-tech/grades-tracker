"use client";

import { useState, useEffect, useRef } from "react";
import { useStudySession } from "@/hooks/useStudySession";
import { useSubjects } from "@/hooks/useSubjects";
import { StudySession, PomodoroSettings } from "@/types/studySession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Bell,
  Settings,
  BookOpen,
  Check,
  X,
  ChevronDown,
  Volume2,
  VolumeX,
  Timer,
  Coffee,
  History,
  ListChecks,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format, formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

enum TimerMode {
  WORK = "work",
  SHORT_BREAK = "shortBreak",
  LONG_BREAK = "longBreak",
}

export default function StudyTimerPage() {
  const {
    sessions,
    currentSession,
    startSession,
    endSession,
    removeSession,
    settings: pomodoroSettings,
    updateSettings,
    stats,
    isLoading,
  } = useStudySession();

  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { toast } = useToast();

  // Timer state
  const [mode, setMode] = useState<TimerMode>(TimerMode.WORK);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default: 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [notes, setNotes] = useState("");

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(
    pomodoroSettings || {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      alarmVolume: 50,
      tickVolume: 20,
      autoStartBreaks: false,
      autoStartPomodoros: false,
    }
  );
  const [muted, setMuted] = useState(false);

  // Session history
  const [showHistory, setShowHistory] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  // Audio references
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<HTMLAudioElement | null>(null);

  // Initialize timer based on settings
  useEffect(() => {
    if (pomodoroSettings) {
      setLocalSettings(pomodoroSettings);

      // Set initial timer based on mode
      if (mode === TimerMode.WORK) {
        setTimeLeft(pomodoroSettings.workDuration * 60);
      } else if (mode === TimerMode.SHORT_BREAK) {
        setTimeLeft(pomodoroSettings.shortBreakDuration * 60);
      } else if (mode === TimerMode.LONG_BREAK) {
        setTimeLeft(pomodoroSettings.longBreakDuration * 60);
      }
    }
  }, [pomodoroSettings, mode]);

  // Set selected subject to first subject when loaded
  useEffect(() => {
    if (subjects?.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);

        // Play tick sound every 15 seconds if not muted
        if (!muted && timeLeft % 15 === 0 && tickRef.current) {
          tickRef.current.volume = (localSettings.tickVolume || 20) / 100;
          tickRef.current
            .play()
            .catch((err) => console.error("Error playing tick sound:", err));
        }
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer finished
      setIsActive(false);

      // Play alarm sound
      if (!muted && alarmRef.current) {
        alarmRef.current.volume = (localSettings.alarmVolume || 50) / 100;
        alarmRef.current
          .play()
          .catch((err) => console.error("Error playing alarm sound:", err));
      }

      // Show notification
      if (mode === TimerMode.WORK) {
        // Increment completed pomodoros
        setCompletedPomodoros((prev) => prev + 1);

        // Determine next break type
        const isLongBreakDue =
          (completedPomodoros + 1) % localSettings.sessionsBeforeLongBreak ===
          0;
        const nextMode = isLongBreakDue
          ? TimerMode.LONG_BREAK
          : TimerMode.SHORT_BREAK;

        toast({
          title: "Work session completed!",
          description: `Time for a ${isLongBreakDue ? "long" : "short"} break.`,
        });

        // Auto-start break if setting is enabled
        if (localSettings.autoStartBreaks) {
          setMode(nextMode);
          setTimeLeft(
            nextMode === TimerMode.LONG_BREAK
              ? localSettings.longBreakDuration * 60
              : localSettings.shortBreakDuration * 60
          );
          setIsActive(true);
        } else {
          setMode(nextMode);
          setTimeLeft(
            nextMode === TimerMode.LONG_BREAK
              ? localSettings.longBreakDuration * 60
              : localSettings.shortBreakDuration * 60
          );
        }
      } else {
        // Break finished, back to work
        toast({
          title: "Break completed!",
          description: "Time to get back to work!",
        });

        // Auto-start work if setting is enabled
        if (localSettings.autoStartPomodoros) {
          setMode(TimerMode.WORK);
          setTimeLeft(localSettings.workDuration * 60);
          setIsActive(true);
        } else {
          setMode(TimerMode.WORK);
          setTimeLeft(localSettings.workDuration * 60);
        }
      }
    }

    return () => clearInterval(interval);
  }, [
    isActive,
    timeLeft,
    mode,
    completedPomodoros,
    localSettings,
    muted,
    toast,
  ]);

  // Format timer display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle timer controls
  const handleStart = () => {
    // If no active session, start one
    if (!currentSession) {
      startSession(selectedSubjectId || null, notes);
    }

    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === TimerMode.WORK) {
      setTimeLeft(localSettings.workDuration * 60);
    } else if (mode === TimerMode.SHORT_BREAK) {
      setTimeLeft(localSettings.shortBreakDuration * 60);
    } else {
      setTimeLeft(localSettings.longBreakDuration * 60);
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);

    if (newMode === TimerMode.WORK) {
      setTimeLeft(localSettings.workDuration * 60);
    } else if (newMode === TimerMode.SHORT_BREAK) {
      setTimeLeft(localSettings.shortBreakDuration * 60);
    } else {
      setTimeLeft(localSettings.longBreakDuration * 60);
    }
  };

  // Handle session end
  const handleEndSession = async () => {
    setIsEndingSession(false);

    if (currentSession) {
      setIsActive(false);
      await endSession(completedPomodoros, notes);
      setCompletedPomodoros(0);
      setNotes("");

      toast({
        title: "Study session saved!",
        description: `Completed ${completedPomodoros} pomodoro${
          completedPomodoros !== 1 ? "s" : ""
        }.`,
      });
    }
  };

  // Handle settings update
  const handleUpdateSettings = async () => {
    try {
      if (updateSettings) {
        await updateSettings(localSettings);
      }
      setShowSettings(false);

      // Update current timer if needed
      if (mode === TimerMode.WORK) {
        setTimeLeft(localSettings.workDuration * 60);
      } else if (mode === TimerMode.SHORT_BREAK) {
        setTimeLeft(localSettings.shortBreakDuration * 60);
      } else {
        setTimeLeft(localSettings.longBreakDuration * 60);
      }

      toast({
        title: "Settings updated",
        description: "Your pomodoro settings have been saved.",
      });
    } catch (error) {
      toast({
        title: "Failed to update settings",
        description: "There was a problem saving your settings.",
        variant: "destructive",
      });
    }
  };

  // Get the background color based on current mode
  const getBackgroundColor = () => {
    if (mode === TimerMode.WORK) {
      return "bg-gradient-to-br from-red-100/50 to-red-50 dark:from-red-950/20 dark:to-background";
    } else if (mode === TimerMode.SHORT_BREAK) {
      return "bg-gradient-to-br from-green-100/50 to-green-50 dark:from-green-950/20 dark:to-background";
    } else {
      return "bg-gradient-to-br from-blue-100/50 to-blue-50 dark:from-blue-950/20 dark:to-background";
    }
  };

  // Progress calculation for circular timer
  const calculateProgress = () => {
    let totalSeconds;
    if (mode === TimerMode.WORK) {
      totalSeconds = localSettings.workDuration * 60;
    } else if (mode === TimerMode.SHORT_BREAK) {
      totalSeconds = localSettings.shortBreakDuration * 60;
    } else {
      totalSeconds = localSettings.longBreakDuration * 60;
    }

    return (1 - timeLeft / totalSeconds) * 100;
  };

  if (isLoading || subjectsLoading) {
    return (
      <div className="container py-10 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-center h-96 animate-pulse">
            <Timer className="h-16 w-16 text-muted-foreground opacity-30" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] ${getBackgroundColor()} transition-colors duration-500`}
    >
      <div className="container py-10 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Timer className="h-7 w-7" />
            <span>Study Timer</span>
          </h1>

          {/* Main timer card */}
          <Card className="mb-6 border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                {/* Mode tabs */}
                <div className="mb-6 w-full max-w-md mx-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={mode === TimerMode.WORK ? "default" : "outline"}
                      className={`flex gap-2 ${
                        mode === TimerMode.WORK
                          ? "bg-red-600 hover:bg-red-700"
                          : ""
                      }`}
                      onClick={() => handleModeChange(TimerMode.WORK)}
                    >
                      <Clock className="h-4 w-4" />
                      Work
                    </Button>
                    <Button
                      variant={
                        mode === TimerMode.SHORT_BREAK ? "default" : "outline"
                      }
                      className={`flex gap-2 ${
                        mode === TimerMode.SHORT_BREAK
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }`}
                      onClick={() => handleModeChange(TimerMode.SHORT_BREAK)}
                    >
                      <Coffee className="h-4 w-4" />
                      Short Break
                    </Button>
                    <Button
                      variant={
                        mode === TimerMode.LONG_BREAK ? "default" : "outline"
                      }
                      className={`flex gap-2 ${
                        mode === TimerMode.LONG_BREAK
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }`}
                      onClick={() => handleModeChange(TimerMode.LONG_BREAK)}
                    >
                      <BookOpen className="h-4 w-4" />
                      Long Break
                    </Button>
                  </div>
                </div>

                {/* Timer display */}
                <div className="relative w-64 h-64 mb-6">
                  {/* Circular progress */}
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeDasharray="283"
                      strokeLinecap="round"
                      strokeDashoffset={283 - (283 * calculateProgress()) / 100}
                      className={`
                        ${
                          mode === TimerMode.WORK
                            ? "text-red-600 dark:text-red-500"
                            : ""
                        }
                        ${
                          mode === TimerMode.SHORT_BREAK
                            ? "text-green-600 dark:text-green-500"
                            : ""
                        }
                        ${
                          mode === TimerMode.LONG_BREAK
                            ? "text-blue-600 dark:text-blue-500"
                            : ""
                        }
                        transition-all duration-1000
                      `}
                    />
                  </svg>

                  {/* Time display */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-5xl font-mono font-semibold">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2 capitalize">
                      {mode === TimerMode.WORK
                        ? "Focus Time"
                        : `${
                            mode === TimerMode.SHORT_BREAK ? "Short" : "Long"
                          } Break`}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2 mb-8">
                  {!isActive ? (
                    <Button onClick={handleStart} size="lg" className="gap-2">
                      <Play className="h-4 w-4" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePause}
                      size="lg"
                      variant="outline"
                      className="gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={handleReset} variant="outline" size="lg">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setMuted(!muted)}
                  >
                    {muted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Session stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-6">
                  <Card className="bg-background/50">
                    <CardContent className="p-4 flex flex-col items-center">
                      <p className="text-sm text-muted-foreground">Pomodoros</p>
                      <p className="text-2xl font-bold">{completedPomodoros}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50">
                    <CardContent className="p-4 flex flex-col items-center">
                      <p className="text-sm text-muted-foreground">
                        Total Today
                      </p>
                      <p className="text-2xl font-bold">
                        {stats?.totalTimeToday
                          ? Math.floor(stats.totalTimeToday)
                          : 0}
                        m
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50">
                    <CardContent className="p-4 flex flex-col items-center">
                      <p className="text-sm text-muted-foreground">Sessions</p>
                      <p className="text-2xl font-bold">
                        {stats?.totalSessions || 0}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50">
                    <CardContent className="p-4 flex flex-col items-center">
                      <p className="text-sm text-muted-foreground">Streak</p>
                      <p className="text-2xl font-bold">
                        {stats?.streakDays || 0}d
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Session options */}
                <Collapsible className="w-full">
                  <Card className="bg-background/50">
                    <CardHeader className="py-3 px-4">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer">
                          <CardTitle className="text-md flex items-center gap-2">
                            <ListChecks className="h-4 w-4" />
                            Session Details
                          </CardTitle>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </CollapsibleTrigger>
                    </CardHeader>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Subject selection */}
                          <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Select
                              value={selectedSubjectId || ""}
                              onValueChange={setSelectedSubjectId}
                              disabled={currentSession !== null}
                            >
                              <SelectTrigger id="subject">
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects &&
                                  subjects.map((subject) => (
                                    <SelectItem
                                      key={subject.id}
                                      value={subject.id}
                                    >
                                      <div className="flex items-center gap-2">
                                        {subject.color && (
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                              backgroundColor: subject.color,
                                            }}
                                          />
                                        )}
                                        {subject.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                <SelectItem value="none">No Subject</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Notes */}
                          <div className="space-y-2">
                            <Label htmlFor="notes">Session Notes</Label>
                            <Textarea
                              id="notes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="What are you working on?"
                              className="resize-none"
                              rows={3}
                            />
                          </div>

                          {/* Action buttons */}
                          <div className="flex justify-between pt-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowHistory(true)}
                              className="gap-2"
                            >
                              <History className="h-4 w-4" />
                              History
                            </Button>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setShowSettings(true)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>

                              <Button
                                onClick={() => setIsEndingSession(true)}
                                variant="default"
                                className="gap-2"
                                disabled={!currentSession}
                              >
                                <Check className="h-4 w-4" />
                                End Session
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Timer Settings</DialogTitle>
              <DialogDescription>
                Customize your pomodoro timer settings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="workDuration">Work Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="workDuration"
                    min={5}
                    max={60}
                    step={5}
                    value={[localSettings.workDuration]}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        workDuration: value[0],
                      })
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-center">
                    {localSettings.workDuration}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortBreakDuration">
                  Short Break (minutes)
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="shortBreakDuration"
                    min={1}
                    max={15}
                    step={1}
                    value={[localSettings.shortBreakDuration]}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        shortBreakDuration: value[0],
                      })
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-center">
                    {localSettings.shortBreakDuration}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longBreakDuration">Long Break (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="longBreakDuration"
                    min={5}
                    max={30}
                    step={5}
                    value={[localSettings.longBreakDuration]}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        longBreakDuration: value[0],
                      })
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-center">
                    {localSettings.longBreakDuration}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionsBeforeLongBreak">
                  Sessions Before Long Break
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="sessionsBeforeLongBreak"
                    min={1}
                    max={6}
                    step={1}
                    value={[localSettings.sessionsBeforeLongBreak]}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        sessionsBeforeLongBreak: value[0],
                      })
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-center">
                    {localSettings.sessionsBeforeLongBreak}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alarmVolume">Alarm Volume</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="alarmVolume"
                    min={0}
                    max={100}
                    step={10}
                    value={[localSettings.alarmVolume || 50]}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        alarmVolume: value[0],
                      })
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-center">
                    {localSettings.alarmVolume || 50}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tickVolume">Tick Volume</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="tickVolume"
                    min={0}
                    max={100}
                    step={10}
                    value={[localSettings.tickVolume || 20]}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        tickVolume: value[0],
                      })
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-center">
                    {localSettings.tickVolume || 20}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoStartBreaks">Auto-start Breaks</Label>
                <Switch
                  id="autoStartBreaks"
                  checked={localSettings.autoStartBreaks || false}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      autoStartBreaks: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoStartPomodoros">
                  Auto-start Work Sessions
                </Label>
                <Switch
                  id="autoStartPomodoros"
                  checked={localSettings.autoStartPomodoros || false}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      autoStartPomodoros: checked,
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSettings}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* End session confirmation */}
        <Dialog open={isEndingSession} onOpenChange={setIsEndingSession}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>End Study Session</DialogTitle>
              <DialogDescription>
                You've completed {completedPomodoros} pomodoro
                {completedPomodoros !== 1 ? "s" : ""}. Are you sure you want to
                end this session?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEndingSession(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEndSession}>End Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Session history dialog */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>Study History</DialogTitle>
              <DialogDescription>
                Your previous study sessions
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto">
              {sessions && sessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No study sessions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your completed sessions will appear here
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Pomodoros</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions &&
                      sessions
                        .filter((session) => session.completed)
                        .map((session) => {
                          const subject =
                            subjects &&
                            subjects.find((s) => s.id === session.subjectId);
                          return (
                            <TableRow key={session.id}>
                              <TableCell className="whitespace-nowrap">
                                {format(
                                  new Date(session.startTime),
                                  "MMM d, yyyy"
                                )}
                              </TableCell>
                              <TableCell>
                                {subject ? (
                                  <div className="flex items-center gap-2">
                                    {subject.color && (
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor: subject.color,
                                        }}
                                      />
                                    )}
                                    {subject.name}
                                  </div>
                                ) : (
                                  "No subject"
                                )}
                              </TableCell>
                              <TableCell>
                                {session.duration
                                  ? `${session.duration} min`
                                  : "In progress"}
                              </TableCell>
                              <TableCell>{session.pomodoros}</TableCell>
                              <TableCell className="text-right">
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Clock className="h-4 w-4" />
                                      <span className="sr-only">Details</span>
                                    </Button>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80">
                                    <div className="space-y-2">
                                      <h4 className="font-medium">
                                        Session Details
                                      </h4>
                                      <p className="text-sm">
                                        Started:{" "}
                                        {format(
                                          new Date(session.startTime),
                                          "PPpp"
                                        )}
                                      </p>
                                      {session.endTime && (
                                        <p className="text-sm">
                                          Ended:{" "}
                                          {format(
                                            new Date(session.endTime),
                                            "PPpp"
                                          )}
                                        </p>
                                      )}
                                      {session.notes && (
                                        <div className="pt-2">
                                          <p className="text-sm font-medium">
                                            Notes:
                                          </p>
                                          <p className="text-sm">
                                            {session.notes}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "Are you sure you want to delete this session?"
                                      )
                                    ) {
                                      removeSession(session.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setShowHistory(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Audio elements for sound effects */}
        <audio ref={alarmRef} src="/sounds/bell.mp3" preload="auto" />
        <audio ref={tickRef} src="/sounds/tick.mp3" preload="auto" />
      </div>
    </div>
  );
}

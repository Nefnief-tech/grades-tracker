export interface StudySession {
  id: string;
  userId: string;
  subjectId: string | null;
  startTime: string;
  endTime: string | null;
  duration: number | null; // Duration in minutes
  completed: boolean;
  notes: string;
  pomodoros: number; // Number of completed pomodoro cycles
}

export interface PomodoroSettings {
  workDuration: number; // In minutes
  shortBreakDuration: number; // In minutes
  longBreakDuration: number; // In minutes
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: string;
  alarmVolume: number;
}

export interface StudyStats {
  totalTimeToday: number; // In minutes
  totalTimeThisWeek: number; // In minutes
  totalSessions: number;
  sessionsPerSubject: Record<string, number>;
  timePerSubject: Record<string, number>; // In minutes
  averageSessionLength: number; // In minutes
  streakDays: number;
  lastStudyDate: string | null;
}

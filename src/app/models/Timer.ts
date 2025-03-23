export interface TimerSettings {
  id: string;
  name: string;
  icon?: string;
  type: 'pomodoro' | 'custom';
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
  longBreakDuration?: number; // in seconds
  longBreakInterval?: number; // number of sessions before long break
  autoStartNextSession?: boolean;
  sound?: string;
  vibration?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimerSession {
  id: string;
  timerSettingsId?: string;
  habitId?: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  type: 'work' | 'break' | 'long-break';
  completed: boolean;
  interrupted?: boolean;
  notes?: string;
}

export interface StudySession {
  id: string;
  subject: string;
  task?: string;
  tags: string[];
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  notes?: string;
  focusRating?: number; // 1-5 rating of focus
  timerSessions?: TimerSession[];
} 
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { TimerSettings, TimerSession, StudySession } from '../models/Timer';
import { useHabitStore } from './habitStore';

interface TimerState {
  timerSettings: TimerSettings[];
  activeTimerId: string | null;
  timerSessions: TimerSession[];
  studySessions: StudySession[];
  timerState: 'idle' | 'running' | 'paused' | 'completed';
  activeHabitId: string | null; // Track which habit is being studied
  currentSession: {
    type: 'work' | 'break' | 'long-break';
    startTime: string | null;
    timeLeft: number; // in seconds
    elapsedTime: number; // in seconds
    totalDuration: number; // in seconds
    sessionsCompleted: number;
  };
  
  // Timer Settings CRUD
  addTimerSettings: (settings: Omit<TimerSettings, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTimerSettings: (id: string, updates: Partial<TimerSettings>) => void;
  deleteTimerSettings: (id: string) => void;
  
  // Timer Control
  startTimer: (timerId: string, sessionType?: 'work' | 'break' | 'long-break', habitId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (completed?: boolean) => void;
  resetTimer: () => void;
  tick: () => void;
  
  // Study Session CRUD
  addStudySession: (session: Omit<StudySession, 'id' | 'duration'>) => string;
  updateStudySession: (id: string, updates: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;
  completeStudySession: (id: string, focusRating?: number, notes?: string) => void;
  
  // Habit tracking
  setActiveHabit: (habitId: string | null) => void;
  getActiveHabitProgress: () => { hoursSpent: number, totalHours: number, percentComplete: number, isCompleted: boolean } | null;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      timerSettings: [
        {
          id: 'default-pomodoro',
          name: 'Standard Pomodoro',
          icon: 'clock',
          type: 'pomodoro',
          workDuration: 25 * 60, // 25 minutes
          breakDuration: 5 * 60, // 5 minutes
          longBreakDuration: 15 * 60, // 15 minutes
          longBreakInterval: 4, // After 4 work sessions
          autoStartNextSession: true,
          sound: 'chime',
          vibration: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'long-focus',
          name: 'Long Focus Session',
          icon: 'brain',
          type: 'custom',
          workDuration: 50 * 60, // 50 minutes
          breakDuration: 10 * 60, // 10 minutes
          autoStartNextSession: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      activeTimerId: null,
      activeHabitId: null,
      timerSessions: [],
      studySessions: [],
      timerState: 'idle',
      currentSession: {
        type: 'work',
        startTime: null,
        timeLeft: 0,
        elapsedTime: 0,
        totalDuration: 0,
        sessionsCompleted: 0,
      },
      
      addTimerSettings: (settings) => {
        const newSettings: TimerSettings = {
          ...settings,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          timerSettings: [...state.timerSettings, newSettings],
        }));
      },
      
      updateTimerSettings: (id, updates) => {
        set((state) => ({
          timerSettings: state.timerSettings.map((settings) =>
            settings.id === id
              ? { ...settings, ...updates, updatedAt: new Date().toISOString() }
              : settings
          ),
        }));
      },
      
      deleteTimerSettings: (id) => {
        set((state) => ({
          timerSettings: state.timerSettings.filter((settings) => settings.id !== id),
        }));
      },
      
      startTimer: (timerId, sessionType = 'work', habitId = null) => {
        const state = get();
        const settings = state.timerSettings.find((s) => s.id === timerId);
        
        if (!settings) return;
        
        const duration = sessionType === 'work' 
          ? settings.workDuration 
          : sessionType === 'break' 
            ? settings.breakDuration 
            : settings.longBreakDuration || settings.breakDuration * 3;
        
        // Create a new timer session
        const timerSession: TimerSession = {
          id: uuidv4(),
          timerSettingsId: timerId,
          habitId: habitId || state.activeHabitId, // Link to habit if provided
          startTime: new Date().toISOString(),
          duration: 0, // Will be updated when timer completes
          type: sessionType,
          completed: false,
        };
        
        set({
          activeTimerId: timerId,
          timerState: 'running',
          currentSession: {
            type: sessionType,
            startTime: new Date().toISOString(),
            timeLeft: duration,
            elapsedTime: 0,
            totalDuration: duration,
            sessionsCompleted: state.currentSession.sessionsCompleted,
          },
          timerSessions: [...state.timerSessions, timerSession],
        });
      },
      
      pauseTimer: () => {
        set({ timerState: 'paused' });
      },
      
      resumeTimer: () => {
        set({ timerState: 'running' });
      },
      
      stopTimer: (completed = false) => {
        const state = get();
        const currentTime = new Date().toISOString();
        
        // Update the current timer session
        const updatedTimerSessions = [...state.timerSessions];
        const currentSessionIndex = updatedTimerSessions.length - 1;
        
        if (currentSessionIndex >= 0) {
          const elapsedTime = state.currentSession.elapsedTime;
          updatedTimerSessions[currentSessionIndex] = {
            ...updatedTimerSessions[currentSessionIndex],
            endTime: currentTime,
            duration: elapsedTime,
            completed: completed,
            interrupted: !completed,
          };
          
          // Update habit progress if this was a completed work session and linked to a habit
          if (completed && state.currentSession.type === 'work' && state.activeHabitId) {
            // Convert seconds to hours (for tracking against habit duration)
            const hoursSpent = elapsedTime / 3600;
            
            // Get habits from the store
            const habitStore = useHabitStore.getState();
            const habit = habitStore.habits.find(h => h.id === state.activeHabitId);
            
            if (habit) {
              // Add a completion entry to track this study session
              habitStore.completeHabit({
                habitId: state.activeHabitId,
                date: currentTime,
                count: hoursSpent, // Store the actual hours instead of just "1"
                notes: `Completed ${Math.round(hoursSpent * 100) / 100} hours of study with timer`
              });
              
              // Check if habit is fully completed (exactly at or over 100%)
              const progress = get().getActiveHabitProgress();
              if (progress && progress.percentComplete >= 100) {
                // Mark the habit as fully completed
                habitStore.updateHabit(state.activeHabitId, {
                  isCompleted: true
                });
              } else {
                // Ensure the habit is marked as not completed if under 100%
                habitStore.updateHabit(state.activeHabitId, {
                  isCompleted: false
                });
              }
            }
          }
        }
        
        // If the timer was completed, increment the sessions counter
        const sessionsCompleted = completed 
          ? state.currentSession.type === 'work'
            ? state.currentSession.sessionsCompleted + 1
            : state.currentSession.sessionsCompleted
          : state.currentSession.sessionsCompleted;
        
        set({
          timerState: 'idle',
          timerSessions: updatedTimerSessions,
          currentSession: {
            ...state.currentSession,
            startTime: null,
            timeLeft: 0,
            elapsedTime: 0,
            sessionsCompleted,
          },
        });
        
        // If auto-start is enabled and the timer completed successfully, start the next session
        if (completed && state.activeTimerId) {
          const settings = state.timerSettings.find((s) => s.id === state.activeTimerId);
          
          if (settings?.autoStartNextSession) {
            // Determine next session type
            let nextSessionType: 'work' | 'break' | 'long-break';
            
            if (state.currentSession.type !== 'work') {
              // After a break, always go back to work
              nextSessionType = 'work';
            } else {
              // After work, determine if we need a long break or a regular break
              const longBreakInterval = settings.longBreakInterval || 4;
              nextSessionType = (sessionsCompleted % longBreakInterval === 0)
                ? 'long-break'
                : 'break';
            }
            
            // Start the next session
            get().startTimer(state.activeTimerId, nextSessionType, state.activeHabitId);
          }
        }
      },
      
      resetTimer: () => {
        set((state) => {
          const settings = state.activeTimerId 
            ? state.timerSettings.find((s) => s.id === state.activeTimerId) 
            : null;
          
          const duration = settings 
            ? state.currentSession.type === 'work'
              ? settings.workDuration
              : state.currentSession.type === 'break'
                ? settings.breakDuration
                : settings.longBreakDuration || settings.breakDuration * 3
            : 0;
          
          return {
            timerState: 'idle',
            currentSession: {
              ...state.currentSession,
              timeLeft: duration,
              elapsedTime: 0,
              totalDuration: duration,
            },
          };
        });
      },
      
      tick: () => {
        set((state) => {
          if (state.timerState !== 'running' || state.currentSession.timeLeft <= 0) {
            return state;
          }
          
          const timeLeft = Math.max(0, state.currentSession.timeLeft - 1);
          const elapsedTime = state.currentSession.elapsedTime + 1;
          
          // If timer has reached zero, complete it
          if (timeLeft === 0) {
            get().stopTimer(true);
          }
          
          return {
            currentSession: {
              ...state.currentSession,
              timeLeft,
              elapsedTime,
            },
          };
        });
      },
      
      addStudySession: (session) => {
        const id = uuidv4();
        const newSession: StudySession = {
          ...session,
          id,
          habitId: session.habitId || get().activeHabitId, // Link to active habit
          duration: 0, // Will be calculated when session ends
          startTime: session.startTime || new Date().toISOString(),
        };
        
        set((state) => ({
          studySessions: [...state.studySessions, newSession],
        }));
        
        return id;
      },
      
      updateStudySession: (id, updates) => {
        set((state) => ({
          studySessions: state.studySessions.map((session) =>
            session.id === id ? { ...session, ...updates } : session
          ),
        }));
      },
      
      deleteStudySession: (id) => {
        set((state) => ({
          studySessions: state.studySessions.filter((session) => session.id !== id),
        }));
      },
      
      completeStudySession: (id, focusRating, notes) => {
        set((state) => {
          const sessionIndex = state.studySessions.findIndex((s) => s.id === id);
          if (sessionIndex === -1) return state;
          
          const session = state.studySessions[sessionIndex];
          const endTime = new Date().toISOString();
          
          // Calculate duration in seconds
          const startDate = new Date(session.startTime);
          const endDate = new Date(endTime);
          const durationMs = endDate.getTime() - startDate.getTime();
          const durationSeconds = Math.floor(durationMs / 1000);
          
          // Filter timer sessions associated with this study session
          const relatedTimerSessions = state.timerSessions.filter(
            (ts) => ts.id === session.id
          );
          
          const updatedStudySessions = [...state.studySessions];
          updatedStudySessions[sessionIndex] = {
            ...session,
            endTime,
            duration: durationSeconds,
            focusRating,
            notes: notes || session.notes,
            timerSessions: relatedTimerSessions,
          };
          
          return {
            studySessions: updatedStudySessions,
          };
        });
      },
      
      // New methods for habit tracking
      setActiveHabit: (habitId) => {
        set({ activeHabitId: habitId });
      },
      
      getActiveHabitProgress: () => {
        const state = get();
        if (!state.activeHabitId) return null;
        
        // Get the habit from the habit store
        const habitStore = useHabitStore.getState();
        const habit = habitStore.habits.find(h => h.id === state.activeHabitId);
        
        if (!habit || !habit.duration) return null;
        
        // Calculate total hours spent on this habit
        
        // 1. Calculate hours from habit completions
        let totalHoursSpent = 0;
        
        // Go through each completion
        habit.completions.forEach(completion => {
          if (completion.notes && completion.notes.includes('hours of study with timer')) {
            // This is a timer-tracked completion - extract hours from the notes
            const hoursMatch = completion.notes.match(/Completed (\d+(\.\d+)?) hours/);
            if (hoursMatch && hoursMatch[1]) {
              totalHoursSpent += parseFloat(hoursMatch[1]);
            } else {
              // Fallback to the count if we can't parse the notes
              totalHoursSpent += completion.count || 0;
            }
          } else {
            // This is a manually tracked completion
            totalHoursSpent += completion.count || 0;
          }
        });
        
        // 2. Add current session time if active
        if (state.timerState === 'running' && 
            state.activeHabitId === habit.id && 
            state.currentSession.type === 'work') {
          const currentSessionHours = state.currentSession.elapsedTime / 3600;
          totalHoursSpent += currentSessionHours;
        }
        
        // 3. Calculate percentage (with bounds)
        const totalHours = habit.duration;
        const percentComplete = Math.min(100, Math.max(0, (totalHoursSpent / totalHours) * 100));
        
        return {
          hoursSpent: totalHoursSpent,
          totalHours,
          percentComplete,
          isCompleted: percentComplete >= 100
        };
      },
    }),
    {
      name: 'ascend-timer-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration of timer state from older versions
        if (version === 0) {
          // Return a fresh state if migrating from version 0
          return {
            timerSettings: [
              {
                id: 'default-pomodoro',
                name: 'Standard Pomodoro',
                icon: 'clock',
                type: 'pomodoro',
                workDuration: 25 * 60,
                breakDuration: 5 * 60,
                longBreakDuration: 15 * 60,
                longBreakInterval: 4,
                autoStartNextSession: true,
                sound: 'chime',
                vibration: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'long-focus',
                name: 'Long Focus Session',
                icon: 'brain',
                type: 'custom',
                workDuration: 50 * 60,
                breakDuration: 10 * 60,
                autoStartNextSession: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            activeTimerId: null,
            activeHabitId: null,
            timerSessions: [],
            studySessions: [],
            timerState: 'idle',
            currentSession: {
              type: 'work',
              startTime: null,
              timeLeft: 0,
              elapsedTime: 0,
              totalDuration: 0,
              sessionsCompleted: 0,
            }
          };
        }
        return persistedState as TimerState;
      },
    }
  )
); 
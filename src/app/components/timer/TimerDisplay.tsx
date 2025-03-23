"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimerStore } from '@/app/store/timerStore';
import { useHabitStore } from '@/app/store/habitStore';
import { FiPlay, FiPause, FiSkipForward, FiStopCircle } from 'react-icons/fi';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function TimerDisplay() {
  // Add a state to track client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  const {
    timerState,
    currentSession,
    activeTimerId,
    activeHabitId,
    timerSettings,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    tick,
    getActiveHabitProgress
  } = useTimerStore();
  
  const { habits } = useHabitStore();
  const activeHabit = isClient ? habits.find(h => h.id === activeHabitId) : null;
  const habitProgress = isClient && activeHabit ? getActiveHabitProgress() : null;

  // Local state for timer animation
  const [timerKey, setTimerKey] = useState(0);
  
  // References for tracking time 
  const lastTimestampRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get active timer settings
  const activeTimer = isClient ? timerSettings.find(s => s.id === activeTimerId) : null;
  
  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Handle timer with accurate time tracking
  useEffect(() => {
    if (!isClient) return; // Skip on server-side rendering
    
    const handleVisibilityChange = () => {
      if (timerState !== 'running') return;
      
      if (document.visibilityState === 'visible') {
        // Tab is now visible, calculate elapsed time
        const now = Date.now();
        const elapsedMs = now - lastTimestampRef.current;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        
        // Update the timestamp
        lastTimestampRef.current = now;
        
        // Tick the timer for each second that passed while hidden
        if (elapsedSeconds > 0) {
          for (let i = 0; i < elapsedSeconds; i++) {
            tick();
          }
        }
      } else {
        // Tab is now hidden, save the timestamp
        lastTimestampRef.current = Date.now();
      }
    };
    
    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up interval for when tab is visible
    if (timerState === 'running') {
      // Reset the timestamp to prevent double-counting
      lastTimestampRef.current = Date.now();
      
      // Use setInterval for consistent ticking when visible
      intervalRef.current = setInterval(() => {
        // Only tick if the tab is visible to prevent double counting
        if (document.visibilityState === 'visible') {
          const now = Date.now();
          const elapsed = now - lastTimestampRef.current;
          // Only tick if at least 1 second has passed
          if (elapsed >= 1000) {
            lastTimestampRef.current = now;
            tick();
          }
        }
      }, 1000);
    }
    
    // Cleanup listeners and intervals
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState, tick, isClient]);
  
  // Reset animation key when timer changes
  useEffect(() => {
    if (!isClient) return;
    setTimerKey(prev => prev + 1);
  }, [currentSession.type, currentSession.timeLeft, isClient]);

  // Update display when active timer changes
  useEffect(() => {
    if (!isClient) return;
    if (activeTimerId && timerState === 'idle') {
      resetTimer();
    }
  }, [activeTimerId, timerState, resetTimer, isClient]);

  const handlePlayPause = () => {
    if (timerState === 'idle') {
      // If no timer is active, start with default Pomodoro
      if (!activeTimerId) {
        const defaultTimer = timerSettings.find(s => s.id === 'default-pomodoro');
        if (defaultTimer) {
          startTimer(defaultTimer.id);
        }
      } else {
        // Resume current timer
        startTimer(activeTimerId, currentSession.type);
      }
    } else if (timerState === 'running') {
      pauseTimer();
    } else if (timerState === 'paused') {
      resumeTimer();
    }
  };

  const handleSkip = () => {
    if (!activeTimerId) return;
    
    // Current session is work, skip to break
    if (currentSession.type === 'work') {
      stopTimer(true); // Complete the current work session
    } 
    // Current session is break, skip to work
    else {
      stopTimer(true); // Complete the current break session
    }
  };

  const handleStop = () => {
    stopTimer(false);
    resetTimer();
  };

  // Get timeLeft or default duration from active timer
  let timeLeft = currentSession.timeLeft;
  if (isClient && timeLeft === 0 && activeTimerId && timerState === 'idle') {
    const settings = timerSettings.find(s => s.id === activeTimerId);
    if (settings) {
      timeLeft = settings.workDuration;
    }
  }

  // Calculate progress percentage
  const progress = isClient && currentSession.totalDuration > 0
    ? ((currentSession.totalDuration - currentSession.timeLeft) / currentSession.totalDuration) * 100
    : 0;

  // Determine session type label
  const sessionTypeLabel = currentSession.type === 'long-break' 
    ? 'Long Break' 
    : `${currentSession.type === 'work' ? 'Work' : 'Break'} Session`;

  // If not client-side yet, show a minimal loading state to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-80 h-80 mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl font-bold text-text-light dark:text-text-dark font-display">
              00:00
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-80 h-80 mb-6">
        {/* Progress circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            key={timerKey}
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className={`text-primary-500 dark:text-primary-400`}
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dashoffset"
              from={283 - (283 * (progress - (100 / currentSession.totalDuration))) / 100}
              to={283 - (283 * progress) / 100}
              dur="1s"
              begin="0s"
              fill="freeze"
            />
          </circle>
        </svg>
        
        {/* Timer text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={`time-${timeLeft}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-7xl font-bold text-text-light dark:text-text-dark font-display"
            >
              {formatTime(timeLeft)}
            </motion.span>
          </AnimatePresence>
          
          <span className="text-sm text-text-muted mt-2 capitalize">
            {timerState === 'idle' ? 'Ready' : timerState === 'paused' ? 'Paused' : sessionTypeLabel}
          </span>
          
          {activeTimer && (
            <span className="text-xs text-text-muted mt-1">{activeTimer.name}</span>
          )}
          
          {/* Display active habit if any */}
          {activeHabit && (
            <div className="mt-3 flex flex-col items-center">
              <span className="px-4 py-1.5 bg-study-primary/40 text-white text-sm font-medium rounded-full border border-study-primary/50 shadow-md shadow-study-primary/20">
                Tracking: {activeHabit.name}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Timer controls */}
      <div className="flex items-center space-x-5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStop}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            timerState === 'idle'
              ? 'text-text-muted/50 cursor-not-allowed'
              : 'text-text-muted hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400'
          } focus:outline-none`}
          aria-label="Stop timer"
          disabled={timerState === 'idle'}
        >
          <FiStopCircle className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handlePlayPause}
          className={`w-16 h-16 flex items-center justify-center rounded-full focus:outline-none ${
            timerState === 'running'
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
          aria-label={timerState === 'running' ? 'Pause timer' : 'Start timer'}
        >
          {timerState === 'running' ? (
            <FiPause className="w-8 h-8" />
          ) : (
            <FiPlay className="w-8 h-8 ml-1" />
          )}
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSkip}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            timerState === 'idle'
              ? 'text-text-muted/50 cursor-not-allowed'
              : 'text-text-muted hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400'
          } focus:outline-none`}
          aria-label="Skip to next session"
          disabled={timerState === 'idle'}
        >
          <FiSkipForward className="w-6 h-6" />
        </motion.button>
      </div>
      
      {/* Session counter */}
      {currentSession.sessionsCompleted > 0 && (
        <div className="mt-6 text-sm text-text-muted">
          Sessions completed: <span className="font-medium">{currentSession.sessionsCompleted}</span>
        </div>
      )}
    </div>
  );
} 
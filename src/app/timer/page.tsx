"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiSettings, FiPlus, FiChevronDown, FiChevronUp, FiTrash } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import TimerDisplay from '../components/timer/TimerDisplay';
import { useTimerStore } from '../store/timerStore';
import { useHabitStore } from '../store/habitStore';
import { TimerSettings } from '../models/Timer';

export default function TimerPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeTimerTab, setActiveTimerTab] = useState(0);
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(null);
  const [isTrackingExpanded, setIsTrackingExpanded] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  
  // Prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Only access stores after client-side rendering
  const { 
    timerSettings, 
    timerState,
    activeTimerId, 
    activeHabitId,
    studySessions,
    currentSession,
    getActiveHabitProgress,
    createTimer, 
    startTimer, 
    setActiveHabit, 
    resetTimer, 
    deleteTimer
  } = useTimerStore();
  
  const { habits } = useHabitStore();
  
  // Get study habits (category: 'study')
  const studyHabits = isClient ? habits.filter(habit => habit.category === 'study' || habit.category === 'work') : [];
  
  // Get habit progress only on client side
  const habitProgress = isClient ? getActiveHabitProgress() : null;
  
  // Initialize with active timer or default
  useEffect(() => {
    if (isClient) {
      setSelectedTimerId(activeTimerId || 'default-pomodoro');
    }
  }, [isClient, activeTimerId]);
  
  // Initialize with active habit
  useEffect(() => {
    if (isClient && activeHabitId) {
      setSelectedHabitId(activeHabitId);
    }
  }, [isClient, activeHabitId]);
  
  // Show loading state when not client-side
  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen bg-dark text-white">
        <Navbar />
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-pulse w-64 h-64 rounded-full bg-black/20"></div>
        </div>
      </div>
    );
  }
  
  const handleSelectTimer = (timerId: string) => {
    setSelectedTimerId(timerId);
  };
  
  const handleSelectHabit = (habitId: string) => {
    setSelectedHabitId(habitId);
    setActiveHabit(habitId);
  };
  
  const handleStartStudySession = () => {
    if (!selectedHabitId) return; // Require habit selection instead of subject
    
    // Create and start study session
    const studySessionId = createTimer({
      subject: habits.find(h => h.id === selectedHabitId)?.name || 'Study Session', // Use habit name as subject
      tags: [],
      habitId: selectedHabitId,
      startTime: new Date().toISOString(),
    });
    
    // Start the timer if not already running
    if (selectedTimerId) {
      setActiveHabit(selectedHabitId);
      startTimer(selectedTimerId, 'work', selectedHabitId);
    }
    
    // Close tracking panel
    setIsTrackingExpanded(false);
  };
  
  // Add a function to handle the "New Preset" button click
  const handleNewPreset = () => {
    // Create a new default preset
    const newTimerSettings: Omit<TimerSettings, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Custom Preset',
      type: 'custom',
      icon: 'clock',
      workDuration: 25 * 60, // 25 minutes default
      breakDuration: 5 * 60, // 5 minutes default
      longBreakDuration: 15 * 60, // 15 minutes default
      longBreakInterval: 4,
      autoStartNextSession: true,
      sound: 'chime',
      vibration: true
    };
    
    // Add the new preset
    createTimer(newTimerSettings);
  };
  
  const handleTimerSettings = (timerId: string) => {
    // In a real application, this would open a modal with timer settings
    // For now, use basic browser prompt to demonstrate functionality
    const timer = timerSettings.find(t => t.id === timerId);
    if (!timer) return;
    
    const workMinutes = prompt('Enter work duration in minutes:', String(timer.workDuration / 60));
    if (workMinutes === null) return;
    
    const breakMinutes = prompt('Enter break duration in minutes:', String(timer.breakDuration / 60));
    if (breakMinutes === null) return;
    
    const longBreakMinutes = prompt('Enter long break duration in minutes (optional):', 
      timer.longBreakDuration ? String(timer.longBreakDuration / 60) : '15');
    
    const workDuration = parseInt(workMinutes) * 60;
    const breakDuration = parseInt(breakMinutes) * 60;
    const longBreakDuration = longBreakMinutes ? parseInt(longBreakMinutes) * 60 : undefined;
    
    // Update the timer settings
    updateTimerSettings(timerId, {
      workDuration: isNaN(workDuration) ? timer.workDuration : workDuration,
      breakDuration: isNaN(breakDuration) ? timer.breakDuration : breakDuration,
      longBreakDuration: isNaN(longBreakDuration!) ? timer.longBreakDuration : longBreakDuration,
    });
  };
  
  const handleDeleteTimer = (timerId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the timer
    
    // Don't allow deletion of default timers
    if (timerId === 'default-pomodoro' || timerId === 'long-focus') {
      alert('Default presets cannot be deleted.');
      return;
    }
    
    // Confirm deletion
    if (confirm('Are you sure you want to delete this timer preset?')) {
      // Update selected timer if the deleted one was selected
      if (selectedTimerId === timerId) {
        setSelectedTimerId('default-pomodoro');
      }
      
      // Update active timer if the deleted one was active
      if (activeTimerId === timerId) {
        startTimer('default-pomodoro');
        resetTimer();
      }
      
      // Delete the timer
      deleteTimerSettings(timerId);
    }
  };
  
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-white">Focus Timer</h1>
          <p className="text-white/80">Stay productive with timed work sessions</p>
        </div>
        
        {/* Timer Display */}
        <div className="mb-12 flex justify-center py-4">
          <TimerDisplay />
        </div>
        
        {/* Active Habit Progress */}
        {activeHabitId && habitProgress && (
          <div className="mb-8 p-5 bg-gradient-to-br from-study-primary/20 to-study-primary/5 rounded-xl border border-study-primary/30 shadow-lg shadow-study-primary/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-white">
                {habits.find(h => h.id === activeHabitId)?.name || 'Study Progress'}
              </h3>
              <div className="flex items-center gap-3">
                <div className="text-sm text-white/90 font-medium bg-study-primary/30 px-3 py-1 rounded-full">
                  {habitProgress.percentComplete.toFixed(1)}% complete
                </div>
                <button 
                  onClick={() => {
                    setActiveHabit(null);
                    setSelectedHabitId(null);
                  }}
                  className="p-1.5 text-white/70 hover:text-red-400 rounded-full hover:bg-white/10"
                  aria-label="Stop tracking this habit"
                >
                  <FiTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="w-full bg-black/40 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className="h-full rounded-full bg-study-primary transition-all duration-500 ease-out"
                style={{ width: `${habitProgress.percentComplete}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">
                <span className="font-medium text-white">{habitProgress.hoursSpent.toFixed(1)}</span> hours completed
              </span>
              <span className="text-sm text-white/80">
                <span className="font-medium text-white">{(habitProgress.totalHours - habitProgress.hoursSpent).toFixed(1)}</span> hours remaining
              </span>
            </div>
          </div>
        )}
        
        {/* Timer Presets */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-white">Timer Presets</h2>
            <button 
              className="btn-outline flex items-center text-sm"
              onClick={handleNewPreset}
            >
              <FiPlus className="mr-1.5" />
              New Preset
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {timerSettings.map((timer) => (
              <motion.div
                key={timer.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleSelectTimer(timer.id);
                  // Also update the active timer in the store when clicked
                  if (timer.id !== activeTimerId) {
                    startTimer(timer.id, 'work', activeHabitId || undefined);
                    resetTimer();
                  }
                }}
                className={`glow-card orange p-4 rounded-xl bg-gradient-to-br from-primary-600/30 to-primary-400/10 border border-primary-500/30 hover:-translate-y-1 transition-transform duration-300 cursor-pointer ${
                  selectedTimerId === timer.id
                    ? 'ring-2 ring-primary-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                    : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-full bg-primary-500/40 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                    <FiClock className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{timer.name}</h3>
                    <div className="text-sm text-white/80 flex items-center">
                      <span>
                        {Math.floor(timer.workDuration / 60)}m work / {Math.floor(timer.breakDuration / 60)}m break
                      </span>
                      {timer.longBreakDuration && (
                        <span className="ml-1">
                          / {Math.floor(timer.longBreakDuration / 60)}m long break
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex">
                    <button 
                      className="p-2 text-white/70 hover:text-primary-400 rounded-full hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent selecting the timer
                        // Open settings for this specific timer
                        handleTimerSettings(timer.id);
                      }}
                    >
                      <FiSettings className="w-4 h-4" />
                    </button>
                    
                    {/* Delete button - only show for custom presets */}
                    {timer.id !== 'default-pomodoro' && timer.id !== 'long-focus' && (
                      <button 
                        className="p-2 text-white/70 hover:text-red-400 rounded-full hover:bg-white/10 ml-1"
                        onClick={(e) => handleDeleteTimer(timer.id, e)}
                        aria-label="Delete timer preset"
                      >
                        <FiTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Study Session Tracking */}
        <div className="glow-card blue rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-400/10 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.25)] mb-8 overflow-hidden">
          <button 
            onClick={() => setIsTrackingExpanded(!isTrackingExpanded)}
            className="w-full p-6 text-left flex items-center justify-between focus:outline-none"
          >
            <h2 className="text-lg font-medium text-white">Track Study Session</h2>
            <div className="text-white">
              {isTrackingExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </div>
          </button>
          
          <AnimatePresence>
            {isTrackingExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6"
              >
                <div className="space-y-4">
                  {/* Select Study Habit - now the primary focus */}
                  {studyHabits.length > 0 && (
                    <div>
                      <label htmlFor="studyHabit" className="block text-sm font-medium text-white mb-1">
                        Select Habit to Track
                      </label>
                      <select
                        id="studyHabit"
                        className="input text-white bg-black/30 border-white/20 w-full"
                        value={selectedHabitId || ''}
                        onChange={(e) => handleSelectHabit(e.target.value || null)}
                        style={{color: 'rgba(255, 255, 255, 1) !important', WebkitTextFillColor: 'white', opacity: '1 !important'}}
                      >
                        <option value="" style={{backgroundColor: '#333', color: 'white'}}>-- Select a habit --</option>
                        {studyHabits.map(habit => (
                          <option key={habit.id} value={habit.id} style={{backgroundColor: '#333', color: 'white'}}>
                            {habit.name} {habit.duration ? `(${habit.duration} hours)` : ''}
                          </option>
                        ))}
                      </select>
                      
                      {selectedHabitId && (
                        <div className="mt-3 p-3 bg-study-primary/20 rounded-lg border border-study-primary/30">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-white font-medium">
                              {habits.find(h => h.id === selectedHabitId)?.name}
                            </p>
                            <button 
                              onClick={() => {
                                setSelectedHabitId(null);
                              }}
                              className="p-1 text-white/70 hover:text-red-400 rounded-full hover:bg-white/10"
                              aria-label="Clear selection"
                            >
                              <FiTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-white/80">
                            Hours spent will be deducted from habit&apos;s duration goal
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {studyHabits.length === 0 && (
                    <div className="p-3 bg-black/20 rounded-lg border border-white/10 text-white/70 text-sm">
                      No study habits found. Add study habits in the Home tab to track them with the timer.
                    </div>
                  )}
                  
                  <button 
                    className="btn-primary w-full"
                    onClick={handleStartStudySession}
                    disabled={!selectedHabitId} // Disable if no habit is selected
                  >
                    Start Study Session
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
} 
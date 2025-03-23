"use client";

import { useState, useEffect } from 'react';
import { Habit } from '@/app/models/Habit';
import { useHabitStore } from '@/app/store/habitStore';
import { format } from 'date-fns';
import { FiCheck, FiFlag, FiBook, FiHeart, FiCoffee, FiZap, FiClock, FiStar, FiX, FiEdit3 } from 'react-icons/fi';

interface HabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'study':
      return <FiBook className="w-5 h-5" />;
    case 'health':
      return <FiHeart className="w-5 h-5" />;
    case 'personal':
      return <FiCoffee className="w-5 h-5" />;
    case 'work':
      return <FiZap className="w-5 h-5" />;
    default:
      return <FiFlag className="w-5 h-5" />;
  }
};

export default function HabitCard({ habit, onEdit }: HabitCardProps) {
  const [isClient, setIsClient] = useState(false);
  const { completeHabit, deleteHabit, undoHabitCompletion } = useHabitStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  
  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Check if the habit is completed for today
  const today = isClient ? format(new Date(), 'yyyy-MM-dd') : '';
  
  // Initialize completion status
  let completedToday = isClient && habit.completions.some(c => c.date.split('T')[0] === today);
  const completionCount = isClient ? habit.completions.filter(c => c.date.split('T')[0] === today).reduce((sum, c) => sum + c.count, 0) : 0;
  
  // Get target repetitions
  const repetitionTarget = habit.frequency.repetitions || 1;
  
  // Calculate progress
  const progress = (completionCount / repetitionTarget) * 100;
  
  // Calculate study progress for study/work habits with duration
  let studyProgress = null;
  if (isClient && (habit.category === 'study' || habit.category === 'work') && habit.duration) {
    const todayCompletions = habit.completions.filter(c => c.date.split('T')[0] === today);
    const hoursSpent = todayCompletions.reduce((sum, c) => sum + c.count, 0);
    const percentComplete = habit.duration ? Math.min(100, (hoursSpent / habit.duration) * 100) : 0;
    const isCompleted = percentComplete >= 100;
    
    studyProgress = {
      hoursSpent,
      percentComplete,
      isCompleted
    };
    
    // For habits with duration, completedToday should be based on 100% progress
    // This ensures consistency between home menu and timer menu
    if (habit.duration) {
      completedToday = studyProgress.isCompleted;
    }
  }
  
  // Add effect to refresh study progress when lastUpdateTime changes
  useEffect(() => {
    if (isClient && (habit.category === 'study' || habit.category === 'work') && habit.duration) {
      // This will re-render the component when lastUpdateTime changes
      // The studyProgress calculation will run again with fresh data
    }
  }, [isClient, habit, lastUpdateTime]);
  
  // Get the correct category color
  const getCategoryColor = () => {
    switch (habit.category) {
      case 'study':
        return {
          bgClass: 'from-blue-600/30 to-blue-400/10 border-blue-500/30',
          glowClass: 'glow-card blue',
          iconBg: 'bg-blue-500/40',
          iconShadow: 'shadow-[0_0_10px_rgba(59,130,246,0.4)]',
          textColor: 'text-blue-400',
          progressBg: 'bg-gradient-to-r from-blue-600 to-blue-400'
        };
      case 'health':
        return {
          bgClass: 'from-green-600/30 to-green-400/10 border-green-500/30',
          glowClass: 'glow-card green',
          iconBg: 'bg-green-500/40',
          iconShadow: 'shadow-[0_0_10px_rgba(34,197,94,0.4)]',
          textColor: 'text-green-400',
          progressBg: 'bg-gradient-to-r from-green-600 to-green-400'
        };
      case 'personal':
        return {
          bgClass: 'from-yellow-600/30 to-yellow-400/10 border-yellow-500/30',
          glowClass: 'glow-card yellow',
          iconBg: 'bg-yellow-500/40',
          iconShadow: 'shadow-[0_0_10px_rgba(234,179,8,0.4)]',
          textColor: 'text-yellow-400',
          progressBg: 'bg-gradient-to-r from-yellow-600 to-yellow-400'
        };
      case 'work':
        return {
          bgClass: 'from-red-600/30 to-red-400/10 border-red-500/30',
          glowClass: 'glow-card red',
          iconBg: 'bg-red-500/40',
          iconShadow: 'shadow-[0_0_10px_rgba(239,68,68,0.4)]',
          textColor: 'text-red-400',
          progressBg: 'bg-gradient-to-r from-red-600 to-red-400'
        };
      case 'creative':
        return {
          bgClass: 'from-purple-600/30 to-purple-400/10 border-purple-500/30',
          glowClass: 'glow-card purple',
          iconBg: 'bg-purple-500/40',
          iconShadow: 'shadow-[0_0_10px_rgba(168,85,247,0.4)]',
          textColor: 'text-purple-400',
          progressBg: 'bg-gradient-to-r from-purple-600 to-purple-400'
        };
      default:
        return {
          bgClass: 'from-primary-600/30 to-primary-400/10 border-primary-500/30',
          glowClass: 'glow-card orange',
          iconBg: 'bg-primary-500/40',
          iconShadow: 'shadow-[0_0_10px_rgba(249,115,22,0.4)]',
          textColor: 'text-primary-400',
          progressBg: 'bg-gradient-to-r from-primary-600 to-primary-400'
        };
    }
  };
  
  const categoryColor = getCategoryColor();
  
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Set completing state to prevent double-clicks
    setIsCompleting(true);
    
    // For habits with duration, clicking the complete button manually completes the habit
    if (habit.duration) {
      if (completedToday) {
        // If already completed, undo all completions for today
        undoHabitCompletion(habit.id, today);
        // Trigger UI refresh
        setTimeout(() => {
          setLastUpdateTime(Date.now());
          setIsCompleting(false);
        }, 300);
      } else {
        // Get current progress if any
        const currentHoursSpent = studyProgress ? studyProgress.hoursSpent : 0;
        const hoursToComplete = habit.duration;
        
        // We now have two options:
        // 1. Complete partially (add 1 hour)
        // 2. Complete fully (add remaining hours to reach 100%)
        
        // Check if we're close to completion (more than 80% done)
        const isNearlyComplete = currentHoursSpent >= (hoursToComplete * 0.8);
        
        // If nearly complete, just complete it fully
        if (isNearlyComplete) {
          const remainingHours = hoursToComplete - currentHoursSpent;
          completeHabit({
            habitId: habit.id,
            date: today + 'T' + new Date().toISOString().split('T')[1],
            count: Math.max(0.1, remainingHours), // Always add at least 0.1 hours
            notes: `Manually completed ${Math.round(remainingHours * 10) / 10} hours`
          });
        } else {
          // Otherwise, add 1 hour of progress (partial completion)
          completeHabit({
            habitId: habit.id,
            date: today + 'T' + new Date().toISOString().split('T')[1],
            count: 1,
            notes: `Manually added 1 hour`
          });
        }
        
        // Trigger UI refresh
        setTimeout(() => {
          setLastUpdateTime(Date.now());
          setIsCompleting(false);
        }, 300);
      }
    } else {
      // For regular habits without duration, toggle completion as before
      if (completedToday && completionCount > 0) {
        undoHabitCompletion(habit.id, today);
      } else {
        completeHabit({
          habitId: habit.id,
          date: today + 'T' + new Date().toISOString().split('T')[1],
          count: 1
        });
      }
      
      // Trigger UI refresh
      setTimeout(() => {
        setLastUpdateTime(Date.now());
        setIsCompleting(false);
      }, 300);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habit.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(habit);
    }
  };
  
  // Get frequency text in a readable format
  function getFrequencyText(frequency: Habit['frequency']) {
    if (frequency.type === 'daily') {
      return 'Daily';
    } else if (frequency.type === 'weekly') {
      return `${frequency.days?.length || 0} days/week`;
    }
    return 'Custom';
  }
  
  return (
    <div
      className={`${categoryColor.glowClass} p-4 rounded-xl bg-gradient-to-br ${categoryColor.bgClass} border transition-transform duration-300 cursor-pointer relative`}
      onClick={() => onEdit && onEdit(habit)}
    >
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full ${categoryColor.iconBg} flex items-center justify-center text-white mr-4 ${categoryColor.iconShadow}`}>
          {getCategoryIcon(habit.category)}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white">{habit.name}</h3>
          <div className="flex items-center text-sm text-white/80 mt-1">
            <div className="flex items-center mr-4">
              <FiClock className="mr-1.5 w-3 h-3" />
              <span>{getFrequencyText(habit.frequency)}</span>
            </div>
            <div className="flex items-center">
              <FiStar className="mr-1.5 w-3 h-3" />
              <span>
                <span className={`font-medium ${categoryColor.textColor}`}>{habit.streak.current}</span> day streak
              </span>
            </div>
          </div>
          
          {/* Display duration if specified */}
          {habit.duration && (
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-white/70">
                <span className={`font-medium ${categoryColor.textColor}`}>{habit.duration}</span> 
                hour{habit.duration !== 1 ? 's' : ''} {habit.category === 'study' ? 'of study' : 'of work'}
              </div>
              
              {studyProgress && (
                <div className="text-xs text-white/90 font-medium bg-white/10 px-2 py-0.5 rounded-full">
                  {studyProgress.percentComplete.toFixed(1)}% complete
                </div>
              )}
            </div>
          )}
          
          {/* Progress bar for study and work habits with duration */}
          {studyProgress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>{studyProgress.hoursSpent.toFixed(1)} hours</span>
                <span>{((habit.duration || 0) - studyProgress.hoursSpent).toFixed(1)} remaining</span>
              </div>
              <div className="bg-black/30 rounded-full h-2 overflow-hidden">
                <div 
                  className={`${categoryColor.progressBg} h-full rounded-full`}
                  style={{ width: `${studyProgress.percentComplete}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Progress bar for habits with more than 1 repetition */}
          {isClient && habit.frequency.repetitions && habit.frequency.repetitions > 1 && !studyProgress && (
            <>
              <div className="mt-2 text-xs text-white/70">
                {completionCount}/{habit.frequency.repetitions} today
              </div>
              <div className="progress-bar mt-1 bg-black/30 rounded-full h-2 overflow-hidden">
                <div 
                  className={`progress-bar-glow ${categoryColor.progressBg} h-full rounded-full`}
                  style={{ width: `${progress}%`, transition: 'width 0.5s ease-out' }}
                />
              </div>
            </>
          )}
        </div>
        <div className="ml-4 flex items-center">
          <button
            onClick={handleComplete}
            className={`w-10 h-10 flex items-center justify-center rounded-full focus:outline-none transition-all duration-200 transform active:scale-95 ${
              completedToday
                ? `${categoryColor.iconBg} text-white ${categoryColor.iconShadow}`
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            } ${isCompleting ? 'pointer-events-none opacity-70' : ''}`}
            disabled={isCompleting}
          >
            <FiCheck className={`w-5 h-5 ${completedToday ? 'text-white' : 'text-white/70'}`} />
          </button>
          
          <button
            onClick={handleDelete}
            className="ml-2 w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-red-400 hover:bg-white/10 focus:outline-none transition-all duration-200"
            aria-label="Delete habit"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 
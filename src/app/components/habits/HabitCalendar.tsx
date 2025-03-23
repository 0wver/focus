"use client";

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX, FiCalendar } from 'react-icons/fi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, subMonths, addMonths, isSameDay } from 'date-fns';
import { useHabitStore } from '@/app/store/habitStore';

interface HabitCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
}

export default function HabitCalendar({ isOpen, onClose, onSelectDate }: HabitCalendarProps) {
  const { habits } = useHabitStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get days of the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Previous month
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Select a date
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    onSelectDate(date);
    onClose();
  };

  // Check if there are any habit completions on a specific date
  const hasCompletionsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habits.some(habit => 
      habit.completions.some(completion => 
        completion.date.split('T')[0] === dateStr
      )
    );
  };

  // Check if there are any habits scheduled for a specific date
  const hasHabitsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();
    const today = format(new Date(), 'yyyy-MM-dd');
    const isSelectedDateToday = dateStr === today;
    
    return habits.some(habit => {
      // Extract just the date parts for comparison (YYYY-MM-DD)
      const habitCreationDay = habit.createdAt.split('T')[0]; // Get YYYY-MM-DD part only
      
      // Don't show habits created after the selected date
      if (habitCreationDay > dateStr) {
        return false; // Habit didn't exist yet on this date
      }
      
      // For weekly habits, check if this day is included in the selected days
      if (habit.frequency.type === 'weekly') {
        return habit.frequency.days?.includes(dayOfWeek) || false;
      }
      
      // For daily habits, we need special handling
      if (habit.frequency.type === 'daily') {
        // Always show daily habits for today
        if (isSelectedDateToday) {
          return true;
        }
        
        // For past dates, only show if completed or created on that date
        // If there's a completion specifically for this date
        if (habit.completions.some(completion => 
          completion.date.split('T')[0] === dateStr
        )) {
          return true;
        }
        
        // If the habit was created on this exact date
        if (habitCreationDay === dateStr) {
          return true;
        }
        
        // Otherwise, don't show this habit on this date
        return false;
      }
      
      return false;
    });
  };

  // Count completions on a specific date
  const countCompletionsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habits.reduce((count, habit) => {
      return count + habit.completions.filter(completion => 
        completion.date.split('T')[0] === dateStr
      ).length;
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        />
        
        {/* Calendar Modal */}
        <div
          className="bg-black/40 border border-white/15 w-full max-w-md overflow-hidden p-6 text-left shadow-xl relative z-10 transition-all duration-300 transform scale-100 opacity-100 backdrop-blur-md rounded-xl"
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-medium text-white flex items-center">
              <FiCalendar className="mr-2" />
              Select Date
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-white hover:bg-white/10 focus:outline-none"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={previousMonth}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 focus:outline-none transition-colors duration-200"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <h4 className="text-lg font-medium text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 focus:outline-none transition-colors duration-200"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Days of Week */}
          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-sm text-white/60 font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, i) => {
              const dayStr = format(day, 'd');
              const isCurrentDay = isToday(day);
              const isSelected = isSameDay(day, selectedDate);
              const hasCompletions = hasCompletionsOnDate(day);
              const hasHabits = hasHabitsOnDate(day);
              const completionCount = countCompletionsOnDate(day);
              
              return (
                <button
                  key={i}
                  onClick={() => handleSelectDate(day)}
                  className={`
                    h-10 w-full rounded-full flex items-center justify-center text-sm relative
                    ${!isSameMonth(day, currentMonth) ? 'text-white/30' : ''}
                    ${isCurrentDay && !isSelected ? 'bg-primary-500/20 text-white' : ''}
                    ${isSelected ? 'bg-primary-600 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]' : ''}
                    ${!isSelected && !isCurrentDay ? 'hover:bg-white/10' : ''}
                    transition-colors duration-200
                  `}
                >
                  <span>{dayStr}</span>
                  
                  {/* Completion indicator */}
                  {hasCompletions && (
                    <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-400 ${isSelected ? 'bg-white' : ''}`}></span>
                  )}
                  
                  {/* Scheduled habit indicator (different color/style than completions) */}
                  {!hasCompletions && hasHabits && (
                    <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 ${isSelected ? 'bg-white/70' : ''}`}></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 
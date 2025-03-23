"use client";

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { FiPlus, FiClock, FiBarChart2, FiChevronRight, FiStar, FiCalendar, FiSettings, FiX, FiZap } from 'react-icons/fi';
import Link from 'next/link';
import Navbar from './components/layout/Navbar';
import HabitCard from './components/habits/HabitCard';
import AddHabitModal from './components/habits/AddHabitModal';
import EditHabitModal from './components/habits/EditHabitModal';
import HabitCalendar from './components/habits/HabitCalendar';
import { useHabitStore } from './store/habitStore';
import { useTimerStore } from './store/timerStore';
import { Habit } from './models/Habit';

export default function Dashboard() {
  const { habits } = useHabitStore();
  const { studySessions } = useTimerStore();
  const [isClient, setIsClient] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [animateHabits, setAnimateHabits] = useState(false);
  const [statCardIndex, setStatCardIndex] = useState(0);
  
  // Prevent hydration issues
  useEffect(() => {
    setIsClient(true);
    
    // Clear any previous localStorage data to ensure a clean start
    const storedVersion = localStorage.getItem('ascend-habits-storage-version');
    if (storedVersion !== '2') {
      localStorage.removeItem('ascend-habits-storage');
      localStorage.setItem('ascend-habits-storage-version', '2');
    }
    
    // Trigger animation after component is mounted
    setTimeout(() => {
      setAnimateHabits(true);
    }, 100);
  }, []);
  
  // Only show UI when the component has mounted
  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen bg-dark text-white">
        <Navbar />
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-pulse space-y-4 w-full max-w-3xl px-4">
            <div className="h-8 bg-black/20 rounded w-1/3"></div>
            <div className="h-24 bg-black/20 rounded"></div>
            <div className="h-24 bg-black/20 rounded"></div>
            <div className="h-24 bg-black/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Format the selected date for display
  const selectedDateFormatted = format(selectedDate, 'EEEE, MMMM d');
  
  // Filter habits for the selected date
  const getHabitsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const today = format(new Date(), 'yyyy-MM-dd');
    const isSelectedDateToday = dateStr === today;
    
    return habits.filter(habit => {
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
        // Case 1: If there's a completion specifically for this date
        if (habit.completions.some(completion => 
          completion.date.split('T')[0] === dateStr
        )) {
          return true;
        }
        
        // Case 2: If the habit was created on this exact date
        if (habitCreationDay === dateStr) {
          return true;
        }
        
        // Otherwise, don't show this habit on this date
        return false;
      }
      
      return false;
    });
  };
  
  // Get habits specific to the selected date
  const habitsForSelectedDate = getHabitsForDate(selectedDate);
  
  // Calculate daily progress for selected date
  const totalHabits = habitsForSelectedDate.length;
  const completedToday = habitsForSelectedDate.filter(habit => 
    habit.completions.some(c => c.date.split('T')[0] === format(selectedDate, 'yyyy-MM-dd'))
  ).length;
  
  const progress = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
  
  // Calculate hours studied today
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Calculate total hours from study sessions (both study and work categories combined for consistency)
  const totalStudyHours = studySessions
    .filter(session => session.startTime.startsWith(today))
    .reduce((total, session) => {
      return total + (session.duration / 3600); // Convert seconds to hours
    }, 0);
  
  // Calculate hours from habit completions
  const habitStudyHours = habits
    .filter(habit => (habit.category === 'study' || habit.category === 'work') && habit.duration)
    .reduce((total, habit) => {
      // Sum up hours from today's completions
      const todayHours = habit.completions
        .filter(completion => completion.date.startsWith(today))
        .reduce((sum, completion) => {
          let hoursForCompletion = 0;
          
          if (completion.notes && completion.notes.includes('hours of study with timer')) {
            // This is a timer-tracked completion - extract hours from the notes
            const hoursMatch = completion.notes.match(/Completed (\d+(\.\d+)?) hours/);
            if (hoursMatch && hoursMatch[1]) {
              hoursForCompletion = parseFloat(hoursMatch[1]);
            } else {
              // Fallback to the count if we can't parse the notes
              hoursForCompletion = completion.count || 0;
            }
          } else {
            // This is a manually tracked completion
            hoursForCompletion = completion.count || 0;
          }
          
          return sum + hoursForCompletion;
        }, 0);
      
      return total + todayHours;
    }, 0);
  
  // Total hours studied today (from study sessions and habit completions)
  const totalHoursStudiedToday = totalStudyHours + habitStudyHours;
  
  // Calculate average daily study hours (over the last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
  
  const dailyStudyHours = last7Days.map(dayStr => {
    // Hours from sessions
    const sessionHours = studySessions
      .filter(session => session.startTime.startsWith(dayStr))
      .reduce((total, session) => {
        return total + (session.duration / 3600);
      }, 0);
      
    // Hours from habit completions
    const habitHours = habits
      .filter(habit => (habit.category === 'study' || habit.category === 'work') && habit.duration)
      .reduce((total, habit) => {
        return total + habit.completions
          .filter(completion => completion.date.startsWith(dayStr))
          .reduce((sum, completion) => {
            let hoursForCompletion = 0;
            
            if (completion.notes && completion.notes.includes('hours of study with timer')) {
              // This is a timer-tracked completion - extract hours from the notes
              const hoursMatch = completion.notes.match(/Completed (\d+(\.\d+)?) hours/);
              if (hoursMatch && hoursMatch[1]) {
                hoursForCompletion = parseFloat(hoursMatch[1]);
              } else {
                // Fallback to the count if we can't parse the notes
                hoursForCompletion = completion.count || 0;
              }
            } else {
              // This is a manually tracked completion
              hoursForCompletion = completion.count || 0;
            }
            
            return sum + hoursForCompletion;
          }, 0);
      }, 0);
    
    return sessionHours + habitHours;
  });
  
  const averageDailyStudyHours = dailyStudyHours.reduce((sum, hours) => sum + hours, 0) / 7;
  
  // Calculate total work hours
  const totalWorkHours = studySessions
    .filter(session => session.startTime.startsWith(today) && session.subject.toLowerCase().includes('work'))
    .reduce((total, session) => {
      return total + (session.duration / 3600);
    }, 0);
    
  // Add work hours from habit completions
  const workHoursFromHabits = habits
    .filter(habit => habit.category === 'work' && habit.duration)
    .reduce((total, habit) => {
      return total + habit.completions
        .filter(completion => completion.date.startsWith(today))
        .reduce((sum, completion) => {
          let hoursForCompletion = 0;
          
          if (completion.notes && completion.notes.includes('hours of work with timer')) {
            // This is a timer-tracked completion - extract hours from the notes
            const hoursMatch = completion.notes.match(/Completed (\d+(\.\d+)?) hours/);
            if (hoursMatch && hoursMatch[1]) {
              hoursForCompletion = parseFloat(hoursMatch[1]);
            } else {
              // Fallback to the count if we can't parse the notes
              hoursForCompletion = completion.count || 0;
            }
          } else {
            // This is a manually tracked completion
            hoursForCompletion = completion.count || 0;
          }
          
          return sum + hoursForCompletion;
        }, 0);
    }, 0);
  
  const totalWorkHoursToday = totalWorkHours + workHoursFromHabits;
  
  // Create an array of stat cards to cycle through
  const statCards = [
    {
      title: "Hours Studied Today",
      value: totalHoursStudiedToday.toFixed(1),
      unit: "hrs",
      icon: <FiClock className="w-6 h-6" />,
      description: "",
      color: "blue"
    },
    {
      title: "Average Daily Study",
      value: averageDailyStudyHours.toFixed(1),
      unit: "hrs",
      icon: <FiBarChart2 className="w-6 h-6" />,
      description: "7-day average",
      color: "cyan"
    },
    {
      title: "Work Hours Today",
      value: totalWorkHoursToday.toFixed(1),
      unit: "hrs",
      icon: <FiZap className="w-6 h-6" />,
      description: "",
      color: "red"
    }
  ];
  
  // Function to cycle through stat cards
  const cycleStatCard = () => {
    setStatCardIndex((prevIndex) => (prevIndex + 1) % statCards.length);
  };
  
  // Get streaks for the streak leader feature
  const habitsByStreak = [...habits].sort((a, b) => b.streak.current - a.streak.current);
  const longestStreak = habitsByStreak.length > 0 ? habitsByStreak[0] : null;
  
  // Handle habit edit
  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setIsEditModalOpen(true);
  };
  
  // Handle calendar date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  // Handle closing the add modal - animate new habits
  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setAnimateHabits(true);
  };
  
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">{selectedDateFormatted}</h1>
          <h2 className="text-2xl font-display font-bold text-white">Welcome back! Keep up the good work.</h2>
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Daily Progress Card - Purple theme */}
          <div className="glow-card purple p-5 hover:-translate-y-1 transition-transform duration-300 rounded-xl bg-gradient-to-br from-purple-600/30 to-purple-400/10 border border-purple-500/30">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium text-white">Today's Progress</h2>
              <span className="px-3 py-1 rounded-full text-sm bg-purple-500/40 text-white font-medium shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                {completedToday}/{totalHabits}
              </span>
            </div>
            
            <div className="progress-bar mb-3 bg-black/30 rounded-full h-3 overflow-hidden">
              <div
                className="progress-bar-glow bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full"
                style={{ width: `${progress}%`, transition: 'width 1.2s ease-in-out' }}
              />
            </div>
            
            <div className="flex text-sm justify-between text-white/90">
              <span className="flex items-center">{completedToday} completed</span>
              <span className="flex items-center">{totalHabits - completedToday} remaining</span>
            </div>
          </div>
          
          {/* Dynamic Stat Card that cycles on click */}
          <div 
            onClick={cycleStatCard}
            className={`glow-card ${statCards[statCardIndex].color} p-5 hover:-translate-y-1 transition-transform duration-300 rounded-xl bg-gradient-to-br from-${statCards[statCardIndex].color}-600/30 to-${statCards[statCardIndex].color}-400/10 border border-${statCards[statCardIndex].color}-500/30 cursor-pointer`}
          >
            <h2 className="text-lg font-medium text-white mb-3">{statCards[statCardIndex].title}</h2>
            
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full bg-${statCards[statCardIndex].color}-500/40 flex items-center justify-center text-white mr-4 shadow-[0_0_10px_rgba(59,130,246,0.4)]`}>
                {statCards[statCardIndex].icon}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-white">
                  {statCards[statCardIndex].value}
                  <span className="text-lg font-normal text-white/70 ml-1">{statCards[statCardIndex].unit}</span>
                </div>
                {statCards[statCardIndex].description && (
                  <div className="text-sm text-white/90 mt-1">
                    {statCards[statCardIndex].description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Fixed Action Button */}
        <div className="fixed-action-buttons flex flex-col gap-3 fixed bottom-20 right-6 z-50">
          <button
            className="action-button-primary bg-gradient-to-br from-primary-600 to-primary-700 shadow-[0_0_15px_rgba(249,115,22,0.5)] hover:scale-105 active:scale-95 transition-transform duration-300"
            onClick={() => setIsAddModalOpen(true)}
          >
            <FiPlus className="text-white text-xl" />
          </button>
        </div>
        
        {/* Habits List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-white">Your Habits</h2>
            <button 
              className="text-sm text-primary-400 flex items-center hover:text-primary-300 transition-colors duration-300"
              onClick={() => setIsCalendarOpen(true)}
            >
              <FiCalendar className="mr-1.5 w-4 h-4" />
              Select Date
            </button>
          </div>
          
          <div className="space-y-4">
            {habitsForSelectedDate.length > 0 ? (
              habitsForSelectedDate.map((habit, index) => (
                <div
                  key={habit.id}
                  className={`${animateHabits ? 'animate-fade-in' : ''}`}
                  style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
                >
                  <HabitCard 
                    habit={habit} 
                    onClick={handleEditHabit} 
                    onEdit={handleEditHabit} 
                  />
                </div>
              ))
            ) : (
              <div className="p-6 rounded-xl bg-gradient-to-br from-black/50 to-black/30 border border-white/10 text-center backdrop-blur-md shadow-xl glow-card orange animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                  <FiCalendar className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No Habits Scheduled</h3>
                <p className="text-white/70 mb-5 max-w-md mx-auto">
                  You don't have any habits scheduled for {selectedDateFormatted}.
                </p>
                <button 
                  className="px-4 py-2.5 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <FiPlus className="mr-1.5 inline-block" />
                  Add a New Habit
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Modals */}
      <AddHabitModal 
        isOpen={isAddModalOpen} 
        onClose={handleAddModalClose} 
        selectedDate={selectedDate}
      />
      
      <EditHabitModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedHabit(null);
        }}
        habit={selectedHabit}
      />
      
      <HabitCalendar
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSelectDate={handleDateSelect}
      />
    </>
  );
}

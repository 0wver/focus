"use client";

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { FiCalendar, FiBarChart2, FiPieChart, FiClock, FiBook, FiHeart, FiZap, FiCoffee, FiEdit3, FiCheck } from 'react-icons/fi';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Navbar from '../components/layout/Navbar';
import { useHabitStore } from '../store/habitStore';
import { useTimerStore } from '../store/timerStore';
import { Habit } from '@/app/models/Habit';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function StatsPage() {
  const { habits } = useHabitStore();
  const { studySessions } = useTimerStore();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  
  // Prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Initialize selectedHabit when habits are loaded
  useEffect(() => {
    if (isClient && habits.length > 0 && !selectedHabit) {
      setSelectedHabit(habits[0].id);
    }
  }, [isClient, habits, selectedHabit]);
  
  // Only show UI when the component has mounted
  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen bg-dark text-white">
        <Navbar />
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-pulse space-y-4 w-full max-w-4xl px-4">
            <div className="h-8 bg-black/20 rounded w-1/3"></div>
            <div className="h-60 bg-black/20 rounded"></div>
            <div className="h-40 bg-black/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Get current month days
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get current week days
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Week starts on Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Prepare weekly study hours data
  const weeklyStudyHoursData = daysInWeek.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    
    // Calculate hours from habit completions for this day
    const habitsHours = habits
      .filter(habit => habit.category === 'study')
      .reduce((total, habit) => {
        return total + habit.completions
          .filter(c => c.date.startsWith(dayStr))
          .reduce((subtotal, completion) => {
            if (completion.notes && completion.notes.includes('hours of study with timer')) {
              const hoursMatch = completion.notes.match(/Completed (\d+(\.\d+)?) hours/);
              if (hoursMatch && hoursMatch[1]) {
                return subtotal + parseFloat(hoursMatch[1]);
              }
            }
            return subtotal + (completion.count || 0);
          }, 0);
      }, 0);
    
    // Calculate hours from study sessions for this day
    const sessionsHours = studySessions
      .filter(session => session.startTime.startsWith(dayStr))
      .reduce((total, session) => {
        return total + (session.duration / 3600);
      }, 0);
    
    return {
      date: format(day, 'EEE'),
      hours: sessionsHours + habitsHours
    };
  });
  
  // Prepare weekly work hours data
  const weeklyWorkHoursData = daysInWeek.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    
    // Calculate hours from work habit completions for this day
    const workHabitsHours = habits
      .filter(habit => habit.category === 'work')
      .reduce((total, habit) => {
        return total + habit.completions
          .filter(c => c.date.startsWith(dayStr))
          .reduce((subtotal, completion) => {
            if (completion.notes && completion.notes.includes('hours of work with timer')) {
              const hoursMatch = completion.notes.match(/Completed (\d+(\.\d+)?) hours/);
              if (hoursMatch && hoursMatch[1]) {
                return subtotal + parseFloat(hoursMatch[1]);
              }
            }
            return subtotal + (completion.count || 0);
          }, 0);
      }, 0);
    
    // Calculate hours from work-related sessions for this day
    const workSessionsHours = studySessions
      .filter(session => session.startTime.startsWith(dayStr) && session.subject.toLowerCase().includes('work'))
      .reduce((total, session) => {
        return total + (session.duration / 3600);
      }, 0);
    
    return {
      date: format(day, 'EEE'),
      hours: workSessionsHours + workHabitsHours
    };
  });
  
  // Prepare habit completion data for the month
  const habitCompletionData = daysInMonth.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const completedHabits = habits.filter(habit => 
      habit.completions.some(c => c.date.startsWith(dayStr))
    ).length;
    
    return {
      date: format(day, 'd'),
      completed: completedHabits,
      total: habits.length,
    };
  });
  
  // Calculate total hours studied from habits
  const totalHabitsHours = habits
    .filter(habit => habit.category === 'study')
    .reduce((total, habit) => {
      return total + habit.completions.reduce((subtotal, completion) => {
        if (completion.notes && completion.notes.includes('hours of study with timer')) {
          // Extract hours from the timer notes
          const hoursMatch = completion.notes.match(/Completed (\d+(\.\d+)?) hours/);
          if (hoursMatch && hoursMatch[1]) {
            return subtotal + parseFloat(hoursMatch[1]);
          }
        }
        // Use the count field for regular completions
        return subtotal + (completion.count || 0);
      }, 0);
    }, 0);
  
  // Calculate total hours from study sessions
  const totalSessionsHours = studySessions
    .filter(session => !session.subject.toLowerCase().includes('work'))
    .reduce((total, session) => {
      return total + (session.duration / 3600); // Convert seconds to hours
    }, 0);
  
  // Calculate total hours studied (from both habits and sessions)
  const totalHoursStudied = totalSessionsHours + totalHabitsHours;
  
  // Calculate total work hours from habits
  const totalWorkHoursFromHabits = habits
    .filter(habit => habit.category === 'work')
    .reduce((total, habit) => {
      return total + habit.completions.reduce((subtotal, completion) => {
        if (completion.notes && completion.notes.includes('hours of work with timer')) {
          // Extract hours from the timer notes
          const hoursMatch = completion.notes.match(/Completed (\d+(\.\d+)?) hours/);
          if (hoursMatch && hoursMatch[1]) {
            return subtotal + parseFloat(hoursMatch[1]);
          }
        }
        // Use the count field for regular completions
        return subtotal + (completion.count || 0);
      }, 0);
    }, 0);
  
  // Calculate total hours from work-related sessions
  const totalWorkHoursFromSessions = studySessions
    .filter(session => session.subject.toLowerCase().includes('work'))
    .reduce((total, session) => {
      return total + (session.duration / 3600); // Convert seconds to hours
    }, 0);
  
  // Calculate total work hours
  const totalWorkHours = totalWorkHoursFromSessions + totalWorkHoursFromHabits;
  
  // Calculate average work hours per day
  const workDaysSinceStart = habits.filter(h => h.category === 'work').length > 0
    ? Math.max(1, Math.ceil((new Date().getTime() - new Date(Math.min(
        ...(habits.filter(h => h.category === 'work').map(h => new Date(h.createdAt).getTime()))
      )).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  
  const averageWorkHoursPerDay = totalWorkHours / workDaysSinceStart;
  
  // Calculate average hours per day
  const daysSinceStart = habits.length > 0 || studySessions.length > 0 
    ? Math.max(1, Math.ceil((new Date().getTime() - new Date(Math.min(
        ...(habits.length > 0 ? habits.map(h => new Date(h.createdAt).getTime()) : [new Date().getTime()]),
        ...(studySessions.length > 0 ? studySessions.map(s => new Date(s.startTime).getTime()) : [new Date().getTime()])
      )).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  
  const averageHoursPerDay = totalHoursStudied / daysSinceStart;
  
  // Prepare study session data
  const studySessionsData = studySessions.reduce((acc, session) => {
    const subject = session.subject;
    if (!acc[subject]) {
      acc[subject] = 0;
    }
    acc[subject] += session.duration / 3600; // Convert seconds to hours
    return acc;
  }, {} as Record<string, number>);
  
  // Filter to top 5 subjects
  const topSubjects = Object.entries(studySessionsData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Calculate streak statistics
  const currentStreaks = habits.map(h => h.streak.current);
  const longestStreaks = habits.map(h => h.streak.longest);
  const maxCurrentStreak = Math.max(...currentStreaks, 0);
  const maxLongestStreak = Math.max(...longestStreaks, 0);
  const avgCurrentStreak = habits.length 
    ? currentStreaks.reduce((sum, val) => sum + val, 0) / habits.length 
    : 0;
  
  // Utility to get days a habit has been active since creation
  const getDaysActiveForHabit = (habit: Habit) => {
    const creationDate = new Date(habit.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays || 1; // Minimum 1 day
  };
  
  // Calculate per-habit stats
  const habitsWithStats = habits.map(habit => {
    // Calculate total time spent on this habit
    let totalHoursSpent = 0;
    
    // Only count time for study and work categories
    if (habit.category === 'study' || habit.category === 'work') {
      // Calculate hours from habit completions
      totalHoursSpent = habit.completions.reduce((total, completion) => {
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
        } else if (completion.notes && completion.notes.includes('Manually')) {
          // This is a manually tracked completion
          hoursForCompletion = completion.count || 0;
        } else {
          // Regular completion, use count
          hoursForCompletion = completion.count || 0;
        }
        
        return total + hoursForCompletion;
      }, 0);
    }
    
    // Calculate completion rate
    const totalDaysActive = getDaysActiveForHabit(habit);
    const totalCompletions = habit.completions.length;
    const completionRate = totalDaysActive > 0 ? (totalCompletions / totalDaysActive) * 100 : 0;
    
    // Daily activity for the selected habit (last 14 days)
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'dd/MM'),
        formattedDate: format(date, 'yyyy-MM-dd'),
        hours: 0,
        completed: false
      };
    }).reverse();
    
    // Mark days as completed if there's a completion entry
    habit.completions.forEach(completion => {
      const completionDate = completion.date.split('T')[0]; // Get YYYY-MM-DD part
      const dayData = last14Days.find(d => d.formattedDate === completionDate);
      
      if (dayData) {
        dayData.completed = true;
        
        // Add hours data for study/work habits with duration
        if (habit.category === 'study' || habit.category === 'work') {
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
          
          dayData.hours += hoursForCompletion;
        }
      }
    });
    
    return {
      ...habit,
      stats: {
        totalHoursSpent,
        completionRate,
        dailyActivity: last14Days
      }
    };
  });
  
  // Get the currently selected habit
  const selectedHabitData = selectedHabit ? habitsWithStats.find(h => h.id === selectedHabit) : null;
  
  // Create chart data for individual habit daily activity
  const habitDailyActivityData = selectedHabitData ? {
    labels: selectedHabitData.stats.dailyActivity.map(d => d.date),
    datasets: [
      {
        label: 'Hours Spent',
        data: selectedHabitData.stats.dailyActivity.map(d => d.hours),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      }
    ]
  } : null;
  
  const habitDailyActivityOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Activity (Last 14 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours'
        }
      }
    }
  };
  
  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'study':
        return <FiBook className="w-5 h-5" />;
      case 'health':
        return <FiHeart className="w-5 h-5" />;
      case 'work':
        return <FiZap className="w-5 h-5" />;
      case 'personal':
        return <FiCoffee className="w-5 h-5" />;
      case 'creative':
        return <FiEdit3 className="w-5 h-5" />;
      default:
        return <FiCalendar className="w-5 h-5" />;
    }
  };
  
  // Get category color class
  const getCategoryColorClass = (category: string) => {
    switch (category) {
      case 'study':
        return 'blue';
      case 'health':
        return 'green';
      case 'work':
        return 'red';
      case 'personal':
        return 'yellow';
      case 'creative':
        return 'purple';
      default:
        return 'gray';
    }
  };
  
  // Chart data and options
  const completionChartData = {
    labels: habitCompletionData.map(d => d.date),
    datasets: [
      {
        label: 'Habits Completed',
        data: habitCompletionData.map(d => d.completed),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      }
    ]
  };
  
  const completionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Habit Completions',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(habits.length, 1),
        ticks: {
          stepSize: 1,
        }
      }
    }
  };
  
  const studySessionChartData = {
    labels: topSubjects.map(([subject]) => subject),
    datasets: [
      {
        label: 'Hours Studied',
        data: topSubjects.map(([subject, hours]) => parseFloat(hours.toFixed(1))),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(168, 85, 247, 0.7)',
        ],
        borderWidth: 1,
      }
    ]
  };
  
  const studySessionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Study Time by Subject (Hours)',
      },
    },
  };
  
  // Weekly study hours chart data and options
  const weeklyStudyHoursChartData = {
    labels: weeklyStudyHoursData.map(d => d.date),
    datasets: [
      {
        label: 'Hours Studied',
        data: weeklyStudyHoursData.map(d => parseFloat(d.hours.toFixed(1))),
        backgroundColor: 'rgba(6, 182, 212, 0.7)',
        borderColor: 'rgb(6, 182, 212)',
        borderWidth: 1,
      }
    ]
  };
  
  const weeklyStudyHoursChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Study Hours',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours'
        }
      }
    }
  };
  
  // Weekly work hours chart data and options
  const weeklyWorkHoursChartData = {
    labels: weeklyWorkHoursData.map(d => d.date),
    datasets: [
      {
        label: 'Hours Worked',
        data: weeklyWorkHoursData.map(d => parseFloat(d.hours.toFixed(1))),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      }
    ]
  };
  
  const weeklyWorkHoursChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Work Hours',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours'
        }
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-text-light dark:text-text-dark">Your Statistics</h1>
          <p className="text-text-muted">Track your progress and analyze your habits</p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glow-card purple p-4 rounded-xl bg-gradient-to-br from-purple-600/30 to-purple-400/10 border border-purple-500/30 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-500/40 text-white mr-3 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                <FiCalendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Active Habits</p>
                <p className="text-xl font-bold text-white">{habits.length}</p>
              </div>
            </div>
          </div>
          
          <div className="glow-card orange p-4 rounded-xl bg-gradient-to-br from-primary-600/30 to-primary-400/10 border border-primary-500/30 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary-500/40 text-white mr-3 shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                <FiBarChart2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Longest Streak</p>
                <p className="text-xl font-bold text-white">
                  {maxLongestStreak} days
                </p>
              </div>
            </div>
          </div>
          
          <div className="glow-card green p-4 rounded-xl bg-gradient-to-br from-green-600/30 to-green-400/10 border border-green-500/30 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-500/40 text-white mr-3 shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                <FiPieChart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Average Streak</p>
                <p className="text-xl font-bold text-white">
                  {avgCurrentStreak.toFixed(1)} days
                </p>
              </div>
            </div>
          </div>
          
          <div className="glow-card blue p-4 rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-400/10 border border-blue-500/30 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-500/40 text-white mr-3 shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Study Sessions</p>
                <p className="text-xl font-bold text-white">
                  {studySessions.length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hours Studied Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glow-card indigo p-4 rounded-xl bg-gradient-to-br from-indigo-600/30 to-indigo-400/10 border border-indigo-500/30 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-indigo-500/40 text-white mr-3 shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Total Hours Studied</p>
                <p className="text-xl font-bold text-white">
                  {totalHoursStudied.toFixed(1)} hrs
                </p>
              </div>
            </div>
          </div>
          
          <div className="glow-card cyan p-4 rounded-xl bg-gradient-to-br from-cyan-600/30 to-cyan-400/10 border border-cyan-500/30 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-cyan-500/40 text-white mr-3 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                <FiBarChart2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Avg Hours Per Day</p>
                <p className="text-xl font-bold text-white">
                  {averageHoursPerDay.toFixed(1)} hrs
                </p>
              </div>
            </div>
          </div>

          <div className="glow-card red p-4 rounded-xl bg-gradient-to-br from-red-600/30 to-red-400/10 border border-red-500/30 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-500/40 text-white mr-3 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                <FiZap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Total Work Hours</p>
                <p className="text-xl font-bold text-white">
                  {totalWorkHours.toFixed(1)} hrs
                </p>
              </div>
            </div>
          </div>
          
          <div className="glow-card red p-4 rounded-xl bg-gradient-to-br from-red-600/30 to-red-400/10 border border-red-500/30 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-500/40 text-white mr-3 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                <FiBarChart2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Avg Work Hours/Day</p>
                <p className="text-xl font-bold text-white">
                  {averageWorkHoursPerDay.toFixed(1)} hrs
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart Tabs */}
        <div className="mb-4 border-b border-white/10">
          <ul className="flex flex-wrap -mb-px text-sm font-medium">
            <li className="mr-2" onClick={() => setActiveTab('overview')}>
              <button className={`inline-block py-2 px-4 border-b-2 rounded-t-lg ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-white/70 hover:text-primary-400 hover:border-primary-400/30'
              }`}>
                Overview
              </button>
            </li>
            <li className="mr-2" onClick={() => setActiveTab('habits')}>
              <button className={`inline-block py-2 px-4 border-b-2 rounded-t-lg ${
                activeTab === 'habits'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-white/70 hover:text-primary-400 hover:border-primary-400/30'
              }`}>
                Habits
              </button>
            </li>
            <li className="mr-2" onClick={() => setActiveTab('individual')}>
              <button className={`inline-block py-2 px-4 border-b-2 rounded-t-lg ${
                activeTab === 'individual'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-white/70 hover:text-primary-400 hover:border-primary-400/30'
              }`}>
                Individual Habits
              </button>
            </li>
            <li className="mr-2" onClick={() => setActiveTab('study')}>
              <button className={`inline-block py-2 px-4 border-b-2 rounded-t-lg ${
                activeTab === 'study'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-white/70 hover:text-primary-400 hover:border-primary-400/30'
              }`}>
                Study Time
              </button>
            </li>
            <li className="mr-2" onClick={() => setActiveTab('work')}>
              <button className={`inline-block py-2 px-4 border-b-2 rounded-t-lg ${
                activeTab === 'work'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-white/70 hover:text-primary-400 hover:border-primary-400/30'
              }`}>
                Work Time
              </button>
            </li>
          </ul>
        </div>
        
        {/* Chart Content based on active tab */}
        <div className="glow-card p-6 rounded-xl bg-gradient-to-br from-gray-600/30 to-gray-400/5 border border-gray-500/20 mb-8">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Monthly Overview</h3>
              <Line data={completionChartData} options={completionChartOptions} height={50} />
            </div>
          )}
          
          {activeTab === 'habits' && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Habit Completion Rate</h3>
              {/* Add habit-specific chart here */}
              <Line data={completionChartData} options={completionChartOptions} height={50} />
            </div>
          )}
          
          {activeTab === 'individual' && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Individual Habit Data</h3>
              
              {habits.length > 0 ? (
                <>
                  <div className="mb-6">
                    <label htmlFor="habitSelector" className="block text-sm font-medium text-white/80 mb-2">
                      Select Habit
                    </label>
                    <select
                      id="habitSelector"
                      className="w-full bg-black/30 text-white border border-white/20 rounded-lg p-2"
                      value={selectedHabit || ''}
                      onChange={(e) => setSelectedHabit(e.target.value)}
                    >
                      {habits.map(habit => (
                        <option key={habit.id} value={habit.id}>
                          {habit.name} ({habit.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedHabitData && (
                    <>
                      {/* Habit Overview Card */}
                      <div className={`glow-card ${getCategoryColorClass(selectedHabitData.category)} p-4 rounded-xl bg-gradient-to-br from-${getCategoryColorClass(selectedHabitData.category)}-600/30 to-${getCategoryColorClass(selectedHabitData.category)}-400/10 border border-${getCategoryColorClass(selectedHabitData.category)}-500/30 mb-6`}>
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-full bg-${getCategoryColorClass(selectedHabitData.category)}-500/40 flex items-center justify-center text-white mr-4`}>
                            {getCategoryIcon(selectedHabitData.category)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-white">{selectedHabitData.name}</h4>
                            <p className="text-sm text-white/70">
                              {selectedHabitData.frequency.type === 'daily' ? 'Daily' : 
                               selectedHabitData.frequency.type === 'weekly' ? `${selectedHabitData.frequency.days?.length || 0} days per week` : 
                               'Custom'} · {selectedHabitData.category}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Habit Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-black/20 rounded-lg p-4">
                          <p className="text-sm text-white/70 mb-1">Current Streak</p>
                          <p className="text-2xl font-bold text-white">{selectedHabitData.streak.current}<span className="text-sm font-normal text-white/70 ml-1">days</span></p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-4">
                          <p className="text-sm text-white/70 mb-1">Longest Streak</p>
                          <p className="text-2xl font-bold text-white">{selectedHabitData.streak.longest}<span className="text-sm font-normal text-white/70 ml-1">days</span></p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-4">
                          <p className="text-sm text-white/70 mb-1">Completion Rate</p>
                          <p className="text-2xl font-bold text-white">{selectedHabitData.stats.completionRate.toFixed(1)}<span className="text-sm font-normal text-white/70 ml-1">%</span></p>
                        </div>
                      </div>
                      
                      {/* Time Spent Section */}
                      {(selectedHabitData.category === 'study' || selectedHabitData.category === 'work') && (
                        <div className="bg-black/20 rounded-lg p-4 mb-6">
                          <h4 className="text-md font-medium text-white mb-3">Time Tracking</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-white/70 mb-1">Total Hours Spent</p>
                              <p className="text-2xl font-bold text-white">{selectedHabitData.stats.totalHoursSpent.toFixed(1)}<span className="text-sm font-normal text-white/70 ml-1">hrs</span></p>
                            </div>
                            {selectedHabitData.duration && (
                              <div>
                                <p className="text-sm text-white/70 mb-1">Progress</p>
                                <p className="text-2xl font-bold text-white">
                                  {Math.min(100, (selectedHabitData.stats.totalHoursSpent / selectedHabitData.duration * 100)).toFixed(1)}
                                  <span className="text-sm font-normal text-white/70 ml-1">%</span>
                                </p>
                                <div className="mt-2 bg-black/30 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`bg-gradient-to-r from-${getCategoryColorClass(selectedHabitData.category)}-600 to-${getCategoryColorClass(selectedHabitData.category)}-400 h-full rounded-full`}
                                    style={{ width: `${Math.min(100, (selectedHabitData.stats.totalHoursSpent / selectedHabitData.duration * 100))}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Activity Chart */}
                      {habitDailyActivityData && (
                        <div>
                          <h4 className="text-md font-medium text-white mb-3">Daily Activity</h4>
                          <Bar data={habitDailyActivityData} options={habitDailyActivityOptions} height={50} />
                          
                          {/* Completion Calendar */}
                          <div className="mt-6">
                            <h4 className="text-md font-medium text-white mb-3">Last 14 Days</h4>
                            <div className="flex flex-wrap justify-between">
                              {selectedHabitData.stats.dailyActivity.map((day, index) => (
                                <div key={index} className="mb-2 text-center">
                                  <div className={`w-8 h-8 mb-1 rounded-full flex items-center justify-center ${day.completed ? `bg-${getCategoryColorClass(selectedHabitData.category)}-500/60` : 'bg-black/30'}`}>
                                    {day.completed && day.hours > 0 ? 
                                      <span className="text-xs font-medium text-white">{day.hours.toFixed(1)}</span> : 
                                      day.completed ? 
                                        <FiCheck className="text-white text-sm" /> : 
                                        null
                                    }
                                  </div>
                                  <div className="text-xs text-white/60">{day.date}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-white/70">No habits found. Start by adding habits in the Home tab.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'study' && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Study Time Distribution</h3>
              <Bar data={studySessionChartData} options={studySessionChartOptions} height={50} />
              
              {/* Weekly Study Hours Chart */}
              <h3 className="text-lg font-medium text-white mt-8 mb-4">This Week's Study Activity</h3>
              <Bar data={weeklyStudyHoursChartData} options={weeklyStudyHoursChartOptions} height={50} />
              
              {/* Study Hours Details */}
              <div className="mt-8 bg-black/20 rounded-lg p-4">
                <h4 className="text-md font-medium text-white mb-3">Study Hours Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/70 mb-1">From Study Habits:</p>
                    <p className="text-lg font-medium text-white">{totalHabitsHours.toFixed(1)} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 mb-1">From Tracking Sessions:</p>
                    <p className="text-lg font-medium text-white">{totalSessionsHours.toFixed(1)} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 mb-1">Total Study Time:</p>
                    <p className="text-lg font-medium text-white">{totalHoursStudied.toFixed(1)} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 mb-1">Daily Average:</p>
                    <p className="text-lg font-medium text-white">{averageHoursPerDay.toFixed(1)} hours</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'work' && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Work Time Statistics</h3>
              
              {/* Work Habits List */}
              <div className="bg-black/20 rounded-lg p-4 mb-6">
                <h4 className="text-md font-medium text-white mb-3">Work Habits</h4>
                
                {habits.filter(h => h.category === 'work').length > 0 ? (
                  <div className="space-y-3">
                    {habits
                      .filter(h => h.category === 'work')
                      .sort((a, b) => {
                        // Sort by most time spent
                        const aHours = a.completions.reduce((total, c) => total + (c.count || 0), 0);
                        const bHours = b.completions.reduce((total, c) => total + (c.count || 0), 0);
                        return bHours - aHours;
                      })
                      .map(habit => {
                        const habitWithStats = habitsWithStats.find(h => h.id === habit.id);
                        const hoursSpent = habitWithStats?.stats.totalHoursSpent || 0;
                        
                        return (
                          <div key={habit.id} className="flex items-center justify-between p-2 hover:bg-black/10 rounded">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-red-500/40 flex items-center justify-center text-white mr-3">
                                <FiZap className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{habit.name}</p>
                                <p className="text-xs text-white/70">
                                  {hoursSpent.toFixed(1)} hours · {habitWithStats?.stats.completionRate.toFixed(0)}% completion
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-black/30 text-white mr-1">
                                <span className="text-xs">{habit.streak.current}</span>
                              </div>
                              <span className="text-xs text-white/70">day streak</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-white/70">No work habits found. Create work habits to track your productivity.</p>
                  </div>
                )}
              </div>
              
              {/* Weekly Work Hours Chart */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-white mb-3">This Week's Work Activity</h4>
                <Bar data={weeklyWorkHoursChartData} options={weeklyWorkHoursChartOptions} height={50} />
              </div>
              
              {/* Work Hours Sources */}
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-md font-medium text-white mb-3">Work Hours Sources</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="text-md font-medium text-white mb-3">Work Hours Summary</h4>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Total Work Hours:</p>
                      <p className="text-lg font-medium text-white">{totalWorkHours.toFixed(1)} hours</p>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-white/70 mb-1">Average Per Day:</p>
                      <p className="text-lg font-medium text-white">{averageWorkHoursPerDay.toFixed(1)} hours</p>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="text-md font-medium text-white mb-3">Work Hours Breakdown</h4>
                    <div>
                      <p className="text-sm text-white/70 mb-1">From Work Sessions:</p>
                      <p className="text-lg font-medium text-white">{totalWorkHoursFromSessions.toFixed(1)} hours</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-white/70 mb-1">From Work Habits:</p>
                      <p className="text-lg font-medium text-white">{totalWorkHoursFromHabits.toFixed(1)} hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
} 
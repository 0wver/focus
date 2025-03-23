import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit, HabitCompletion } from '../models/Habit';
import { format } from 'date-fns';

interface HabitState {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'streak' | 'completions'>, selectedDate?: Date) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (completion: HabitCompletion) => void;
  undoHabitCompletion: (habitId: string, date: string) => void;
  resetHabits: () => void;
}

// Empty initial state - no sample habits
const initialHabits: Habit[] = [];

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: initialHabits,
      addHabit: (habit, selectedDate) => {
        // Create date objects in the correct format
        const now = selectedDate || new Date();
        const formattedDate = format(now, 'yyyy-MM-dd');
        const isoTime = new Date().toISOString().split('T')[1];
        const fullIsoString = `${formattedDate}T${isoTime}`;
        
        const newHabit: Habit = {
          ...habit,
          id: Date.now().toString(),
          createdAt: fullIsoString, // Use formatted date string to avoid timezone issues
          updatedAt: fullIsoString,
          streak: {
            current: 0,
            longest: 0,
          },
          completions: [],
        };
        
        // Remove automatic completion for daily habits
        // Now habits will only be completed when the user explicitly checks them
        
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },
      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
              : habit
          ),
        }));
      },
      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        }));
      },
      completeHabit: (completion) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        set((state) => {
          // Find the habit to update
          const habitIndex = state.habits.findIndex(h => h.id === completion.habitId);
          if (habitIndex === -1) return state;
          
          const habit = state.habits[habitIndex];
          
          // Check if there's already a completion for today
          const existingCompletionIndex = habit.completions.findIndex(c => 
            c.date.startsWith(today)
          );
          
          let updatedCompletions;
          if (existingCompletionIndex >= 0) {
            // Update existing completion
            updatedCompletions = [...habit.completions];
            updatedCompletions[existingCompletionIndex] = {
              ...updatedCompletions[existingCompletionIndex],
              count: completion.count,
              notes: completion.notes,
            };
          } else {
            // Add new completion
            updatedCompletions = [
              ...habit.completions, 
              { 
                date: completion.date || today + 'T' + new Date().toISOString().split('T')[1],
                count: completion.count || 1,
                notes: completion.notes,
                habitId: habit.id
              }
            ];
          }
          
          // Calculate new streak
          let currentStreak = habit.streak.current;
          
          // Check if the completion is for today
          if (completion.date?.startsWith(today) || !completion.date) {
            // Check if there was a completion yesterday
            const yesterday = format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd');
            const hadCompletionYesterday = habit.completions.some(c => c.date.startsWith(yesterday));
            
            if (hadCompletionYesterday || currentStreak === 0) {
              currentStreak += 1;
            }
          }
          
          const longest = Math.max(habit.streak.longest, currentStreak);
          
          // Create a new array with the updated habit
          const updatedHabits = [...state.habits];
          updatedHabits[habitIndex] = {
            ...habit,
            completions: updatedCompletions,
            streak: {
              current: currentStreak,
              longest: longest,
            },
            updatedAt: new Date().toISOString(),
          };
          
          return { habits: updatedHabits };
        });
      },
      undoHabitCompletion: (habitId, date) => {
        set((state) => {
          const habitIndex = state.habits.findIndex(h => h.id === habitId);
          if (habitIndex === -1) return state;
          
          const habit = state.habits[habitIndex];
          
          // Remove the completion for the specified date
          const updatedCompletions = habit.completions.filter(c => 
            !c.date.startsWith(date)
          );
          
          // Recalculate streak if necessary
          const today = format(new Date(), 'yyyy-MM-dd');
          let currentStreak = habit.streak.current;
          
          if (date === today) {
            // If we're removing today's completion, check if there's a yesterday completion
            const yesterday = format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd');
            const hasYesterdayCompletion = habit.completions.some(c => c.date.startsWith(yesterday));
            
            if (hasYesterdayCompletion && currentStreak > 0) {
              currentStreak -= 1;
            }
          }
          
          // Create a new array with the updated habit
          const updatedHabits = [...state.habits];
          updatedHabits[habitIndex] = {
            ...habit,
            completions: updatedCompletions,
            streak: {
              current: currentStreak,
              longest: habit.streak.longest, // Longest streak remains unchanged
            },
            updatedAt: new Date().toISOString(),
          };
          
          return { habits: updatedHabits };
        });
      },
      resetHabits: () => {
        set({ habits: [] });
      },
    }),
    {
      name: 'ascend-habits-storage',
      version: 2, // Update version to clear previous storage
      migrate: (persistedState: any, version: number) => {
        // If we need migration logic for future changes, add it here
        // For now, just return the state as is or a clean slate if migration fails
        if (version === 0 || version === 1) {
          // For older versions, return an empty state
          return { habits: [] };
        }
        return persistedState as HabitState;
      },
    }
  )
);

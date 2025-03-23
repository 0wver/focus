export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'study' | 'health' | 'personal' | 'work' | 'creative';
  tags: string[];
  frequency: {
    type: 'daily' | 'weekly' | 'monthly';
    days?: number[]; // For weekly: 0 = Sunday, 1 = Monday, etc.
    dates?: number[]; // For monthly: 1-31
    repetitions: number;
  };
  schedule: {
    times: string[]; // Format: 'HH:MM'
    sound?: string;
    vibration?: boolean;
  };
  duration?: number; // Duration in hours (e.g., how many hours to study or work)
  isCompleted?: boolean; // Whether the habit has been fully completed (for habits with duration)
  createdAt: string;
  updatedAt: string;
  streak: {
    current: number;
    longest: number;
  };
  completions: HabitCompletion[];
}

export interface HabitCompletion {
  date: string; // ISO string
  count: number;
  notes?: string;
  habitId?: string; // For when we pass completion data around
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export const DAYS_OF_WEEK = [
  { id: 0, name: 'Sunday', shortName: 'Sun' },
  { id: 1, name: 'Monday', shortName: 'Mon' },
  { id: 2, name: 'Tuesday', shortName: 'Tue' },
  { id: 3, name: 'Wednesday', shortName: 'Wed' },
  { id: 4, name: 'Thursday', shortName: 'Thu' },
  { id: 5, name: 'Friday', shortName: 'Fri' },
  { id: 6, name: 'Saturday', shortName: 'Sat' },
]; 
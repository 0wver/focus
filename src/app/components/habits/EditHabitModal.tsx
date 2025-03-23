"use client";

import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiClock, FiTag, FiInfo, FiBook, FiHeart, FiCoffee, FiZap, FiEdit3 } from 'react-icons/fi';
import { useHabitStore } from '@/app/store/habitStore';
import { DAYS_OF_WEEK, Habit } from '@/app/models/Habit';

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
}

const categoryOptions = [
  { id: 'study', name: 'Study', color: 'study', icon: <FiBook className="w-5 h-5" /> },
  { id: 'health', name: 'Health', color: 'health', icon: <FiHeart className="w-5 h-5" /> },
  { id: 'personal', name: 'Personal', color: 'personal', icon: <FiCoffee className="w-5 h-5" /> },
  { id: 'work', name: 'Work', color: 'work', icon: <FiZap className="w-5 h-5" /> },
  { id: 'creative', name: 'Creative', color: 'creative', icon: <FiEdit3 className="w-5 h-5" /> },
];

export default function EditHabitModal({ isOpen, onClose, habit }: EditHabitModalProps) {
  const { updateHabit } = useHabitStore();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('study');
  const [icon, setIcon] = useState('star');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Monday to Friday by default
  const [repetitions, setRepetitions] = useState(1);
  const [reminders, setReminders] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [duration, setDuration] = useState(1); // Default to 1 hour
  
  // Current step tracker for multi-step form
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  // Load habit data when opened
  useEffect(() => {
    if (habit && isOpen) {
      setName(habit.name);
      setDescription(habit.description || '');
      setCategory(habit.category);
      setIcon(habit.icon);
      setFrequencyType(habit.frequency.type === 'monthly' ? 'weekly' : habit.frequency.type);
      setSelectedDays(habit.frequency.days || [1, 2, 3, 4, 5]);
      setRepetitions(habit.frequency.repetitions);
      setReminders(habit.schedule.times || []);
      setTags(habit.tags || []);
      setDuration(habit.duration || 1); // Set duration from habit or default to 1
    }
  }, [habit, isOpen]);
  
  // Reset form
  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('study');
    setIcon('star');
    setFrequencyType('daily');
    setSelectedDays([1, 2, 3, 4, 5]);
    setRepetitions(1);
    setReminders([]);
    setReminderTime('09:00');
    setTags([]);
    setTagInput('');
    setDuration(1);
    setStep(1);
  };
  
  // Close modal and reset form
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Add a tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // Remove a tag
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  // Add a reminder time
  const addReminder = () => {
    if (reminderTime && !reminders.includes(reminderTime)) {
      setReminders([...reminders, reminderTime]);
    }
  };
  
  // Remove a reminder time
  const removeReminder = (time: string) => {
    setReminders(reminders.filter(t => t !== time));
  };
  
  // Toggle day selection for weekly habits
  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  
  // Get theme classes based on category
  const getCategoryClasses = (categoryId: string) => {
    switch (categoryId) {
      case 'study':
        return {
          bgColor: 'bg-study-dark/30',
          textColor: 'text-white',
          borderColor: 'border-study-primary/30',
          selectedBg: 'bg-study-primary',
        };
      case 'health':
        return {
          bgColor: 'bg-health-dark/30',
          textColor: 'text-white',
          borderColor: 'border-health-primary/30',
          selectedBg: 'bg-health-primary',
        };
      case 'personal':
        return {
          bgColor: 'bg-personal-dark/30',
          textColor: 'text-white',
          borderColor: 'border-personal-primary/30',
          selectedBg: 'bg-personal-primary',
        };
      case 'work':
        return {
          bgColor: 'bg-work-dark/30',
          textColor: 'text-white',
          borderColor: 'border-work-primary/30',
          selectedBg: 'bg-work-primary',
        };
      case 'creative':
        return {
          bgColor: 'bg-creative-dark/30',
          textColor: 'text-white',
          borderColor: 'border-creative-primary/30',
          selectedBg: 'bg-creative-primary',
        };
      default:
        return {
          bgColor: 'bg-primary-900/20',
          textColor: 'text-white',
          borderColor: 'border-primary-400/30',
          selectedBg: 'bg-primary-600',
        };
    }
  };
  
  // Next step
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  // Previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habit) return;
    
    // Validate frequency data to prevent errors
    let frequencyData = {};
    if (frequencyType === 'weekly') {
      frequencyData = {
        type: frequencyType,
        days: selectedDays,
        repetitions: repetitions,
      };
    } else {
      frequencyData = {
        type: 'daily',
        repetitions: repetitions,
      };
    }
    
    // Update the habit
    updateHabit(habit.id, {
      name,
      description,
      icon,
      category,
      tags,
      frequency: frequencyData as any,
      schedule: {
        times: reminders,
        sound: 'bell',
        vibration: true,
      },
      duration: duration, // Update the duration field
    });
    
    // Close the modal and reset form
    handleClose();
  };
  
  // Determine if current step is valid
  const isCurrentStepValid = () => {
    if (step === 1) {
      return name.trim().length > 0 && category;
    }
    if (step === 2) {
      return true; // Frequency settings are pre-populated with defaults
    }
    return true;
  };
  
  // Get the selected category theme
  const selectedCategoryClasses = getCategoryClasses(category);
  
  if (!isOpen || !habit) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        />
        
        {/* Modal */}
        <div
          className="bg-black/40 border border-white/15 w-full max-w-md overflow-hidden p-6 text-left shadow-xl relative z-10 transition-all duration-300 transform scale-100 opacity-100 backdrop-blur-md rounded-xl"
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-medium text-white">
              Edit Habit
            </h3>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-white hover:bg-white/10 focus:outline-none"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          
          {/* Steps indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step > i
                        ? `${selectedCategoryClasses.selectedBg} text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]`
                        : step === i + 1
                        ? `border-2 ${selectedCategoryClasses.borderColor} ${selectedCategoryClasses.textColor}`
                        : 'border-2 border-white/20 text-white/60'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div
                      className={`w-full h-0.5 mx-1 ${
                        step > i + 1
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600'
                          : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/60">
              <span className="px-2">Basic Info</span>
              <span className="px-2">Frequency</span>
              <span className="px-2">Reminders</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-white/40"
                    placeholder="e.g., Morning Meditation"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-white/40 resize-none"
                    placeholder="Short description of your habit"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categoryOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCategory(opt.id)}
                        className={`flex items-center justify-center px-3 py-2.5 rounded-lg border border-white/20 transition-all duration-200 ${
                          category === opt.id
                            ? `bg-${opt.color}-primary/30 border-${opt.color}-primary/50`
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full bg-${opt.color}-primary/40 flex items-center justify-center mb-1.5`}>
                            {opt.icon}
                          </div>
                          <span className="text-xs text-white/80">{opt.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Frequency */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    How often?
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setFrequencyType('daily')}
                      className={`flex items-center justify-center px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                        frequencyType === 'daily'
                          ? `bg-${selectedCategoryClasses.selectedBg} border-primary-500/50 text-white`
                          : 'bg-white/5 hover:bg-white/10 border-white/20 text-white/80'
                      }`}
                    >
                      Every Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequencyType('weekly')}
                      className={`flex items-center justify-center px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                        frequencyType === 'weekly'
                          ? `bg-${selectedCategoryClasses.selectedBg} border-primary-500/50 text-white`
                          : 'bg-white/5 hover:bg-white/10 border-white/20 text-white/80'
                      }`}
                    >
                      Specific Days
                    </button>
                  </div>
                </div>
                
                {frequencyType === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Select Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedDays.includes(day.id)
                              ? `bg-${selectedCategoryClasses.selectedBg} text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]`
                              : 'bg-white/10 text-white/80 hover:bg-white/20'
                          }`}
                        >
                          {day.shortName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <div className="flex items-center">
                      <FiInfo className="mr-2" />
                      Times per day
                    </div>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={repetitions}
                    onChange={(e) => setRepetitions(parseInt(e.target.value) || 1)}
                    className="input w-full text-white bg-black/30 border-white/20"
                  />
                  <p className="mt-1 text-sm text-white/70">
                    How many times do you want to complete this habit each day?
                  </p>
                </div>
                
                {/* Duration in hours field */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <div className="flex items-center">
                      <FiClock className="mr-2" />
                      Duration (hours)
                    </div>
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(0.5, parseFloat(e.target.value) || 1))}
                    className="input w-full text-white bg-black/30 border-white/20"
                  />
                  <p className="mt-1 text-sm text-white/70">
                    How many hours do you want to {category === 'study' ? 'study' : 'work on'} this habit?
                  </p>
                </div>
              </div>
            )}
            
            {/* Step 3: Reminders & Tags */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <div className="flex items-center">
                      <FiClock className="mr-1.5" />
                      Reminders
                    </div>
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white"
                    />
                    <button
                      type="button"
                      onClick={addReminder}
                      className="px-3 py-2 bg-primary-600 rounded-r-lg text-white hover:bg-primary-700 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {reminders.map((time) => (
                      <div
                        key={time}
                        className="flex items-center bg-white/10 px-3 py-1 rounded-full text-sm text-white"
                      >
                        <span>{time}</span>
                        <button
                          type="button"
                          onClick={() => removeReminder(time)}
                          className="ml-2 text-white/70 hover:text-white"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {reminders.length === 0 && (
                      <span className="text-white/50 text-sm">No reminders set</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <div className="flex items-center">
                      <FiTag className="mr-1.5" />
                      Tags (Optional)
                    </div>
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add a tag"
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-white/40"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-primary-600 rounded-r-lg text-white hover:bg-primary-700 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center bg-white/10 px-3 py-1 rounded-full text-sm text-white"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-white/70 hover:text-white"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {tags.length === 0 && (
                      <span className="text-white/50 text-sm">No tags added</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 bg-white/10 rounded-lg text-white/90 hover:bg-white/20 transition-all duration-200"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-white/10 rounded-lg text-white/90 hover:bg-white/20 transition-all duration-200"
                >
                  Cancel
                </button>
              )}
              
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isCurrentStepValid()}
                  className={`px-4 py-2 rounded-lg text-white transition-all duration-200 ${
                    isCurrentStepValid()
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : 'bg-primary-600/40 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isCurrentStepValid()}
                  className={`px-4 py-2 rounded-lg text-white transition-all duration-200 ${
                    isCurrentStepValid()
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : 'bg-primary-600/40 cursor-not-allowed'
                  }`}
                >
                  Save Changes
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
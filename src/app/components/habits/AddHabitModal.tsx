"use client";

import { useState } from 'react';
import { FiX, FiPlus, FiCalendar, FiClock, FiTag, FiInfo, FiBook, FiHeart, FiCoffee, FiZap, FiEdit3 } from 'react-icons/fi';
import { useHabitStore } from '@/app/store/habitStore';
import { DAYS_OF_WEEK } from '@/app/models/Habit';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date; // Add optional selected date prop
}

const categoryOptions = [
  { id: 'study', name: 'Study', color: 'study', icon: <FiBook className="w-5 h-5" /> },
  { id: 'health', name: 'Health', color: 'health', icon: <FiHeart className="w-5 h-5" /> },
  { id: 'personal', name: 'Personal', color: 'personal', icon: <FiCoffee className="w-5 h-5" /> },
  { id: 'work', name: 'Work', color: 'work', icon: <FiZap className="w-5 h-5" /> },
  { id: 'creative', name: 'Creative', color: 'creative', icon: <FiEdit3 className="w-5 h-5" /> },
];

export default function AddHabitModal({ isOpen, onClose, selectedDate }: AddHabitModalProps) {
  const { addHabit } = useHabitStore();
  
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
  const [duration, setDuration] = useState<number>(1); // Default to 1 hour
  
  // Current step tracker for multi-step form
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
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
    
    // Add the habit to the store
    addHabit({
      name,
      description,
      icon,
      category,
      tags,
      frequency: frequencyData,
      schedule: {
        times: reminders,
        sound: 'bell',
        vibration: true,
      },
      duration: duration, // Add the duration in hours
    }, selectedDate);
    
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
  
  if (!isOpen) return null;
  
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
              Add New Habit
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
                      className={`h-1 w-10 mx-1 ${
                        step > i + 1
                          ? `${selectedCategoryClasses.selectedBg}`
                          : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                    Habit Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input text-white bg-black/30 border-white/20"
                    placeholder="E.g., Study for Finals"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
                    Description <span className="text-white/60">(optional)</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input min-h-[80px] text-white bg-black/30 border-white/20"
                    placeholder="What's this habit about?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categoryOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setCategory(option.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${
                          category === option.id
                            ? `${getCategoryClasses(option.id).selectedBg} text-white border-transparent shadow-[0_0_10px_rgba(249,115,22,0.3)]`
                            : `${getCategoryClasses(option.id).bgColor} ${getCategoryClasses(option.id).textColor} ${getCategoryClasses(option.id).borderColor} hover:bg-opacity-70`
                        }`}
                      >
                        <div className="mb-1">{option.icon}</div>
                        <span className="text-xs font-medium">{option.name}</span>
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
                  <label className="block text-sm font-medium text-white mb-2">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2" />
                      Frequency
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFrequencyType('daily')}
                      className={`p-3 rounded-lg border ${
                        frequencyType === 'daily'
                          ? `${selectedCategoryClasses.selectedBg} border-transparent`
                          : 'border-white/20 bg-black/30 hover:bg-black/40'
                      } text-white transition-colors duration-200`}
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequencyType('weekly')}
                      className={`p-3 rounded-lg border ${
                        frequencyType === 'weekly'
                          ? `${selectedCategoryClasses.selectedBg} border-transparent`
                          : 'border-white/20 bg-black/30 hover:bg-black/40'
                      } text-white transition-colors duration-200`}
                    >
                      Weekly
                    </button>
                  </div>
                </div>
                
                {/* Weekly days selector */}
                {frequencyType === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Select Days
                    </label>
                    <div className="grid grid-cols-7 gap-1">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`p-2 rounded-md text-sm ${
                            selectedDays.includes(day.id)
                              ? `${selectedCategoryClasses.selectedBg} text-white`
                              : 'bg-black/30 text-white/70 hover:bg-black/40'
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
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <div className="flex items-center">
                      <FiClock className="mr-2" />
                      Reminders <span className="text-white/60">(optional)</span>
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="input flex-1 text-white bg-black/30 border-white/20"
                    />
                    <button
                      type="button"
                      onClick={addReminder}
                      className={`p-2 rounded-lg ${selectedCategoryClasses.selectedBg} text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]`}
                    >
                      <FiPlus />
                    </button>
                  </div>
                  
                  {reminders.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {reminders.map((time) => (
                        <div
                          key={time}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${selectedCategoryClasses.bgColor} ${selectedCategoryClasses.textColor}`}
                        >
                          {time}
                          <button
                            type="button"
                            onClick={() => removeReminder(time)}
                            className="ml-2 text-white/60 hover:text-red-500"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <div className="flex items-center">
                      <FiTag className="mr-2" />
                      Tags <span className="text-white/60">(optional)</span>
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="input flex-1 text-white bg-black/30 border-white/20"
                      placeholder="Enter a tag"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className={`p-2 rounded-lg ${selectedCategoryClasses.selectedBg} text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]`}
                    >
                      <FiPlus />
                    </button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <div
                          key={tag}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${selectedCategoryClasses.bgColor} ${selectedCategoryClasses.textColor}`}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-white/60 hover:text-red-500"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-outline"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-outline"
                >
                  Cancel
                </button>
              )}
              
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isCurrentStepValid()}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                    isCurrentStepValid()
                      ? `${selectedCategoryClasses.selectedBg} hover:opacity-90 shadow-[0_0_10px_rgba(249,115,22,0.3)]`
                      : 'bg-gray-700/50 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${selectedCategoryClasses.selectedBg} hover:opacity-90 shadow-[0_0_10px_rgba(249,115,22,0.3)]`}
                >
                  Create Habit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
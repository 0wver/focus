"use client";

import { useState, useEffect } from 'react';
import { FiMoon, FiSun, FiBell, FiVolume2, FiVolumeX, FiGithub, FiInfo, FiTrash2 } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import { useTheme } from '../providers/ThemeProvider';
import { useHabitStore } from '../store/habitStore';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { resetHabits } = useHabitStore();
  const [isClient, setIsClient] = useState(false);
  
  // Form state
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [defaultTimer, setDefaultTimer] = useState('pomodoro');
  
  // Prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Only show UI when the component has mounted
  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen bg-dark text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6 w-full">
            <div className="h-8 bg-black/20 rounded w-1/3"></div>
            <div className="h-40 bg-black/20 rounded"></div>
            <div className="h-40 bg-black/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Reset storage function
  const handleResetStorage = () => {
    if (confirm('Are you sure you want to reset all habits? This action cannot be undone.')) {
      resetHabits();
      localStorage.removeItem('ascend-habits-storage');
      localStorage.setItem('ascend-habits-storage-version', '2');
      window.location.reload();
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
          <p className="text-white/80">Customize your experience</p>
        </div>
        
        <div className="space-y-8">
          {/* Appearance Settings */}
          <div className="glow-card orange p-6 rounded-xl bg-gradient-to-br from-primary-600/30 to-primary-400/10 border border-primary-500/30 shadow-[0_0_20px_rgba(249,115,22,0.25)]">
            <h2 className="text-lg font-medium mb-4 text-white">Appearance</h2>
            
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center">
                {theme === 'dark' ? (
                  <FiMoon className="w-5 h-5 mr-3 text-primary-400" />
                ) : (
                  <FiSun className="w-5 h-5 mr-3 text-primary-400" />
                )}
                <div>
                  <h3 className="font-medium text-white">Theme</h3>
                  <p className="text-sm text-white/70">Switch between light and dark mode</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
                <div className="w-11 h-6 bg-black/30 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-300 peer-focus:ring-primary-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="glow-card purple p-6 rounded-xl bg-gradient-to-br from-purple-600/30 to-purple-400/10 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            <h2 className="text-lg font-medium mb-4 text-white">Notifications</h2>
            
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center">
                <FiBell className="w-5 h-5 mr-3 text-purple-400" />
                <div>
                  <h3 className="font-medium text-white">Enable Notifications</h3>
                  <p className="text-sm text-white/70">Get habit reminders and timer alerts</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <div className="w-11 h-6 bg-black/30 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-300 peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center">
                {sound ? (
                  <FiVolume2 className="w-5 h-5 mr-3 text-purple-400" />
                ) : (
                  <FiVolumeX className="w-5 h-5 mr-3 text-white/60" />
                )}
                <div>
                  <h3 className="font-medium text-white">Sound</h3>
                  <p className="text-sm text-white/70">Play sounds for notifications and timers</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  checked={sound}
                  onChange={() => setSound(!sound)}
                />
                <div className="w-11 h-6 bg-black/30 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-300 peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <FiBell className="w-5 h-5 mr-3 text-purple-400" />
                <div>
                  <h3 className="font-medium text-white">Vibration</h3>
                  <p className="text-sm text-white/70">Vibrate on notifications and timer completion</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  checked={vibration}
                  onChange={() => setVibration(!vibration)}
                />
                <div className="w-11 h-6 bg-black/30 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-300 peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
          
          {/* Timer Settings */}
          <div className="glow-card green p-6 rounded-xl bg-gradient-to-br from-green-600/30 to-green-400/10 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.25)]">
            <h2 className="text-lg font-medium mb-4 text-white">Timer Settings</h2>
            
            <div className="mb-4">
              <label htmlFor="defaultTimer" className="block text-sm font-medium text-white/70 mb-2">
                Default Timer
              </label>
              <select
                id="defaultTimer"
                className="input text-white bg-black/30 border-white/20"
                value={defaultTimer}
                onChange={(e) => setDefaultTimer(e.target.value)}
              >
                <option value="pomodoro">Pomodoro (25/5)</option>
                <option value="longFocus">Long Focus (50/10)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          
          {/* Data Management Section */}
          <div className="glow-card red p-6 rounded-xl bg-gradient-to-br from-red-600/30 to-red-400/10 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
            <h2 className="text-lg font-medium mb-4 text-white">Data Management</h2>
            
            <div className="flex flex-col">
              <div className="flex items-center mb-4">
                <FiTrash2 className="w-5 h-5 mr-3 text-red-400" />
                <div>
                  <h3 className="font-medium text-white">Reset All Data</h3>
                  <p className="text-sm text-white/70">This will permanently delete all your habits and their tracking data.</p>
                </div>
              </div>
              
              <button 
                onClick={handleResetStorage}
                className="w-full flex items-center justify-center text-red-100 hover:text-white transition-colors duration-300 px-4 py-3 rounded-lg bg-red-600/30 hover:bg-red-600/40 border border-red-500/40"
              >
                Reset All Data
              </button>
            </div>
          </div>
          
          {/* About Section */}
          <div className="glow-card blue p-6 rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-400/10 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.25)]">
            <h2 className="text-lg font-medium mb-4 text-white">About</h2>
            
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center">
                <FiInfo className="w-5 h-5 mr-3 text-blue-400" />
                <div>
                  <h3 className="font-medium text-white">Version</h3>
                  <p className="text-sm text-white/70">1.0.0</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <FiGithub className="w-5 h-5 mr-3 text-blue-400" />
                <div>
                  <h3 className="font-medium text-white">GitHub</h3>
                  <p className="text-sm text-white/70">View source code</p>
                </div>
              </div>
              
              <a
                href="https://github.com/0wver"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Open
              </a>
            </div>
            
            <div className="flex items-center justify-between py-3 border-t border-white/10">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-3 text-blue-400 flex items-center justify-center">👨‍💻</div>
                <div>
                  <h3 className="font-medium text-white">Developer</h3>
                  <p className="text-sm text-white/70">Made by Amer El Sayed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 
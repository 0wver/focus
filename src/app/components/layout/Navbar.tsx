"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiClock, FiBarChart2, FiSettings, FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";
import { useState } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";

const mainNavItems = [
  { name: "Dashboard", path: "/", icon: <FiHome className="w-5 h-5" /> },
  { name: "Timer", path: "/timer", icon: <FiClock className="w-5 h-5" /> },
  { name: "Stats", path: "/stats", icon: <FiBarChart2 className="w-5 h-5" /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-40 bg-black/30 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16">
          {/* Logo in the corner */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="flex items-center transition duration-300">
                <span className="text-white font-display font-bold text-2xl">Focus</span>
                <span className="ml-1 text-white font-display font-bold text-2xl">Flow</span>
              </div>
            </Link>
          </div>

          {/* Centered Navigation Pill */}
          <div className="bg-black/20 p-1.5 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-label={item.name}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary-500/30 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110 after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-r after:from-primary-500 after:to-primary-400 after:opacity-20 after:-z-10 after:blur-md' 
                      : 'text-white/90 hover:bg-black/30 hover:text-white hover:scale-105'
                  }`}
                >
                  {item.icon}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-black/20 text-primary-400 hover:bg-primary-500/20 hover:scale-105' 
                  : 'bg-white/10 text-primary-400 hover:bg-primary-500/20 hover:scale-105'
              }`}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? (
                <FiSun className="w-5 h-5" />
              ) : (
                <FiMoon className="w-5 h-5" />
              )}
            </button>
            
            <Link
              href="/settings"
              aria-label="Settings"
              className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-all duration-300 ${
                pathname === '/settings' 
                  ? 'bg-primary-500/30 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110 after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-r after:from-primary-500 after:to-primary-400 after:opacity-20 after:-z-10 after:blur-md' 
                  : 'bg-black/20 text-white/90 hover:bg-primary-500/20 hover:scale-105'
              }`}
            >
              <FiSettings className="w-5 h-5" />
              {pathname === '/settings' && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center relative transition-all duration-300 ${
                isMobileMenuOpen
                  ? 'bg-primary-500/30 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110 after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-r after:from-primary-500 after:to-primary-400 after:opacity-20 after:-z-10 after:blur-md'
                  : 'bg-black/20 text-white/90 hover:bg-primary-500/20 hover:scale-105'
              }`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-2 bg-black/20 backdrop-blur-md shadow-lg">
            <div className="flex justify-center space-x-3 py-2">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    aria-label={item.name}
                    className={`w-12 h-12 flex items-center justify-center rounded-full relative transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary-500/30 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110 after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-r after:from-primary-500 after:to-primary-400 after:opacity-20 after:-z-10 after:blur-md' 
                        : 'bg-black/30 text-white/90 hover:text-white hover:bg-primary-500/20 hover:scale-105'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 
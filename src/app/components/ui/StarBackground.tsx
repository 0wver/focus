"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Star {
  size: number;
  x: number;
  y: number;
  opacity: number;
  delay: number;
  duration: number;
  color: string;
}

export default function StarBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [glowingStars, setGlowingStars] = useState<Array<{size: number, x: number, y: number, delay: number}>>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Mark when component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Generate stars when component mounts
  useEffect(() => {
    if (!isClient) return;
    
    const starsCount = 200; // More stars
    const newStars: Star[] = [];
    
    // Star colors with orange/amber hues
    const starColors = [
      'rgba(255, 255, 255, 0.95)', // White
      'rgba(255, 243, 224, 0.9)', // Very light orange
      'rgba(255, 224, 178, 0.85)', // Light orange
      'rgba(255, 183, 77, 0.75)',  // Medium orange
      'rgba(249, 115, 22, 0.7)',  // Primary orange
    ];
    
    for (let i = 0; i < starsCount; i++) {
      const randomColorIndex = Math.floor(Math.random() * starColors.length);
      newStars.push({
        size: Math.random() * 3.5 + 0.5, // Varied sizes with some larger stars
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.6 + 0.4, // Slightly brighter stars
        delay: Math.random() * 8,
        duration: Math.random() * 8 + 4, // Longer pulse durations
        color: starColors[randomColorIndex],
      });
    }
    
    setStars(newStars);
    
    // Generate glowing stars
    const newGlowingStars = Array.from({ length: 8 }).map(() => ({
      size: Math.random() * 4 + 3.5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10
    }));
    
    setGlowingStars(newGlowingStars);
  }, [isClient]);

  // Create shooting stars at random intervals
  const [shootingStars, setShootingStars] = useState<{top: string, duration: number, delay: number}[]>([]);
  
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      const newShootingStar = {
        top: `${Math.random() * 90}%`,
        duration: Math.random() * 1.5 + 1,
        delay: Math.random() * 0.5,
      };
      
      setShootingStars(prev => [...prev, newShootingStar]);
      
      // Remove shooting star after animation completes
      setTimeout(() => {
        setShootingStars(prev => prev.filter(star => star !== newShootingStar));
      }, (newShootingStar.duration + newShootingStar.delay + 1) * 1000);
      
    }, 8000); // Create a new shooting star roughly every 8 seconds
    
    return () => clearInterval(interval);
  }, [isClient]);

  // Don't render stars until client-side
  if (!isClient) {
    return <div className="fixed inset-0 z-[-20] overflow-hidden" />;
  }

  return (
    <div className="fixed inset-0 z-[-20] overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary-900/5 to-transparent opacity-30 z-[-19]" />
      <div className="absolute top-1/3 right-1/3 w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary-700/5 to-transparent blur-[100px] opacity-30 z-[-19]" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary-600/5 to-transparent blur-[80px] opacity-20 z-[-19]" />
      
      {/* Regular stars */}
      {stars.map((star, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.opacity,
            backgroundColor: star.color,
            boxShadow: star.size > 2 ? `0 0 ${star.size * 3}px ${star.color}` : 'none',
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 1.7, star.opacity],
            scale: [1, star.size > 2 ? 1.3 : 1.1, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Larger glowing stars - extra bright */}
      {glowingStars.map((star, index) => (
        <motion.div
          key={`glow-star-${index}`}
          className="absolute rounded-full bg-primary-300"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x}%`,
            top: `${star.y}%`,
            boxShadow: `0 0 ${star.size * 4}px rgba(249, 115, 22, 0.8)`,
          }}
          animate={{
            opacity: [0.7, 0.95, 0.7],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Dynamic shooting stars that appear at random intervals */}
      {shootingStars.map((star, index) => (
        <motion.div
          key={`shooting-star-${index}`}
          className="absolute h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent z-10"
          style={{ 
            top: star.top, 
            left: '-200px',
            width: '200px',
            rotate: '15deg',
            filter: 'blur(0.5px)',
          }}
          initial={{ left: '-10%', opacity: 0 }}
          animate={{
            left: ['0%', '120%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            ease: "easeOut",
            times: [0, 0.7, 1],
          }}
        />
      ))}
      
      {/* Fixed shooting stars for consistent effect */}
      <motion.div
        className="absolute h-[1.5px] bg-gradient-to-r from-transparent via-primary-100 to-transparent"
        style={{ 
          top: '15%', 
          left: '-200px',
          width: '200px',
          rotate: '15deg',
          filter: 'blur(0.5px)',
        }}
        animate={{
          left: ['-10%', '120%'],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 18,
          ease: "easeOut",
          times: [0, 0.7, 1],
        }}
      />
      
      <motion.div
        className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
        style={{ 
          top: '40%', 
          left: '-150px',
          width: '150px',
          rotate: '20deg',
          filter: 'blur(0.3px)',
        }}
        animate={{
          left: ['0%', '120%'],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 13,
          ease: "easeOut",
          times: [0, 0.7, 1],
        }}
      />
      
      <motion.div
        className="absolute h-[2px] bg-gradient-to-r from-transparent via-primary-200 to-transparent"
        style={{ 
          top: '70%', 
          left: '-180px',
          width: '180px',
          rotate: '30deg',
          filter: 'blur(0.7px)',
        }}
        animate={{
          left: ['-5%', '120%'],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          repeatDelay: 25,
          ease: "easeOut",
          times: [0, 0.7, 1],
        }}
      />
    </div>
  );
} 
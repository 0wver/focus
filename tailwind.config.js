/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        secondary: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#1c1c1c',
          900: '#141414',
          950: '#0c0c0c',
        },
        background: {
          light: '#f8fafc',
          dark: '#000000',
        },
        text: {
          light: '#111827',
          muted: '#6b7280',
          dark: '#f3f4f6',
        },
        // Theme colors for habits
        health: {
          primary: '#16a34a',
          secondary: '#22c55e',
          light: '#dcfce7',
          dark: '#14532d',
        },
        study: {
          primary: '#4f46e5',
          secondary: '#6366f1',
          light: '#e0e7ff',
          dark: '#312e81',
        },
        personal: {
          primary: '#f97316',
          secondary: '#fb923c',
          light: '#ffedd5',
          dark: '#9a3412',
        },
        work: {
          primary: '#0ea5e9',
          secondary: '#38bdf8',
          light: '#e0f2fe',
          dark: '#075985',
        },
        creative: {
          primary: '#ec4899',
          secondary: '#f472b6',
          light: '#fce7f3',
          dark: '#9d174d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        smooth: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'smooth-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'glass': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glass-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(249, 115, 22, 0.6)',
        'glow-secondary': '0 0 20px rgba(41, 37, 36, 0.5)',
        'btn-glow': '0 0 15px rgba(249, 115, 22, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 15s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(45deg, rgba(249, 115, 22, 0.05), rgba(41, 37, 36, 0.05))',
        'gradient-mesh-dark': 'linear-gradient(45deg, rgba(249, 115, 22, 0.1), rgba(41, 37, 36, 0.1))',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}; 
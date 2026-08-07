import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center focus:outline-none ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300 shadow-inner'
          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900 shadow-sm'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-transform duration-500 rotate-0 hover:rotate-90" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-500 rotate-0 hover:-rotate-12" />
      )}
    </motion.button>
  );
}

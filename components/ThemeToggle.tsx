'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useGlobal } from '@/contexts/GlobalContext';

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

export function ThemeToggle({ className = '', size = 20 }: ThemeToggleProps) {
  const { theme, toggleTheme } = useGlobal();

  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-xl transition-all duration-300
        bg-white hover:bg-gray-50 text-gray-600 shadow-lg shadow-gray-200/50
        dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-yellow-400 dark:shadow-gray-900/20
        border border-gray-200 dark:border-gray-700
        ${className}
      `}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: 'var(--tw-rotate, 0)',
          scale: 1,
        }}
        className="dark:[--tw-rotate:180deg]"
        style={{ '--tw-rotate': '0deg' } as React.CSSProperties}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
      >
        {isDark ? (
          <Moon size={size} className="transition-colors duration-300" />
        ) : (
          <Sun size={size} className="transition-colors duration-300" />
        )}
      </motion.div>

      {/* 背景装饰 */}
      <motion.div
        className="
          absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
          bg-gradient-to-r from-yellow-400/20 to-orange-400/20
          dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-purple-600/20
        "
        whileHover={{ opacity: 1 }}
      />
    </motion.button>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PageSkeleton } from '../ui/skeleton';

interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'dots';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  text = 'Loading...',
  size = 'md',
}) => {
  if (variant === 'skeleton') {
    return <PageSkeleton />;
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const containerSizeClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12',
  };

  if (variant === 'dots') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
        <div
          className={`backdrop-blur-xl rounded-3xl shadow-2xl border bg-white/80 border-white/40 shadow-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/40 dark:shadow-black/20 ${containerSizeClasses[size]}`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className={`bg-blue-500 rounded-full ${sizeClasses[size]}`}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
            <motion.p
              className="text-gray-600 dark:text-gray-300 font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {text}
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div
        className={`backdrop-blur-xl rounded-3xl shadow-2xl border bg-white/80 border-white/40 shadow-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/40 dark:shadow-black/20 ${containerSizeClasses[size]}`}
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div
              className={`border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin ${sizeClasses[size]}`}
            ></div>
            {size === 'lg' && (
              <div
                className={`absolute inset-1 border border-purple-400/20 border-b-purple-400 rounded-full animate-spin animation-delay-75 ${sizeClasses[size]}`}
              ></div>
            )}
          </div>
          <motion.p
            className="text-gray-600 dark:text-gray-300 font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {text}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

// 简单的内联加载器
export const InlineLoading: React.FC<{
  size?: 'sm' | 'md';
  text?: string;
}> = ({ size = 'sm', text }) => {
  const spinnerSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <div
        className={`border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin ${spinnerSize}`}
      ></div>
      {text && <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>}
    </div>
  );
};

// 按钮加载状态
export const ButtonLoading: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ isLoading, children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
        </div>
      )}
      <div className={isLoading ? 'invisible' : 'visible'}>{children}</div>
    </div>
  );
};

export default Loading;

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // 初始化主题
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      const initialTheme = savedTheme || systemTheme;

      setTheme(initialTheme);
      setMounted(true);
    } catch (error) {
      console.warn('Failed to initialize theme:', error);
      setMounted(true);
    }
  }, []);

  // 应用主题到HTML元素
  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;

    try {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
    } catch (error) {
      console.warn('Failed to apply theme:', error);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      document.body.removeAttribute("class");
      if(newTheme ==="dark"){
        document.body.classList.add(
  "transition-colors",
  "duration-500",
  "bg-gradient-to-br",
  "from-gray-900",
  "via-slate-800",
  "via-gray-900",
  "to-slate-900"
);
      }else{
        document.body.classList.add(
  "transition-colors",
  "duration-500",
  "bg-gradient-to-br",
  "from-violet-50",
  "via-indigo-50",
  "via-blue-50",
  "to-cyan-50" // 注意这里应该写 50，Tailwind 没有 to-cyan-5
);}
      return newTheme;
    });
  };

  const contextValue = {
    theme,
    toggleTheme,
    setTheme,
    mounted,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // 在开发环境中显示错误，在生产环境中返回默认值
    if (process.env.NODE_ENV === 'development') {
      console.warn('useTheme must be used within a ThemeProvider, returning default values');
    }
    // 返回默认值以防止应用崩溃
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
      mounted: false,
    };
  }
  return context;
}

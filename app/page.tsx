'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { type Language, loadTranslations, Translations } from '@/lib/i18n';
import LanguageSelector from '@/components/language-selector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

export default function Home() {
  const [translations, setTranslations] = useState<Translations['home']>();
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language | null;
      return savedLang || 'zh';
    }
    return 'zh';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  useEffect(() => {
    const loadTranslationsAsync = async () => {
      try {
        const data = await loadTranslations(language);
        setTranslations(data.home);
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslationsAsync();
  }, [language]);

  const handleLanguageChange = async (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
        <div className="backdrop-blur-xl rounded-3xl p-8 shadow-2xl border bg-white/80 border-white/40 shadow-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/40 dark:shadow-black/20">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!translations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
        <div className="backdrop-blur-xl rounded-3xl p-8 shadow-2xl border bg-white/80 border-white/40 shadow-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/40 dark:shadow-black/20">
          <p className="text-red-500 dark:text-red-400 font-medium">Failed to load translations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      {/* iOS 16 风格背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl bg-gradient-to-br from-blue-200/30 to-indigo-300/40 dark:from-blue-600/15 dark:to-indigo-700/20"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-3xl bg-gradient-to-br from-purple-200/35 to-pink-300/45 dark:from-purple-600/18 dark:to-pink-700/23"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-2xl bg-gradient-to-br from-cyan-200/25 to-blue-300/35 dark:from-cyan-600/12 dark:to-blue-700/18"
          animate={{ 
            x: [-50, 50, -50],
            y: [-30, 30, -30],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* 主要内容容器 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* iOS 16 风格顶部控制区 */}
        <motion.div 
          className="flex justify-end p-6 sm:p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="backdrop-blur-xl rounded-2xl p-3 shadow-lg border bg-white/70 border-white/40 shadow-gray-200/30 dark:bg-gray-800/70 dark:border-gray-700/40 dark:shadow-black/20">
            <div className="flex items-center gap-3">
              <LanguageSelector
                currentLanguage={language}
                onLanguageChange={handleLanguageChange}
              />
            </div>
          </div>
        </motion.div>

        {/* iOS 16 风格主要内容区域 */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 pb-8">
          <div className="w-full max-w-lg mx-auto text-center">
            {/* iOS 16 风格主标题区域 */}
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              {/* 飞行棋图标 */}
              <motion.div 
                className="mb-8 flex justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/30 dark:shadow-blue-500/20 flex items-center justify-center">
                    <div className="text-5xl sm:text-6xl">🎲</div>
                  </div>
                  {/* iOS 16 风格光泽效果 */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white/30 rounded-full blur-sm"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 bg-white/20 rounded-full blur-sm"></div>
                </div>
              </motion.div>

              {/* 主标题 */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                {translations.title}
              </h1>
              
              {/* 副标题 */}
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed px-4">
                {translations.subtitle}
              </p>
            </motion.div>

            {/* iOS 16 风格开始游戏按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            >
              <Link href="/flying">
                <motion.button
                  className="w-full sm:w-auto px-12 py-5 rounded-3xl font-black text-xl tracking-wide text-white shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border border-blue-500/30"
                  whileHover={{ 
                    scale: 1.02,
                    y: -2
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <span>🚀</span>
                    <span>{translations.cta.startGame}</span>
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* iOS 16 风格底部提示 */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {translations.cta.subtext}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

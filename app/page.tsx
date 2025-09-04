'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { type Language, loadTranslations, Translations } from '@/lib/i18n';
import LanguageSelector from '@/components/language-selector';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [translations, setTranslations] = useState<Translations['home']>();

  const [isLoading, setIsLoading] = useState(true);

  const [language, setLanguage] = useState<Language>(() => {
    // 从 localStorage 读取语言设置，如果没有则默认为 'zh'
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language | null;
      return savedLang || 'zh';
    }
    return 'zh';
  });

  const { theme, mounted } = useTheme();
  const isDarkMode = theme === 'dark';

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

  if (!mounted) {
    return (
      <div className="w-full px-0 sm:px-4 lg:px-8 xl:px-12 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!translations) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
      >
        <p className="text-red-500">Failed to load translations</p>
      </div>
    );
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-b from-gray-900 to-gray-800'
          : 'bg-gradient-to-b from-pink-50 to-purple-50'
      }`}
    >
      <div className="text-center max-w-4xl mx-auto px-4">
        {/* Logo and Title */}
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-pink-400' : 'text-pink-600'
            }`}
          >
            {translations.title}
          </h1>
          <p
            className={`text-lg mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {translations.subtitle}
          </p>
          <div className="flex justify-center">
            <div
              className={`backdrop-blur-sm rounded-2xl p-2 shadow-lg border transition-colors duration-500 ${
                theme === 'dark'
                  ? 'bg-gray-800/60 border-gray-700/40'
                  : 'bg-white/60 border-white/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <LanguageSelector
                  currentLanguage={language}
                  onLanguageChange={handleLanguageChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Game Features */}
        <div
          className={`p-6 rounded-xl shadow-lg mb-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h2
            className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            {translations.features.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4">
              <div className="text-pink-500 text-3xl mb-2">🎲</div>
              <h3
                className={`font-medium text-lg mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                {translations.features.classic.title}
              </h3>
              <p
                className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {translations.features.classic.description}
              </p>
            </div>
            <div className="p-4">
              <div className="text-pink-500 text-3xl mb-2">💖</div>
              <h3
                className={`font-medium text-lg mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                {translations.features.interaction.title}
              </h3>
              <p
                className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {translations.features.interaction.description}
              </p>
            </div>
            <div className="p-4">
              <div className="text-pink-500 text-3xl mb-2">🎯</div>
              <h3
                className={`font-medium text-lg mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                {translations.features.modes.title}
              </h3>
              <p
                className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {translations.features.modes.description}
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-4">
          <Link
            href="/flying"
            className="inline-block w-full md:w-auto bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300"
          >
            {translations.cta.startGame}
          </Link>
          <p
            className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {translations.cta.subtext}
          </p>
        </div>
      </div>
    </main>
  );
}

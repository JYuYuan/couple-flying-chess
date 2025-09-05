'use client';

import { type Language, languageNames, languageFlags } from '@/lib/i18n';
import { Github, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  showGithub?: boolean;
  className?: string;
}

export default function LanguageSelector({
  currentLanguage,
  onLanguageChange,
  className = '',
}: LanguageSelectorProps) {
  const languages: Language[] = ['zh', 'en', 'ja'];
  const { isMuted, toggleMute } = useSound();

  // 根据 className 判断是否为 title 样式
  const isTitleStyle = className.includes('title');

  return (
    <div
      className={`flex items-center space-x-2 ${currentLanguage === 'zh' && isTitleStyle ? 'justify-center' : ''}`}
    >
      {/* iOS 16 风格语言选择按钮组 */}
      <div
        className="relative flex items-center p-2 rounded-2xl shadow-xl border transition-all duration-500 backdrop-blur-xl bg-white/80 border-white/40 shadow-gray-200/40 dark:bg-gray-800/80 dark:border-gray-700/40 dark:shadow-black/30"
      >
        {languages.map((lang) => (
          <motion.button
            key={lang}
            className={`
              relative rounded-2xl overflow-hidden z-20 flex-1 px-3 py-2.5 text-sm font-bold transition-all duration-300
              ${
                lang === currentLanguage
                  ? 'text-white shadow-lg shadow-purple-400/30 dark:shadow-purple-500/30'
                  : 'transition-colors duration-300 text-gray-700 hover:text-gray-900 hover:bg-black/10 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10'
              }
            `}
            onClick={() => onLanguageChange(lang)}
            title={languageNames[lang]}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-center space-x-1">
              <motion.span
                className="text-base leading-none relative z-30"
                animate={{
                  scale: lang === currentLanguage ? 1.1 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
              >
                {languageFlags[lang]}
              </motion.span>
              <span className="hidden sm:inline-block text-xs font-bold tracking-wider">
                {lang.toUpperCase()}
              </span>
            </div>

            {/* iOS 16 风格毛玻璃选中效果 */}
            <AnimatePresence>
              {lang === currentLanguage && (
                <motion.div
                  className="absolute inset-0 rounded-xl backdrop-blur-sm border z-10 bg-white/40 border-white/50 dark:bg-white/20 dark:border-white/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                />
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <motion.button
        className={`
          relative p-2.5 rounded-2xl shadow-xl border overflow-hidden transition-all duration-500 backdrop-blur-xl
          ${
            isMuted
              ? 'bg-red-100/90 border-red-300/60 text-red-600 hover:bg-red-200/90 shadow-red-200/40 dark:bg-red-900/80 dark:border-red-700/50 dark:text-red-300 dark:hover:bg-red-800/90 dark:shadow-red-900/40'
              : 'bg-green-100/90 border-green-300/60 text-green-600 hover:bg-green-200/90 shadow-green-200/40 dark:bg-green-900/80 dark:border-green-700/50 dark:text-green-300 dark:hover:bg-green-800/90 dark:shadow-green-900/40'
          }
        `}
        onClick={toggleMute}
        title={isMuted ? '开启声音' : '静音'}
        aria-label={isMuted ? '开启声音' : '静音'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* iOS 16 风格毛玻璃背景脉冲动画 */}
        <motion.div
          className={`absolute inset-0 rounded-2xl backdrop-blur-sm ${
            isMuted
              ? 'bg-red-400/30 dark:bg-red-400/20'
              : 'bg-green-400/30 dark:bg-green-400/20'
          }`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="relative z-10">
          <motion.div
            key={isMuted ? 'muted' : 'unmuted'}
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
          >
            {isMuted ? (
              <VolumeX size={16} className="drop-shadow-sm" />
            ) : (
              <Volume2 size={16} className="drop-shadow-sm" />
            )}
          </motion.div>

          {/* iOS 16 风格毛玻璃状态指示器 */}
          <motion.div
            className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full backdrop-blur-sm border shadow-lg ${
              isMuted
                ? 'bg-red-500/90 border-red-400/70 dark:bg-red-400/90 dark:border-red-300/70'
                : 'bg-green-500/90 border-green-400/70 dark:bg-green-400/90 dark:border-green-300/70'
            }`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.button>
      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <ThemeToggle size={18} />
    </div>
  );
}

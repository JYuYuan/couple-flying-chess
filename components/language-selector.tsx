'use client';

import { type Language, languageNames, languageFlags } from '@/lib/i18n';
import { Github, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
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
  showGithub = false,
  className = '',
}: LanguageSelectorProps) {
  const languages: Language[] = ['zh', 'en', 'ja'];
  const { isMuted, toggleMute } = useSound();
  const { theme, mounted } = useTheme();

  // 根据 className 判断是否为 title 样式
  const isTitleStyle = className.includes('title');

  if (!mounted) {
    return (
      <div className="w-full px-0 sm:px-4 lg:px-8 xl:px-12 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center space-x-2 ${currentLanguage === 'zh' && isTitleStyle ? 'justify-center' : ''}`}
    >
      {/* 语言选择按钮组 */}
      <div
        className={`relative flex items-center p-1.5 rounded-xl shadow-lg border transition-all duration-500 ${
          theme === 'dark'
            ? 'bg-gray-800/50 backdrop-blur-md border-gray-700/40 shadow-black/30'
            : 'bg-white/50 backdrop-blur-md border-white/60 shadow-gray-200/30'
        }`}
      >
        {languages.map((lang) => (
          <motion.button
            key={lang}
            className={`
              relative rounded-xl overflow-hidden z-20 flex-1 px-2.5 py-2 text-sm font-medium  transition-all duration-300
              ${
                lang === currentLanguage
                  ? `text-white shadow-md ${theme === 'dark' ? 'shadow-purple-500/20' : 'shadow-purple-400/20'}`
                  : `transition-colors duration-300 ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-black/10'
                    }`
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

            {/* 毛玻璃选中效果 */}
            <AnimatePresence>
              {lang === currentLanguage && (
                <motion.div
                  className={`absolute inset-0 rounded-lg backdrop-blur-sm border z-10 ${
                    theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white/30 border-white/40'
                  }`}
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

      {/* GitHub 链接 */}
      {showGithub && (
        <motion.a
          href="https://github.com/woniu9524/couple-flying-chess"
          target="_blank"
          rel="noopener noreferrer"
          className={`
            p-2 rounded-xl shadow-lg border transition-all duration-500
            ${
              theme === 'dark'
                ? 'bg-gray-800/50 backdrop-blur-md border-gray-700/40 text-gray-300 hover:text-white hover:bg-gray-700/60 shadow-black/30'
                : 'bg-white/50 backdrop-blur-md border-white/60 text-gray-600 hover:text-indigo-600 hover:bg-white/70 shadow-gray-200/30'
            }
          `}
          title="查看 GitHub 源代码"
          whileHover={{
            scale: 1.1,
            rotateY: 8,
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Github size={16} className="drop-shadow-sm" />
        </motion.a>
      )}

      {/* 音量控制按钮 */}
      <motion.button
        className={`
          relative p-2 rounded-xl shadow-lg border overflow-hidden transition-all duration-500
          ${
            isMuted
              ? theme === 'dark'
                ? 'bg-red-900/50 backdrop-blur-md border-red-700/40 text-red-300 hover:bg-red-800/60 shadow-red-900/30'
                : 'bg-red-100/70 backdrop-blur-md border-red-300/50 text-red-600 hover:bg-red-200/70 shadow-red-200/30'
              : theme === 'dark'
                ? 'bg-green-900/50 backdrop-blur-md border-green-700/40 text-green-300 hover:bg-green-800/60 shadow-green-900/30'
                : 'bg-green-100/70 backdrop-blur-md border-green-300/50 text-green-600 hover:bg-green-200/70 shadow-green-200/30'
          }
        `}
        onClick={toggleMute}
        title={isMuted ? '开启声音' : '静音'}
        aria-label={isMuted ? '开启声音' : '静音'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* 毛玻璃背景脉冲动画 */}
        <motion.div
          className={`absolute inset-0 rounded-xl backdrop-blur-sm ${
            isMuted
              ? theme === 'dark'
                ? 'bg-red-400/10'
                : 'bg-red-400/20'
              : theme === 'dark'
                ? 'bg-green-400/10'
                : 'bg-green-400/20'
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

          {/* 毛玻璃状态指示器 */}
          <motion.div
            className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full backdrop-blur-sm border ${
              isMuted
                ? theme === 'dark'
                  ? 'bg-red-400/90 border-red-300/60'
                  : 'bg-red-500/90 border-red-400/60'
                : theme === 'dark'
                  ? 'bg-green-400/90 border-green-300/60'
                  : 'bg-green-500/90 border-green-400/60'
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

'use client';

import React from 'react';
import Link from 'next/link';
import LanguageSelector from '@/components/language-selector';
import { motion } from 'framer-motion';
import { ChevronRight, Gamepad2, Plane, Settings, Sparkles, Target } from 'lucide-react';
import { useGlobal } from '@/contexts/GlobalContext';

export default function Home() {
  const { translations: allTranslations } = useGlobal();
  const translations = { ...allTranslations?.home };

  const gameOptions = [
    {
      title: translations.title,
      subtitle: translations.subtitle,
      description: '体验策略与运气的完美结合',
      icon: Plane, // 使用 lucide-react 图标组件
      href: '/flying/mode',
      gradient: 'from-blue-500 via-blue-600 to-purple-600',
      shadowColor: 'shadow-blue-500/25',
      hoverShadow: 'hover:shadow-blue-500/40',
      bgGradient: 'from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50',
      iconBg: 'from-blue-500 to-purple-600',
    },
    {
      title: '幸运转盘',
      subtitle: '趣味互动挑战',
      description: '转动命运的齿轮，迎接未知',
      icon: Target, // 使用 lucide-react 图标组件
      href: '/wheel/mode',
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      shadowColor: 'shadow-amber-500/25',
      hoverShadow: 'hover:shadow-amber-500/40',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50',
      iconBg: 'from-amber-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      {/* iOS 16 风格背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl bg-gradient-to-br from-blue-200/30 to-indigo-300/40 dark:from-blue-600/15 dark:to-indigo-700/20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-3xl bg-gradient-to-br from-purple-200/35 to-pink-300/45 dark:from-purple-600/18 dark:to-pink-700/23"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-2xl bg-gradient-to-br from-cyan-200/25 to-blue-300/35 dark:from-cyan-600/12 dark:to-blue-700/18"
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
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
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="backdrop-blur-xl rounded-2xl p-3 shadow-lg border bg-white/70 border-white/40 shadow-gray-200/30 dark:bg-gray-800/70 dark:border-gray-700/40 dark:shadow-black/20">
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <Link href="/settings">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
       relative p-2 rounded-xl transition-all duration-300
  bg-sky-50 hover:bg-sky-100 text-sky-600 shadow-md shadow-sky-200/60
  dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-sky-400 dark:shadow-sky-900/30
  border border-sky-100 dark:border-gray-700
      `}
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
                    <Settings className="w-5 h-5" />
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
              </Link>
            </div>
          </div>
        </motion.div>

        {/* iOS 16 风格主要内容区域 */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 pb-8">
          <div className="w-full max-w-2xl mx-auto text-center">
            {/* iOS 16 风格主标题区域 */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              {/* 游戏图标 */}
              <motion.div
                className="mb-8 flex justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/30 dark:shadow-blue-500/20 flex items-center justify-center">
                    <Gamepad2 size={56} className="text-white" />
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

            {/* iOS 16 风格游戏选择卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
              className="space-y-4 sm:space-y-6"
            >
              {gameOptions.map((game, index) => {
                const IconComponent = game.icon; // 获取图标组件

                return (
                  <motion.div
                    key={game.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Link href={game.href}>
                      <motion.div
                        className={`
                          group relative overflow-hidden rounded-3xl backdrop-blur-xl border-2 border-white/30 
                          bg-gradient-to-br ${game.bgGradient} 
                          shadow-xl ${game.shadowColor} ${game.hoverShadow}
                          transition-all duration-500 cursor-pointer
                        `}
                        whileHover={{
                          scale: 1.02,
                          y: -4,
                          transition: { duration: 0.2 },
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* 背景光效 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* 内容区域 */}
                        <div className="relative p-6 sm:p-8 flex items-center">
                          {/* 左侧图标区域 */}
                          <div className="flex-shrink-0 mr-6">
                            <div
                              className={`
                              relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl
                              bg-gradient-to-br ${game.iconBg}
                              shadow-lg shadow-black/20
                              flex items-center justify-center
                              transform group-hover:scale-110 group-hover:rotate-3
                              transition-all duration-300
                            `}
                            >
                              {/* 使用 lucide-react 图标 */}
                              <motion.div
                                whileHover={{
                                  transition: { duration: 0.5 },
                                  rotate: game.title?.includes('转盘') ? 180 : 0,
                                }}
                              >
                                <IconComponent size={32} className="text-white drop-shadow-lg" />
                              </motion.div>

                              {/* 图标光泽效果 */}
                              <div className="absolute top-2 left-2 w-4 h-4 bg-white/40 rounded-full blur-sm" />
                              <div className="absolute bottom-2 right-2 w-2 h-2 bg-white/30 rounded-full blur-sm" />
                            </div>
                          </div>

                          {/* 中间文字区域 */}
                          <div className="flex-1 text-left">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-1 group-hover:text-white transition-colors duration-300">
                              {game.title}
                            </h3>
                            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300 mb-2 group-hover:text-white/90 transition-colors duration-300">
                              {game.subtitle}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 group-hover:text-white/70 transition-colors duration-300">
                              {game.description}
                            </p>
                          </div>

                          {/* 右侧箭头 */}
                          <div className="flex-shrink-0 ml-4">
                            <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                              <ChevronRight
                                size={20}
                                className="text-gray-600 dark:text-gray-300 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 底部渐变条 */}
                        <div
                          className={`
                          absolute bottom-0 left-0 right-0 h-1 
                          bg-gradient-to-r ${game.gradient}
                          transform scale-x-0 group-hover:scale-x-100
                          transition-transform duration-500 origin-left
                        `}
                        />

                        {/* 悬浮时的边框光效 */}
                        <div
                          className={`
                          absolute inset-0 rounded-3xl border-2 border-transparent
                          bg-gradient-to-r ${game.gradient} opacity-0 group-hover:opacity-20
                          transition-opacity duration-500 pointer-events-none
                        `}
                          style={{
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'subtract',
                          }}
                        />
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* iOS 16 风格底部提示 */}
            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
            >
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <Sparkles size={16} className="text-yellow-500" />
                <span>{translations.cta?.subtext || '选择你喜欢的游戏模式开始吧'}</span>
                <Sparkles size={16} className="text-yellow-500" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Edit, Plus, X, Sparkles, ChevronDown } from 'lucide-react';
import type { GameMode, CustomMode } from '@/components/game/flying/types/game';
import { gameModeIcons, gameModeEmojis } from '@/components/game/flying/constants/game-config';
import { Translations } from '@/lib/i18n';
import { useTheme } from '@/contexts/ThemeContext';

interface GameModeSelectorProps {
  translations: Translations;
  customModes: CustomMode[];
  isLoadingTasks: boolean;
  gameMode: GameMode;
  onStartGame: (mode: GameMode) => void;
  onStartCustomGame: (mode: CustomMode) => void;
  onCreateCustomMode: () => void;
  onDeleteCustomMode: (modeId: string) => void;
}

// 定义样式对象
const modeStyles = {
  dark: {
    normal: {
      bg: 'bg-gradient-to-br from-blue-900/60 via-gray-800 to-cyan-900/60 hover:from-blue-800/70 hover:to-cyan-800/70',
      iconBg:
        'bg-gradient-to-br from-blue-800/50 to-cyan-700/50 group-hover:from-blue-700/60 group-hover:to-cyan-600/60',
      iconColor: 'text-blue-400',
      textColor: 'text-gray-100 group-hover:text-blue-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    love: {
      bg: 'bg-gradient-to-br from-pink-900/60 via-gray-800 to-rose-900/60 hover:from-pink-800/70 hover:to-rose-800/70',
      iconBg:
        'bg-gradient-to-br from-pink-800/50 to-rose-700/50 group-hover:from-pink-700/60 group-hover:to-rose-600/60',
      iconColor: 'text-pink-400',
      textColor: 'text-gray-100 group-hover:text-pink-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    couple: {
      bg: 'bg-gradient-to-br from-purple-900/60 via-gray-800 to-indigo-900/60 hover:from-purple-800/70 hover:to-indigo-800/70',
      iconBg:
        'bg-gradient-to-br from-purple-800/50 to-indigo-700/50 group-hover:from-purple-700/60 group-hover:to-indigo-600/60',
      iconColor: 'text-purple-400',
      textColor: 'text-gray-100 group-hover:text-purple-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    advanced: {
      bg: 'bg-gradient-to-br from-emerald-900/60 via-gray-800 to-teal-900/60 hover:from-emerald-800/70 hover:to-teal-800/70',
      iconBg:
        'bg-gradient-to-br from-emerald-800/50 to-teal-700/50 group-hover:from-emerald-700/60 group-hover:to-teal-600/60',
      iconColor: 'text-emerald-400',
      textColor: 'text-gray-100 group-hover:text-emerald-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    intimate: {
      bg: 'bg-gradient-to-br from-rose-600 via-pink-700 to-red-700 text-white',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconColor: 'text-white',
      textColor: 'text-white',
      descColor: 'text-white/90',
    },
    mixed: {
      bg: 'bg-gradient-to-br from-orange-900/60 via-gray-800 to-amber-900/60 hover:from-orange-800/70 hover:to-amber-800/70',
      iconBg:
        'bg-gradient-to-br from-orange-800/50 to-amber-700/50 group-hover:from-orange-700/60 group-hover:to-amber-600/60',
      iconColor: 'text-orange-400',
      textColor: 'text-gray-100 group-hover:text-orange-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    hetero: {
      bg: 'bg-gradient-to-br from-violet-900/60 via-gray-800 to-fuchsia-900/60 hover:from-violet-800/70 hover:to-fuchsia-800/70',
      iconBg:
        'bg-gradient-to-br from-violet-800/50 to-fuchsia-700/50 group-hover:from-violet-700/60 group-hover:to-fuchsia-600/60',
      iconColor: 'text-violet-400',
      textColor: 'text-gray-100 group-hover:text-violet-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    daily: {
      bg: 'bg-gradient-to-br from-sky-900/60 via-gray-800 to-blue-900/60 hover:from-sky-800/70 hover:to-blue-800/70',
      iconBg:
        'bg-gradient-to-br from-sky-800/50 to-blue-700/50 group-hover:from-sky-700/60 group-hover:to-blue-600/60',
      iconColor: 'text-sky-400',
      textColor: 'text-gray-100 group-hover:text-sky-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    food: {
      bg: 'bg-gradient-to-br from-orange-900/60 via-gray-800 to-yellow-900/60 hover:from-orange-800/70 hover:to-yellow-800/70',
      iconBg:
        'bg-gradient-to-br from-orange-800/50 to-yellow-700/50 group-hover:from-orange-700/60 group-hover:to-yellow-600/60',
      iconColor: 'text-orange-400',
      textColor: 'text-gray-100 group-hover:text-orange-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    fitness: {
      bg: 'bg-gradient-to-br from-green-900/60 via-gray-800 to-emerald-900/60 hover:from-green-800/70 hover:to-emerald-800/70',
      iconBg:
        'bg-gradient-to-br from-green-800/50 to-emerald-700/50 group-hover:from-green-700/60 group-hover:to-emerald-600/60',
      iconColor: 'text-green-400',
      textColor: 'text-gray-100 group-hover:text-green-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    creative: {
      bg: 'bg-gradient-to-br from-violet-900/60 via-gray-800 to-purple-900/60 hover:from-violet-800/70 hover:to-purple-800/70',
      iconBg:
        'bg-gradient-to-br from-violet-800/50 to-purple-700/50 group-hover:from-violet-700/60 group-hover:to-purple-600/60',
      iconColor: 'text-violet-400',
      textColor: 'text-gray-100 group-hover:text-violet-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    romantic: {
      bg: 'bg-gradient-to-br from-pink-900/60 via-gray-800 to-rose-900/60 hover:from-pink-800/70 hover:to-rose-800/70',
      iconBg:
        'bg-gradient-to-br from-pink-800/50 to-rose-700/50 group-hover:from-pink-700/60 group-hover:to-rose-600/60',
      iconColor: 'text-pink-400',
      textColor: 'text-gray-100 group-hover:text-pink-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    game: {
      bg: 'bg-gradient-to-br from-cyan-900/60 via-gray-800 to-teal-900/60 hover:from-cyan-800/70 hover:to-teal-800/70',
      iconBg:
        'bg-gradient-to-br from-cyan-800/50 to-teal-700/50 group-hover:from-cyan-700/60 group-hover:to-teal-600/60',
      iconColor: 'text-cyan-400',
      textColor: 'text-gray-100 group-hover:text-cyan-300',
      descColor: 'text-gray-400 group-hover:text-gray-300',
    },
    adult: {
      bg: 'bg-gradient-to-br from-red-800 via-gray-800 to-rose-800 text-white',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconColor: 'text-white',
      textColor: 'text-white',
      descColor: 'text-white/90',
    },
    'master-slave-sex': {
      bg: 'bg-gradient-to-br from-purple-800 via-gray-800 to-indigo-800 text-white',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconColor: 'text-white',
      textColor: 'text-white',
      descColor: 'text-white/90',
    },
  },
  light: {
    normal: {
      bg: 'bg-gradient-to-br from-blue-50 via-white to-cyan-50 hover:from-blue-100 hover:to-cyan-100',
      iconBg:
        'bg-gradient-to-br from-blue-100 to-cyan-200 group-hover:from-blue-200 group-hover:to-cyan-300',
      iconColor: 'text-blue-600',
      textColor: 'text-gray-800 group-hover:text-blue-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    love: {
      bg: 'bg-gradient-to-br from-pink-50 via-white to-rose-50 hover:from-pink-100 hover:to-rose-100',
      iconBg:
        'bg-gradient-to-br from-pink-100 to-rose-200 group-hover:from-pink-200 group-hover:to-rose-300',
      iconColor: 'text-pink-600',
      textColor: 'text-gray-800 group-hover:text-pink-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    couple: {
      bg: 'bg-gradient-to-br from-purple-50 via-white to-indigo-50 hover:from-purple-100 hover:to-indigo-100',
      iconBg:
        'bg-gradient-to-br from-purple-100 to-indigo-200 group-hover:from-purple-200 group-hover:to-indigo-300',
      iconColor: 'text-purple-600',
      textColor: 'text-gray-800 group-hover:text-purple-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    advanced: {
      bg: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 hover:from-emerald-100 hover:to-teal-100',
      iconBg:
        'bg-gradient-to-br from-emerald-100 to-teal-200 group-hover:from-emerald-200 group-hover:to-teal-300',
      iconColor: 'text-emerald-600',
      textColor: 'text-gray-800 group-hover:text-emerald-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    intimate: {
      bg: 'bg-gradient-to-br from-rose-400 via-pink-500 to-red-500 text-white',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconColor: 'text-white',
      textColor: 'text-white',
      descColor: 'text-white/90',
    },
    mixed: {
      bg: 'bg-gradient-to-br from-orange-50 via-white to-amber-50 hover:from-orange-100 hover:to-amber-100',
      iconBg:
        'bg-gradient-to-br from-orange-100 to-amber-200 group-hover:from-orange-200 group-hover:to-amber-300',
      iconColor: 'text-orange-600',
      textColor: 'text-gray-800 group-hover:text-orange-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    hetero: {
      bg: 'bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 hover:from-violet-100 hover:to-fuchsia-100',
      iconBg:
        'bg-gradient-to-br from-violet-100 to-fuchsia-200 group-hover:from-violet-200 group-hover:to-fuchsia-300',
      iconColor: 'text-violet-600',
      textColor: 'text-gray-800 group-hover:text-violet-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    daily: {
      bg: 'bg-gradient-to-br from-sky-50 via-white to-blue-50 hover:from-sky-100 hover:to-blue-100',
      iconBg:
        'bg-gradient-to-br from-sky-100 to-blue-200 group-hover:from-sky-200 group-hover:to-blue-300',
      iconColor: 'text-sky-600',
      textColor: 'text-gray-800 group-hover:text-sky-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    food: {
      bg: 'bg-gradient-to-br from-orange-50 via-white to-yellow-50 hover:from-orange-100 hover:to-yellow-100',
      iconBg:
        'bg-gradient-to-br from-orange-100 to-yellow-200 group-hover:from-orange-200 group-hover:to-yellow-300',
      iconColor: 'text-orange-600',
      textColor: 'text-gray-800 group-hover:text-orange-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    fitness: {
      bg: 'bg-gradient-to-br from-green-50 via-white to-emerald-50 hover:from-green-100 hover:to-emerald-100',
      iconBg:
        'bg-gradient-to-br from-green-100 to-emerald-200 group-hover:from-green-200 group-hover:to-emerald-300',
      iconColor: 'text-green-600',
      textColor: 'text-gray-800 group-hover:text-green-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    creative: {
      bg: 'bg-gradient-to-br from-violet-50 via-white to-purple-50 hover:from-violet-100 hover:to-purple-100',
      iconBg:
        'bg-gradient-to-br from-violet-100 to-purple-200 group-hover:from-violet-200 group-hover:to-purple-300',
      iconColor: 'text-violet-600',
      textColor: 'text-gray-800 group-hover:text-violet-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    romantic: {
      bg: 'bg-gradient-to-br from-pink-50 via-white to-rose-50 hover:from-pink-100 hover:to-rose-100',
      iconBg:
        'bg-gradient-to-br from-pink-100 to-rose-200 group-hover:from-pink-200 group-hover:to-rose-300',
      iconColor: 'text-pink-600',
      textColor: 'text-gray-800 group-hover:text-pink-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    game: {
      bg: 'bg-gradient-to-br from-cyan-50 via-white to-teal-50 hover:from-cyan-100 hover:to-teal-100',
      iconBg:
        'bg-gradient-to-br from-cyan-100 to-teal-200 group-hover:from-cyan-200 group-hover:to-teal-300',
      iconColor: 'text-cyan-600',
      textColor: 'text-gray-800 group-hover:text-cyan-700',
      descColor: 'text-gray-600 group-hover:text-gray-700',
    },
    adult: {
      bg: 'bg-gradient-to-br from-red-400 via-red-500 to-rose-500 text-white',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconColor: 'text-white',
      textColor: 'text-white',
      descColor: 'text-white/90',
    },
    'master-slave-sex': {
      bg: 'bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-500 text-white',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconColor: 'text-white',
      textColor: 'text-white',
      descColor: 'text-white/90',
    },
  },
};

// 默认样式
const defaultStyle = {
  dark: {
    bg: 'bg-gradient-to-br from-gray-800 via-gray-700 to-slate-800 hover:from-gray-700 hover:to-slate-700',
    iconBg:
      'bg-gradient-to-br from-gray-700/50 to-slate-600/50 group-hover:from-gray-600/60 group-hover:to-slate-500/60',
    iconColor: 'text-gray-400',
    textColor: 'text-gray-100 group-hover:text-gray-200',
    descColor: 'text-gray-400 group-hover:text-gray-300',
  },
  light: {
    bg: 'bg-gradient-to-br from-gray-50 via-white to-slate-50 hover:from-gray-100 hover:to-slate-100',
    iconBg:
      'bg-gradient-to-br from-gray-100 to-slate-200 group-hover:from-gray-200 group-hover:to-slate-300',
    iconColor: 'text-gray-600',
    textColor: 'text-gray-800 group-hover:text-gray-700',
    descColor: 'text-gray-600 group-hover:text-gray-700',
  },
};

const modeCategories = {
  basic: ['normal', 'love'] as GameMode[],
  lifestyle: ['daily', 'food', 'fitness', 'creative', 'romantic', 'game'] as GameMode[],
  adult: [
    'adult',
    'master-slave-sex',
    'couple',
    'advanced',
    'intimate',
    'mixed',
    'hetero',
  ] as GameMode[],
};

export function GameModeSelector({
  translations,
  customModes,
  isLoadingTasks,
  gameMode,
  onStartGame,
  onStartCustomGame,
  onCreateCustomMode,
  onDeleteCustomMode,
}: GameModeSelectorProps) {
  const { theme, mounted } = useTheme();
  const isDarkMode = theme === 'dark';

  // 展开/折叠状态
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    basic: true,
    lifestyle: false,
    adult: false,
  });

  // 防止hydration不匹配，在客户端挂载之前显示加载状态
  if (!mounted) {
    return (
      <div className="w-full px-0 sm:px-4 lg:px-8 xl:px-12 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        </div>
      </div>
    );
  }

  // 游戏模式分类

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // 使用对象方式获取样式
  const getCardStyles = (mode: string) => {
    const themeKey = isDarkMode ? 'dark' : 'light';
    return modeStyles[themeKey][mode as keyof typeof modeStyles.dark] || defaultStyle[themeKey];
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-8 xl:px-12 py-8">
      {/* 分类模式展示 */}
      {Object.entries(modeCategories).map(([categoryKey, category]) => (
        <div key={categoryKey} className="mb-8">
          {/* 分类标题和折叠按钮 */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl mb-4 cursor-pointer transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => toggleCategory(categoryKey)}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {categoryKey === 'basic' && '🎯'}
                {categoryKey === 'lifestyle' && '🌈'}
                {categoryKey === 'adult' && '❤️‍🔥'}
              </div>
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}
              >
                {translations.modeCategories[categoryKey as keyof Translations['modeCategories']]}
              </h3>
              <span
                className={`text-xs px-2.5 py-1 rounded-full shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/20' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-blue-500/30'
                }`}
              >
                {category.length}
              </span>
            </div>
            <div
              className={`transition-transform duration-300 ${
                expandedCategories[categoryKey] ? 'rotate-180' : ''
              }`}
            >
              <ChevronDown size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </div>
          </div>

          {/* 可折叠的游戏模式网格 */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              expandedCategories[categoryKey] ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
              {category.map((modeKey) => {
                const mode = translations.modes[modeKey];
                if (!mode) return null;

                const IconComponent = gameModeIcons[modeKey as GameMode];
                const isLoading = isLoadingTasks && gameMode === modeKey;
                const styles = getCardStyles(modeKey);

                return (
                  <div
                    key={modeKey}
                    onClick={() => !isLoadingTasks && onStartGame(modeKey as GameMode)}
                    className={`group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-white/50'} ${styles.bg} ${isLoading ? 'pointer-events-none' : ''}`}
                  >
                    {/* 装饰性背景 - 更柔和的效果 */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-current to-transparent rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-current to-transparent rounded-full blur-xl"></div>
                    </div>

                    <div className="relative p-6 h-full flex flex-col">
                      {/* 图标和emoji区域 */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${styles.iconBg}`}
                        >
                          <IconComponent
                            size={24}
                            className={`transition-all duration-300 ${styles.iconColor}`}
                          />
                        </div>
                        <div className="text-2xl animate-bounce">
                          {gameModeEmojis[modeKey as GameMode]}
                        </div>
                      </div>

                      {/* 标题和描述 */}
                      <div className="flex-1">
                        <h3
                          className={`text-lg font-bold mb-2 transition-colors duration-300 ${styles.textColor}`}
                        >
                          {mode.name}
                        </h3>
                        <p className={`text-sm leading-relaxed ${styles.descColor}`}>
                          {mode.description}
                        </p>
                      </div>

                      {/* 加载指示器 */}
                      {isLoading && (
                        <div className="mt-4 flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-medium">{translations.common.loading}</span>
                        </div>
                      )}

                      {/* 选中指示器 */}
                      {isLoading && (
                        <div className="absolute inset-0 bg-current/10 backdrop-blur-sm rounded-2xl"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* 自定义模式区域 */}
      {(customModes.length > 0 || true) && (
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <div
              className={`flex-1 h-px bg-gradient-to-r from-transparent ${isDarkMode ? 'via-gray-600' : 'via-gray-300'} to-transparent`}
            ></div>
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <Sparkles size={16} className="text-purple-500" />
              <span
                className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                自定义模式
              </span>
              <Sparkles size={16} className="text-purple-500" />
            </div>
            <div
              className={`flex-1 h-px bg-gradient-to-r from-transparent ${isDarkMode ? 'via-gray-600' : 'via-gray-300'} to-transparent`}
            ></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
            {/* 已创建的自定义模式卡片 */}
            {customModes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => onStartCustomGame(mode)}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-2xl ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-indigo-900/60 via-gray-800 to-purple-900/60 hover:from-indigo-800/70 hover:to-purple-800/70 border-indigo-700/50'
                    : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-100/50'
                }`}
              >
                {/* 装饰性背景 */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-lg"></div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-md"></div>
                </div>

                <div className="relative p-6 h-full flex flex-col">
                  {/* 图标和删除按钮 */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isDarkMode
                          ? 'bg-gradient-to-br from-indigo-800/50 to-purple-700/50 group-hover:from-indigo-700/60 group-hover:to-purple-600/60'
                          : 'bg-gradient-to-br from-indigo-100 to-purple-200 group-hover:from-indigo-200 group-hover:to-purple-300'
                      }`}
                    >
                      <Edit
                        size={24}
                        className={`transition-colors duration-300 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">🎨</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustomMode(mode.id);
                        }}
                        className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title={translations.customMode.delete}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 标题和描述 */}
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                        isDarkMode
                          ? 'text-gray-100 group-hover:text-indigo-300'
                          : 'text-gray-800 group-hover:text-indigo-700'
                      }`}
                    >
                      {mode.name}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        isDarkMode
                          ? 'text-gray-400 group-hover:text-gray-300'
                          : 'text-gray-600 group-hover:text-gray-700'
                      }`}
                    >
                      {mode.description}
                    </p>
                  </div>

                  {/* 任务数量标识 */}
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}
                    >
                      {mode.tasks.length}
                    </span>
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}

            {/* 创建自定义模式卡片 */}
            <div
              onClick={onCreateCustomMode}
              className={`group relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-2xl ${
                isDarkMode
                  ? 'bg-gradient-to-br from-slate-800 via-gray-800 to-gray-800 hover:from-slate-700 hover:to-gray-700 border-slate-600 hover:border-slate-500'
                  : 'bg-gradient-to-br from-slate-50 via-white to-gray-50 hover:from-slate-100 hover:to-gray-100 border-slate-300 hover:border-slate-400'
              }`}
            >
              {/* 装饰性背景 */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-br from-slate-400 to-gray-400 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              <div className="relative p-6 h-full flex flex-col items-center justify-center text-center">
                {/* 图标区域 */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-slate-700 to-gray-700 group-hover:from-slate-600 group-hover:to-gray-600'
                      : 'bg-gradient-to-br from-slate-100 to-gray-200 group-hover:from-slate-200 group-hover:to-gray-300'
                  }`}
                >
                  <Plus
                    size={28}
                    className={`transition-all duration-300 ${
                      isDarkMode
                        ? 'text-slate-400 group-hover:text-gray-400'
                        : 'text-slate-600 group-hover:text-gray-600'
                    }`}
                  />
                </div>

                {/* emoji */}
                <div className="text-3xl mb-3 group-hover:animate-bounce">
                  {gameModeEmojis.custom}
                </div>

                {/* 标题和描述 */}
                <h3
                  className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode
                      ? 'text-gray-100 group-hover:text-slate-300'
                      : 'text-gray-800 group-hover:text-slate-700'
                  }`}
                >
                  {translations.customMode.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode
                      ? 'text-gray-400 group-hover:text-gray-300'
                      : 'text-gray-600 group-hover:text-gray-700'
                  }`}
                >
                  {translations.customMode.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

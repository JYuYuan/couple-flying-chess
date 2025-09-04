import React, { useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '@/components/Portal';
import { useTheme } from '@/contexts/ThemeContext';
import { Translations } from '@/lib/i18n';
import { GameMode } from '@/components/game/flying/types/game';

interface ContinueGameModalProps {
  gameMode: string;
  customModeName?: string;
  currentPlayer: string;
  redPosition: number;
  bluePosition: number;
  onContinue: () => void;
  onNewGame: () => void;
  onClose?: () => void;
  translations: Translations;
  isVisible?: boolean;
}

export function ContinueGameModal({
  gameMode,
  customModeName,
  currentPlayer,
  redPosition,
  bluePosition,
  onContinue,
  onNewGame,
  onClose,
  translations,
  isVisible = true,
}: ContinueGameModalProps) {
  const { theme, mounted } = useTheme();

  // 禁用外层滚动
  useEffect(() => {
    if (!isVisible) return;

    // 保存当前的 overflow 样式
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // 获取滚动条宽度
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    // 禁用滚动并补偿滚动条宽度
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    // 清理函数：恢复原始样式
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isVisible]);

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
    <Portal>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`fixed inset-0 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm overflow-y-auto transition-colors duration-500 ${
              theme === 'dark' ? 'bg-black bg-opacity-80' : 'bg-black bg-opacity-60'
            }`}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                duration: 0.3,
              }}
              className={`rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative overflow-hidden border my-auto transition-colors duration-500 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-gray-700/20'
                  : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-white/20'
              }`}
            >
              {/* 装饰性背景图案 */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full translate-x-20 translate-y-20"></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full -translate-x-12 -translate-y-12"></div>
              </div>

              {/* 关闭按钮 */}
              {onClose && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-full transition-all duration-200 backdrop-blur-sm z-40"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </motion.button>
              )}

              {/* 顶部装饰条 */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

              <div className="relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
                    {translations?.game.continueGame}
                  </h2>
                  <p className="text-gray-600 text-sm">{translations?.game.findLocalGame}</p>
                </div>

                <div>
                  <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 shadow-lg">
                      <p className="text-gray-700 text-center text-sm sm:text-base">
                        <strong className="text-gray-900">
                          {translations?.game?.gameMode || '游戏模式'}:
                        </strong>
                        <br />
                        <span className="text-blue-700 font-bold text-base sm:text-lg inline-block mt-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200">
                          {gameMode === 'custom'
                            ? customModeName || '自定义模式'
                            : translations?.modes?.[gameMode as GameMode]?.name || gameMode}
                        </span>
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-red-50/80 to-blue-50/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 shadow-lg">
                      <p className="text-gray-700 text-center text-sm sm:text-base">
                        <strong className="text-gray-900">
                          {translations?.game?.currentPlayer}:
                        </strong>
                        <br />
                        <span
                          className={`font-bold text-base sm:text-lg inline-block mt-1 px-3 sm:px-4 py-1 sm:py-2 rounded-full border-2 ${
                            currentPlayer === 'red'
                              ? 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100 border-red-200'
                              : 'text-blue-700 bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200'
                          }`}
                        >
                          {currentPlayer === 'red'
                            ? translations?.game?.red
                            : translations?.game?.blue}
                        </span>
                      </p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 shadow-lg">
                      <div className="text-gray-700 text-center text-sm sm:text-base">
                        <strong className="text-gray-900">
                          {translations?.game?.positions || '位置'}:
                        </strong>
                        <br />
                        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-2">
                          <span className="text-red-700 font-bold bg-gradient-to-r from-red-100 to-pink-100 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border border-red-200">
                            {translations?.game?.red}: {redPosition}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span className="text-blue-700 font-bold bg-gradient-to-r from-blue-100 to-cyan-100 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border border-blue-200">
                            {translations?.game?.blue}: {bluePosition}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-blue-400/50"
                      onClick={onContinue}
                    >
                      <span className="block text-base sm:text-lg">
                        ✨ {translations?.game?.continueGame}
                      </span>
                      <span className="block text-xs opacity-90">
                        {translations?.game.lastLocation}
                      </span>
                    </button>
                    <button
                      className="w-full sm:flex-1 bg-gradient-to-r from-gray-500 via-gray-600 to-slate-600 hover:from-gray-600 hover:via-gray-700 hover:to-slate-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-gray-400/50 flex flex-col items-center justify-center gap-1"
                      onClick={onNewGame}
                    >
                      <div className="flex items-center gap-2">
                        <RotateCcw size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="text-base sm:text-lg">
                          {translations?.game?.newGame || '新游戏'}
                        </span>
                      </div>
                      <span className="text-xs opacity-90">{translations?.common.restart}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

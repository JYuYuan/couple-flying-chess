import React, { useEffect } from 'react';
import { CheckCircle, Heart, RotateCcw, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Portal } from '@/components/Portal';
import Timer from '@/components/game/flying/components/Timer/Timer';
import type { CurrentTask, PlayerColor, WinTaskOption } from '@/components/game/flying/types/game';
import { Translations } from '@/lib/i18n';

interface WinTaskModalProps {
  winner: PlayerColor;
  selectedWinTask: WinTaskOption;
  currentTask?: CurrentTask | null;
  translations: Translations;
  onTaskComplete: () => void;
  onRestart: () => void;
}

export function WinTaskModal({
  winner,
  selectedWinTask,
  currentTask,
  translations,
  onTaskComplete,
  onRestart,
}: WinTaskModalProps) {
  // 禁用外层滚动
  useEffect(() => {
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
  }, []);

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-colors duration-500 bg-black/60 dark:bg-black/80"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden border transition-colors duration-500 bg-gradient-to-br from-white via-slate-50 to-indigo-50 border-white/20 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 dark:border-gray-700/20"
          >
            {/* 装饰性背景 */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl ${
                  winner === 'red'
                    ? 'bg-gradient-to-br from-red-500 to-pink-500'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                }`}
              ></div>
              <div
                className={`absolute -bottom-10 -left-10 w-28 h-28 rounded-full blur-xl ${
                  winner === 'red'
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                }`}
              ></div>
            </div>

            {/* 头部 */}
            <div className="p-6 border-b transition-colors duration-500 border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`p-3 rounded-full border-2 ${
                    winner === 'red'
                      ? 'bg-gradient-to-br from-red-100 to-pink-200 border-red-200 dark:from-red-900/30 dark:to-pink-900/30 dark:border-red-700/50'
                      : 'bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-200 dark:from-blue-900/30 dark:to-cyan-900/30 dark:border-blue-700/50'
                  }`}
                >
                  <Star size={28} className={winner === 'red' ? 'text-red-600' : 'text-blue-600'} />
                </motion.div>
                <h2 className="text-2xl font-bold transition-colors duration-500 text-gray-800 dark:text-white">
                  {translations.game.winTaskExecution || '胜利任务执行'}
                </h2>
              </div>

              {/* 执行者标识 */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-sm transition-colors duration-300 ${
                    winner === 'red'
                      ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-2 border-red-200 dark:from-red-900/40 dark:to-pink-900/40 dark:text-red-300 dark:border-red-700/50'
                      : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-2 border-blue-200 dark:from-blue-900/40 dark:to-cyan-900/40 dark:text-blue-300 dark:border-blue-700/50'
                  }`}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-2 h-2 rounded-full mr-2 ${winner === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}
                  ></motion.div>
                  {winner === 'red'
                    ? translations.tasks.redExecute
                    : translations.tasks.blueExecute}
                </div>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-6 space-y-6">
              {/* 任务描述 */}
              <div className="relative p-6 rounded-xl border transition-colors duration-500 bg-white/60 border-gray-200/30 dark:bg-gray-800/30 dark:border-gray-700/30">
                {/* 引用符号 */}
                <div
                  className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                    winner === 'red'
                      ? 'bg-gradient-to-br from-red-500 to-pink-500'
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}
                >
                  <span className="text-white text-lg font-bold">★</span>
                </div>

                {/* 左侧装饰线 */}
                <div
                  className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${
                    winner === 'red'
                      ? 'bg-gradient-to-b from-red-500 to-pink-600 dark:from-red-400 dark:to-pink-500'
                      : 'bg-gradient-to-b from-blue-500 to-cyan-600 dark:from-blue-400 dark:to-cyan-500'
                  }`}
                ></div>

                <blockquote className="pl-6">
                  <p className="text-center text-lg leading-relaxed font-medium italic transition-colors duration-500 text-gray-800 dark:text-gray-200">
                    {selectedWinTask.description}
                  </p>
                </blockquote>

                {/* 装饰性引用符号 */}
                <div className="absolute -bottom-1 -right-1 text-2xl opacity-30 transition-colors duration-500 text-gray-400 dark:text-gray-600">
                  <span className="font-serif">★</span>
                </div>
              </div>

              {/* 庆祝消息 */}
              <div className="flex items-center justify-center space-x-3 p-4 rounded-xl border transition-colors duration-500 bg-gray-50/60 border-gray-200/20 dark:bg-gray-800/20 dark:border-gray-700/20">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart size={24} className="text-pink-500" />
                </motion.div>
                <p className="text-center font-medium transition-colors duration-500 text-gray-600 dark:text-gray-300">
                  {translations.game.celebrationMessage || '完成这个任务来庆祝你们的胜利！'}
                </p>
              </div>

              {/* 计时器 */}
              {currentTask?.durationMs && (
                <div className="flex justify-center">
                  <Timer initialTimeLeft={currentTask.durationMs} variant="win" size="large" />
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="relative z-10 p-6 border-t transition-colors duration-500 border-gray-200/30 dark:border-gray-700/30">
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onTaskComplete}
                  className="relative z-10 flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <CheckCircle size={18} />
                    </motion.div>
                    <span>{translations.common.completed}</span>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRestart}
                  className="relative z-10 flex-1 font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 dark:text-white"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <RotateCcw size={16} />
                    <span>{translations.common.restart}</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
}

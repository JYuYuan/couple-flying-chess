import React, { useEffect } from 'react';
import { ArrowLeft, Crown, Sparkles, Trophy, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Portal } from '@/components/Portal';
import type { PlayerColor, WinTaskOption } from '@/components/game/flying/types/game';
import { useGlobal } from '@/contexts/GlobalContext';

interface WinModalProps {
  winner: PlayerColor;
  winTaskOptions: WinTaskOption[];
  onWinTaskSelect: (task: WinTaskOption) => void;
  onRestartFromWin: () => void;
}

export function WinModal({
  winner,
  winTaskOptions,
  onWinTaskSelect,
  onRestartFromWin,
}: WinModalProps) {
  const { translations } = useGlobal();

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

  // 动态生成彩带动画
  const confettiElements = Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={i}
      className={`absolute w-3 h-3 rounded-full ${winner === 'red' ? 'bg-red-400' : 'bg-blue-400'}`}
      animate={{
        y: [0, -100, 100],
        x: [0, Math.random() * 200 - 100],
        rotate: [0, 360],
        opacity: [1, 0.7, 0],
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 2,
      }}
      style={{
        left: `${10 + Math.random() * 80}%`,
        top: '50%',
      }}
    />
  ));

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
        fixed inset-0 backdrop-blur-sm z-[9999] flex items-center justify-center p-4
        transition-colors duration-500
        bg-black/60 dark:bg-black/80
      "
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="
          rounded-3xl overflow-x-hidden shadow-2xl w-full max-w-2xl max-h-[90vh]
          overflow-y-auto relative border transition-colors duration-500
          bg-gradient-to-br from-white via-slate-50 to-indigo-50 border-white/20
          dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 dark:border-gray-700/20
        "
          >
            {/* 彩带动画背景 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {confettiElements}
            </div>

            {/* 装饰性背景 */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div
                className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
                  winner === 'red'
                    ? 'bg-gradient-to-br from-red-500 to-pink-500'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                }`}
              ></div>
              <div
                className={`absolute -bottom-20 -left-20 w-32 h-32 rounded-full blur-2xl ${
                  winner === 'red'
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                }`}
              ></div>
            </div>

            {/* 头部庆祝区域 */}
            <div className="relative p-8 text-center">
              {/* 王冠图标 */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div
                  className={`relative p-6 rounded-full ${
                    winner === 'red'
                      ? 'bg-gradient-to-br from-red-100 to-pink-200'
                      : 'bg-gradient-to-br from-blue-100 to-cyan-200'
                  }`}
                >
                  <Crown
                    size={60}
                    className={winner === 'red' ? 'text-red-600' : 'text-blue-600'}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles size={24} className="text-yellow-500" />
                  </motion.div>
                </div>
              </motion.div>

              {/* 胜利标题 */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl sm:text-4xl font-black mb-4 text-gray-800 dark:text-white"
              >
                🎉 {winner === 'red' ? translations?.game.redWin : translations?.game.blueWin} 🎉
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-lg mb-8 transition-colors duration-500 text-gray-600 dark:text-gray-300"
              >
                {translations?.game.selectWinTask || '选择一个胜利任务来庆祝吧！'}
              </motion.p>
            </div>

            {/* 胜利任务选择区域 */}
            <motion.div className="px-8 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="
              p-6 rounded-2xl border transition-colors duration-500
              bg-white/60 border-gray-200/30
              dark:bg-gray-800/30 dark:border-gray-700/30
            "
              >
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Trophy
                    size={24}
                    className={winner === 'red' ? 'text-red-500' : 'text-blue-500'}
                  />
                  <h3 className="text-xl font-bold transition-colors duration-500 text-gray-800 dark:text-white">
                    {translations?.game.winTasksTitle || '胜利任务选择'}
                  </h3>
                  <Trophy
                    size={24}
                    className={winner === 'red' ? 'text-red-500' : 'text-blue-500'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {winTaskOptions.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onWinTaskSelect(task)}
                      className={`
                    relative z-10 p-4 rounded-xl border-2 cursor-pointer
                    transition-all duration-300 shadow-lg hover:shadow-xl
                    ${
                      winner === 'red'
                        ? 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 hover:border-red-300 dark:border-red-700/50 dark:from-red-900/20 dark:to-pink-900/20 dark:hover:from-red-800/30 dark:hover:to-pink-800/30'
                        : 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 hover:border-blue-300 dark:border-blue-700/50 dark:from-blue-900/20 dark:to-cyan-900/20 dark:hover:from-blue-800/30 dark:hover:to-cyan-800/30'
                    }
                  `}
                    >
                      {/* 任务编号 */}
                      <div
                        className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg ${
                          winner === 'red'
                            ? 'bg-gradient-to-br from-red-500 to-red-600'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="flex items-start space-x-3 pt-2">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                        >
                          <Zap
                            size={20}
                            className={winner === 'red' ? 'text-red-500' : 'text-blue-500'}
                          />
                        </motion.div>
                        <p className="text-sm leading-relaxed transition-colors duration-500 text-gray-700 dark:text-gray-200">
                          {task.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* 底部按钮 */}
            <div className="relative z-10 p-8 border-t transition-colors duration-500 border-gray-200/30 dark:border-gray-700/30">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRestartFromWin}
                className="
              relative z-10 w-full py-4 px-6 rounded-xl font-bold text-lg
              transition-all duration-200 shadow-lg hover:shadow-xl
              bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400
              dark:from-gray-700 dark:to-gray-800 dark:text-white dark:hover:from-gray-600 dark:hover:to-gray-700
            "
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowLeft size={20} />
                  <span>{translations?.common.skipToHome || '跳过回到首页'}</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
}

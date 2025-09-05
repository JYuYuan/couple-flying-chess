import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, Star, Users, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Portal } from '@/components/Portal';
import type { CurrentTask, TaskType } from '@/components/game/flying/types/game';
import Timer from '@/components/game/flying/components/Timer/Timer';
import { Translations } from '@/lib/i18n';

interface TaskModalProps {
  currentTask: CurrentTask;
  taskType: TaskType;
  translations: Translations;
  onTaskComplete: (isCompleted: boolean) => void;
}

export function TaskModal({ currentTask, taskType, translations, onTaskComplete }: TaskModalProps) {
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

  // 获取 iOS 16 风格任务类型信息
  const getTaskTypeInfo = () => {
    switch (taskType) {
      case 'star':
        return {
          icon: Star,
          title: translations.tasks.starTask,
          bgGradient:
            'from-yellow-100/80 to-amber-100/80 dark:from-yellow-600/20 dark:to-amber-700/20',
          iconColor: 'text-yellow-500 drop-shadow-sm',
          borderColor: 'border-yellow-200 dark:border-yellow-600/30',
        };
      case 'trap':
        return {
          icon: AlertTriangle,
          title: translations.tasks.trapTask,
          bgGradient: 'from-orange-100/80 to-red-100/80 dark:from-orange-600/20 dark:to-red-700/20',
          iconColor: 'text-orange-500 drop-shadow-sm',
          borderColor: 'border-orange-200 dark:border-orange-600/30',
        };
      default:
        return {
          icon: Users,
          title: translations.tasks.collisionTask,
          bgGradient:
            'from-purple-100/80 to-pink-100/80 dark:from-purple-600/20 dark:to-pink-700/20',
          iconColor: 'text-purple-500 drop-shadow-sm',
          borderColor: 'border-purple-200 dark:border-purple-600/30',
        };
    }
  };

  const taskInfo = getTaskTypeInfo();
  const TaskIcon = taskInfo.icon;

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 transition-colors duration-500 bg-black/40 dark:bg-black/80"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden border transition-all duration-500 backdrop-blur-2xl bg-gradient-to-br from-white/95 via-slate-50/90 to-indigo-50/95 border-white/30 shadow-gray-300/40 dark:bg-gradient-to-br dark:from-gray-900/95 dark:via-slate-800/90 dark:to-gray-900/95 dark:border-gray-700/30 dark:shadow-black/50"
          >
            {/* iOS 16 风格装饰性背景 */}
            <div className="absolute inset-0 opacity-8 pointer-events-none">
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${taskInfo.bgGradient} rounded-full blur-2xl`}
              ></div>
              <div
                className={`absolute -bottom-10 -left-10 w-28 h-28 bg-gradient-to-br ${taskInfo.bgGradient} rounded-full blur-xl`}
              ></div>
            </div>

            {/* iOS 16 风格头部 */}
            <div className="p-8 border-b transition-colors duration-500 border-gray-200/40 dark:border-gray-700/40">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-br ${taskInfo.bgGradient} ${taskInfo.borderColor} border-2 shadow-lg backdrop-blur-sm`}
                >
                  <TaskIcon size={32} className={taskInfo.iconColor} />
                </div>
                <h2 className="text-2xl font-black transition-colors duration-500 text-gray-900 dark:text-white tracking-tight">
                  {translations.tasks.challenge}
                </h2>
              </div>
              <p className="text-center font-bold transition-colors duration-500 text-gray-700 dark:text-gray-300">
                {taskInfo.title}
              </p>
            </div>

            {/* iOS 16 风格内容区域 */}
            <div className="p-8 space-y-8">
              {/* iOS 16 风格执行者 */}
              <div className="text-center">
                <div
                  className="inline-flex items-center px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 shadow-lg backdrop-blur-sm"
                  style={{
                    background:
                      currentTask.executor === 'red'
                        ? 'linear-gradient(135deg, rgba(254, 202, 202, 0.9), rgba(252, 165, 165, 0.9))'
                        : 'linear-gradient(135deg, rgba(191, 219, 254, 0.9), rgba(147, 197, 253, 0.9))',
                    color: currentTask.executor === 'red' ? '#dc2626' : '#2563eb',
                    border: `2px solid ${currentTask.executor === 'red' ? '#fecaca' : '#bfdbfe'}`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-3 shadow-sm"
                    style={{
                      backgroundColor: currentTask.executor === 'red' ? '#dc2626' : '#2563eb',
                    }}
                  ></div>
                  {currentTask.executor === 'red'
                    ? translations.tasks.redExecute
                    : translations.tasks.blueExecute}
                </div>
              </div>

              {/* 任务描述 */}
              <div
                className={`relative p-6 rounded-xl border transition-colors duration-500 ${'bg-white/60 border-gray-200/30 dark:bg-gray-800/30 dark:border-gray-700/30'}`}
              >
                {/* 引用符号 */}
                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                  <span className="text-white text-lg font-bold">"</span>
                </div>

                {/* 左侧引用线 */}
                <div
                  className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${'bg-gradient-to-b from-indigo-500 to-purple-600 dark:bg-gradient-to-b dark:from-indigo-400 dark:to-purple-500'}`}
                ></div>

                <blockquote className="pl-6">
                  <p
                    className={`text-center text-lg leading-relaxed font-medium italic transition-colors duration-500 ${'text-gray-800 dark:text-gray-200'}`}
                  >
                    {currentTask.description}
                  </p>
                </blockquote>

                {/* 装饰性引用符号 */}
                <div
                  className={`absolute -bottom-1 -right-1 text-2xl opacity-30 transition-colors duration-500 ${'text-gray-400 dark:text-gray-600'}`}
                >
                  <span className="font-serif">"</span>
                </div>
              </div>

              {/* 奖励信息 */}
              <div
                className={`p-4 rounded-xl border transition-colors duration-500 ${'bg-gray-50/60 border-gray-200/20 dark:bg-gray-800/20 dark:border-gray-700/20'}`}
              >
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span
                      className={`text-sm transition-colors duration-500 ${'text-gray-600 dark:text-gray-300'}`}
                    >
                      {taskType === 'collision'
                        ? translations.tasks.collisionCompletedReward
                        : translations.tasks.completedReward}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XCircle size={16} className="text-red-500" />
                    <span
                      className={`text-sm transition-colors duration-500 ${'text-gray-600 dark:text-gray-300'}`}
                    >
                      {taskType === 'collision'
                        ? translations.tasks.collisionFailedPenalty
                        : translations.tasks.failedPenalty}
                    </span>
                  </div>
                </div>
              </div>

              {/* 计时器 */}
              {currentTask?.durationMs && (
                <div className="flex justify-center">
                  <Timer
                    initialTimeLeft={currentTask?.durationMs}
                    variant="task"
                    size="medium"
                    className=""
                  />
                </div>
              )}
            </div>

            {/* iOS 16 风格底部按钮 */}
            <div className="relative z-10 p-8 border-t transition-colors duration-500 border-gray-200/40 dark:border-gray-700/40">
              <div className="flex space-x-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onTaskComplete(true)}
                  className="relative z-10 flex-1 text-white font-black py-5 px-5 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl backdrop-blur-xl border border-white/20"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(16, 185, 129, 0.95))',
                  }}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <CheckCircle size={22} className="drop-shadow-sm" />
                    <span className="text-lg tracking-wide">{translations.common.completed}</span>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onTaskComplete(false)}
                  className="relative z-10 flex-1 text-white font-black py-5 px-5 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl backdrop-blur-xl border border-white/20"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(244, 63, 94, 0.95))',
                  }}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <XCircle size={22} className="drop-shadow-sm" />
                    <span className="text-lg tracking-wide">{translations.common.failed}</span>
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

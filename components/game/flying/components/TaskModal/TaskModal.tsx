import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Star, AlertTriangle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '@/components/Portal';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { theme, mounted } = useTheme();

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

  // 获取任务类型图标和颜色
  const getTaskTypeInfo = () => {
    switch (taskType) {
      case 'star':
        return {
          icon: Star,
          title: translations.tasks.starTask,
          bgGradient:
            theme === 'dark'
              ? 'from-yellow-600/20 to-amber-700/20'
              : 'from-yellow-100 to-amber-100',
          iconColor: 'text-yellow-500',
          borderColor: theme === 'dark' ? 'border-yellow-600/30' : 'border-yellow-200',
        };
      case 'trap':
        return {
          icon: AlertTriangle,
          title: translations.tasks.trapTask,
          bgGradient:
            theme === 'dark' ? 'from-orange-600/20 to-red-700/20' : 'from-orange-100 to-red-100',
          iconColor: 'text-orange-500',
          borderColor: theme === 'dark' ? 'border-orange-600/30' : 'border-orange-200',
        };
      default:
        return {
          icon: Users,
          title: translations.tasks.collisionTask,
          bgGradient:
            theme === 'dark' ? 'from-purple-600/20 to-pink-700/20' : 'from-purple-100 to-pink-100',
          iconColor: 'text-purple-500',
          borderColor: theme === 'dark' ? 'border-purple-600/30' : 'border-purple-200',
        };
    }
  };

  const taskInfo = getTaskTypeInfo();
  const TaskIcon = taskInfo.icon;

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
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-colors duration-500 ${
            theme === 'dark' ? 'bg-black/80' : 'bg-black/60'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden border transition-colors duration-500 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-gray-700/20'
                : 'bg-gradient-to-br from-white via-slate-50 to-indigo-50 border-white/20'
            }`}
          >
            {/* 装饰性背景 */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${taskInfo.bgGradient} rounded-full blur-2xl`}
              ></div>
              <div
                className={`absolute -bottom-10 -left-10 w-28 h-28 bg-gradient-to-br ${taskInfo.bgGradient} rounded-full blur-xl`}
              ></div>
            </div>

            {/* 头部 */}
            <div
              className={`p-6 border-b transition-colors duration-500 ${
                theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/30'
              }`}
            >
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div
                  className={`p-3 rounded-full bg-gradient-to-br ${taskInfo.bgGradient} ${taskInfo.borderColor} border-2`}
                >
                  <TaskIcon size={28} className={taskInfo.iconColor} />
                </div>
                <h2
                  className={`text-2xl font-bold transition-colors duration-500 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {translations.tasks.challenge}
                </h2>
              </div>
              <p
                className={`text-center font-semibold transition-colors duration-500 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {taskInfo.title}
              </p>
            </div>

            {/* 内容区域 */}
            <div className="p-6 space-y-6">
              {/* 执行者 */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-sm transition-colors duration-300 ${
                    currentTask.executor === 'red'
                      ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-2 border-red-200'
                      : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-2 border-blue-200'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      currentTask.executor === 'red' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  ></div>
                  {currentTask.executor === 'red'
                    ? translations.tasks.redExecute
                    : translations.tasks.blueExecute}
                </div>
              </div>

              {/* 任务描述 */}
              <div
                className={`relative p-6 rounded-xl border transition-colors duration-500 ${
                  theme === 'dark'
                    ? 'bg-gray-800/30 border-gray-700/30'
                    : 'bg-white/60 border-gray-200/30'
                }`}
              >
                {/* 引用符号 */}
                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                  <span className="text-white text-lg font-bold">"</span>
                </div>

                {/* 左侧引用线 */}
                <div
                  className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${
                    theme === 'dark'
                      ? 'bg-gradient-to-b from-indigo-400 to-purple-500'
                      : 'bg-gradient-to-b from-indigo-500 to-purple-600'
                  }`}
                ></div>

                <blockquote className="pl-6">
                  <p
                    className={`text-center text-lg leading-relaxed font-medium italic transition-colors duration-500 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    {currentTask.description}
                  </p>
                </blockquote>

                {/* 装饰性引用符号 */}
                <div
                  className={`absolute -bottom-1 -right-1 text-2xl opacity-30 transition-colors duration-500 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  <span className="font-serif">"</span>
                </div>
              </div>

              {/* 奖励信息 */}
              <div
                className={`p-4 rounded-xl border transition-colors duration-500 ${
                  theme === 'dark'
                    ? 'bg-gray-800/20 border-gray-700/20'
                    : 'bg-gray-50/60 border-gray-200/20'
                }`}
              >
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span
                      className={`text-sm transition-colors duration-500 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {taskType === 'collision'
                        ? translations.tasks.collisionCompletedReward
                        : translations.tasks.completedReward}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XCircle size={16} className="text-red-500" />
                    <span
                      className={`text-sm transition-colors duration-500 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
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

            {/* 底部按钮 */}
            <div
              className={`relative z-10 p-6 border-t transition-colors duration-500 ${
                theme === 'dark' ? 'border-gray-700/30' : 'border-gray-200/30'
              }`}
            >
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTaskComplete(true)}
                  className="relative z-10 flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle size={18} />
                    <span>{translations.common.completed}</span>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTaskComplete(false)}
                  className="relative z-10 flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <XCircle size={18} />
                    <span>{translations.common.failed}</span>
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

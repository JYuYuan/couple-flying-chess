'use client';

import React from 'react';
import { useGlobal } from '@/contexts/GlobalContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CustomModeManager from '@/components/game/flying/components/CustomModeManager/CustomModeManager';

const SettingTask: React.FC = () => {
  const { translations } = useGlobal();

  const t = translations?.settings;

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      {/* 背景装饰 */}
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
      </div>

      {/* 主要内容容器 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <motion.div
          className="flex justify-between items-center p-6 sm:p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Link href="/settings">
            <motion.button
              className="
  p-3 rounded-2xl backdrop-blur-xl
  bg-white/70 border-white/40 shadow-gray-200/30
  dark:bg-sky-500/30 dark:border-sky-400/40 dark:shadow-sky-500/30 dark:text-sky-200
  border shadow-lg hover:shadow-xl transition-all duration-200
"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={t?.backToHome || '返回主页'}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {t?.taskTemplate.title || '任务模板设置'}
          </h1>

          <div className="w-12"></div>
          {/* 占位符保持居中 */}
        </motion.div>

        {/* 设置内容 */}
        <div className="flex-1 px-6 sm:px-8 pb-8">
          <div className="max-w-4xl mx-auto">
            <CustomModeManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingTask;

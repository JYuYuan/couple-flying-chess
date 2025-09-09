'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Minus, Plus, RotateCcw, TestTube, Zap } from 'lucide-react';
import {
  defaultTimeSettings,
  formatTime,
  getSuggestedTaskTime,
  TimeSettings,
} from '@/components/game/flying/utils/timeManager';
import { useGlobal } from '@/contexts/GlobalContext';
import { useTaskManagement } from '@/components/game/flying/hooks/useTaskManagement';
import Loading from '@/components/Loading';

const FlyingSettings: React.FC = () => {
  const { translations, language } = useGlobal();
  const taskManagement = useTaskManagement();

  const t = translations?.settings?.flying;

  const [timeSettings, setTimeSettings] = useState<TimeSettings>(defaultTimeSettings);
  const [newKeyword, setNewKeyword] = useState('');
  const [newTime, setNewTime] = useState(60);
  const [testTask, setTestTask] = useState(
    t?.test?.tryExamples || '给对方一个温暖的拥抱并按摩肩膀',
  );
  const [testResult, setTestResult] = useState<{
    time: number;
    reason: string;
    keywords: string[];
  } | null>(null);

  // 从本地存储加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('flyingTimeSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setTimeSettings((prev) => ({
          ...prev,
          ...parsed,
          keywordTimes: { ...defaultTimeSettings.keywordTimes, ...parsed.keywordTimes },
        }));
      } catch (error) {
        console.error('Failed to parse time settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    taskManagement.loadTasks('normal', language, translations);
  }, [language]);

  // 保存设置到本地存储
  const saveSettings = (newSettings: TimeSettings) => {
    setTimeSettings(newSettings);
    localStorage.setItem('flyingTimeSettings', JSON.stringify(newSettings));
  };

  // 添加新的关键词时间
  const addKeywordTime = () => {
    if (newKeyword.trim() && newTime > 0) {
      const updatedSettings = {
        ...timeSettings,
        keywordTimes: {
          ...timeSettings.keywordTimes,
          [newKeyword.trim()]: newTime,
        },
      };
      saveSettings(updatedSettings);
      setNewKeyword('');
      setNewTime(60);
    }
  };

  // 删除关键词时间
  const removeKeywordTime = (keyword: string) => {
    const { [keyword]: removed, ...rest } = timeSettings.keywordTimes;
    const updatedSettings = {
      ...timeSettings,
      keywordTimes: rest,
    };
    saveSettings(updatedSettings);
  };

  // 更新关键词时间
  const updateKeywordTime = (keyword: string, time: number) => {
    const updatedSettings = {
      ...timeSettings,
      keywordTimes: {
        ...timeSettings.keywordTimes,
        [keyword]: Math.max(1, time),
      },
    };
    saveSettings(updatedSettings);
  };

  // 重置为默认设置
  const resetToDefaults = () => {
    saveSettings({ ...defaultTimeSettings });
  };

  // 实时更新测试结果
  useEffect(() => {
    if (testTask.trim()) {
      const result = getSuggestedTaskTime(testTask);
      setTestResult(result);
    }
  }, [testTask, timeSettings]);

  if (taskManagement.isLoadingTasks) return <Loading />;


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* iOS 16 风格导航栏 */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/flying/mode">
              <motion.button
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </motion.button>
            </Link>

            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t?.title || '游戏时间设置'}
            </h1>

            <motion.button
              onClick={resetToDefaults}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 基础设置卡片 */}
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 卡片标题 */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-medium text-gray-900 dark:text-white">
                {t?.basic?.title || '基础设置'}
              </h2>
            </div>
          </div>

          {/* 默认时间设置 */}
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {t?.basic?.defaultTaskTime || '默认任务时间'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t?.basic?.defaultTaskTimeDesc || '未匹配关键词时使用的默认时间'}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <motion.button
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    saveSettings({
                      ...timeSettings,
                      defaultTaskTime: Math.max(1, timeSettings.defaultTaskTime - 10),
                    })
                  }
                >
                  <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </motion.button>

                <div className="min-w-[80px] text-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatTime(timeSettings.defaultTaskTime)}
                  </span>
                </div>

                <motion.button
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    saveSettings({
                      ...timeSettings,
                      defaultTaskTime: timeSettings.defaultTaskTime + 10,
                    })
                  }
                >
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* 智能检测开关 */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {t?.basic?.smartTimeDetection || '智能时间检测'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t?.basic?.smartTimeDetectionDesc || '根据任务内容关键词自动设置时间'}
                </p>
              </div>
              <motion.label
                className="relative inline-flex items-center cursor-pointer ml-4"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={timeSettings.enableAutoTime}
                  onChange={(e) =>
                    saveSettings({
                      ...timeSettings,
                      enableAutoTime: e.target.checked,
                    })
                  }
                />
                <div className="relative w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500"></div>
              </motion.label>
            </div>
          </div>
        </motion.div>

        {/* 关键词管理卡片 */}
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* 卡片标题 */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-medium text-gray-900 dark:text-white">
                {t?.keywords?.title || '关键词时间配置'}
              </h2>
            </div>
          </div>

          {/* 添加新关键词 */}
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-900/10">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t?.keywords?.addNew || '添加新关键词'}
            </h3>

            {/* 关键词输入 */}
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder={t?.keywords?.addNewKeyword || '输入关键词...'}
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* 时间设置和添加按钮 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 h-10">
                  <input
                    type="number"
                    min="1"
                    value={newTime}
                    onChange={(e) => setNewTime(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-transparent text-sm text-center outline-none text-gray-900 dark:text-white"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t?.keywords?.seconds || '秒'}
                  </span>
                </div>

                <motion.button
                  onClick={addKeywordTime}
                  className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!newKeyword.trim()}
                >
                  添加
                </motion.button>
              </div>
            </div>
          </div>

          {/* 关键词列表 */}
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(timeSettings.keywordTimes).map(([keyword, time], index) => (
              <motion.div
                key={keyword}
                className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                      {keyword}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateKeywordTime(keyword, time - 5)}
                    >
                      <Minus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                    </motion.button>

                    <div className="min-w-[60px] text-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatTime(time)}
                      </span>
                    </div>

                    <motion.button
                      className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateKeywordTime(keyword, time + 5)}
                    >
                      <Plus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                    </motion.button>

                    <motion.button
                      className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 ml-2"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeKeywordTime(keyword)}
                    >
                      <span className="text-xs font-bold">×</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 测试区域卡片 */}
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/* 卡片标题 */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-green-500" />
              <h2 className="text-base font-medium text-gray-900 dark:text-white">
                {t?.test?.title || '关键词检测测试'}
              </h2>
            </div>
          </div>

          {/* 测试输入 */}
          <div className="px-4 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t?.test?.taskContent || '测试任务内容：'}
              </label>
              <textarea
                value={testTask}
                onChange={(e) => setTestTask(e.target.value)}
                placeholder={t?.test?.taskPlaceholder || '输入任务描述来测试关键词检测...'}
                className="w-full h-20 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* 检测结果 */}
            {testResult && (
              <motion.div
                className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800/30"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 gap-3">
                  {/* 检测时间 */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatTime(testResult.time)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t?.test?.detectedTime || '检测时间'}
                    </div>
                  </div>

                  {/* 匹配关键词 */}
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {t?.test?.matchedKeywords || '匹配关键词'}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {testResult.keywords.length > 0 ? (
                        testResult.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs">
                          {t?.test?.noMatch || '无匹配'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 检测原因 */}
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t?.test?.detectionReason || '检测原因'}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {testResult.reason}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 示例任务 */}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {t?.test?.tryExamples || '试试这些示例：'}
              </div>
              <div className="flex flex-wrap gap-2">
                {taskManagement.taskQueue
                  .filter((item) => item.indexOf('$time') > -1)
                  .map((item) => item.replace('$time', ''))
                  .map((example) => (
                    <motion.button
                      key={example}
                      onClick={() => setTestTask(example)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {example}
                    </motion.button>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 使用说明卡片 */}
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="px-4 py-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
              {t?.usage?.title || '使用说明'}
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                •{' '}
                {t?.usage?.point1 ||
                  '启用"智能时间检测"后，系统会自动识别任务中的关键词并设置对应时间'}
              </p>
              <p>• {t?.usage?.point2 || '如果任务包含多个关键词，将使用时间最长的关键词'}</p>
              <p>• {t?.usage?.point3 || '未匹配到关键词时，将使用默认任务时间'}</p>
              <p>• {t?.usage?.point4 || '所有时间设置会自动保存到本地存储'}</p>
              <p>• {t?.usage?.point5 || '可以在上方测试区域实时预览关键词检测效果'}</p>
            </div>
          </div>
        </motion.div>

        {/* 底部安全区域 */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default FlyingSettings;

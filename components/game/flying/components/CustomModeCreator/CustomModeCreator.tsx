import React, { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Save,
  Check,
  Sparkles,
  Palette,
  Wand2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { NewCustomMode, GameMode } from '@/components/game/flying/types/game';
import { Translations } from '@/lib/i18n';
import { gameModes } from '@/components/game/flying/constants/game-config';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '@/components/Portal';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomModeCreatorProps {
  newCustomMode: NewCustomMode;
  setNewCustomMode: React.Dispatch<React.SetStateAction<NewCustomMode>>;
  manualTask: string;
  setManualTask: React.Dispatch<React.SetStateAction<string>>;
  availableModeTasks: Record<GameMode, string[]>;
  isLoadingTasks: boolean;
  translations: Translations;
  onClose: () => void;
  onCreateMode: () => void;
  onLoadAllTasks: () => void;
  onAddManualTask: () => void;
  onRemoveTask: (index: number) => void;
  aiTasksSection?: React.ReactNode;
}

export function CustomModeCreator({
  newCustomMode,
  setNewCustomMode,
  manualTask,
  setManualTask,
  availableModeTasks,
  isLoadingTasks,
  translations,
  onClose,
  onCreateMode,
  onLoadAllTasks,
  onAddManualTask,
  onRemoveTask,
  aiTasksSection,
}: CustomModeCreatorProps) {
  const loading = isLoadingTasks || (isLoadingTasks && !Object.keys(availableModeTasks).length);

  const { theme, mounted } = useTheme();
  const [expandedModes, setExpandedModes] = useState<Record<string, boolean>>({});

  const toggleModeExpansion = (mode: string) => {
    setExpandedModes((prev) => ({
      ...prev,
      [mode]: !prev[mode],
    }));
  };

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
          className={`fixed inset-0 backdrop-blur-sm z-[9999] flex items-center justify-center transition-colors duration-500 ${
            theme === 'dark' ? 'bg-black/80' : 'bg-black/60'
          }`}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="w-full flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`shadow-2xl w-full max-w-4xl border max-h-[90vh] flex flex-col transition-colors duration-500 rounded-3xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-gray-700/50'
                  : 'bg-gradient-to-br from-white via-slate-50 to-indigo-50 border-white/20'
              }`}
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-8 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Sparkles size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        {translations.customMode.creator.title}
                      </h2>
                      <p className="text-white/80 text-sm sm:text-base">
                        {translations.customMode.creator.subTitle}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm"
                  >
                    <X size={20} className="text-white" />
                  </motion.button>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1">
                {/* 基本信息 */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Palette size={20} className="text-indigo-600" />
                    <h3
                      className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`}
                    >
                      {translations.customMode.creator.baseInfo}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        {translations.customMode.creator.modeName}
                      </label>
                      <input
                        type="text"
                        value={newCustomMode.name}
                        onChange={(e) =>
                          setNewCustomMode((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder={translations.customMode.creator.modeNamePlaceholder}
                        maxLength={20}
                        className={`w-full px-4 py-3 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          theme === 'dark'
                            ? 'bg-gray-700/70 border-gray-600 text-gray-100 placeholder-gray-400'
                            : 'bg-white/70 border-gray-200 text-gray-800 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        {translations.customMode.creator.modeDescription}
                      </label>
                      <input
                        type="text"
                        value={newCustomMode.description}
                        onChange={(e) =>
                          setNewCustomMode((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder={translations.customMode.creator.modeDescriptionPlaceholder}
                        maxLength={50}
                        className={`w-full px-4 py-3 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          theme === 'dark'
                            ? 'bg-gray-700/70 border-gray-600 text-gray-100 placeholder-gray-400'
                            : 'bg-white/70 border-gray-200 text-gray-800 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 任务选择 */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Wand2 size={20} className="text-purple-600" />
                    <h3
                      className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                      }`}
                    >
                      {translations.customMode.creator.taskSelection}
                    </h3>
                  </div>

                  <Tabs
                    value={newCustomMode.type}
                    defaultValue={newCustomMode.type}
                    onValueChange={(value) =>
                      setNewCustomMode({ ...newCustomMode, type: value as NewCustomMode['type'] })
                    }
                  >
                    <TabsList
                      className={`grid w-full grid-cols-2 mb-6 backdrop-blur-sm p-1 rounded-xl ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'
                      }`}
                    >
                      <TabsTrigger
                        value="custom"
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          theme === 'dark'
                            ? 'text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm data-[state=active]:text-gray-100'
                            : 'text-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-800'
                        }`}
                      >
                        {translations.customMode.creatorType.custom}
                      </TabsTrigger>
                      <TabsTrigger
                        value="ai"
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          theme === 'dark'
                            ? 'text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm data-[state=active]:text-gray-100'
                            : 'text-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-800'
                        }`}
                      >
                        {translations.customMode.creatorType.ai}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="custom" className="space-y-6">
                      <div
                        className={`backdrop-blur-sm rounded-2xl p-6 border ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700/50'
                            : 'bg-white/50 border-gray-200/50'
                        }`}
                      >
                        <h4
                          className={`font-semibold mb-4 ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}
                        >
                          {translations.customMode.creator.fromExistingModes}
                        </h4>
                        <motion.button
                          disabled={loading}
                          whileTap={{ scale: 0.98 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={onLoadAllTasks}
                          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            {loading && (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            <span>
                              {loading
                                ? translations.customMode.creator.loading
                                : translations.customMode.creator.loadTasks}
                            </span>
                          </div>
                        </motion.button>

                        {Object.keys(availableModeTasks).length > 0 && (
                          <div className="mt-6 space-y-4">
                            {[...gameModes].map((mode) => (
                              <div
                                key={mode}
                                className={`border rounded-xl overflow-hidden ${
                                  theme === 'dark'
                                    ? 'border-gray-600 bg-gray-800/20'
                                    : 'border-gray-200 bg-gray-50/50'
                                }`}
                              >
                                <div
                                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors duration-200 ${
                                    theme === 'dark'
                                      ? 'hover:bg-gray-700/30'
                                      : 'hover:bg-gray-100/70'
                                  }`}
                                  onClick={() => toggleModeExpansion(mode)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <h6
                                      className={`text-sm font-semibold ${
                                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                      }`}
                                    >
                                      {(translations.modes as any)[mode]?.name || mode}
                                    </h6>
                                    <span className="text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full text-xs">
                                      {availableModeTasks[mode]?.length || 0} 个任务
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`text-xs ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                      }`}
                                    >
                                      {expandedModes[mode] ? '收起' : '展开'}
                                    </span>
                                    {expandedModes[mode] ? (
                                      <ChevronUp
                                        size={16}
                                        className={
                                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={16}
                                        className={
                                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }
                                      />
                                    )}
                                  </div>
                                </div>

                                <div
                                  className={`transition-all duration-300 overflow-hidden ${
                                    expandedModes[mode]
                                      ? 'max-h-80 opacity-100'
                                      : 'max-h-0 opacity-0'
                                  }`}
                                >
                                  <div
                                    className={`max-h-64 overflow-y-auto p-4 pt-0 custom-scrollbar ${
                                      theme === 'dark' ? 'bg-gray-800/10' : 'bg-white/30'
                                    }`}
                                  >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {availableModeTasks[mode]?.map((task, index) => (
                                        <motion.div
                                          key={`${mode}-${index}`}
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          className={`p-3 mt-1 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                            newCustomMode.tasks.includes(task)
                                              ? theme === 'dark'
                                                ? 'border-indigo-400 bg-indigo-900/30 text-indigo-300'
                                                : 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                              : theme === 'dark'
                                                ? 'border-gray-600 bg-gray-700/30 hover:border-gray-500 text-gray-200'
                                                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                                          }`}
                                          onClick={() => {
                                            if (newCustomMode.tasks.includes(task)) {
                                              setNewCustomMode((prev) => ({
                                                ...prev,
                                                tasks: prev.tasks.filter((t) => t !== task),
                                              }));
                                            } else {
                                              setNewCustomMode((prev) => ({
                                                ...prev,
                                                tasks: [...prev.tasks, task],
                                              }));
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm flex-1 mr-2">{task}</span>
                                            {newCustomMode.tasks.includes(task) && (
                                              <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <Check size={12} className="text-white" />
                                              </div>
                                            )}
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="ai" className="space-y-6">
                      <div
                        className={`backdrop-blur-sm rounded-2xl p-6 border ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700/50'
                            : 'bg-white/50 border-gray-200/50'
                        }`}
                      >
                        {aiTasksSection}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* 手动添加任务 */}
                  <div
                    className={`backdrop-blur-sm rounded-2xl p-6 border ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700/50'
                        : 'bg-white/50 border-gray-200/50'
                    }`}
                  >
                    <h4
                      className={`font-semibold mb-4 ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                      }`}
                    >
                      {translations.customMode.creator.manualAdd}
                    </h4>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <input
                        type="text"
                        value={manualTask}
                        onChange={(e) => setManualTask(e.target.value)}
                        placeholder={translations.customMode.creator.manualAddPlaceholder}
                        maxLength={100}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onAddManualTask();
                          }
                        }}
                        className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                            : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500'
                        }`}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAddManualTask}
                        disabled={
                          !manualTask.trim() || newCustomMode.tasks.includes(manualTask.trim())
                        }
                        className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        <Plus size={16} />
                      </motion.button>
                    </div>
                  </div>

                  {/* 已选择的任务列表 */}
                  {newCustomMode.tasks.length > 0 && (
                    <div
                      className={`backdrop-blur-sm rounded-2xl p-6 border ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700/50'
                          : 'bg-white/50 border-gray-200/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4
                          className={`font-semibold ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}
                        >
                          {translations.customMode.creator.selectedTasks}
                        </h4>
                        <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {newCustomMode.tasks.length}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {newCustomMode.tasks.map((task, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`flex items-center justify-between p-3 rounded-xl border ${
                              theme === 'dark'
                                ? 'bg-gray-700/30 border-gray-600'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <span className="w-6 h-6 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span
                                className={`text-sm flex-1 ${
                                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                }`}
                              >
                                {task}
                              </span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onRemoveTask(index)}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-500 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                              <X size={14} />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 底部操作栏 */}
              <div
                className={`backdrop-blur-sm border-t p-6 sm:p-8 rounded-b-3xl ${
                  theme === 'dark'
                    ? 'bg-gray-800/80 border-gray-700/50'
                    : 'bg-white/80 border-gray-200/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    onClick={onCreateMode}
                    disabled={!newCustomMode.name.trim() || newCustomMode.tasks.length === 0}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Save size={18} />
                      <span>{translations.customMode.creator.createButton}</span>
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`sm:w-32 font-medium py-4 px-6 rounded-xl transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                    onClick={onClose}
                  >
                    {translations.customMode.creator.cancel}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
}

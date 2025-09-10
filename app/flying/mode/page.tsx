'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useCustomModes } from '@/components/game/flying/hooks/useCustomModes';
import { useTaskManagement } from '@/components/game/flying/hooks/useTaskManagement';
import { useAITaskGeneration } from '@/components/game/flying/hooks/useAITaskGeneration';
import { useGamePersistence } from '@/components/game/flying/hooks/useGamePersistence';
import { GameModeSelector } from '@/components/game/flying/components/GameModeSelector/GameModeSelector';
import { CustomModeCreator } from '@/components/game/flying/components/CustomModeCreator/CustomModeCreator';
import { AITasksSection } from '@/components/game/flying/components/AITasksSection/AITasksSection';
import { ContinueGameModal } from '@/components/game/flying/components/ContinueGameModal/ContinueGameModal';
import { GameMode } from '@/components/game/flying/types/game';
import LanguageSelector from '@/components/language-selector';
import { useGlobal } from '@/contexts/GlobalContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

const GameModePage: React.FC = () => {
  const { language, translations, playSound, stopSound, getAudioRef, showToast } = useGlobal();
  const persistence = useGamePersistence();
  const router = useRouter();

  // 自定义模式
  const customModes = useCustomModes();

  // 任务管理
  const taskManagement = useTaskManagement();

  // AI任务生成
  const aiTasks = useAITaskGeneration();

  const [manualTask, setManualTask] = useState('');
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);

  const [pendingGameStart, setPendingGameStart] = useState<{
    mode: GameMode;
    customModeId?: string;
    customMode?: any;
    savedData?: any;
  } | null>(null);

  useEffect(() => {
    playSound('bgm');

    // 添加多种用户交互事件监听，用于解决浏览器的自动播放限制
    const handleUserInteraction = () => {
      playSound('bgm');
      // 移除所有事件监听器
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('mousemove', handleUserInteraction);
    };

    // 监听多种用户交互事件
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('mousemove', handleUserInteraction);

    // 组件卸载时清理
    return () => {
      stopSound('bgm');
      // 清理事件监听器
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('mousemove', handleUserInteraction);
    };
  }, []);

  // 检查是否有保存的游戏状态
  const hasGameSave = (mode: GameMode, customModeId?: string) => {
    const savedData = persistence.loadGame(mode, customModeId);
    return savedData && (savedData.redPosition > 0 || savedData.bluePosition > 0);
  };

  const redirectStartGame = (mode: string, customMode?: string, isNewGame?: boolean) => {
    router.push(
      `/flying/start?mode=${mode}&customMode=${customMode}&isNewGame=${isNewGame ? 1 : 0}`,
    );
  };

  // 事件处理
  const startGame = async (mode: GameMode, customMode?: any) => {
    const customModeId = customMode?.id;

    // 尝试播放背景音乐（如果还没有播放）
    if (getAudioRef('bgm')?.paused) playSound('bgm');

    // 检查是否有保存的游戏状态
    if (hasGameSave(mode, customModeId)) {
      // 先获取存档数据用于弹窗显示
      const savedData = persistence.loadGame(mode, customModeId);

      setPendingGameStart({ mode, customModeId, customMode, savedData });
      setShowContinueModal(true);
      return;
    }

    // 直接开始新游戏
    redirectStartGame(mode, customMode, true);
  };

  const handleCloseModal = useCallback(() => {
    setIsClosingModal(true);
    // 给动画时间执行（300ms）
    setTimeout(() => {
      setShowContinueModal(false);
      setIsClosingModal(false);
      setPendingGameStart(null);
    }, 300);
  }, []);

  const continueGame = async () => {
    if (!pendingGameStart) return;
    const { mode, customMode } = pendingGameStart;
    redirectStartGame(mode, customMode, false);
    handleCloseModal();
  };

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      {/* iOS 16 风格背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse transition-all duration-700 bg-gradient-to-br from-blue-200/20 to-indigo-300/30 dark:bg-gradient-to-br dark:from-blue-600/10 dark:to-indigo-700/15"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 transition-all duration-700 bg-gradient-to-br from-purple-200/25 to-pink-300/35 dark:bg-gradient-to-br dark:from-purple-600/12 dark:to-pink-700/18"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-2xl animate-pulse delay-500 transition-all duration-700 bg-gradient-to-br from-cyan-200/20 to-blue-300/30 dark:bg-gradient-to-br dark:from-cyan-600/8 dark:to-blue-700/12"></div>
      </div>

      {/* iOS 16 风格头部区域 */}
      <div className="relative z-10">
        <div className="backdrop-blur-2xl shadow-2xl transition-all duration-500 border-b bg-gradient-to-br from-white/85 via-white/75 to-white/65 border-white/20 dark:bg-gradient-to-br dark:from-gray-900/85 dark:via-slate-800/75 dark:to-gray-900/65 dark:border-gray-700/20">
          <div className="w-full sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-12 lg:py-16">
            <div className="text-center space-y-6">
              {/* iOS 16 风格主标题 */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-tight">
                  {translations?.game.title}
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed px-4 sm:px-8 lg:px-16 xl:px-24 text-gray-700 dark:text-gray-300">
                  {translations?.game.subtitle}
                </p>
              </div>

              {/* iOS 16 风格装饰性分割线 */}
              <div className="flex items-center justify-center space-x-4 py-6">
                <div className="w-12 sm:w-20 h-0.5 bg-gradient-to-r from-transparent to-blue-300/60"></div>
                <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg"></div>
                <div className="w-2.5 h-2.5 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full shadow-md"></div>
                <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full shadow-sm"></div>
                <div className="w-12 sm:w-20 h-0.5 bg-gradient-to-l from-transparent to-indigo-300/60"></div>
              </div>

              {/* iOS 16 风格控制器区域 */}
              <div className="flex justify-center">
                <div className="backdrop-blur-xl rounded-3xl p-3 shadow-xl border transition-all duration-500 hover:shadow-2xl bg-white/80 border-white/40 shadow-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/40 dark:shadow-black/20">
                  <div className="flex items-center gap-2">
                    <LanguageSelector />
                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <Link href="/flying/settings">
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS 16 风格主要内容区域 */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-12">
        <div
          className={`text-center mb-8 sm:mb-12 transition-opacity duration-500 ${
            customModes.showCustomModeCreator ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* iOS 16 风格欢迎区域 */}
          <div className="backdrop-blur-xl rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl border mx-auto lg:mx-8 xl:mx-16 transition-all duration-500 hover:shadow-3xl bg-white/70 border-white/30 shadow-gray-300/30 dark:bg-gray-900/70 dark:border-gray-700/30 dark:shadow-black/30">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent from-gray-900 via-gray-800 to-gray-700 dark:from-gray-100 dark:via-white dark:to-gray-200">
                {translations?.game.selectMode}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl leading-relaxed px-4 sm:px-8 lg:px-12 xl:px-16 transition-colors duration-500 text-gray-700 dark:text-gray-300">
                {translations?.game.modeDescription}
              </p>
            </div>

            {/* 装饰性图案 */}
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>

        {/* 游戏模式选择器 */}
        <div className="relative">
          <GameModeSelector
            onStartGame={startGame}
            customModes={customModes.customModes}
            isLoadingTasks={taskManagement.isLoadingTasks}
            onStartCustomGame={(mode) => {
              return startGame('custom', mode);
            }}
            onCreateCustomMode={() => {
              customModes.setShowCustomModeCreator(true);
            }}
            onDeleteCustomMode={customModes.deleteCustomMode}
          />
        </div>

        {/* 自定义模式创建器 */}
        {customModes.showCustomModeCreator && (
          <CustomModeCreator
            newCustomMode={customModes.newCustomMode}
            setNewCustomMode={customModes.setNewCustomMode}
            manualTask={manualTask}
            setManualTask={setManualTask}
            availableModeTasks={taskManagement.availableModeTasks}
            isLoadingTasks={taskManagement.isLoadingTasks}
            onClose={() => {
              customModes.setShowCustomModeCreator(false);
              customModes.setNewCustomMode({
                name: '',
                description: '',
                type: 'custom',
                tasks: [],
              });
              setManualTask('');
            }}
            onCreateMode={() => {
              const success = customModes.createCustomMode(customModes.newCustomMode, () => {
                showToast(
                  translations?.customMode.messages.createSuccess || '自定义模式创建成功！',
                  'success',
                );
              });
              if (success) {
                setManualTask('');
              }
            }}
            onLoadAllTasks={() => taskManagement.loadAllTasksForSelection(language)}
            onAddManualTask={() => {
              if (
                manualTask.trim() &&
                !customModes.newCustomMode.tasks.includes(manualTask.trim())
              ) {
                customModes.setNewCustomMode((prev) => ({
                  ...prev,
                  tasks: [...prev.tasks, manualTask.trim()],
                }));
                setManualTask('');
              }
            }}
            onRemoveTask={(index) => {
              customModes.setNewCustomMode((prev) => ({
                ...prev,
                tasks: prev.tasks.filter((_, i) => i !== index),
              }));
            }}
            aiTasksSection={
              <AITasksSection
                deepSeekApi={aiTasks.deepSeekApi}
                newCustomMode={customModes.newCustomMode}
                isGeneratingTasks={aiTasks.isGeneratingTasks}
                onApiKeyChange={aiTasks.saveDeepSeekApiKey}
                onApiConfigChange={(updates) => {
                  aiTasks.setDeepSeekApi((prev) => ({ ...prev, ...updates }));
                }}
                onGenerateTasks={() => {
                  aiTasks.generateAITasks(
                    customModes.newCustomMode,
                    translations,
                    () =>
                      showToast(
                        translations?.customMode.ai.tasksGenerated ||
                          'Tasks generated successfully',
                        'success',
                      ),
                    (error) => showToast(error, 'error'),
                  );
                }}
                onToggleTask={(task) => {
                  if (customModes.newCustomMode.tasks.includes(task)) {
                    customModes.setNewCustomMode((prev) => ({
                      ...prev,
                      tasks: prev.tasks.filter((t) => t !== task),
                    }));
                  } else {
                    customModes.setNewCustomMode((prev) => ({
                      ...prev,
                      tasks: [...prev.tasks, task],
                    }));
                  }
                }}
              />
            }
          />
        )}
      </div>

      {/* 继续游戏模态框 */}
      {showContinueModal && pendingGameStart && (
        <ContinueGameModal
          onContinue={continueGame}
          onClose={handleCloseModal}
          gameMode={pendingGameStart.mode}
          isVisible={showContinueModal && !isClosingModal}
          customModeName={pendingGameStart.customMode?.name}
          redPosition={pendingGameStart.savedData?.redPosition || 0}
          bluePosition={pendingGameStart.savedData?.bluePosition || 0}
          currentPlayer={pendingGameStart.savedData?.currentPlayer || 'red'}
          onNewGame={() => {
            if (pendingGameStart) {
              handleCloseModal();
              redirectStartGame(pendingGameStart.mode, pendingGameStart.customMode, true);
            }
          }}
        />
      )}
    </div>
  );
};
export default GameModePage;

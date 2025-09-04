'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSound } from '@/contexts/SoundContext';
import { createBoardPath, PathCell } from '@/lib/game-config';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { type Language, loadTranslations, type Translations } from '@/lib/i18n';
import { closeModal, openModal, shuffleArray } from '@/components/game/flying/utils/game-utils';
import { useGameState } from '@/components/game/flying/hooks/useGameState';
import { useTaskManagement } from '@/components/game/flying/hooks/useTaskManagement';
import { useCustomModes } from '@/components/game/flying/hooks/useCustomModes';
import { usePlayerMovement } from '@/components/game/flying/hooks/usePlayerMovement';
import { useAITaskGeneration } from '@/components/game/flying/hooks/useAITaskGeneration';
import { useGameLogic } from '@/components/game/flying/hooks/useGameLogic';
import { GameBoard } from '@/components/game/flying/components/GameBoard/GameBoard';
import { GameModeSelector } from '@/components/game/flying/components/GameModeSelector/GameModeSelector';
import { TaskModal } from '@/components/game/flying/components/TaskModal/TaskModal';
import { WinModal } from '@/components/game/flying/components/WinModal/WinModal';
import { CustomModeCreator } from '@/components/game/flying/components/CustomModeCreator/CustomModeCreator';
import { AITasksSection } from '@/components/game/flying/components/AITasksSection/AITasksSection';
import { WinTaskModal } from '@/components/game/flying/components/WinTaskModal/WinTaskModal';
import { ContinueGameModal } from '@/components/game/flying/components/ContinueGameModal/ContinueGameModal';
import { useGamePersistence } from '@/components/game/flying/hooks/useGamePersistence';
import { GameMode, PlayerColor, WinTaskOption } from '@/components/game/flying/types/game';
import LanguageSelector from '@/components/language-selector';
import { useAudio } from '@/hooks/use-audio';
import { useTheme } from '@/contexts/ThemeContext';
import SpecialEffects, {
  EffectType,
} from '@/components/game/flying/components/SpecialEffects/SpecialEffects';

export default function CoupleLudoGame() {
  const rollDiceAudio = useAudio({ src: '/audio/shake-and-roll-dice-soundbible.mp3' });
  const stepAudio = useAudio({
    src: '/audio/step.wav',
    volume: 0.8,
    loop: false,
  });
  const persistence = useGamePersistence();
  const { theme, mounted } = useTheme();

  // 游戏状态
  const gameState = useGameState();

  // 任务管理
  const taskManagement = useTaskManagement();

  // 自定义模式
  const customModes = useCustomModes();

  // AI任务生成
  const aiTasks = useAITaskGeneration();

  // 基础状态
  const [boardPath, setBoardPath] = useState<PathCell[]>([]);
  const [language, setLanguage] = useState<Language>(() => {
    // 从 localStorage 读取语言设置，如果没有则默认为 'zh'
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language | null;
      return savedLang || 'zh';
    }
    return 'zh';
  });
  const [translations, setTranslations] = useState<Translations>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [manualTask, setManualTask] = useState('');
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [pendingGameStart, setPendingGameStart] = useState<{
    mode: GameMode;
    customModeId?: string;
    customMode?: any;
    savedData?: any;
  } | null>(null);

  // 特效状态
  const [currentEffect, setCurrentEffect] = useState<EffectType>(null);
  // 当语言改变时保存到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  // 加载翻译
  useEffect(() => {
    const loadTranslationsAsync = async () => {
      try {
        const data = await loadTranslations(language);
        setTranslations(data);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    loadTranslationsAsync();
  }, [language]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { registerAudio, unregisterAudio } = useSound();

  useEffect(() => {
    // 创建音频元素
    const audio = new Audio('/audio/bgm.mp3');
    audio.loop = true; // 设置循环播放
    audio.volume = 0.5; // 设置音量
    audioRef.current = audio;

    // 注册音频到 SoundContext
    registerAudio(audio);

    // 尝试自动播放（需要用户交互后才会生效）
    const playAudio = () => {
      if (audio && audio.paused) {
        audio.play().catch((error) => {
          console.log('自动播放失败，需要用户交互:', error);
        });
      }
    };

    // 立即尝试播放（可能失败，但不会报错）
    playAudio();

    // 添加多种用户交互事件监听，用于解决浏览器的自动播放限制
    const handleUserInteraction = () => {
      playAudio();
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
      unregisterAudio(audio);
      if (audio) {
        audio.pause();
        audioRef.current = null;
      }
      // 清理事件监听器
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('mousemove', handleUserInteraction);
    };
  }, [registerAudio, unregisterAudio]);

  // 玩家移动
  const playerMovement = usePlayerMovement(
    boardPath,
    gameState.redPosition,
    gameState.bluePosition,
    gameState.setRedPosition,
    gameState.setBluePosition,
    gameState.setIsMoving,
    gameState.setGameState,
    (position, player) => {
      // 先检查特殊事件并触发特效
      const cellType = boardPath[position]?.type;
      const otherPlayerPosition = player === 'red' ? gameState.bluePosition : gameState.redPosition;

      // 碰撞检测
      if (position > 0 && position < boardPath.length - 1 && position === otherPlayerPosition) {
        setCurrentEffect('collision');
        setTimeout(() => {
          gameLogic.checkSpecialEvents(position, player);
        }, 500); // 等待特效开始后触发游戏逻辑
      }
      // 幸运星
      else if (cellType === 'star') {
        setCurrentEffect('star');
        setTimeout(() => {
          gameLogic.checkSpecialEvents(position, player);
        }, 500);
      }
      // 陷阱
      else if (cellType === 'trap') {
        setCurrentEffect('trap');
        setTimeout(() => {
          gameLogic.checkSpecialEvents(position, player);
        }, 500);
      }
      // 普通格子
      else {
        gameLogic.checkSpecialEvents(position, player);
      }
    },
  );

  const animateTaskOutcomeMove = useCallback(
    (targetPosition: number, player: PlayerColor, originalPosition: number) => {
      // 如果目标位置和当前位置相同，直接完成
      if (targetPosition === originalPosition) {
        gameState.setCurrentTask(null);
        gameState.setTaskType(null);

        if (targetPosition === boardPath.length - 1) {
          gameState.setWinner(player);
          gameState.setGameState('win');
        } else {
          gameState.switchTurn();
        }
        return;
      }

      gameState.setIsMoving(true);
      gameState.setGameState('moving');

      let currentAnimatedPos = originalPosition;

      const step = () => {
        if (currentAnimatedPos === targetPosition) {
          gameState.setIsMoving(false);
          gameState.setGameState('playing');
          gameState.setCurrentTask(null);
          gameState.setTaskType(null);

          if (targetPosition === boardPath.length - 1) {
            gameState.setWinner(player);
            gameState.setGameState('win');
          } else {
            gameState.switchTurn();
          }
          return;
        }

        currentAnimatedPos += targetPosition > currentAnimatedPos ? 1 : -1;

        if (player === 'red') gameState.setRedPosition(currentAnimatedPos);
        else gameState.setBluePosition(currentAnimatedPos);

        // 播放步进音效
        stepAudio.play().catch((error) => {
          console.log('播放移动音效失败:', error);
        });

        setTimeout(step, 300);
      };
      step();
    },
    [boardPath.length, gameState, stepAudio],
  );

  // 游戏逻辑
  const gameLogic = useGameLogic(
    boardPath,
    gameState.redPosition,
    gameState.bluePosition,
    taskManagement.taskQueue,
    taskManagement.setTaskQueue,
    gameState.setCurrentTask,
    gameState.setTaskType,
    gameState.setGameState,
    gameState.setWinner,
    gameState.switchTurn,
    () => {
      const winTasks = taskManagement.generateWinTasks(translations);
      gameState.setWinTaskOptions(winTasks);
    },
    animateTaskOutcomeMove,
  );

  // 初始化
  useEffect(() => {
    const path = createBoardPath();
    setBoardPath(path);
    loadTranslations(language).then(setTranslations);
    customModes.loadCustomModes();
    aiTasks.loadDeepSeekApiKey();
  }, []);

  useEffect(() => {
    loadTranslations(language).then(setTranslations);
  }, [language]);

  useEffect(() => {
    if (gameState.gameMode === 'custom' && customModes.currentCustomMode) {
      if (customModes.currentCustomMode.tasks.length > 0) {
        taskManagement.setTaskQueue(shuffleArray([...customModes.currentCustomMode.tasks]));
      } else {
        taskManagement.setTaskQueue([]);
      }
    }
  }, [gameState.gameMode, customModes.currentCustomMode]);

  // 工具函数
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // 事件处理
  const rollDice = () => {
    if (gameState.isRolling || gameState.isMoving || taskManagement.isLoadingTasks) return;

    // 尝试播放背景音乐（如果还没有播放）
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch((error) => {
        console.log('背景音乐播放失败:', error);
      });
    }

    // 播放掷骰子音效
    rollDiceAudio.play();

    gameState.setIsRolling(true);
    gameState.setDiceValue(null);

    let count = 0;
    const interval = setInterval(() => {
      gameState.setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        gameState.setDiceValue(finalValue);
        gameState.setIsRolling(false);
        playerMovement.movePlayer(finalValue, gameState.currentPlayer);
      }
    }, 80);
  };

  const startGame = async (mode: GameMode, customMode?: any) => {
    const customModeId = customMode?.id;

    // 尝试播放背景音乐（如果还没有播放）
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch((error) => {
        console.log('背景音乐播放失败:', error);
      });
    }

    // 检查是否有保存的游戏状态
    if (gameState.hasGameSave(mode, customModeId)) {
      // 先获取存档数据用于弹窗显示
      const savedData = persistence.loadGame(mode, customModeId);

      setPendingGameStart({ mode, customModeId, customMode, savedData });
      setShowContinueModal(true);
      return;
    }

    // 直接开始新游戏
    await startNewGame(mode, customMode);
  };

  const startNewGame = async (mode: GameMode, customMode?: any) => {
    const customModeId = customMode?.id;

    gameState.setGameMode(mode);
    gameState.setGameState('playing');
    gameState.setCurrentPlayer('red');
    gameState.setRedPosition(0);
    gameState.setBluePosition(0);
    gameState.setDiceValue(null);
    gameState.setIsRolling(false);
    gameState.setIsMoving(false);
    gameState.setCurrentTask(null);
    gameState.setTaskType(null);
    gameState.setWinner(null);
    gameState.setCustomModeId(customModeId);
    setToast(null);

    // 清除之前的游戏存档
    gameState.clearGameSave(mode, customModeId);

    if (mode === 'custom' && customMode) {
      customModes.setCurrentCustomMode(customMode);
    }

    if (mode !== 'custom') {
      await taskManagement.loadTasks(mode, language, translations || undefined);
    }
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

    const { mode, customModeId, customMode } = pendingGameStart;

    // 加载游戏状态
    const loaded = gameState.loadGameState(mode, customModeId);

    if (loaded) {
      if (mode === 'custom' && customMode) {
        customModes.setCurrentCustomMode(customMode);
      }

      if (mode !== 'custom') {
        await taskManagement.loadTasks(mode, language, translations || undefined);
      }
    } else {
      // 如果加载失败，开始新游戏
      await startNewGame(mode, customMode);
    }

    handleCloseModal();
  };

  const handleTaskComplete = (isCompleted: boolean) => {
    const result = gameLogic.handleTaskComplete(
      isCompleted,
      gameState.currentTask,
      gameState.taskType,
      translations!,
      showToast,
    );

    if (result?.resetToStart && result.player) {
      if (result.player === 'red') {
        gameState.setRedPosition(0);
      } else {
        gameState.setBluePosition(0);
      }
    }
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (gameState.gameState !== 'start' && gameState.gameMode) {
      await taskManagement.loadTasks(gameState.gameMode, newLanguage);
    }
  };

  const restartGame = () => {
    gameState.resetGame();
    customModes.setCurrentCustomMode(null);
    customModes.setShowCustomModeCreator(false);
    setToast(null);
    closeModal();
  };

  const handleWinTaskSelect = useCallback(
    (task: WinTaskOption) => {
      gameState.setSelectedWinTask(task);
      gameState.setGameState('winTask');
    },
    [gameState],
  );

  const handleWinTaskComplete = useCallback(() => {
    // 清空当前游戏类型的持久化数据
    persistence.clearGame(gameState.gameMode, gameState.customModeId);

    gameState.setGameState('win');
    gameState.setSelectedWinTask(null);
    gameState.setWinTaskOptions([]);
  }, [gameState, persistence]);

  const restartFromWin = useCallback(() => {
    // 清空当前游戏类型的持久化数据
    persistence.clearGame(gameState.gameMode, gameState.customModeId);

    gameState.setGameState('start');
    gameState.setWinner(null);
    gameState.setSelectedWinTask(null);
    gameState.setWinTaskOptions([]);
  }, [gameState, persistence]);

  if (!mounted) {
    return (
      <div className="w-full px-0 sm:px-4 lg:px-8 xl:px-12 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        </div>
      </div>
    );
  }

  // 渲染函数
  if (!translations) {
    return (
      <div className="game-container start-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p className="text-white ml-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (gameState.gameState === 'start') {
    return (
      <div
        className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-900 via-slate-800 via-gray-900 to-slate-900'
            : 'bg-gradient-to-br from-violet-50 via-indigo-50 via-blue-50 to-cyan-50'
        }`}
      >
        {/* 动态背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse transition-colors duration-500 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-blue-600/20 to-indigo-700/20'
                : 'bg-gradient-to-br from-blue-200/40 to-indigo-300/40'
            }`}
          ></div>
          <div
            className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 transition-colors duration-500 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-purple-600/20 to-pink-700/20'
                : 'bg-gradient-to-br from-purple-200/40 to-pink-300/40'
            }`}
          ></div>
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-2xl animate-pulse delay-500 transition-colors duration-500 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-cyan-600/15 to-blue-700/15'
                : 'bg-gradient-to-br from-cyan-200/30 to-blue-300/30'
            }`}
          ></div>
        </div>

        {/* 头部区域 */}
        <div className="relative z-10">
          <div
            className={`backdrop-blur-xl shadow-2xl transition-colors duration-500 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-900/90 via-slate-800/80 to-gray-900/70'
                : 'bg-gradient-to-br from-white/90 via-white/80 to-white/70'
            }`}
          >
            <div className="w-full sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-12 lg:py-16">
              <div className="text-center space-y-6">
                {/* 主标题 */}
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                    {translations.game.title}
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-medium leading-relaxed px-4 sm:px-8 lg:px-16 xl:px-24">
                    {translations.game.subtitle}
                  </p>
                </div>

                {/* 装饰性分割线 */}
                <div className="flex items-center justify-center space-x-4 py-4">
                  <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent to-indigo-300"></div>
                  <div className="w-3 h-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gradient-to-br from-pink-400 to-red-500 rounded-full"></div>
                  <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-l from-transparent to-pink-300"></div>
                </div>

                {/* 控制器区域 */}
                <div className="flex justify-center">
                  <div
                    className={`backdrop-blur-sm rounded-2xl p-2 shadow-lg border transition-colors duration-500 ${
                      theme === 'dark'
                        ? 'bg-gray-800/60 border-gray-700/40'
                        : 'bg-white/60 border-white/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <LanguageSelector
                        currentLanguage={language}
                        onLanguageChange={handleLanguageChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-12">
          <div
            className={`text-center mb-8 sm:mb-12 transition-opacity duration-500 ${
              customModes.showCustomModeCreator ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {/* 欢迎区域 */}
            <div
              className={`backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl border mx-auto lg:mx-8 xl:mx-16 transition-colors duration-500 ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700/30'
                  : 'bg-white/50 border-white/30'
              }`}
            >
              <div className="space-y-4">
                <h2
                  className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                    theme === 'dark'
                      ? 'from-gray-200 via-white to-gray-100'
                      : 'from-gray-800 via-gray-700 to-gray-900'
                  }`}
                >
                  {translations.game.selectMode}
                </h2>
                <p
                  className={`text-base sm:text-lg lg:text-xl leading-relaxed px-4 sm:px-8 lg:px-12 xl:px-16 transition-colors duration-500 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {translations.game.modeDescription}
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
              translations={translations}
              customModes={customModes.customModes}
              isLoadingTasks={taskManagement.isLoadingTasks}
              gameMode={gameState.gameMode}
              onStartGame={startGame}
              onStartCustomGame={(mode) => {
                startGame('custom', mode);
              }}
              onCreateCustomMode={() => {
                openModal();
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
              translations={translations}
              onClose={() => {
                closeModal();
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
                const success = customModes.createCustomMode(() => {
                  showToast(
                    translations?.customMode.messages.createSuccess || '自定义模式创建成功！',
                    'success',
                  );
                });
                if (success) {
                  closeModal();
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
                  translations={translations}
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
            gameMode={pendingGameStart.mode}
            onClose={handleCloseModal}
            redPosition={pendingGameStart.savedData?.redPosition || 0}
            bluePosition={pendingGameStart.savedData?.bluePosition || 0}
            currentPlayer={pendingGameStart.savedData?.currentPlayer || 'red'}
            customModeName={pendingGameStart.customMode?.name}
            isVisible={showContinueModal && !isClosingModal}
            onNewGame={async () => {
              if (pendingGameStart) {
                await startNewGame(pendingGameStart.mode, pendingGameStart.customMode);
                handleCloseModal();
              }
            }}
            translations={translations}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark'
          ? `bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 ${gameState.currentPlayer === 'red' ? 'from-red-900/30 via-pink-900/20 to-rose-900/30' : 'from-blue-900/30 via-indigo-900/20 to-cyan-900/30'}`
          : `bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 ${gameState.currentPlayer === 'red' ? 'from-red-50 via-pink-50 to-rose-100' : 'from-blue-50 via-indigo-50 to-cyan-100'}`
      }`}
    >
      {/* 头部导航 */}
      <div
        className={`sticky top-0 z-10 backdrop-blur-md border-b shadow-lg transition-all duration-500 ${
          theme === 'dark'
            ? `bg-gray-900/80 border-gray-700/20 ${gameState.currentPlayer === 'red' ? 'bg-gradient-to-r from-red-900/10 to-pink-900/10' : 'bg-gradient-to-r from-blue-900/10 to-indigo-900/10'}`
            : `bg-white/80 border-white/20 ${gameState.currentPlayer === 'red' ? 'bg-gradient-to-r from-red-500/10 to-pink-500/10' : 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10'}`
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* 返回按钮 */}
            <button
              onClick={restartGame}
              title={translations.game.backToHome}
              className={`p-2 sm:p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                gameState.currentPlayer === 'red'
                  ? 'bg-red-100 hover:bg-red-200 text-red-600 shadow-red-200'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600 shadow-blue-200'
              } shadow-lg hover:shadow-xl`}
            >
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* 标题 */}
            <div className="flex-1 text-center">
              <h1
                className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-colors duration-500 ${
                  theme === 'dark'
                    ? 'from-gray-100 via-white to-gray-200'
                    : 'from-gray-800 via-gray-700 to-gray-900'
                }`}
              >
                {translations.game.title}
              </h1>
              <p
                className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
                  gameState.currentPlayer === 'red' ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                {gameState.gameMode === 'custom'
                  ? customModes.currentCustomMode?.name || '自定义模式'
                  : translations.modes[gameState.gameMode].name}
              </p>
            </div>

            {/* 控制器区域 */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <LanguageSelector
                currentLanguage={language}
                onLanguageChange={handleLanguageChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-6 space-y-6">
        {/* 回合指示器 */}
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
              gameState.currentPlayer === 'red'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-300'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-300'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full mr-3 animate-pulse ${
                gameState.currentPlayer === 'red' ? 'bg-white' : 'bg-white'
              }`}
            ></div>
            <span className="text-lg sm:text-xl font-bold">
              {gameState.currentPlayer === 'red'
                ? translations.game.redTurn
                : translations.game.blueTurn}
            </span>
          </div>
        </div>

        {/* 骰子区域 */}
        <div className="flex flex-col items-center space-y-4">
          {/* 骰子显示 */}
          <div
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 ${
              gameState.currentPlayer === 'red'
                ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-300'
                : 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-300'
            } ${gameState.isRolling ? 'animate-spin' : ''}`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {gameState.diceValue ?? '?'}
              </span>
            </div>
            {/* 装饰性光泽效果 */}
            <div className="absolute top-2 left-2 w-4 h-4 bg-white/30 rounded-full blur-sm"></div>
          </div>

          {/* 掷骰子按钮 */}
          <button
            onClick={rollDice}
            disabled={
              gameState.isRolling ||
              gameState.isMoving ||
              gameState.gameState === 'task' ||
              taskManagement.isLoadingTasks
            }
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl ${
              gameState.currentPlayer === 'red'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-red-300'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-blue-300'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {gameState.isRolling && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {gameState.isMoving
                ? translations.common.moving
                : gameState.isRolling
                  ? translations.common.rolling
                  : taskManagement.isLoadingTasks
                    ? translations.common.preparing
                    : translations.common.rollDice}
            </span>
          </button>
        </div>

        {/* 游戏棋盘 */}
        <div
          className={`backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-xl border transition-colors duration-500 max-w-2xl mx-auto ${
            theme === 'dark' ? 'bg-gray-800/50 border-gray-700/20' : 'bg-white/50 border-white/20'
          }`}
        >
          <GameBoard
            boardPath={boardPath}
            translations={translations}
            isMoving={gameState.isMoving}
            redPosition={gameState.redPosition}
            bluePosition={gameState.bluePosition}
            currentPlayer={gameState.currentPlayer}
          />
        </div>
      </div>

      {gameState.gameState === 'task' && gameState.currentTask && (
        <TaskModal
          currentTask={gameState.currentTask}
          taskType={gameState.taskType!}
          translations={translations}
          onTaskComplete={handleTaskComplete}
        />
      )}

      {gameState.gameState === 'win' && gameState.winner && (
        <WinModal
          winner={gameState.winner}
          translations={translations}
          onRestartFromWin={restartFromWin}
          onWinTaskSelect={handleWinTaskSelect}
          winTaskOptions={gameState.winTaskOptions}
        />
      )}

      {gameState.gameState === 'winTask' && gameState.selectedWinTask && gameState.winner && (
        <WinTaskModal
          winner={gameState.winner}
          translations={translations}
          onRestart={restartFromWin}
          currentTask={gameState.currentTask}
          onTaskComplete={handleWinTaskComplete}
          selectedWinTask={gameState.selectedWinTask}
        />
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 特效组件 */}
      <SpecialEffects
        effectType={currentEffect}
        onComplete={() => setCurrentEffect(null)}
        duration={2000}
      />
    </div>
  );
}

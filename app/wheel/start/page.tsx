'use client';

import React, { useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { loadTranslations } from '@/lib/i18n';
import { shuffleArray } from '@/components/game/flying/utils/game-utils';
import { useGameState } from '@/components/game/flying/hooks/useGameState';
import { useTaskManagement } from '@/components/game/flying/hooks/useTaskManagement';
import { useCustomModes } from '@/components/game/flying/hooks/useCustomModes';
import { useGamePersistence } from '@/components/game/flying/hooks/useGamePersistence';
import WheelGame from '@/components/game/wheel/WheelGame';
import { useWheelGameLogic } from '@/components/game/wheel/useWheelGameLogic';
import { TaskModal } from '@/components/game/flying/components/TaskModal/TaskModal';
import { WinModal } from '@/components/game/flying/components/WinModal/WinModal';
import { WinTaskModal } from '@/components/game/flying/components/WinTaskModal/WinTaskModal';
import { GameMode, WinTaskOption } from '@/components/game/flying/types/game';
import SpecialEffects, {
  EffectType,
} from '@/components/game/flying/components/SpecialEffects/SpecialEffects';
import { useGlobal } from '@/contexts/GlobalContext';
import { useParams, useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import { useOptimizedState, useStableCallback } from '@/hooks/use-performance';

interface gamePlayParams {
  isNewGame?: boolean;
  initialCustomMode?: any;
  initialGameMode?: GameMode;
}

const GamePlayPage: React.FC = () => {
  const params: gamePlayParams = useParams(); // 动态路由参数
  const { isNewGame = 1, initialCustomMode = '', initialGameMode = 'normal' } = params || {};
  const { playSound, translations, language, showToast } = useGlobal();
  const router = useRouter();

  const persistence = useGamePersistence();

  // 游戏状态
  const gameState = useGameState();

  // 任务管理
  const taskManagement = useTaskManagement();

  // 自定义模式
  const customModes = useCustomModes();

  // 使用防抖优化特效状态更新
  const [currentEffect, setCurrentEffectInternal] = useOptimizedState<EffectType>(null);
  const setCurrentEffect = useStableCallback(setCurrentEffectInternal);

  // 转盘游戏逻辑
  const wheelGameLogic = useWheelGameLogic(
    gameState.currentPlayer,
    gameState.setCurrentTask,
    gameState.setTaskType,
    gameState.setGameState,
    gameState.switchTurn,
    playSound,
    showToast,
    taskManagement.taskQueue,
    taskManagement.setTaskQueue,
  );

  // 缓存玩家颜色相关的样式
  const playerStyles = useMemo(() => {
    const isRed = gameState.currentPlayer === 'red';
    return {
      buttonClass: isRed
        ? 'bg-red-100 hover:bg-red-200 text-red-600 shadow-red-200'
        : 'bg-blue-100 hover:bg-blue-200 text-blue-600 shadow-blue-200',
      backgroundOverlay: isRed
        ? 'radial-gradient(ellipse at top right, rgba(239, 68, 68, 0.05), transparent 50%), radial-gradient(ellipse at bottom left, rgba(236, 72, 153, 0.05), transparent 50%)'
        : 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.05), transparent 50%), radial-gradient(ellipse at bottom left, rgba(99, 102, 241, 0.05), transparent 50%)',
      headerGradient: isRed
        ? 'linear-gradient(to right, rgba(239, 68, 68, 0.05), rgba(236, 72, 153, 0.05))'
        : 'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.05))',
      turnIndicatorGradient: isRed
        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(236, 72, 153, 0.9))'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(99, 102, 241, 0.9))',
      diceGradient: isRed
        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(236, 72, 153, 0.1))'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
      buttonGradient: isRed
        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(236, 72, 153, 0.95))'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(99, 102, 241, 0.95))',
      borderColor: isRed ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)',
      textColor: isRed ? '#dc2626' : '#2563eb',
      glowShadow: isRed
        ? '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(239, 68, 68, 0.6)'
        : '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.6)',
    };
  }, [gameState.currentPlayer]);

  // 初始化游戏
  useEffect(() => {
    const initializeGame = async () => {
      // 加载自定义模式数据
      customModes.loadCustomModes();

      gameState.setGameMode(initialGameMode);
      gameState.setGameState('playing');
      gameState.setCurrentPlayer('red');
      gameState.setDiceValue(null);
      gameState.setIsRolling(false);
      gameState.setIsMoving(false);
      gameState.setCurrentTask(null);
      gameState.setTaskType(null);
      gameState.setWinner(null);
      gameState.setCustomModeId(initialCustomMode?.id);

      if (initialGameMode === 'custom' && initialCustomMode) {
        customModes.setCurrentCustomMode(initialCustomMode);
      }

      if (initialGameMode !== 'custom') {
        const translations = await loadTranslations(language);
        await taskManagement.loadTasks(initialGameMode, language, translations);
      }
    };

    void initializeGame();
  }, [initialGameMode, initialCustomMode, isNewGame, language]);

  useEffect(() => {
    if (gameState.gameMode === 'custom' && customModes.currentCustomMode) {
      if (customModes.currentCustomMode.tasks.length > 0) {
        taskManagement.setTaskQueue(shuffleArray([...customModes.currentCustomMode.tasks]));
      } else {
        taskManagement.setTaskQueue([]);
      }
    }
  }, [gameState.gameMode, customModes.currentCustomMode]);

  const handleTaskComplete = useStableCallback((isCompleted: boolean) => {
    wheelGameLogic.handleTaskComplete(isCompleted);
  });

  const handleBackButton = useStableCallback(() => {
    router.back();
  });

  if (taskManagement.isLoadingTasks) return <Loading />;

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 relative">
      {/* 动态背景叠加层 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: playerStyles.backgroundOverlay,
        }}
      />
      {/* iOS 16 风格头部导航 */}
      <div className="sticky top-0 z-10 backdrop-blur-2xl border-b shadow-2xl transition-all duration-500 bg-white/70 border-white/20 shadow-gray-200/30 dark:bg-gray-900/70 dark:border-gray-700/20 dark:shadow-black/30">
        {/* 动态渐变叠加层 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: playerStyles.headerGradient,
          }}
        />
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* 返回按钮 */}
            <button
              onClick={handleBackButton}
              title={translations?.game.backToHome}
              className={`flex-shrink-0 p-2 sm:p-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 transform ${playerStyles.buttonClass} shadow-lg hover:shadow-xl`}
            >
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* 标题 */}
            <div className="flex-1 min-w-0 mx-3 sm:mx-4">
              <div className="text-center">
                <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black bg-gradient-to-r bg-clip-text text-transparent from-gray-900 via-gray-800 to-gray-700 dark:from-gray-100 dark:via-white dark:to-gray-200 transition-all duration-300 truncate">
                  大转盘游戏
                </h1>
                <p
                  className="text-xs sm:text-sm lg:text-base font-semibold transition-all duration-300 truncate"
                  style={{
                    color: playerStyles.textColor,
                  }}
                >
                  {gameState.gameMode === 'custom'
                    ? customModes.currentCustomMode?.name || '自定义模式'
                    : translations?.modes[gameState.gameMode].name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS 16 风格主要内容区域 */}
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8 space-y-8 relative z-10">
        {/* iOS 16 风格回合指示器 */}
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-3xl shadow-2xl transition-all duration-500 transform hover:scale-105 backdrop-blur-xl border bg-white/80 border-white/40 shadow-gray-300/40 dark:bg-gray-900/80 dark:border-gray-700/40 dark:shadow-black/40 animate-bounce"
            style={{
              background: playerStyles.turnIndicatorGradient,
              transform: 'translateY(0px)',
              animation: 'fadeInScale 0.6s ease-out, float 3s ease-in-out infinite',
            }}
          >
            <div
              className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full mr-2 sm:mr-3 bg-white shadow-lg transition-all duration-300"
              style={{
                animation: 'pulseGlow 2s ease-in-out infinite',
                boxShadow: playerStyles.glowShadow,
              }}
            ></div>
            <span className="text-base sm:text-lg lg:text-xl font-black text-white tracking-wide transition-all duration-300">
              {gameState.currentPlayer === 'red'
                ? translations?.game.redTurn
                : translations?.game.blueTurn}
            </span>
          </div>
        </div>

        {/* 大转盘游戏区域 */}
        <div className="backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all duration-500 max-w-4xl mx-auto hover:shadow-3xl bg-white/80 border-white/30 shadow-gray-300/40 dark:bg-gray-900/80 dark:border-gray-700/30 dark:shadow-black/40">
          <WheelGame
            taskQueue={taskManagement.taskQueue}
            currentPlayer={gameState.currentPlayer}
            onTaskTriggered={wheelGameLogic.handleWheelResult}
            isDisabled={gameState.gameState === 'task' || taskManagement.isLoadingTasks}
          />
        </div>
      </div>

      {gameState.gameState === 'task' && gameState.currentTask && (
        <TaskModal
          taskType={gameState.taskType!}
          currentTask={gameState.currentTask}
          onTaskComplete={handleTaskComplete}
          isExec={false}
        />
      )}

      {/* 特效组件 */}
      <SpecialEffects
        duration={1000}
        effectType={currentEffect}
        onComplete={() => setCurrentEffect(null)}
      />
    </div>
  );
};

export default GamePlayPage;

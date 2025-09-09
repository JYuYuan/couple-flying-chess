'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createBoardPath, PathCell } from '@/lib/game-config';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { loadTranslations } from '@/lib/i18n';
import { shuffleArray } from '@/components/game/flying/utils/game-utils';
import { useGameState } from '@/components/game/flying/hooks/useGameState';
import { useTaskManagement } from '@/components/game/flying/hooks/useTaskManagement';
import { useCustomModes } from '@/components/game/flying/hooks/useCustomModes';
import { usePlayerMovement } from '@/components/game/flying/hooks/usePlayerMovement';
import { useGameLogic } from '@/components/game/flying/hooks/useGameLogic';
import { useGamePersistence } from '@/components/game/flying/hooks/useGamePersistence';
import { GameBoard } from '@/components/game/flying/components/GameBoard/GameBoard';
import { TaskModal } from '@/components/game/flying/components/TaskModal/TaskModal';
import { WinModal } from '@/components/game/flying/components/WinModal/WinModal';
import { WinTaskModal } from '@/components/game/flying/components/WinTaskModal/WinTaskModal';
import { GameMode, PlayerColor, WinTaskOption } from '@/components/game/flying/types/game';
import LanguageSelector from '@/components/language-selector';
import SpecialEffects, {
  EffectType,
} from '@/components/game/flying/components/SpecialEffects/SpecialEffects';
import { useGlobal } from '@/contexts/GlobalContext';
import { useParams, useRouter } from 'next/navigation';
import Loading from '@/components/Loading';

interface gamePlayParams {
  isNewGame?: boolean;
  initialCustomMode?: any;
  initialGameMode?: GameMode;
}

const GamePlayPage: React.FC = () => {
  const params: gamePlayParams = useParams(); // 动态路由参数
  const { isNewGame = 1, initialCustomMode = '', initialGameMode = 'normal' } = params || {};
  const { playSound, translations, language } = useGlobal();
  const router = useRouter();

  const persistence = useGamePersistence();

  // 游戏状态
  const gameState = useGameState();

  // 任务管理
  const taskManagement = useTaskManagement();

  // 自定义模式
  const customModes = useCustomModes();

  // 基础状态
  const [boardPath, setBoardPath] = useState<PathCell[]>([]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 特效状态
  const [currentEffect, setCurrentEffect] = useState<EffectType>(null);

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
        playSound('stepDice');

        setTimeout(step, 300);
      };
      step();
    },
    [boardPath.length, gameState, playSound],
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

  // 初始化游戏
  useEffect(() => {
    const initializeGame = async () => {
      const path = createBoardPath();
      setBoardPath(path);

      // 加载自定义模式数据
      customModes.loadCustomModes();

      if (isNewGame) {
        // 开始新游戏
        gameState.setGameMode(initialGameMode);
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
        gameState.setCustomModeId(initialCustomMode?.id);

        // 清除之前的游戏存档
        gameState.clearGameSave(initialGameMode, initialCustomMode?.id);

        if (initialGameMode === 'custom' && initialCustomMode) {
          customModes.setCurrentCustomMode(initialCustomMode);
        }

        if (initialGameMode !== 'custom') {
          const translations = await loadTranslations(language);
          await taskManagement.loadTasks(initialGameMode, language, translations);
        }
      } else {
        // 加载保存的游戏状态
        const loaded = gameState.loadGameState(initialGameMode, initialCustomMode?.id);

        if (loaded) {
          if (initialGameMode === 'custom' && initialCustomMode) {
            customModes.setCurrentCustomMode(initialCustomMode);
          }

          if (initialGameMode !== 'custom') {
            const translations = await loadTranslations(language);
            await taskManagement.loadTasks(initialGameMode, language, translations);
          }
        } else {
          // 如果加载失败，开始新游戏
          gameState.setGameMode(initialGameMode);
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
          gameState.setCustomModeId(initialCustomMode?.id);

          if (initialGameMode === 'custom' && initialCustomMode) {
            customModes.setCurrentCustomMode(initialCustomMode);
          }

          if (initialGameMode !== 'custom') {
            const translations = await loadTranslations(language);
            await taskManagement.loadTasks(initialGameMode, language, translations);
          }
        }
      }
    };

    initializeGame();
  }, [initialGameMode, initialCustomMode, isNewGame, language]);

  useEffect(() => {
    if (gameState.gameState !== 'start' && gameState.gameMode) {
      taskManagement.loadTasks(gameState.gameMode, language);
    }
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

    // 播放掷骰子音效
    playSound('rollDice');

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
    router.back();
  }, [gameState, persistence]);

  if (taskManagement.isLoadingTasks) return <Loading />

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 relative">
      {/* 动态背景叠加层 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            gameState.currentPlayer === 'red'
              ? 'radial-gradient(ellipse at top right, rgba(239, 68, 68, 0.05), transparent 50%), radial-gradient(ellipse at bottom left, rgba(236, 72, 153, 0.05), transparent 50%)'
              : 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.05), transparent 50%), radial-gradient(ellipse at bottom left, rgba(99, 102, 241, 0.05), transparent 50%)',
        }}
      />
      {/* iOS 16 风格头部导航 */}
      <div className="sticky top-0 z-10 backdrop-blur-2xl border-b shadow-2xl transition-all duration-500 bg-white/70 border-white/20 shadow-gray-200/30 dark:bg-gray-900/70 dark:border-gray-700/20 dark:shadow-black/30">
        {/* 动态渐变叠加层 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              gameState.currentPlayer === 'red'
                ? 'linear-gradient(to right, rgba(239, 68, 68, 0.05), rgba(236, 72, 153, 0.05))'
                : 'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.05))',
          }}
        />
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* 返回按钮 */}
            <button
              onClick={() => router.back()}
              title={translations?.game.backToHome}
              className={`flex-shrink-0 p-2 sm:p-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 transform ${
                gameState.currentPlayer === 'red'
                  ? 'bg-red-100 hover:bg-red-200 text-red-600 shadow-red-200'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600 shadow-blue-200'
              } shadow-lg hover:shadow-xl`}
            >
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* 标题 */}
            <div className="flex-1 min-w-0 mx-3 sm:mx-4">
              <div className="text-center">
                <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black bg-gradient-to-r bg-clip-text text-transparent from-gray-900 via-gray-800 to-gray-700 dark:from-gray-100 dark:via-white dark:to-gray-200 transition-all duration-300 truncate">
                  {translations?.game.title}
                </h1>
                <p
                  className="text-xs sm:text-sm lg:text-base font-semibold transition-all duration-300 truncate animate-pulse"
                  style={{
                    color: gameState.currentPlayer === 'red' ? '#dc2626' : '#2563eb',
                  }}
                >
                  {gameState.gameMode === 'custom'
                    ? customModes.currentCustomMode?.name || '自定义模式'
                    : translations?.modes[gameState.gameMode].name}
                </p>
              </div>
            </div>

            {/* 控制器区域 */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <LanguageSelector />
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
              background:
                gameState.currentPlayer === 'red'
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(236, 72, 153, 0.9))'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(99, 102, 241, 0.9))',
              transform: 'translateY(0px)',
              animation: 'fadeInScale 0.6s ease-out, float 3s ease-in-out infinite',
            }}
          >
            <div
              className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full mr-2 sm:mr-3 bg-white shadow-lg transition-all duration-300"
              style={{
                animation: 'pulseGlow 2s ease-in-out infinite',
                boxShadow:
                  gameState.currentPlayer === 'red'
                    ? '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(239, 68, 68, 0.6)'
                    : '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.6)',
              }}
            ></div>
            <span className="text-base sm:text-lg lg:text-xl font-black text-white tracking-wide transition-all duration-300">
              {gameState.currentPlayer === 'red'
                ? translations?.game.redTurn
                : translations?.game.blueTurn}
            </span>
          </div>
        </div>

        {/* iOS 16 风格骰子区域 */}
        <div className="flex flex-col items-center space-y-6">
          {/* iOS 16 风格骰子显示 */}
          <div
            className="relative w-20 sm:w-24 lg:w-28 h-20 sm:h-24 lg:h-28 rounded-3xl shadow-2xl transition-all duration-500 transform hover:scale-110 backdrop-blur-xl border bg-white/90 border-white/50 shadow-gray-400/40 dark:bg-gray-800/90 dark:border-gray-600/50 dark:shadow-black/50"
            style={{
              background:
                gameState.currentPlayer === 'red'
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(236, 72, 153, 0.15))'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15))',
              animation: gameState.isRolling
                ? 'diceRoll 0.15s linear infinite, shake 0.1s ease-in-out infinite'
                : 'float 4s ease-in-out infinite',
              transformOrigin: 'center center',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wider transition-all duration-300"
                style={{
                  color: gameState.currentPlayer === 'red' ? '#dc2626' : '#2563eb',
                  textShadow:
                    gameState.currentPlayer === 'red'
                      ? '0 0 10px rgba(220, 38, 38, 0.5)'
                      : '0 0 10px rgba(37, 99, 235, 0.5)',
                  transform: gameState.isRolling ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {gameState.diceValue ?? '?'}
              </span>
            </div>
            {/* iOS 16 风格装饰性光泽效果 */}
            <div
              className="absolute top-2 sm:top-3 left-2 sm:left-3 w-3 sm:w-4 h-3 sm:h-4 bg-white/40 rounded-full blur-sm transition-all duration-300"
              style={{
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            ></div>
            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/20 rounded-full blur-sm"></div>
            {/* 发光边框效果 */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                boxShadow:
                  gameState.currentPlayer === 'red'
                    ? '0 0 30px rgba(239, 68, 68, 0.3), inset 0 0 30px rgba(239, 68, 68, 0.1)'
                    : '0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 30px rgba(59, 130, 246, 0.1)',
                animation: gameState.isRolling ? 'glowPulse 0.3s ease-in-out infinite' : 'none',
              }}
            ></div>
          </div>

          {/* iOS 16 风格掷骰子按钮 */}
          <button
            onClick={rollDice}
            disabled={
              gameState.isRolling ||
              gameState.isMoving ||
              gameState.gameState === 'task' ||
              taskManagement.isLoadingTasks
            }
            className="relative px-8 sm:px-10 py-4 sm:py-5 rounded-3xl font-black text-base sm:text-lg tracking-wide transition-all duration-500 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-2xl hover:shadow-3xl backdrop-blur-xl border text-white overflow-hidden"
            style={{
              background:
                gameState.currentPlayer === 'red'
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(236, 72, 153, 0.95))'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(99, 102, 241, 0.95))',
              borderColor:
                gameState.currentPlayer === 'red'
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(59, 130, 246, 0.3)',
              animation: gameState.isRolling ? 'buttonPulse 0.3s ease-in-out infinite' : 'none',
            }}
          >
            {/* 按钮发光背景动画 */}
            <div
              className="absolute inset-0 opacity-30 transition-opacity duration-300"
              style={{
                background:
                  gameState.currentPlayer === 'red'
                    ? 'radial-gradient(circle at center, rgba(255, 255, 255, 0.3), transparent 70%)'
                    : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.3), transparent 70%)',
                animation: 'ripple 2s ease-in-out infinite',
              }}
            ></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {gameState.isRolling && (
                <div
                  className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  style={{
                    animation: 'spinFast 0.5s linear infinite',
                  }}
                ></div>
              )}
              {gameState.isMoving
                ? translations?.common.moving
                : gameState.isRolling
                  ? translations?.common.rolling
                  : taskManagement.isLoadingTasks
                    ? translations?.common.preparing
                    : translations?.common.rollDice}
            </span>
          </button>
        </div>

        {/* iOS 16 风格游戏棋盘 */}
        <div className="backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all duration-500 max-w-2xl mx-auto hover:shadow-3xl bg-white/80 border-white/30 shadow-gray-300/40 dark:bg-gray-900/80 dark:border-gray-700/30 dark:shadow-black/40">
          <GameBoard
            boardPath={boardPath}
            isMoving={gameState.isMoving}
            redPosition={gameState.redPosition}
            bluePosition={gameState.bluePosition}
            currentPlayer={gameState.currentPlayer}
          />
        </div>
      </div>

      {gameState.gameState === 'task' && gameState.currentTask && (
        <TaskModal
          taskType={gameState.taskType!}
          currentTask={gameState.currentTask}
          onTaskComplete={handleTaskComplete}
        />
      )}

      {gameState.gameState === 'win' && gameState.winner && (
        <WinModal
          winner={gameState.winner}
          onRestartFromWin={restartFromWin}
          onWinTaskSelect={handleWinTaskSelect}
          winTaskOptions={gameState.winTaskOptions}
        />
      )}

      {gameState.gameState === 'winTask' && gameState.selectedWinTask && gameState.winner && (
        <WinTaskModal
          winner={gameState.winner}
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
        duration={1000}
        effectType={currentEffect}
        onComplete={() => setCurrentEffect(null)}
      />
    </div>
  );
};

export default GamePlayPage;

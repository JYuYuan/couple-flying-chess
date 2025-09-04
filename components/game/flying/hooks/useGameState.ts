import { useState, useCallback, useEffect } from 'react';
import type {
  GameState,
  GameMode,
  PlayerColor,
  CurrentTask,
  TaskType,
  WinTaskOption,
} from '../types/game';
import { useGamePersistence } from './useGamePersistence';

export function useGameState() {
  const persistence = useGamePersistence();
  const [gameState, setGameState] = useState<GameState>('start');
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>('red');
  const [redPosition, setRedPosition] = useState(0);
  const [bluePosition, setBluePosition] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentTask, setCurrentTask] = useState<CurrentTask | null>(null);
  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [winTaskOptions, setWinTaskOptions] = useState<WinTaskOption[]>([]);
  const [selectedWinTask, setSelectedWinTask] = useState<WinTaskOption | null>(null);
  const [customModeId, setCustomModeId] = useState<string | undefined>(undefined);

  // 自动保存游戏状态
  useEffect(() => {
    if (gameState !== 'start') {
      persistence.saveGame(
        gameMode,
        gameState,
        currentPlayer,
        redPosition,
        bluePosition,
        diceValue,
        currentTask,
        taskType,
        winner,
        winTaskOptions,
        selectedWinTask,
        customModeId
      );
    }
  }, [
    gameState,
    gameMode,
    currentPlayer,
    redPosition,
    bluePosition,
    diceValue,
    currentTask,
    taskType,
    winner,
    winTaskOptions,
    selectedWinTask,
    customModeId,
    persistence
  ]);

  const switchTurn = useCallback(() => {
    // 重置骰子状态
    setDiceValue(null);
    setIsRolling(false);
    // 重置任务状态
    setCurrentTask(null);
    setTaskType(null);
    // 切换玩家
    setCurrentPlayer((prev) => (prev === 'red' ? 'blue' : 'red'));
  }, []);

  const resetGame = useCallback(() => {
    setGameState('start');
    setGameMode('normal');
    setCurrentPlayer('red');
    setRedPosition(0);
    setBluePosition(0);
    setDiceValue(null);
    setIsRolling(false);
    setIsMoving(false);
    setCurrentTask(null);
    setTaskType(null);
    setWinner(null);
    setWinTaskOptions([]);
    setSelectedWinTask(null);
    setCustomModeId(undefined);
  }, []);

  const loadGameState = useCallback((
    mode: GameMode,
    customId?: string
  ) => {
    const savedData = persistence.loadGame(mode, customId);
    if (savedData) {
      setGameState(savedData.gameState);
      setGameMode(savedData.gameMode);
      setCurrentPlayer(savedData.currentPlayer);
      setRedPosition(savedData.redPosition);
      setBluePosition(savedData.bluePosition);
      setDiceValue(savedData.diceValue);
      setCurrentTask(savedData.currentTask);
      setTaskType(savedData.taskType);
      setWinner(savedData.winner);
      setWinTaskOptions(savedData.winTaskOptions);
      setSelectedWinTask(savedData.selectedWinTask);
      setCustomModeId(savedData.customModeId);
      return true;
    }
    return false;
  }, [persistence]);

  const clearGameSave = useCallback((mode: GameMode, customId?: string) => {
    persistence.clearGame(mode, customId);
  }, [persistence]);

  const hasGameSave = useCallback((mode: GameMode, customId?: string) => {
    return persistence.hasGameSave(mode, customId);
  }, [persistence]);

  const getSavedGameData = useCallback((mode: GameMode, customId?: string) => {
    return persistence.loadGame(mode, customId);
  }, [persistence]);

  return {
    // State
    gameState,
    setGameState,
    gameMode,
    setGameMode,
    currentPlayer,
    setCurrentPlayer,
    redPosition,
    setRedPosition,
    bluePosition,
    setBluePosition,
    diceValue,
    setDiceValue,
    isRolling,
    setIsRolling,
    currentTask,
    setCurrentTask,
    taskType,
    setTaskType,
    winner,
    setWinner,
    isMoving,
    setIsMoving,
    winTaskOptions,
    setWinTaskOptions,
    selectedWinTask,
    setSelectedWinTask,
    customModeId,
    setCustomModeId,
    // Actions
    switchTurn,
    resetGame,
    loadGameState,
    clearGameSave,
    hasGameSave,
    getSavedGameData,
  };
}

import { useCallback, useEffect } from 'react';
import type { GameState, GameMode, PlayerColor, CurrentTask, TaskType, WinTaskOption } from '../types/game';

export interface GameSaveData {
  gameState: GameState;
  gameMode: GameMode;
  currentPlayer: PlayerColor;
  redPosition: number;
  bluePosition: number;
  diceValue: number | null;
  currentTask: CurrentTask | null;
  taskType: TaskType | null;
  winner: PlayerColor | null;
  winTaskOptions: WinTaskOption[];
  selectedWinTask: WinTaskOption | null;
  timestamp: number;
  customModeId?: string;
}

export function useGamePersistence() {
  const getSaveKey = useCallback((gameMode: GameMode, customModeId?: string) => {
    if (gameMode === 'custom' && customModeId) {
      return `couple-flying-chess-save-custom-${customModeId}`;
    }
    return `couple-flying-chess-save-${gameMode}`;
  }, []);

  const saveGame = useCallback((
    gameMode: GameMode,
    gameState: GameState,
    currentPlayer: PlayerColor,
    redPosition: number,
    bluePosition: number,
    diceValue: number | null,
    currentTask: CurrentTask | null,
    taskType: TaskType | null,
    winner: PlayerColor | null,
    winTaskOptions: WinTaskOption[],
    selectedWinTask: WinTaskOption | null,
    customModeId?: string
  ) => {
    if (typeof window === 'undefined') return;
    
    // 只保存进行中的游戏状态
    if (gameState === 'start') return;

    const saveData: GameSaveData = {
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
      timestamp: Date.now(),
      customModeId
    };

    const key = getSaveKey(gameMode, customModeId);
    try {
      localStorage.setItem(key, JSON.stringify(saveData));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }, [getSaveKey]);

  const loadGame = useCallback((gameMode: GameMode, customModeId?: string): GameSaveData | null => {
    if (typeof window === 'undefined') return null;

    const key = getSaveKey(gameMode, customModeId);
    try {
      const savedData = localStorage.getItem(key);
      if (!savedData) return null;

      const gameData: GameSaveData = JSON.parse(savedData);
      
      // 检查存档是否过期（24小时）
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      if (now - gameData.timestamp > dayInMs) {
        localStorage.removeItem(key);
        return null;
      }

      return gameData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }, [getSaveKey]);

  const clearGame = useCallback((gameMode: GameMode, customModeId?: string) => {
    if (typeof window === 'undefined') return;

    const key = getSaveKey(gameMode, customModeId);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear game:', error);
    }
  }, [getSaveKey]);

  const hasGameSave = useCallback((gameMode: GameMode, customModeId?: string): boolean => {
    if (typeof window === 'undefined') return false;

    const saveData = loadGame(gameMode, customModeId);
    return saveData !== null;
  }, [loadGame]);

  const getAllGameSaves = useCallback((): Array<{key: string, data: GameSaveData}> => {
    if (typeof window === 'undefined') return [];

    const saves: Array<{key: string, data: GameSaveData}> = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('couple-flying-chess-save-')) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const gameData: GameSaveData = JSON.parse(data);
              saves.push({ key, data: gameData });
            } catch (e) {
              // 忽略解析错误的数据
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to get all game saves:', error);
    }

    return saves;
  }, []);

  const cleanupOldSaves = useCallback(() => {
    if (typeof window === 'undefined') return;

    const saves = getAllGameSaves();
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    saves.forEach(({ key, data }) => {
      if (now - data.timestamp > dayInMs) {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Failed to cleanup old save:', error);
        }
      }
    });
  }, [getAllGameSaves]);

  // 定期清理过期存档
  useEffect(() => {
    cleanupOldSaves();
    
    // 每小时清理一次
    const interval = setInterval(cleanupOldSaves, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [cleanupOldSaves]);

  return {
    saveGame,
    loadGame,
    clearGame,
    hasGameSave,
    getAllGameSaves,
    cleanupOldSaves
  };
}
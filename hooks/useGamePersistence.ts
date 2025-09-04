import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameMode, PlayerColor } from '@/components/game/flying/types/game';

type TaskType = 'normal' | 'special' | 'challenge' | 'custom' | null;

interface Task {
  id: string;
  text: string;
  type: TaskType;
  completed?: boolean;
}

export interface SavedGameState {
  gameMode: GameMode;
  currentPlayer: PlayerColor;
  redPosition: number;
  bluePosition: number;
  diceValue: number | null;
  isRolling: boolean;
  isMoving: boolean;
  taskQueue: Task[];
  currentTask: Task | null;
  taskType: TaskType;
  winner: PlayerColor | null;
  customModeId?: string;
  timestamp: number;
  gameStarted: boolean;
}

const GAME_STORAGE_KEY = 'couple-flying-chess-saved-game';
const GAME_STATE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface UseGamePersistenceProps {
  // Game state
  gameMode: GameMode;
  currentPlayer: PlayerColor;
  redPosition: number;
  bluePosition: number;
  diceValue: number | null;
  isRolling: boolean;
  isMoving: boolean;
  taskQueue: Task[];
  currentTask: Task | null;
  taskType: TaskType;
  winner: PlayerColor | null;
  gameStarted: boolean;
  customModeId?: string;
  
  // Callbacks
  onContinue: (savedState: SavedGameState) => void;
  onNewGame: () => void;
  onGameStateChange?: (state: Partial<SavedGameState>) => void;
}

export function useGamePersistence({
  // Game state
  gameMode,
  currentPlayer,
  redPosition,
  bluePosition,
  diceValue,
  isRolling,
  isMoving,
  taskQueue,
  currentTask,
  taskType,
  winner,
  gameStarted,
  customModeId,
  
  // Callbacks
  onContinue,
  onNewGame,
  onGameStateChange,
}: UseGamePersistenceProps) {
  const [savedGame, setSavedGame] = useState<SavedGameState | null>(null);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const hasLoadedFromStorage = useRef(false);
  const lastSaveTime = useRef<number>(0);
  const SAVE_DEBOUNCE_TIME = 1000; // 1 second debounce

  // Current game state
  const currentGameState = useMemo<Omit<SavedGameState, 'timestamp'>>(() => ({
    gameMode,
    currentPlayer,
    redPosition,
    bluePosition,
    diceValue,
    isRolling,
    isMoving,
    taskQueue,
    currentTask,
    taskType,
    winner,
    gameStarted,
    customModeId,
  }), [
    gameMode,
    currentPlayer,
    redPosition,
    bluePosition,
    diceValue,
    isRolling,
    isMoving,
    taskQueue,
    currentTask,
    taskType,
    winner,
    gameStarted,
    customModeId,
  ]);

  // Save game state to localStorage
  const saveGameState = useCallback((state: Partial<SavedGameState> = {}) => {
    const now = Date.now();
    
    // Debounce rapid saves
    if (now - lastSaveTime.current < SAVE_DEBOUNCE_TIME) {
      return;
    }
    
    lastSaveTime.current = now;
    
    const gameToSave: Omit<SavedGameState, 'timestamp'> = {
      ...currentGameState,
      ...state,
      // Always reset these states when saving
      isRolling: false,
      isMoving: false,
    };

    try {
      localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({
        ...gameToSave,
        timestamp: now,
      }));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [currentGameState]);

  // Clear saved game
  const clearSavedGame = useCallback(() => {
    localStorage.removeItem(GAME_STORAGE_KEY);
    setSavedGame(null);
  }, []);

  // Load saved game from localStorage
  const loadSavedGame = useCallback((): SavedGameState | null => {
    try {
      const saved = localStorage.getItem(GAME_STORAGE_KEY);
      if (!saved) return null;

      const parsed = JSON.parse(saved) as SavedGameState;
      
      // Check if the game was saved within the expiry time
      if (Date.now() - parsed.timestamp > GAME_STATE_EXPIRY) {
        clearSavedGame();
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to load saved game:', error);
      clearSavedGame();
      return null;
    }
  }, [clearSavedGame]);

  // Handle continue game
  const handleContinueGame = useCallback(() => {
    if (!savedGame) return;
    
    // Notify parent component to update state
    onContinue(savedGame);
    
    // Save the continued game state
    saveGameState({
      ...savedGame,
      timestamp: Date.now(), // Update timestamp when continuing
    });
    
    setShowContinueModal(false);
  }, [savedGame, onContinue, saveGameState]);

  // Handle new game
  const handleNewGame = useCallback(() => {
    clearSavedGame();
    setShowContinueModal(false);
    onNewGame();
  }, [clearSavedGame, onNewGame]);

  // Check for saved game on mount
  useEffect(() => {
    if (hasLoadedFromStorage.current) return;
    
    const loadedGame = loadSavedGame();
    if (loadedGame) {
      setSavedGame(loadedGame);
      setShowContinueModal(true);
    }
    
    hasLoadedFromStorage.current = true;
  }, [loadSavedGame]);

  // Auto-save when game state changes
  useEffect(() => {
    if (!gameStarted) return;
    
    const timer = setTimeout(() => {
      saveGameState();
    }, SAVE_DEBOUNCE_TIME);
    
    return () => clearTimeout(timer);
  }, [gameStarted, saveGameState, currentGameState]);

  // Expose methods and state
  return {
    hasSavedGame: savedGame !== null,
    showContinueModal,
    continueGame: handleContinueGame,
    startNewGame: handleNewGame,
    saveGameState,
    clearSavedGame,
    hideContinueModal: () => setShowContinueModal(false),
    loadSavedGame,
  };
}

// Helper function to save game state (for external use)
export function saveGameStateExternally(state: Omit<SavedGameState, 'timestamp'>) {
  try {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({
      ...state,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Failed to save game state externally:', error);
  }
}

// Helper function to clear saved game (for external use)
export function clearSavedGameExternally() {
  try {
    localStorage.removeItem(GAME_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear saved game externally:', error);
  }
}

// Helper function to load saved game (for external use)
export function loadSavedGameExternally(): SavedGameState | null {
  try {
    const saved = localStorage.getItem(GAME_STORAGE_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved) as SavedGameState;
    
    // Check if the game was saved within the expiry time
    if (Date.now() - parsed.timestamp > GAME_STATE_EXPIRY) {
      localStorage.removeItem(GAME_STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load saved game externally:', error);
    return null;
  }
}

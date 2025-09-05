export type GameState = 'start' | 'playing' | 'task' | 'win' | 'winTask' | 'moving' | 'customMode';
export type GameMode =
  | 'normal'
  | 'love'
  | 'couple'
  | 'advanced'
  | 'intimate'
  | 'mixed'
  | 'hetero'
  | 'daily'
  | 'food'
  | 'fitness'
  | 'creative'
  | 'romantic'
  | 'game'
  | 'adult'
  | 'master-slave-sex'
  | 'custom'
  | 'roleplay-workplace'
  | 'roleplay-fantasy'
  | 'roleplay-uniform'
  | 'roleplay-ancient';
export type PlayerColor = 'red' | 'blue';
export type TaskType = 'star' | 'trap' | 'collision';

export interface CurrentTask {
  description: string;
  executor: PlayerColor;
  target: PlayerColor;
  durationMs?: number;
}

export interface WinTaskOption {
  id: number;
  description: string;
}

export interface CustomMode {
  id: string;
  name: string;
  type: 'ai' | 'custom';
  description: string;
  tasks: string[];
  createdAt: number;
}

export type NewCustomMode = {
  name: string;
  type: 'ai' | 'custom';
  description: string;
  tasks: string[];
};

export interface TaskSource {
  mode: GameMode;
  taskIndex: number;
  task: string;
}

export interface DeepSeekApiConfig {
  apiKey?: string;
  taskNum: string;
  keyword?: string;
  tasks: string[];
  role?: string;
}

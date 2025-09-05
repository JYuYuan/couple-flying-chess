import { useCallback, useState } from 'react';
import type { GameMode } from '../types/game';
import { shuffleArray } from '../utils/game-utils';
import { Language, Translations } from '@/lib/i18n';
import { gameModes } from '@/components/game/flying/constants/game-config';

export function useTaskManagement() {
  const [taskQueue, setTaskQueue] = useState<string[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [availableModeTasks, setAvailableModeTasks] = useState<Record<GameMode, string[]>>(
    {} as Record<GameMode, string[]>,
  );

  const loadTasks = useCallback(
    async (mode: GameMode, lang: Language, translations?: Translations) => {
      setIsLoadingTasks(true);
      try {
        let response = await fetch(`/tasks/${mode}-${lang}.json`);
        if (!response.ok && lang !== 'zh') {
          response = await fetch(`/tasks/${mode}.json`);
        }
        if (!response.ok) {
          throw new Error(`Failed to load tasks for mode: ${mode}`);
        }
        const tasks: string[] = await response.json();
        setTaskQueue(shuffleArray(tasks));
      } catch (error) {
        console.error('Error loading tasks:', error);
        const fallbackTasks = translations
          ? [translations.tasks.emptyQueue]
          : ['做一个鬼脸', '给对方一个赞美', '分享一个小秘密'];
        setTaskQueue(shuffleArray(fallbackTasks));
      } finally {
        setIsLoadingTasks(false);
      }
    },
    [],
  );

  const loadAllTasksForSelection = useCallback(async (language: Language) => {
    const modes: GameMode[] = [...gameModes];
    const tasks: Record<GameMode, string[]> = {} as Record<GameMode, string[]>;

    for (const mode of modes) {
      try {
        let response = await fetch(`/tasks/${mode}-${language}.json`);
        if (!response.ok && language !== 'zh') {
          response = await fetch(`/tasks/${mode}.json`);
        }
        if (response.ok) {
          tasks[mode] = await response.json();
        } else {
          tasks[mode] = [];
        }
      } catch (error) {
        console.error(`Error loading tasks for ${mode}:`, error);
        tasks[mode] = [];
      }
    }
    setAvailableModeTasks(tasks);
  }, []);

  const generateWinTasks = useCallback(
    (translations?: Translations) => {
      const availableTasks =
        taskQueue.length > 0
          ? taskQueue
          : [
              translations?.tasks.emptyQueue || '给对方一个温暖的拥抱',
              '说出三个对方的优点',
              '一起做一件浪漫的事',
            ];

      const shuffled = shuffleArray([...availableTasks]);
      return shuffled.slice(0, 3).map((task, index) => ({
        id: index + 1,
        description: task,
      }));
    },
    [taskQueue],
  );

  return {
    taskQueue,
    setTaskQueue,
    isLoadingTasks,
    availableModeTasks,
    loadTasks,
    loadAllTasksForSelection,
    generateWinTasks,
  };
}

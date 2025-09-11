import { useCallback, useEffect, useState } from 'react';
import type { CurrentTask, GameState, PlayerColor, TaskType } from '../types/game';
import { PathCell } from '@/lib/game-config';
import { Translations } from '@/lib/i18n';

import { getSuggestedTaskTime } from '@/components/game/flying/utils/timeManager';

export function useGameLogic(
  boardPath: PathCell[],
  redPosition: number,
  bluePosition: number,
  taskQueue: string[],
  setTaskQueue: (tasks: string[]) => void,
  setCurrentTask: (task: CurrentTask | null) => void,
  setTaskType: (type: TaskType | null) => void,
  setGameState: (state: GameState) => void,
  setWinner: (winner: PlayerColor | null) => void,
  switchTurn: () => void,
  generateWinTasks: () => void,
  animateTaskOutcomeMove: (
    targetPosition: number,
    player: PlayerColor,
    originalPosition: number,
  ) => void,
) {

  // 确定任务执行者
  const determineExecutor = useCallback(
    (type: TaskType, playerOnCell: PlayerColor): PlayerColor => {
      if (type === 'trap') {
        return playerOnCell; // 陷阱：当前玩家执行
      } else {
        // 星星或碰撞：对方玩家执行
        return playerOnCell === 'red' ? 'blue' : 'red';
      }
    },
    [],
  );

 

  const triggerTask = useCallback(
    (type: TaskType, playerOnCell: PlayerColor, translations?: Translations) => {
      if (taskQueue.length === 0) {
        console.warn('Task queue is empty!');
        const emptyMessage = translations?.tasks.emptyQueue || '任务队列空了！休息一下吧！';
        setCurrentTask({ description: emptyMessage, executor: playerOnCell, target: playerOnCell });
        setGameState('task');
        return;
      }

      const currentTaskDescription = taskQueue[0];
      setTaskQueue([...taskQueue.slice(1), taskQueue[0]]);

      const executor = determineExecutor(type, playerOnCell);
      const durationMs = getSuggestedTaskTime(currentTaskDescription).time;

      setCurrentTask({
        executor,
        durationMs,
        target: playerOnCell,
        description: currentTaskDescription.replace('$time', ''),
      });
      setGameState('task');
    },
    [
      taskQueue,
      setTaskQueue,
      setCurrentTask,
      setGameState,
      determineExecutor
    ],
  );

  const checkSpecialEvents = useCallback(
    (newPosition: number, player: PlayerColor) => {
      const otherPlayerPosition = player === 'red' ? bluePosition : redPosition;

      // 检查碰撞：双方不在起点或终点，且位置相同
      if (
        newPosition > 0 &&
        newPosition < boardPath.length - 1 &&
        newPosition === otherPlayerPosition
      ) {
        console.log('Collision detected at position:', newPosition);
        setTaskType('collision');
        triggerTask('collision', player);
        return;
      }

      // 只有正好到达终点才获胜
      if (newPosition === boardPath.length - 1) {
        setWinner(player);
        generateWinTasks();
        setGameState('win');
        return;
      }

      const cellType = boardPath[newPosition]?.type;
      if (cellType === 'star') {
        setTimeout(() => {
          setTaskType('star');
          triggerTask('star', player);
        }, 300);
      } else if (cellType === 'trap') {
        setTimeout(() => {
          setTaskType('trap');
          triggerTask('trap', player);
        }, 300);
      } else {
        setTimeout(switchTurn, 300);
      }
    },
    [
      boardPath,
      bluePosition,
      redPosition,
      setTaskType,
      triggerTask,
      setWinner,
      generateWinTasks,
      setGameState,
      switchTurn,
    ],
  );

  // 计算奖励或惩罚步数
  const calculateSteps = useCallback((isCompleted: boolean) => {
    const rewardSteps = Math.floor(Math.random() * 4);
    const penaltySteps = Math.floor(Math.random() * 4) + 3;
    return isCompleted ? rewardSteps : -penaltySteps;
  }, []);

  // 获取玩家当前位置
  const getPlayerPosition = useCallback(
    (player: PlayerColor) => {
      return player === 'red' ? redPosition : bluePosition;
    },
    [redPosition, bluePosition],
  );

  // 获取玩家移动消息
  const getMovementMessage = useCallback(
    (player: PlayerColor, steps: number, translations: Translations) => {
      if (steps === 0) {
        return player === 'red' ? translations.toast.redStay : translations.toast.blueStay;
      } else if (steps > 0) {
        const template =
          player === 'red' ? translations.toast.redForward : translations.toast.blueForward;
        return template.replace('{steps}', steps.toString());
      } else {
        const template =
          player === 'red' ? translations.toast.redBackward : translations.toast.blueBackward;
        return template.replace('{steps}', Math.abs(steps).toString());
      }
    },
    [],
  );

  // 处理碰撞任务结果
  const handleCollisionTaskResult = useCallback(
    (
      isCompleted: boolean,
      executorPlayer: PlayerColor,
      translations: Translations,
      onShowToast: (message: string, type: 'success' | 'error') => void,
    ) => {
      let toastMessage = '';
      let toastType: 'success' | 'error';

      if (!isCompleted) {
        toastMessage =
          executorPlayer === 'red'
            ? translations.toast.redFailedToStart
            : translations.toast.blueFailedToStart;
        toastType = 'error';
        setCurrentTask(null);
        setTaskType(null);
        onShowToast(toastMessage, toastType);
        setGameState('playing');
        switchTurn();
        return { resetToStart: true, player: executorPlayer };
      } else {
        toastMessage =
          executorPlayer === 'red'
            ? translations.toast.redCompleted
            : translations.toast.blueCompleted;
        toastType = 'success';
        setCurrentTask(null);
        setTaskType(null);
        onShowToast(toastMessage, toastType);
        setGameState('playing');
        switchTurn();
        return { resetToStart: false };
      }
    },
    [setCurrentTask, setTaskType, setGameState, switchTurn],
  );

  const handleTaskComplete = useCallback(
    (
      isCompleted: boolean,
      currentTask: CurrentTask | null,
      taskType: TaskType | null,
      translations: Translations,
      onShowToast: (message: string, type: 'success' | 'error') => void,
    ) => {
      if (!currentTask || !translations) return;

      const activePlayer = currentTask.executor;
      const currentPosition = getPlayerPosition(activePlayer);
      const maxPosition = boardPath.length - 1;
      let finalPosition = currentPosition;
      let toastMessage = '';
      let toastType: 'success' | 'error' = 'success';

      if (taskType === 'star' || taskType === 'trap') {
        const steps = calculateSteps(isCompleted);

        if (steps >= 0) {
          // 处理前进或原地不动
          let newPosition = currentPosition + steps;
          if (newPosition > maxPosition) {
            const overshoot = newPosition - maxPosition;
            newPosition = maxPosition - overshoot;
            newPosition = Math.max(0, newPosition);
          }
          finalPosition = newPosition;
          toastType = 'success';
        } else {
          // 处理后退
          finalPosition = Math.max(currentPosition + steps, 0);
          toastType = 'error';
        }

        toastMessage = getMovementMessage(activePlayer, steps, translations);
      } else if (taskType === 'collision') {
        return handleCollisionTaskResult(isCompleted, activePlayer, translations, onShowToast);
      }

      onShowToast(toastMessage, toastType);

      if (finalPosition !== currentPosition && (taskType === 'star' || taskType === 'trap')) {
        animateTaskOutcomeMove(finalPosition, activePlayer, currentPosition);
      } else {
        setCurrentTask(null);
        setTaskType(null);
        setGameState('playing');
        if (finalPosition === maxPosition && (taskType === 'star' || taskType === 'trap')) {
          setWinner(activePlayer);
          setGameState('win');
        } else {
          switchTurn();
        }
      }

      return { resetToStart: false };
    },
    [
      getPlayerPosition,
      calculateSteps,
      getMovementMessage,
      handleCollisionTaskResult,
      boardPath.length,
      setCurrentTask,
      setTaskType,
      setGameState,
      setWinner,
      switchTurn,
      animateTaskOutcomeMove,
    ],
  );

  return {
    triggerTask,
    checkSpecialEvents,
    handleTaskComplete,
  };
}

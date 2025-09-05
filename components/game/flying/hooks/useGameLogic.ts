import { useCallback } from 'react';
import type { CurrentTask, GameState, PlayerColor, TaskType } from '../types/game';
import { PathCell } from '@/lib/game-config';
import { Translations } from '@/lib/i18n';
import { randomMs } from '@/lib/utils';

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

      let executor: PlayerColor;
      if (type === 'star') {
        executor = playerOnCell === 'red' ? 'blue' : 'red';
      } else if (type === 'trap') {
        executor = playerOnCell;
      } else {
        executor = playerOnCell === 'red' ? 'blue' : 'red';
      }

      // 从任务描述中提取时间信息并转换为毫秒
      let durationMs: number | undefined;
      if (currentTaskDescription.indexOf('$time') > -1)
        durationMs = randomMs(30 * 1000, 3 * 60 * 1000);

      setCurrentTask({
        executor,
        durationMs,
        target: playerOnCell,
        description: currentTaskDescription.replace('$time', ''),
      });
      setGameState('task');
    },
    [taskQueue, setTaskQueue, setCurrentTask, setGameState],
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
      const currentPosition = activePlayer === 'red' ? redPosition : bluePosition;
      const maxPosition = boardPath.length - 1;
      let finalPosition = currentPosition;
      let toastMessage = '';
      let toastType: 'success' | 'error' = 'success';

      if (taskType === 'star' || taskType === 'trap') {
        const rewardSteps = Math.floor(Math.random() * 4);
        const penaltySteps = Math.floor(Math.random() * 4) + 3;

        if (isCompleted) {
          let newPosition = currentPosition + rewardSteps;
          if (newPosition > maxPosition) {
            const overshoot = newPosition - maxPosition;
            newPosition = maxPosition - overshoot;
            newPosition = Math.max(0, newPosition);
          }
          finalPosition = newPosition;

          if (rewardSteps === 0) {
            toastMessage =
              activePlayer === 'red' ? translations.toast.redStay : translations.toast.blueStay;
          } else {
            const template =
              activePlayer === 'red'
                ? translations.toast.redForward
                : translations.toast.blueForward;
            toastMessage = template.replace('{steps}', rewardSteps.toString());
          }
          toastType = 'success';
        } else {
          finalPosition = Math.max(currentPosition - penaltySteps, 0);
          const template =
            activePlayer === 'red'
              ? translations.toast.redBackward
              : translations.toast.blueBackward;
          toastMessage = template.replace('{steps}', penaltySteps.toString());
          toastType = 'error';
        }
      } else if (taskType === 'collision') {
        const executorPlayer = currentTask.executor;
        if (!isCompleted) {
          if (executorPlayer === 'red') {
            // setRedPosition(0); // 这个需要在父组件处理
            toastMessage = translations.toast.redFailedToStart;
          } else {
            // setBluePosition(0); // 这个需要在父组件处理
            toastMessage = translations.toast.blueFailedToStart;
          }
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
      redPosition,
      bluePosition,
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

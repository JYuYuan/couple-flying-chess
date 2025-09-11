import { useCallback, useEffect, useState } from 'react';
import type { CurrentTask, PlayerColor, TaskType } from '../flying/types/game';
import { useStableCallback } from '@/hooks/use-performance';
import { getSuggestedTaskTime } from '../flying/utils/timeManager';

export interface WheelResult {
  type: 'normal' | 'star' | 'trap' | 'bonus';
  player: PlayerColor;
}

export function useWheelGameLogic(
  currentPlayer: PlayerColor,
  setCurrentTask: (task: CurrentTask | null) => void,
  setTaskType: (type: TaskType | null) => void,
  setGameState: (state: any) => void,
  switchTurn: () => void,
  playSound: (
    sound: 'bgm' | 'rollDice' | 'stepDice' | 'countDown' | 'stopDice' | 'wheelSpin' | 'ding',
  ) => void,
  showToast?: (message: string, type?: 'success' | 'error') => void,
  taskQueue?: string[],
  setTaskQueue?: (queue: string[]) => void,
) {
  const [wheelResult, setWheelResult] = useState<WheelResult | null>(null);

  // 确定任务执行者（参考飞行棋逻辑）
  const determineExecutor = useCallback(
    (type: 'normal' | 'star' | 'trap' | 'bonus', playerOnCell: PlayerColor): PlayerColor => {
      if (type === 'trap') {
        return playerOnCell; // 陷阱：当前玩家执行
      } else {
        // 星星、奖励或碰撞：对方玩家执行
        return playerOnCell === 'red' ? 'blue' : 'red';
      }
    },
    [],
  );

  // 触发任务（参考飞行棋逻辑）
  const triggerTask = useCallback(
    (
      type: 'normal' | 'star' | 'trap' | 'bonus',
      playerOnCell: PlayerColor,
      taskFromWheel?: string,
    ) => {
      // 如果有任务队列，使用队列中的任务
      let currentTaskDescription = taskFromWheel || '';

      if (taskQueue && taskQueue.length > 0) {
        currentTaskDescription = taskQueue[0];
        // 更新任务队列：把第一个任务移到最后
        if (setTaskQueue) {
          setTaskQueue([...taskQueue.slice(1), taskQueue[0]]);
        }
      } else if (taskQueue && taskQueue.length === 0) {
        // 队列为空的处理
        const emptyMessage = '任务队列空了！休息一下吧！';
        setCurrentTask({ description: emptyMessage, executor: playerOnCell, target: playerOnCell });
        setGameState('task');
        return;
      }

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
      determineExecutor,
      calculateTaskDuration,
    ],
  );
  // 处理转盘结果
  const handleWheelResult = useStableCallback((type: 'normal' | 'star' | 'trap') => {
    const result: WheelResult = {
      type,
      player: currentPlayer,
    };

    setWheelResult(result);

    // 根据转盘结果类型执行不同逻辑
    switch (type) {
      case 'star':
        // 幸运星：获得额外机会，继续当前玩家回合
        playSound('ding');
        showToast?.('🌟 幸运星！完成任务后可以继续转动！', 'success');
        triggerTask('star', currentPlayer);
        setTaskType('star');
        break;

      case 'trap':
        // 陷阱：必须完成任务，否则跳过回合
        playSound('ding');
        showToast?.('💥 陷阱！必须完成任务！', 'error');
        triggerTask('trap', currentPlayer);
        setTaskType('trap');
        break;

      case 'normal':
      default:
        // 普通任务
        playSound('rollDice');
        // triggerTask('normal', currentPlayer, task);
        setTaskType(null);
        break;
    }
  });

  // 处理任务完成
  const handleTaskComplete = useStableCallback((isCompleted: boolean) => {
    if (!wheelResult) return;

    const { type } = wheelResult;

    if (isCompleted) {
      switch (type) {
        case 'star':
          // 幸运星完成：继续当前玩家回合
          playSound('ding');
          showToast?.('任务完成！你可以继续转动转盘！', 'success');
          setGameState('playing');
          // 不切换回合
          break;

        case 'trap':
          // 陷阱完成：正常切换回合
          playSound('ding');
          showToast?.('成功完成陷阱任务！', 'success');
          setGameState('playing');
          switchTurn();
          break;

        case 'normal':
        default:
          // 普通任务完成：正常切换回合
          playSound('ding');
          showToast?.('任务完成！', 'success');
          setGameState('playing');
          switchTurn();
          break;
      }
    } else {
      switch (type) {
        case 'star':
          // 幸运星失败：跳过回合
          playSound('stepDice');
          showToast?.('任务失败，跳过回合！', 'error');
          setGameState('playing');
          switchTurn();
          break;

        case 'trap':
          // 陷阱失败：跳过两个回合（实际上跳过下一个回合）
          playSound('stepDice');
          showToast?.('陷阱任务失败！跳过下一个回合！', 'error');
          setGameState('playing');
          switchTurn(); // 切换到对方
          setTimeout(() => {
            switchTurn(); // 立即切换回当前玩家，实现跳过效果
          }, 100);
          break;

        case 'normal':
        default:
          // 普通任务失败：正常切换回合
          playSound('stepDice');
          showToast?.('任务失败！', 'error');
          setGameState('playing');
          switchTurn();
          break;
      }
    }

    // 清理状态
    setCurrentTask(null);
    setTaskType(null);
    setWheelResult(null);
  });

  // 重置转盘结果
  const resetWheelResult = useStableCallback(() => {
    setWheelResult(null);
  });

  return {
    wheelResult,
    handleWheelResult,
    handleTaskComplete,
    resetWheelResult,
  };
}

import { useCallback } from 'react';
import type { PlayerColor } from '../types/game';
import { PathCell } from '@/lib/game-config';
import { useGlobal } from '@/contexts/GlobalContext';

export function usePlayerMovement(
  boardPath: PathCell[],
  redPosition: number,
  bluePosition: number,
  setRedPosition: (pos: number) => void,
  setBluePosition: (pos: number) => void,
  setIsMoving: (moving: boolean) => void,
  setGameState: (state: any) => void,
  onMovementComplete: (position: number, player: PlayerColor) => void,
) {
  const { playSound } = useGlobal();

  // 获取当前玩家位置的辅助函数
  const getPlayerPosition = useCallback(
    (player: PlayerColor) => (player === 'red' ? redPosition : bluePosition),
    [redPosition, bluePosition],
  );

  // 设置玩家位置的辅助函数
  const setPlayerPosition = useCallback(
    (player: PlayerColor, position: number) => {
      if (player === 'red') setRedPosition(position);
      else setBluePosition(position);
    },
    [setRedPosition, setBluePosition],
  );

  const movePlayerStep = useCallback(
    (targetPosition: number, player: PlayerColor, currentStepPos?: number) => {
      const startPosition = currentStepPos ?? getPlayerPosition(player);

      if (startPosition >= targetPosition) {
        setIsMoving(false);
        onMovementComplete(targetPosition, player);
        return;
      }

      const nextPosition = startPosition + 1;
      setPlayerPosition(player, nextPosition);

      // 播放步进音效
      playSound('stepDice');

      setTimeout(() => movePlayerStep(targetPosition, player, nextPosition), 300);
    },
    [getPlayerPosition, setPlayerPosition, onMovementComplete, setIsMoving, playSound],
  );

  const movePlayerToEndAndBack = useCallback(
    (endPosition: number, finalPosition: number, player: PlayerColor, totalSteps: number) => {
      const startPosition = getPlayerPosition(player);
      let currentStep = 0;
      let currentPos = startPosition;
      let hasReachedEnd = false;

      const step = () => {
        if (currentStep >= totalSteps) {
          setIsMoving(false);
          onMovementComplete(finalPosition, player);
          return;
        }

        currentStep++;

        if (!hasReachedEnd) {
          currentPos++;
          if (currentPos >= endPosition) {
            hasReachedEnd = true;
            currentPos = endPosition;
          }
        } else {
          if (currentPos > finalPosition) {
            currentPos--;
          }
        }

        setPlayerPosition(player, currentPos);

        // 播放步进音效
        playSound('stepDice');

        setTimeout(step, 300);
      };

      step();
    },
    [getPlayerPosition, setPlayerPosition, onMovementComplete, setIsMoving, playSound],
  );

  const movePlayer = useCallback(
    (steps: number, currentPlayer: PlayerColor) => {
      const currentPos = getPlayerPosition(currentPlayer);
      const maxPosition = boardPath.length - 1;
      let targetPosition = currentPos + steps;

      setIsMoving(true);
      setGameState('moving');

      if (targetPosition >= maxPosition) {
        if (targetPosition === maxPosition) {
          movePlayerStep(targetPosition, currentPlayer);
        } else {
          const overshoot = targetPosition - maxPosition;
          const finalPosition = Math.max(0, maxPosition - overshoot);
          movePlayerToEndAndBack(maxPosition, finalPosition, currentPlayer, steps);
        }
      } else {
        movePlayerStep(targetPosition, currentPlayer);
      }
    },
    [
      boardPath.length,
      getPlayerPosition,
      movePlayerStep,
      movePlayerToEndAndBack,
      setIsMoving,
      setGameState,
    ],
  );

  return {
    movePlayer,
    movePlayerStep,
    movePlayerToEndAndBack,
  };
}

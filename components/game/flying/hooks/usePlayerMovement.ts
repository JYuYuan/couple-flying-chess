import { useCallback } from 'react';
import type { PlayerColor } from '../types/game';
import { PathCell } from '@/lib/game-config';
import { useAudio } from '@/hooks/use-audio';

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
  const stepSound = useAudio({
    src: '/audio/step.wav',
    volume: 0.8, // 可选，默认为 1.0
    loop: false, // 可选，默认为 false
  });

  const playStepSound = useCallback(() => {
    stepSound.play().catch((error) => {
      console.log('播放步进音效失败:', error);
    });
  }, []);

  const movePlayerStep = useCallback(
    (targetPosition: number, player: PlayerColor, currentStepPos?: number) => {
      const startPosition = currentStepPos ?? (player === 'red' ? redPosition : bluePosition);

      if (startPosition >= targetPosition) {
        setIsMoving(false);
        onMovementComplete(targetPosition, player);
        return;
      }

      const nextPosition = startPosition + 1;
      if (player === 'red') setRedPosition(nextPosition);
      else setBluePosition(nextPosition);

      // 播放步进音效
      playStepSound();

      setTimeout(() => movePlayerStep(targetPosition, player, nextPosition), 300);
    },
    [redPosition, bluePosition, onMovementComplete, setRedPosition, setBluePosition, setIsMoving],
  );

  const movePlayerToEndAndBack = useCallback(
    (endPosition: number, finalPosition: number, player: PlayerColor, totalSteps: number) => {
      const startPosition = player === 'red' ? redPosition : bluePosition;
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

        if (player === 'red') setRedPosition(currentPos);
        else setBluePosition(currentPos);

        // 播放步进音效
        playStepSound();

        setTimeout(step, 300);
      };

      step();
    },
    [redPosition, bluePosition, onMovementComplete, setRedPosition, setBluePosition],
  );

  const movePlayer = useCallback(
    (steps: number, currentPlayer: PlayerColor) => {
      const currentPos = currentPlayer === 'red' ? redPosition : bluePosition;
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
      redPosition,
      bluePosition,
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

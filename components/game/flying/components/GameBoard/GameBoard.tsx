import React from 'react';
import { BirdIcon as Helicopter, Bomb, Plane, Rocket, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PlayerColor } from '@/components/game/flying/types/game';
import { PathCell } from '@/lib/game-config';

interface GameBoardProps {
  boardPath: PathCell[];
  redPosition: number;
  bluePosition: number;
  currentPlayer: PlayerColor;
  isMoving: boolean;
}

export function GameBoard({
  boardPath,
  redPosition,
  bluePosition,
  currentPlayer,
  isMoving,
}: GameBoardProps) {
  // 获取 iOS 16 风格单元格样式
  const getCellStyle = (pathCell: PathCell, isRedOnCell: boolean, isBlueOnCell: boolean) => {
    const baseClasses = `relative z-[999] flex flex-col items-center justify-center aspect-square rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl shadow-gray-200/40 dark:shadow-black/30`;

    switch (pathCell.type) {
      case 'start':
        return `${baseClasses} bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 border-2 border-orange-300/60 shadow-orange-300/50 animate-[glow_2s_ease-in-out_infinite_alternate]`;
      case 'end':
        return `${baseClasses} bg-gradient-to-br from-emerald-400 via-green-500 to-green-600 border-2 border-green-300/60 shadow-green-300/50 animate-[glow_2s_ease-in-out_infinite_alternate]`;
      case 'star':
        return `${baseClasses} bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 border-2 border-yellow-300/60 shadow-yellow-300/50 backdrop-blur-sm`;
      case 'trap':
        return `${baseClasses} bg-gradient-to-br from-red-400 via-rose-500 to-red-600 border-2 border-red-300/60 shadow-red-300/50 backdrop-blur-sm`;
      case 'path':
        return `${baseClasses} bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 border border-blue-200/50 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:border dark:border-slate-600/40 ${
          isRedOnCell || isBlueOnCell ? 'ring-2 ring-blue-400/60 dark:ring-blue-500/60' : ''
        }`;
      default:
        return 'transparent';
    }
  };

  // 获取 iOS 16 风格图标颜色
  const getIconColor = (type: string) => {
    switch (type) {
      case 'start':
        return 'text-orange-800 drop-shadow-sm';
      case 'end':
        return 'text-white drop-shadow-sm';
      case 'star':
        return 'text-amber-800 drop-shadow-sm';
      case 'trap':
        return 'text-white drop-shadow-sm';
      case 'path':
        return 'text-blue-600 dark:text-slate-300 drop-shadow-sm';
      default:
        return 'text-gray-500';
    }
  };

  // 获取连接线方向
  const getConnectionLines = (pathCell: PathCell) => {
    if (!boardPath || pathCell.type === 'start' || pathCell.type === 'end') return null;

    // 找到当前cell在路径中的位置
    const currentIndex = boardPath.findIndex((cell) => cell.id === pathCell.id);
    if (currentIndex === -1) return null;

    const connections = [];
    const lineClass = `absolute -z-10 rounded-sm shadow-sm dark:bg-gradient-to-r dark:from-cyan-400 to-blue-500
        bg-gradient-to-r from-blue-500 to-indigo-600
     opacity-70`;

    // 连接到前一个cell
    if (currentIndex > 0) {
      const prevCell = boardPath[currentIndex - 1];
      const deltaX = pathCell.x - prevCell.x;
      const deltaY = pathCell.y - prevCell.y;

      if (deltaX === 1) {
        // 从左边来
        connections.push(
          <div
            key="from-left"
            className={`${lineClass} w-4 h-1 absolute  left-0 top-1/2 -translate-y-0.5 -translate-x-4`}
          />,
        );
      } else if (deltaX === -1) {
        // 从右边来
        connections.push(
          <div
            key="from-right"
            className={`${lineClass} w-4 h-1 absolute  right-0 top-1/2 -translate-y-0.5 translate-x-4`}
          />,
        );
      } else if (deltaY === 1) {
        // 从上面来
        connections.push(
          <div
            key="from-top"
            className={`${lineClass} w-1 h-4 absolute  top-0 left-1/2 -translate-x-0.5 -translate-y-4`}
          />,
        );
      } else if (deltaY === -1) {
        // 从下面来
        connections.push(
          <div
            key="from-bottom"
            className={`${lineClass} w-1 h-4 absolute  bottom-0 left-1/2 -translate-x-0.5 translate-y-4`}
          />,
        );
      }
    }

    // 连接到下一个cell
    if (currentIndex < boardPath.length - 1) {
      const nextCell = boardPath[currentIndex + 1];
      const deltaX = nextCell.x - pathCell.x;
      const deltaY = nextCell.y - pathCell.y;

      if (deltaX === 1) {
        // 到右边去
        connections.push(
          <div
            key="to-right"
            className={`${lineClass} w-4 h-1  absolute right-0 top-1/2 -translate-y-0.5 translate-x-4`}
          />,
        );
      } else if (deltaX === -1) {
        // 到左边去
        connections.push(
          <div
            key="to-left"
            className={`${lineClass} w-4 h-1  absolute left-0 top-1/2 -translate-y-0.5 -translate-x-4`}
          />,
        );
      } else if (deltaY === 1) {
        // 到下面去
        connections.push(
          <div
            key="to-bottom"
            className={`${lineClass} w-1 h-4  absolute bottom-0 left-1/2 -translate-x-0.5 translate-y-4`}
          />,
        );
      } else if (deltaY === -1) {
        // 到上面去
        connections.push(
          <div
            key="to-top"
            className={`${lineClass} w-1 h-4  absolute top-0 left-1/2 -translate-x-0.5 -translate-y-4`}
          />,
        );
      }
    }

    return connections;
  };

  const renderBoard = () => {
    const boardGridSize = 7;
    const cells = [];
    const cellElements: { [key: string]: React.JSX.Element } = {};

    boardPath.forEach((pathCell) => {
      const isRedOnCell = redPosition === pathCell.id;
      const isBlueOnCell = bluePosition === pathCell.id;
      const areBothOnCell = isRedOnCell && isBlueOnCell;
      const playerIconSize = areBothOnCell ? 16 : 20;

      cellElements[`${pathCell.y}-${pathCell.x}`] = (
        <motion.div
          key={`${pathCell.y}-${pathCell.x}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: pathCell.id * 0.05 }}
          className={getCellStyle(pathCell, isRedOnCell, isBlueOnCell)}
        >
          {/* 单元格内容 */}
          <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
            {pathCell.type === 'start' && (
              <>
                <Rocket size={18} className={getIconColor('start')} />
              </>
            )}
            {pathCell.type === 'end' && (
              <>
                <Trophy size={18} className={getIconColor('end')} />
              </>
            )}
            {pathCell.type === 'star' && (
              <>
                <Star size={16} className={getIconColor('star')} />
              </>
            )}
            {pathCell.type === 'trap' && (
              <>
                <Bomb size={16} className={getIconColor('trap')} />
              </>
            )}
            {pathCell.type === 'path' && (
              <>
                <div className={`w-2 h-2 rounded-full dark:bg-slate-400 bg-blue-400`}></div>
              </>
            )}
          </div>

          {/* 连接线 */}
          {getConnectionLines(pathCell)}

          {/* 玩家棋子 - iOS 16 风格 */}
          {isRedOnCell && (
            <motion.div
              key="red-player"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute z-20 flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 border-2 border-white/80 shadow-2xl backdrop-blur-sm ${
                currentPlayer === 'red' ? 'ring-4 ring-yellow-400/60 animate-pulse' : ''
              } ${areBothOnCell ? 'transform -translate-x-3 -translate-y-3' : ''} ${
                isMoving && currentPlayer === 'red' ? 'animate-bounce' : ''
              }`}
            >
              <Plane size={playerIconSize} className="text-white drop-shadow-sm" />
            </motion.div>
          )}
          {isBlueOnCell && (
            <motion.div
              key="blue-player"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute z-20 flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white/80 shadow-2xl backdrop-blur-sm ${
                currentPlayer === 'blue' ? 'ring-4 ring-yellow-400/60 animate-pulse' : ''
              } ${areBothOnCell ? 'transform translate-x-3 translate-y-3' : ''} ${
                isMoving && currentPlayer === 'blue' ? 'animate-bounce' : ''
              }`}
            >
              <Helicopter size={playerIconSize} className="text-white drop-shadow-sm" />
            </motion.div>
          )}

          {/* 装饰性光效和动画 */}
          {pathCell.type === 'start' && (
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              {/* 微妙的光环效果 */}
              <div className="absolute inset-0 rounded-xl opacity-30">
                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full blur-sm animate-pulse"></div>
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white rounded-full blur-sm animate-pulse delay-500"></div>
              </div>
              {/* 边缘光效 */}
              <div className="absolute inset-0 rounded-xl border border-white/20 animate-[pulse_3s_ease-in-out_infinite]"></div>
            </div>
          )}
          {pathCell.type === 'end' && (
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              {/* 微妙的光环效果 */}
              <div className="absolute inset-0 rounded-xl opacity-30">
                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full blur-sm animate-pulse delay-300"></div>
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white rounded-full blur-sm animate-pulse delay-700"></div>
              </div>
              {/* 边缘光效 */}
              <div className="absolute inset-0 rounded-xl border border-white/20 animate-[pulse_3s_ease-in-out_infinite_reverse]"></div>
            </div>
          )}
          {(pathCell.type === 'star' || pathCell.type === 'trap') && (
            <div className="absolute inset-0 rounded-xl opacity-30 animate-pulse">
              <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full blur-sm"></div>
            </div>
          )}
        </motion.div>
      );
    });

    // 生成空白单元格
    for (let r = 0; r < boardGridSize; r++) {
      for (let c = 0; c < boardGridSize; c++) {
        if (cellElements[`${r}-${c}`]) {
          cells.push(cellElements[`${r}-${c}`]);
        } else {
          cells.push(<div key={`${r}-${c}`} className="aspect-square rounded-xl bg-transparent" />);
        }
      }
    }
    return cells;
  };

  return (
    <div className="relative w-full aspect-square">
      {/* iOS 16 风格棋盘背景 */}
      <div className="relative w-full h-full p-3 rounded-3xl shadow-2xl border transition-all duration-500 backdrop-blur-xl bg-gradient-to-br from-white/90 via-slate-50/80 to-indigo-50/90 border-white/30 shadow-gray-300/40 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-gray-800/80 dark:to-slate-900/90 dark:border-gray-700/30 dark:shadow-black/40">
        {/* iOS 16 风格装饰性背景效果 */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div
            className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-15 animate-pulse shadow-lg"
            style={{
              background:
                currentPlayer === 'red' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)',
            }}
          ></div>
          <div
            className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full blur-2xl opacity-15 animate-pulse delay-1000 shadow-lg"
            style={{
              background:
                currentPlayer === 'red' ? 'rgba(236, 72, 153, 0.6)' : 'rgba(14, 165, 233, 0.6)',
            }}
          ></div>
        </div>

        {/* iOS 16 风格棋盘网格 */}
        <div className="relative z-10 grid grid-cols-7 grid-rows-7 gap-2 w-full h-full p-4">
          {renderBoard()}
        </div>
      </div>
    </div>
  );
}

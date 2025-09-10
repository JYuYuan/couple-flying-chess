'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Star, Bomb } from 'lucide-react';
import { useGlobal } from '@/contexts/GlobalContext';
import { useOptimizedState, useStableCallback } from '@/hooks/use-performance';

interface WheelSection {
  id: number;
  label: string;
  color: string;
  textColor: string;
  task?: string;
  type: 'normal' | 'star' | 'trap';
}

interface WheelGameProps {
  taskQueue: string[];
  onTaskTriggered?: (type: 'normal' | 'star' | 'trap') => void;
  onSpinComplete?: () => void;
  isDisabled?: boolean;
  currentPlayer: 'red' | 'blue';
}

const totalSections = 18;

const WheelGame: React.FC<WheelGameProps> = ({
  taskQueue,
  onTaskTriggered,
  onSpinComplete,
  isDisabled = false,
  currentPlayer,
}) => {
  const { playSound } = useGlobal();
  const wheelRef = useRef<SVGSVGElement>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout>(null);

  // 转盘状态
  const [isSpinning, setIsSpinning] = useOptimizedState(false);
  const [rotation, setRotation] = useOptimizedState(0);
  const [selectedSection, setSelectedSection] = useState<WheelSection | null>(null);

  // 创建36格转盘配置
  const wheelSections = useMemo((): WheelSection[] => {
    const sections: WheelSection[] = [];


    // iOS 16 风格的颜色方案
    const normalColors = ['#007AFF', '#34C759', '#5856D6', '#FF9500', '#FF3B30', '#00C7BE'];
    const starColor = '#FFD700';
    const trapColor = '#FF3B30';

    // 特殊格子位置配置（均匀分布）
    const starPositions = [3, 9, 15, 21, 27, 33]; // 6个星星，每6格一个
    const trapPositions = [6, 12, 18, 24, 30, 35]; // 6个炸弹，每6格一个

    for (let i = 0; i < totalSections; i++) {
      let type: 'normal' | 'star' | 'trap' = 'normal';
      let color = normalColors[i % normalColors.length];
      let label = '';
      let textColor = '#FFFFFF';

      if (starPositions.includes(i)) {
        type = 'star';
        color = starColor;
        label = 'star'; // 用于标识，实际渲染时会用图标
        textColor = '#333333';
      } else if (trapPositions.includes(i)) {
        type = 'trap';
        color = trapColor;
        label = 'bomb'; // 用于标识，实际渲染时会用图标
        textColor = '#FFFFFF';
      } else {
        // 普通格子显示数字
        label = String(i + 1);
        // 调整某些颜色的文字颜色以提高对比度
        if (color === '#34C759' || color === '#FF9500' || color === '#00C7BE') {
          textColor = '#000000';
        }
      }

      sections.push({
        id: i,
        label,
        color,
        textColor,
        task: taskQueue[i % Math.max(taskQueue.length, 1)] || '休息一下',
        type,
      });
    }

    return sections;
  }, [taskQueue]);

  // 每个扇区的角度
  const sectionAngle = 360 / totalSections; // 10度每格

  // 预计算扇形路径和图标位置
  const sectionPaths = useMemo(() => {
    return wheelSections.map((section, index) => {
      const startAngle = (index * sectionAngle - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * sectionAngle - 90) * (Math.PI / 180);

      const outerRadius = 180;
      const innerRadius = 40; // 内圆半径

      // 外圆弧点
      const x1 = 200 + outerRadius * Math.cos(startAngle);
      const y1 = 200 + outerRadius * Math.sin(startAngle);
      const x2 = 200 + outerRadius * Math.cos(endAngle);
      const y2 = 200 + outerRadius * Math.sin(endAngle);

      // 内圆弧点
      const x3 = 200 + innerRadius * Math.cos(endAngle);
      const y3 = 200 + innerRadius * Math.sin(endAngle);
      const x4 = 200 + innerRadius * Math.cos(startAngle);
      const y4 = 200 + innerRadius * Math.sin(startAngle);

      const largeArcFlag = sectionAngle > 180 ? 1 : 0;

      // 创建环形扇区路径
      const pathData = `
        M ${x1} ${y1}
        A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
        Z
      `;

      // 文本/图标位置（在扇形中心）
      const textRadius = (outerRadius + innerRadius) / 2 + 20;
      const midAngle = (startAngle + endAngle) / 2;
      const textX = 200 + textRadius * Math.cos(midAngle);
      const textY = 200 + textRadius * Math.sin(midAngle);
      const textRotation = midAngle * (180 / Math.PI) + 90;

      // 图标位置（稍微靠内一点）
      const iconRadius = textRadius - 5;
      const iconX = 200 + iconRadius * Math.cos(midAngle);
      const iconY = 200 + iconRadius * Math.sin(midAngle);

      return {
        pathData,
        textX,
        textY,
        textRotation,
        iconX,
        iconY,
      };
    });
  }, [wheelSections, sectionAngle]);

  // 转盘旋转逻辑
  const spinWheel = useStableCallback(() => {
    if (isSpinning || isDisabled) return;

    // 清理之前的定时器
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
    }

    playSound('rollDice');
    setIsSpinning(true);
    setSelectedSection(null);

    // 随机选择一个扇区
    const randomIndex = Math.floor(Math.random() * wheelSections.length);
    const selectedSectionData = wheelSections[randomIndex];

    // 计算目标角度
    const targetAngle = 360 - randomIndex * sectionAngle - sectionAngle / 2;
    const spinRotations = 2160 + Math.random() * 1440; // 6-10圈
    const finalRotation = rotation + spinRotations + targetAngle;

    // 应用旋转
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
    }
    setRotation(finalRotation);

    // 动画完成后的处理
    spinTimeoutRef.current = setTimeout(() => {
      setIsSpinning(false);
      setSelectedSection(selectedSectionData);
      playSound('stepDice');

      if (onTaskTriggered) {
        onTaskTriggered(selectedSectionData.type);
      }

      if (onSpinComplete) {
        onSpinComplete();
      }
    }, 4000); // 增加到4秒以适应更多圈数
  });

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  // 玩家主题样式
  const playerStyles = useMemo(() => {
    const isRed = currentPlayer === 'red';
    return {
      primary: isRed ? '#FF3B30' : '#007AFF',
      secondary: isRed ? '#FF6B6B' : '#5AC8FA',
      gradient: isRed
        ? 'linear-gradient(135deg, #FF3B30, #FF6B6B)'
        : 'linear-gradient(135deg, #007AFF, #5AC8FA)',
      shadow: isRed ? 'rgba(255, 59, 48, 0.3)' : 'rgba(0, 122, 255, 0.3)',
    };
  }, [currentPlayer]);

  // 获取图标颜色类名
  const getIconColor = (type: 'star' | 'trap') => {
    if (type === 'star') return 'text-yellow-500';
    if (type === 'trap') return 'text-red-500';
    return 'text-gray-600';
  };

  // 获取任务类型的显示信息
  const getTypeDisplay = (type: 'normal' | 'star' | 'trap') => {
    switch (type) {
      case 'star':
        return { text: '幸运任务', color: '#FFD700' };
      case 'trap':
        return { text: '惩罚任务', color: '#FF3B30' };
      default:
        return { text: '普通任务', color: '#34C759' };
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* 转盘容器 */}
      <div className="relative">
        {/* 顶部指针 */}
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className="relative"
            style={{
              filter: `drop-shadow(0 4px 12px ${playerStyles.shadow})`,
            }}
          >
            {/* 指针主体 */}
            <div
              style={{
                width: '0',
                height: '0',
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent',
                borderBottom: `32px solid ${playerStyles.primary}`,
              }}
            />
            {/* 指针装饰 */}
            <div
              className="absolute top-6 left-1/2 transform -translate-x-1/2"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>
        </div>

        {/* 转盘主体 */}
        <div className="relative w-80 h-80 sm:w-96 sm:h-96">
          <svg
            ref={wheelRef}
            className="w-full h-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
              willChange: isSpinning ? 'transform' : 'auto',
            }}
            viewBox="0 0 400 400"
          >
            <defs>
              {/* iOS 风格的阴影 */}
              <filter id="wheelShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="2" result="offsetblur" />
                <feFlood floodColor="#000000" floodOpacity="0.1" />
                <feComposite in2="offsetblur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* 渐变效果 */}
              <radialGradient id="centerGradient">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#F2F2F7" />
              </radialGradient>
            </defs>

            {/* 外圆背景 */}
            <circle cx="200" cy="200" r="185" fill="#F2F2F7" filter="url(#wheelShadow)" />

            {/* 扇形区域 */}
            {wheelSections.map((section, index) => {
              const { pathData, textX, textY, textRotation, iconX, iconY } = sectionPaths[index];
              const isSelected = selectedSection?.id === section.id;

              return (
                <g key={section.id}>
                  {/* 扇形 */}
                  <path
                    d={pathData}
                    fill={section.color}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    opacity={isSelected ? 1 : isSpinning ? 0.9 : 0.95}
                    style={{
                      filter: isSelected ? 'brightness(1.15)' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />

                  {/* 根据类型渲染内容 */}
                  {section.type === 'star' ? (
                    // Star 图标
                    <foreignObject
                      x={iconX - 12}
                      y={iconY - 12}
                      width="24"
                      height="24"
                      className="pointer-events-none"
                      transform={`rotate(${textRotation} ${iconX} ${iconY})`}
                    >
                      <Star
                        size={20}
                        className="text-yellow-600 fill-yellow-500"
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                        }}
                      />
                    </foreignObject>
                  ) : section.type === 'trap' ? (
                    // Bomb 图标
                    <foreignObject
                      x={iconX - 12}
                      y={iconY - 12}
                      width="24"
                      height="24"
                      className="pointer-events-none"
                      transform={`rotate(${textRotation} ${iconX} ${iconY})`}
                    >
                      <Bomb
                        size={20}
                        className="text-white"
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                        }}
                      />
                    </foreignObject>
                  ) : (
                    // 普通数字
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={section.textColor}
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
                      className="pointer-events-none select-none"
                      transform={`rotate(${textRotation} ${textX} ${textY})`}
                    >
                      {section.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* 中心圆 */}
            <circle
              cx="200"
              cy="200"
              r="40"
              fill="url(#centerGradient)"
              stroke={playerStyles.primary}
              strokeWidth="3"
              filter="url(#wheelShadow)"
            />

            {/* 中心装饰 */}
            <text
              x="200"
              y="200"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={playerStyles.primary}
              fontSize="24"
              fontWeight="bold"
              fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
            >
              {isSpinning ? '...' : 'GO'}
            </text>
          </svg>

          {/* 旋转时的光晕效果 */}
          {isSpinning && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, transparent 40%, ${playerStyles.shadow} 100%)`,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* 控制按钮 */}
      <button
        onClick={spinWheel}
        disabled={isSpinning || isDisabled}
        className="relative px-12 py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: playerStyles.gradient,
          boxShadow: `0 8px 24px ${playerStyles.shadow}`,
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        {/* 按钮光效 */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
          }}
        />

        <span className="relative z-10 flex items-center justify-center gap-3">
          {isSpinning ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>转动中...</span>
            </>
          ) : (
            <>
              <span>🎯</span>
              <span>开始转动</span>
            </>
          )}
        </span>
      </button>

      {/* 结果展示 */}
      {selectedSection && !isSpinning && (
        <div
          className="w-full max-w-sm opacity-0 animate-slideUp"
          style={{
            animationDelay: '0.2s',
            animationFillMode: 'forwards',
          }}
        >
          {/* 结果卡片 */}
          <div
            className="rounded-2xl p-6 backdrop-blur-lg"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* 类型标签 */}
            <div className="flex items-center justify-center mb-4">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: `${getTypeDisplay(selectedSection.type).color}15`,
                  border: `2px solid ${getTypeDisplay(selectedSection.type).color}`,
                }}
              >
                {selectedSection.type === 'star' && (
                  <Star size={20} className={getIconColor('star')} />
                )}
                {selectedSection.type === 'trap' && (
                  <Bomb size={20} className={getIconColor('trap')} />
                )}
                {selectedSection.type === 'normal' && (
                  <span className="text-green-500 text-xl">✓</span>
                )}
                <span
                  className="font-semibold"
                  style={{ color: getTypeDisplay(selectedSection.type).color }}
                >
                  {getTypeDisplay(selectedSection.type).text}
                </span>
              </div>
            </div>

            {/* 格子号 */}
            <div className="text-center mb-2">
              <span className="text-gray-500 text-sm">格子 #{selectedSection.id + 1}</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WheelGame;

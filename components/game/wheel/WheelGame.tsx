'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Bomb, Star, Zap } from 'lucide-react';
import { useGlobal } from '@/contexts/GlobalContext';
import { useOptimizedState, useStableCallback } from '@/hooks/use-performance';

interface WheelSection {
  id: number;
  label: string;
  type: 'normal' | 'star' | 'trap';
}

interface WheelGameProps {
  onTaskTriggered?: (type: 'normal' | 'star' | 'trap') => void;
  onSpinComplete?: () => void;
  isDisabled?: boolean;
  currentPlayer: 'red' | 'blue';
}

const totalSections = 12;

const WheelGame: React.FC<WheelGameProps> = ({
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

  // 创建12格转盘配置
  const wheelSections = useMemo((): WheelSection[] => {
    const sections: WheelSection[] = [];

    // 特殊格子位置配置（均匀分布）
    const starPositions = [2, 6, 10]; // 3个星星
    const trapPositions = [4, 8, 11]; // 3个炸弹

    for (let i = 0; i < totalSections; i++) {
      let type: 'normal' | 'star' | 'trap' = 'normal';
      let label = '';

      if (starPositions.includes(i)) {
        type = 'star';
        label = 'star';
      } else if (trapPositions.includes(i)) {
        type = 'trap';
        label = 'bomb';
      } else {
        label = String(i + 1);
      }

      sections.push({
        id: i,
        label,
        type,
      });
    }

    return sections;
  }, []);

  // 每个扇区的角度
  const sectionAngle = 360 / totalSections; // 30度每格

  // 预计算扇形路径和图标位置
  const sectionPaths = useMemo(() => {
    return wheelSections.map((section, index) => {
      const startAngle = (index * sectionAngle - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * sectionAngle - 90) * (Math.PI / 180);

      const outerRadius = 180;
      const innerRadius = 60; // 内圆半径

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
      const textRadius = (outerRadius + innerRadius) / 2 + 10;
      const midAngle = (startAngle + endAngle) / 2;
      const textX = 200 + textRadius * Math.cos(midAngle);
      const textY = 200 + textRadius * Math.sin(midAngle);
      const textRotation = midAngle * (180 / Math.PI) + 90;

      return {
        pathData,
        textX,
        textY,
        textRotation,
        midAngle: midAngle * (180 / Math.PI),
        sectionStartAngle: (index * sectionAngle - 90 + 360) % 360,
        sectionEndAngle: ((index + 1) * sectionAngle - 90 + 360) % 360,
      };
    });
  }, [wheelSections, sectionAngle]);

  // 根据最终旋转角度计算指针指向的扇区
  const getPointedSection = (finalRotation: number) => {
    // 标准化角度到 0-360 范围
    const normalizedRotation = ((finalRotation % 360) + 360) % 360;

    // 指针在顶部（相当于270度位置，因为我们的坐标系中-90度是顶部）
    // 计算指针相对于转盘当前位置的角度
    const pointerAngle = (270 - normalizedRotation + 360) % 360;

    // 找到包含指针角度的扇区
    for (let i = 0; i < wheelSections.length; i++) {
      const { sectionStartAngle, sectionEndAngle } = sectionPaths[i];

      // 处理跨越0度的情况
      if (sectionStartAngle > sectionEndAngle) {
        if (pointerAngle >= sectionStartAngle || pointerAngle <= sectionEndAngle) {
          return wheelSections[i];
        }
      } else {
        if (pointerAngle >= sectionStartAngle && pointerAngle <= sectionEndAngle) {
          return wheelSections[i];
        }
      }
    }

    // 如果没有找到，返回第一个扇区作为默认值
    return wheelSections[0];
  };

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

    // 随机旋转圈数和角度
    const spinRotations = 1800 + Math.random() * 1800; // 5-10圈
    const randomAngle = Math.random() * 360;
    const finalRotation = rotation + spinRotations + randomAngle;

    // 应用旋转
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
    }
    setRotation(finalRotation);

    // 动画完成后的处理
    spinTimeoutRef.current = setTimeout(() => {
      const pointedSection = getPointedSection(finalRotation);

      setIsSpinning(false);
      setSelectedSection(pointedSection);
      playSound('stepDice');

      if (onTaskTriggered) {
        onTaskTriggered(pointedSection.type);
      }

      if (onSpinComplete) {
        onSpinComplete();
      }
    }, 4000);
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
      shadow: isRed ? 'rgba(255, 59, 48, 0.4)' : 'rgba(0, 122, 255, 0.4)',
    };
  }, [currentPlayer]);

  // 获取任务类型的显示信息
  const getTypeDisplay = (type: 'normal' | 'star' | 'trap') => {
    switch (type) {
      case 'star':
        return { text: '幸运任务', icon: Star, color: '#FFD700' };
      case 'trap':
        return { text: '惩罚任务', icon: Bomb, color: '#FF3B30' };
      default:
        return { text: '普通任务', icon: null, color: '#34C759' };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4 sm:p-8 w-full max-w-2xl mx-auto">
      {/* 转盘容器 */}
      <div className="relative w-full max-w-md sm:max-w-lg">
        {/* 顶部指针 */}
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            top: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className={`relative ${isSpinning ? '' : 'animate-bounce'}`}
            style={{
              filter: `drop-shadow(0 6px 16px ${playerStyles.shadow})`,
              animationDuration: '1.5s',
            }}
          >
            {/* 指针主体 */}
            <div
              className="pointer-triangle"
              style={{
                width: '0',
                height: '0',
                borderLeft: '20px solid transparent',
                borderRight: '20px solid transparent',
                borderBottom: `40px solid ${playerStyles.primary}`,
              }}
            />
            {/* 指针装饰圆点 */}
            <div
              className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shadow-lg"
              style={{
                boxShadow: '0 0 15px rgba(255,255,255,0.9)',
              }}
            />
          </div>
        </div>

        {/* 转盘主体 - 响应式尺寸 */}
        <div className="relative w-full aspect-square max-w-80 sm:max-w-96 lg:max-w-[28rem] mx-auto">
          {/* 背景容器 */}
          <div
            className="absolute inset-0 rounded-full backdrop-blur-xl border-2 border-white/30 bg-white/10 shadow-2xl"
            style={{
              boxShadow: `0 20px 60px ${playerStyles.shadow}`,
            }}
          />

          <svg
            ref={wheelRef}
            className="w-full h-full relative z-10"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
              willChange: isSpinning ? 'transform' : 'auto',
            }}
            viewBox="0 0 400 400"
          >
            <defs>
              {/* 现代阴影效果 */}
              <filter id="modernShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="8"
                  floodColor={playerStyles.shadow}
                  floodOpacity="0.3"
                />
              </filter>

              {/* 发光效果 */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* 渐变效果 */}
              <radialGradient id="centerGradient">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
              </radialGradient>
            </defs>

            {/* 扇形区域 */}
            {wheelSections.map((section, index) => {
              const { pathData, textX, textY, textRotation } = sectionPaths[index];
              const isSelected = selectedSection?.id === section.id;

              return (
                <g key={section.id}>
                  {/* 扇形区域 */}
                  <path
                    d={pathData}
                    fill={isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}
                    stroke={isSelected ? playerStyles.primary : 'rgba(255,255,255,0.3)'}
                    strokeWidth={isSelected ? '3' : '2'}
                    className={`transition-all duration-500 ${isSelected ? 'brightness-125' : ''}`}
                    style={{
                      filter: isSelected ? 'url(#glow)' : 'none',
                    }}
                  />

                  {/* 内容渲染 */}
                  {section.type === 'star' ? (
                    <foreignObject
                      x={textX - 14}
                      y={textY - 14}
                      width="28"
                      height="28"
                      className="pointer-events-none"
                      transform={`rotate(${textRotation} ${textX} ${textY})`}
                    >
                      <Star
                        size={24}
                        className={`text-yellow-400 fill-yellow-300 drop-shadow-lg transition-all duration-300 ${
                          isSelected ? 'scale-125 brightness-125' : ''
                        }`}
                      />
                    </foreignObject>
                  ) : section.type === 'trap' ? (
                    <foreignObject
                      x={textX - 14}
                      y={textY - 14}
                      width="28"
                      height="28"
                      className="pointer-events-none"
                      transform={`rotate(${textRotation} ${textX} ${textY})`}
                    >
                      <Bomb
                        size={24}
                        className={`text-red-400 drop-shadow-lg transition-all duration-300 ${
                          isSelected ? 'scale-125 brightness-125' : ''
                        }`}
                      />
                    </foreignObject>
                  ) : (
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="currentColor"
                      fontSize={isSelected ? '24' : '20'}
                      fontWeight="800"
                      fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
                      className={`pointer-events-none select-none text-gray-800 dark:text-white drop-shadow-lg transition-all duration-300 ${
                        isSelected ? 'brightness-125' : ''
                      }`}
                      transform={`rotate(${textRotation} ${textX} ${textY})`}
                      style={{
                        textShadow: isSelected
                          ? '0 0 15px rgba(255,255,255,1), 0 2px 8px rgba(255,255,255,0.8)'
                          : '0 2px 8px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.5)',
                        filter: 'url(#glow)',
                      }}
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
              r="60"
              fill="url(#centerGradient)"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="4"
              filter="url(#modernShadow)"
              className="backdrop-blur-sm"
            />

            {/* 中心文字 */}
            <text
              x="200"
              y="200"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={playerStyles.primary}
              fontSize="24"
              fontWeight="900"
              fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
              className="drop-shadow-lg"
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                filter: 'url(#glow)',
              }}
            >
              {isSpinning ? '🎯' : 'GO'}
            </text>
          </svg>

          {/* 旋转时的动态效果 */}
          {isSpinning && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none animate-pulse opacity-50"
              style={{
                background: `conic-gradient(from 0deg, transparent, ${playerStyles.shadow}, transparent)`,
                animation: 'spin 2s linear infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* 控制按钮 - 响应式调整 */}
      <button
        onClick={spinWheel}
        disabled={isSpinning || isDisabled}
        className="relative px-8 sm:px-12 py-4 rounded-3xl font-bold text-base sm:text-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md border-2 border-white/30 bg-white/20 text-gray-800 dark:text-white shadow-2xl hover:scale-105 hover:bg-white/30 w-full max-w-xs"
        style={{
          boxShadow: `0 10px 30px ${playerStyles.shadow}`,
        }}
      >
        {/* 按钮内部高光 */}
        <div className="absolute inset-0 rounded-3xl opacity-30 bg-gradient-to-br from-white/50 to-transparent" />

        <span className="relative z-10 flex items-center justify-center gap-3">
          {isSpinning ? (
            <>
              <div className="animate-spin">
                <Zap size={20} className="text-yellow-400" />
              </div>
              <span>转动中...</span>
            </>
          ) : (
            <>
              <Zap size={20} className="text-yellow-400" />
              <span>开始转盘</span>
            </>
          )}
        </span>
      </button>

      {/* 结果展示 */}
      {selectedSection && !isSpinning && (
        <div className="w-full max-w-sm animate-slideUp">
          <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-md border-2 border-white/30 bg-white/20 shadow-2xl">
            {/* 类型标签 */}
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl backdrop-blur-sm bg-white/30 border border-white/40">
                {getTypeDisplay(selectedSection.type).icon &&
                  React.createElement(getTypeDisplay(selectedSection.type).icon!, {
                    size: 20,
                    className:
                      selectedSection.type === 'star'
                        ? 'text-yellow-400 fill-yellow-300'
                        : selectedSection.type === 'trap'
                          ? 'text-red-400'
                          : 'text-green-400',
                  })}
                {selectedSection.type === 'normal' && (
                  <span className="text-green-400 text-xl sm:text-2xl">✓</span>
                )}
                <span
                  className="font-bold text-base sm:text-lg"
                  style={{ color: getTypeDisplay(selectedSection.type).color }}
                >
                  {getTypeDisplay(selectedSection.type).text}
                </span>
              </div>
            </div>

            {/* 结果信息 */}
            <div className="text-center space-y-3 sm:space-y-4 text-gray-800 dark:text-white">
              <div className="font-semibold text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                {selectedSection.type === 'normal' && `格子 #${selectedSection.label}`}
                {selectedSection.type === 'star' && '🌟 幸运格子'}
                {selectedSection.type === 'trap' && '💣 陷阱格子'}
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />

              <div className="font-medium text-base sm:text-lg">🎯 指针指向了这个格子！</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
          animation: slideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @media (max-width: 640px) {
          .pointer-triangle {
            border-left-width: 16px !important;
            border-right-width: 16px !important;
            border-bottom-width: 32px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WheelGame;

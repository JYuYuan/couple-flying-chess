'use client';

import React from 'react';

interface CoupleGameLogoProps {
  size?: number;
  variant?: 'default' | 'round' | 'square';
  className?: string;
}

export const CoupleGameLogo: React.FC<CoupleGameLogoProps> = ({ 
  size = 192, 
  variant = 'default',
  className = ''
}) => {
  const borderRadius = variant === 'round' ? '50%' : variant === 'square' ? '20%' : '25%';
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 192 192"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ borderRadius }}
      >
        {/* 背景渐变 */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B9D" />
            <stop offset="50%" stopColor="#FF8E9E" />
            <stop offset="100%" stopColor="#FFB199" />
          </linearGradient>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4757" />
            <stop offset="100%" stopColor="#FF6B9D" />
          </linearGradient>
          <linearGradient id="diceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.1"/>
          </filter>
        </defs>

        {/* 背景 */}
        <rect 
          width="192" 
          height="192" 
          rx={variant === 'round' ? '96' : variant === 'square' ? '38' : '48'}
          fill="url(#bgGradient)" 
        />

        {/* 装饰性圆点 */}
        <circle cx="40" cy="40" r="4" fill="rgba(255,255,255,0.3)" />
        <circle cx="152" cy="40" r="3" fill="rgba(255,255,255,0.2)" />
        <circle cx="40" cy="152" r="3" fill="rgba(255,255,255,0.2)" />
        <circle cx="152" cy="152" r="4" fill="rgba(255,255,255,0.3)" />

        {/* 主要图标组 */}
        <g transform="translate(96, 96)">
          {/* 爱心 (左上) */}
          <g transform="translate(-25, -25)">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#heartGradient)"
              filter="url(#shadow)"
              transform="scale(0.8)"
            />
          </g>

          {/* 骰子 (右下) */}
          <g transform="translate(15, 15)">
            <rect 
              x="0" 
              y="0" 
              width="20" 
              height="20" 
              rx="4" 
              fill="url(#diceGradient)"
              filter="url(#shadow)"
            />
            {/* 骰子点数 (显示6) */}
            <circle cx="6" cy="6" r="1.5" fill="white" />
            <circle cx="14" cy="6" r="1.5" fill="white" />
            <circle cx="6" cy="10" r="1.5" fill="white" />
            <circle cx="14" cy="10" r="1.5" fill="white" />
            <circle cx="6" cy="14" r="1.5" fill="white" />
            <circle cx="14" cy="14" r="1.5" fill="white" />
          </g>

          {/* 情侣图标 (中心偏左) */}
          <g transform="translate(-10, -5)">
            {/* 男性角色 */}
            <circle cx="0" cy="-5" r="6" fill="#FFB199" stroke="#FF8E9E" strokeWidth="1" />
            <rect x="-4" y="1" width="8" height="10" rx="2" fill="#3B82F6" />
            
            {/* 女性角色 */}
            <circle cx="12" cy="-5" r="6" fill="#FFB199" stroke="#FF8E9E" strokeWidth="1" />
            <rect x="8" y="1" width="8" height="10" rx="2" fill="#FF6B9D" />
            
            {/* 连接的小心 */}
            <path
              d="M6 0c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3-3-1.5-3-3z"
              fill="#FF4757"
              transform="translate(0, -2)"
            />
          </g>
        </g>

        {/* 装饰性星星 */}
        <g>
          <path
            d="M50 30 L52 36 L58 36 L53 40 L55 46 L50 42 L45 46 L47 40 L42 36 L48 36 Z"
            fill="rgba(255,255,255,0.4)"
          />
          <path
            d="M140 160 L142 166 L148 166 L143 170 L145 176 L140 172 L135 176 L137 170 L132 166 L138 166 Z"
            fill="rgba(255,255,255,0.4)"
            transform="scale(0.8)"
          />
        </g>
      </svg>
    </div>
  );
};

// 简化版本用于小尺寸
export const CoupleGameLogoSimple: React.FC<{ size?: number; className?: string }> = ({ 
  size = 64, 
  className = '' 
}) => {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="simpleBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B9D" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#simpleBg)" />
        <text 
          x="32" 
          y="40" 
          textAnchor="middle" 
          fontSize="32" 
          fill="white"
        >
          🎲
        </text>
        <text 
          x="45" 
          y="25" 
          textAnchor="middle" 
          fontSize="12" 
          fill="white"
        >
          💕
        </text>
      </svg>
    </div>
  );
};

export default CoupleGameLogo;
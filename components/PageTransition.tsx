'use client';

import { useRef } from 'react';
import { useGlobal } from '@/contexts/GlobalContext';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const { playSound } = useGlobal();
  const isFirstClick = useRef(true);

  return (
    <div
      onClick={() => {
        if (!isFirstClick.current) return;
        isFirstClick.current = false;
        playSound('bgm');
      }}
      className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 relative"
    >
      {/* 动态背景叠加层 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.03), transparent 50%), radial-gradient(ellipse at bottom left, rgba(99, 102, 241, 0.03), transparent 50%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          minHeight: '100vh',
          zIndex: 1,
        }}
      >
        {/* 直接渲染子元素，不使用动画 */}
        <div style={{ width: '100%', minHeight: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

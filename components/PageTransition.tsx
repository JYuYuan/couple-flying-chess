'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';


export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 简单的方向判断逻辑，可以根据实际路由结构调整
    const isGoingBack = pathname === '/' || pathname.length < prevPathname.current.length;
    setDirection(isGoingBack ? 'back' : 'forward');
    prevPathname.current = pathname;

  }, [pathname]);

  // App切换风格的动画配置
  const slideVariants = {
    enter: (direction: 'forward' | 'back') => ({
      x: direction === 'forward' ? '100%' : '-100%',
      scale: direction === 'forward' ? 0.95 : 1.05,
      opacity: 0,
      zIndex: direction === 'forward' ? 2 : 0,
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      zIndex: 1,
    },
    exit: (direction: 'forward' | 'back') => ({
      x: direction === 'forward' ? '-100%' : '100%',
      scale: direction === 'forward' ? 1.05 : 0.95,
      opacity: 0,
      zIndex: direction === 'forward' ? 0 : 2,
    }),
  };

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 relative">
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
        <AnimatePresence
          mode="sync"
          custom={direction}
          onExitComplete={() => window.scrollTo(0, 0)}
        >
          <motion.div
            key={pathname}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.4,
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: 'auto',
              minHeight: '100%',
              willChange: 'transform, opacity',
              overflowY: 'auto',
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

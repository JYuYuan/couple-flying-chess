import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface TimerProps {
  initialTimeLeft: number; // in milliseconds
  onComplete?: () => void;
  className?: string;
  autoStart?: boolean; // 是否自动开始倒计时
  showIcon?: boolean; // 是否显示图标
  size?: 'small' | 'medium' | 'large'; // 计时器大小
  variant?: 'default' | 'task' | 'win'; // 计时器变体样式
}

const Timer: React.FC<TimerProps> = ({
  initialTimeLeft,
  onComplete,
  className = '',
  autoStart = false,
  showIcon = true,
  size = 'medium',
  variant = 'default',
}) => {
  const startRef = useRef<HTMLAudioElement | null>(null);
  const stopRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(initialTimeLeft);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // 初始化音频元素
  useEffect(() => {
    // 创建音频元素
    const startAudio = new Audio('/audio/stopwatch.wav');
    const stopAudio = new Audio('/audio/ding.mp3');
    startAudio.preload = 'auto';
    stopAudio.preload = 'auto';

    startRef.current = startAudio;
    stopRef.current = stopAudio;

    return () => {
      if (startRef.current) {
        startRef.current.pause();
        startRef.current = null;
      }
      if (stopRef.current) {
        stopRef.current.pause();
        stopRef.current = null;
      }
    };
  }, []);

  // 获取尺寸相关的样式
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: 'text-sm gap-1 px-3 py-2',
          icon: 'w-4 h-4',
          text: 'text-base',
        };
      case 'large':
        return {
          container: 'text-xl gap-3 px-6 py-4',
          icon: 'w-8 h-8',
          text: 'text-3xl',
        };
      default: // medium
        return {
          container: 'text-lg gap-2 px-4 py-3',
          icon: 'w-6 h-6',
          text: 'text-2xl',
        };
    }
  };

  // 获取变体相关的样式
  const getVariantStyles = () => {
    const baseClasses = {
      background:
        'bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm border border-gray-200/40 dark:bg-gradient-to-r dark:from-gray-800/80 dark:to-gray-700/80 dark:border-gray-600/40',
      text: 'text-gray-700 dark:text-gray-200',
      shadow: 'shadow-lg hover:shadow-xl',
    };

    switch (variant) {
      case 'task':
        return {
          ...baseClasses,
          accent: isRunning
            ? 'from-orange-100 to-red-100 border-orange-300 dark:from-orange-600/20 dark:to-red-600/20 dark:border-orange-500/30'
            : 'from-blue-100 to-indigo-100 border-blue-300 dark:from-blue-600/20 dark:to-indigo-600/20 dark:border-blue-500/30',
          textColor: isCompleted
            ? 'text-red-500'
            : isRunning
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-blue-600 dark:text-blue-400',
        };
      case 'win':
        return {
          ...baseClasses,
          accent:
            'from-purple-100 to-pink-100 border-purple-300 dark:from-purple-600/20 dark:to-pink-600/20 dark:border-purple-500/30',
          textColor: 'text-purple-600 dark:text-purple-400',
        };
      default:
        return {
          ...baseClasses,
          accent: isRunning
            ? 'from-green-100 to-emerald-100 border-green-300 dark:from-green-600/20 dark:to-emerald-600/20 dark:border-green-500/30'
            : 'from-gray-100 to-slate-100 border-gray-300 dark:from-gray-600/20 dark:to-slate-600/20 dark:border-gray-500/30',
          textColor: isCompleted
            ? 'text-red-500'
            : isRunning
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  // 格式化时间显示
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // 播放开始音效（循环）
  const playStartSound = useCallback(() => {
    if (!startRef.current) return;
    startRef.current.currentTime = 0;
    startRef.current.loop = true; // 设置循环播放
    startRef.current.play().catch((e) => console.error('播放开始音效失败:', e));
  }, []);

  // 停止开始音效
  const stopStartSound = useCallback(() => {
    if (!startRef.current) return;
    startRef.current.pause();
    startRef.current.currentTime = 0;
    startRef.current.loop = false; // 关闭循环
  }, []);

  // 播放结束音效
  const playCompleteSound = useCallback(() => {
    if (!stopRef.current) return;
    stopRef.current.currentTime = 0;
    stopRef.current.play().catch((e) => console.error('播放结束音效失败:', e));
  }, []);

  // 开始倒计时
  const startTimer = useCallback(() => {
    if (isRunning || isCompleted) return;
    setIsRunning(true);
    playStartSound();
  }, [isRunning, isCompleted, playStartSound]);

  // 重置倒计时
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopStartSound(); // 停止开始音效
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(initialTimeLeft);
  }, [initialTimeLeft, stopStartSound]);

  // 处理倒计时逻辑
  useEffect(() => {
    if (!isRunning) return;

    // 清除之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 设置新的定时器
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          if (timerRef.current) clearInterval(timerRef.current);
          stopStartSound(); // 停止开始音效
          playCompleteSound(); // 播放结束音效
          setIsRunning(false);
          setIsCompleted(true);
          onComplete?.();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    // 组件卸载时清除定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, onComplete, playCompleteSound]);

  // 自动开始倒计时
  useEffect(() => {
    if (autoStart) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoStart, startTimer]);

  // 获取当前图标
  const getCurrentIcon = () => {
    if (isCompleted) return RotateCcw;
    if (isRunning) return Zap;
    return Play;
  };

  const IconComponent = getCurrentIcon();

  // 获取标题提示
  const getTooltipText = () => {
    if (isCompleted) return '点击重置';
    if (isRunning) return '倒计时进行中...';
    return '点击开始';
  };

  // 点击事件处理
  const handleClick = () => {
    if (isCompleted) {
      resetTimer();
    } else if (!isRunning) {
      startTimer();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`
        relative inline-flex items-center justify-center rounded-xl cursor-pointer 
        transition-all duration-300 transform font-mono font-bold overflow-hidden
        ${sizeStyles.container}
        ${variantStyles.background}
        ${variantStyles.accent}
        ${variantStyles.shadow}
        ${className}
      `}
      title={getTooltipText()}
    >
      <AnimatePresence mode="wait">
        {showIcon && (
          <motion.div
            key={isRunning ? 'running' : isCompleted ? 'completed' : 'idle'}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`${sizeStyles.icon} ${variantStyles.textColor} ${
              isRunning ? 'animate-pulse' : ''
            }`}
          >
            <IconComponent className={sizeStyles.icon} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.span
        key={timeLeft}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`${sizeStyles.text} ${variantStyles.textColor} ${
          isRunning ? 'animate-pulse' : ''
        }`}
      >
        {isCompleted ? '00:00' : formatTime(timeLeft)}
      </motion.span>

      {/* 进度指示器 */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-b-xl overflow-hidden">
        <motion.div
          className={`h-full transition-colors duration-300 ${
            isRunning
              ? 'bg-gradient-to-r from-orange-500 to-red-500'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          }`}
          initial={{ width: '100%' }}
          animate={{
            width: isRunning ? `${(timeLeft / initialTimeLeft) * 100}%` : '100%',
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default React.memo(Timer);

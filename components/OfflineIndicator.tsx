'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowIndicator(true);
      } else {
        // 在线时延迟隐藏指示器
        setTimeout(() => setShowIndicator(false), 2000);
      }
    };

    // 初始状态检查
    updateOnlineStatus();

    // 监听网络状态变化
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleRetry = () => {
    // 触发页面刷新或重新连接逻辑
    window.location.reload();
  };

  if (!showIndicator) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
      >
        <div
          className={`flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-xl border shadow-lg transition-all duration-300 ${
            isOnline
              ? 'bg-green-500/80 border-green-400/40 text-white'
              : 'bg-red-500/80 border-red-400/40 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? '网络已恢复' : '网络连接断开'}
            </span>
          </div>
          
          {!isOnline && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="text-xs">重试</span>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for checking online status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return isOnline;
};

export default OfflineIndicator;
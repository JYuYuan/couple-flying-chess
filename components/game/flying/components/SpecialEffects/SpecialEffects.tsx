import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, AlertTriangle, Heart, Sparkles, Bomb } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export type EffectType = 'star' | 'trap' | 'collision' | null;

interface SpecialEffectsProps {
  effectType: EffectType;
  onComplete: () => void;
  duration?: number;
}

const SpecialEffects: React.FC<SpecialEffectsProps> = ({
  effectType,
  onComplete,
  duration = 2000,
}) => {
  const { theme, mounted } = useTheme();
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    if (effectType) {
      // 生成粒子效果
      const particleCount = effectType === 'star' ? 12 : effectType === 'trap' ? 8 : 6;
      setParticles(Array.from({ length: particleCount }, (_, i) => i));

      const timer = setTimeout(() => {
        onComplete();
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [effectType, onComplete, duration]);

  const getEffectConfig = () => {
    switch (effectType) {
      case 'star':
        return {
          icon: Star,
          color: theme === 'dark' 
            ? 'from-yellow-400 via-amber-500 to-orange-500' 
            : 'from-yellow-300 via-yellow-400 to-amber-500',
          bgColor: theme === 'dark' 
            ? 'from-yellow-900/30 via-amber-900/40 to-orange-900/30' 
            : 'from-yellow-100/80 via-amber-100/90 to-orange-100/80',
          particleColor: theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500',
          title: '🌟 幸运星',
          subtitle: '好运降临！',
        };
      case 'trap':
        return {
          icon: Bomb,
          color: theme === 'dark' 
            ? 'from-red-500 via-rose-600 to-pink-600' 
            : 'from-red-400 via-rose-500 to-pink-500',
          bgColor: theme === 'dark' 
            ? 'from-red-900/30 via-rose-900/40 to-pink-900/30' 
            : 'from-red-100/80 via-rose-100/90 to-pink-100/80',
          particleColor: theme === 'dark' ? 'bg-red-400' : 'bg-red-500',
          title: '💥 陷阱',
          subtitle: '小心挑战！',
        };
      case 'collision':
        return {
          icon: Zap,
          color: theme === 'dark' 
            ? 'from-purple-500 via-indigo-600 to-blue-600' 
            : 'from-purple-400 via-indigo-500 to-blue-500',
          bgColor: theme === 'dark' 
            ? 'from-purple-900/30 via-indigo-900/40 to-blue-900/30' 
            : 'from-purple-100/80 via-indigo-100/90 to-blue-100/80',
          particleColor: theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500',
          title: '⚡ 碰撞',
          subtitle: '意外相遇！',
        };
      default:
        return null;
    }
  };

  const config = getEffectConfig();

  if (!effectType || !config) return null;

  const IconComponent = config.icon;

  if (!mounted) {
    return (
      <div className="w-full px-0 sm:px-4 lg:px-8 xl:px-12 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ pointerEvents: 'none' }}
      >
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 bg-gradient-to-br ${config.bgColor} backdrop-blur-sm`}
        />

        {/* 主效果容器 */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 15,
            duration: 0.6 
          }}
          className="relative flex flex-col items-center justify-center"
        >
          {/* 主图标 */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: effectType === 'star' ? [0, 360] : [0, -10, 10, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-2xl border-4 border-white/20`}
          >
            <IconComponent size={48} className="text-white drop-shadow-lg" />
            
            {/* 内部光环 */}
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} opacity-50`}
            />
          </motion.div>

          {/* 标题和副标题 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <h2 className={`text-3xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent mb-2`}>
              {config.title}
            </h2>
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {config.subtitle}
            </p>
          </motion.div>

          {/* 装饰性光圈 */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 2, 1],
                opacity: [0, 0.3, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className={`absolute w-32 h-32 rounded-full border-2 border-white/20 ${config.color.replace('from-', 'border-').split(' ')[0]}`}
              style={{ borderWidth: '1px' }}
            />
          ))}
        </motion.div>

        {/* 粒子效果 */}
        {particles.map((particle) => (
          <motion.div
            key={particle}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 0, 
              opacity: 1,
            }}
            animate={{ 
              x: (Math.random() - 0.5) * 800,
              y: (Math.random() - 0.5) * 600,
              scale: [0, 1, 0],
              opacity: [1, 0.8, 0],
            }}
            transition={{ 
              duration: 2,
              delay: Math.random() * 0.5,
              ease: 'easeOut',
            }}
            className={`absolute w-2 h-2 rounded-full ${config.particleColor} shadow-lg`}
            style={{
              left: '50%',
              top: '50%',
            }}
          />
        ))}

        {/* 专门的星星效果（仅限幸运星） */}
        {effectType === 'star' && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  rotate: 360,
                  x: Math.cos((i / 8) * Math.PI * 2) * 150,
                  y: Math.sin((i / 8) * Math.PI * 2) * 150,
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                }}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                <Sparkles size={16} className="text-yellow-400 drop-shadow-lg" />
              </motion.div>
            ))}
          </>
        )}

        {/* 专门的爆炸效果（仅限陷阱） */}
        {effectType === 'trap' && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`explosion-${i}`}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  rotate: Math.random() * 360,
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                <AlertTriangle size={20} className="text-red-400 drop-shadow-lg" />
              </motion.div>
            ))}
          </>
        )}

        {/* 专门的电击效果（仅限碰撞） */}
        {effectType === 'collision' && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`lightning-${i}`}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ 
                  scaleY: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: (i % 2 === 0 ? -1 : 1) * (50 + i * 20),
                }}
                transition={{ 
                  duration: 0.8,
                  delay: i * 0.2,
                  repeat: 2,
                }}
                className="absolute w-1 h-20 bg-gradient-to-b from-purple-400 via-blue-400 to-transparent shadow-lg"
                style={{
                  left: '50%',
                  top: '50%',
                  transformOrigin: 'top center',
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SpecialEffects;
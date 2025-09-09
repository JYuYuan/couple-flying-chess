import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Bomb, Sparkles, Star, Zap } from 'lucide-react';
import { Translations } from '@/lib/i18n';
import { useGlobal } from '@/contexts/GlobalContext';

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
  const [particles, setParticles] = useState<number[]>([]);
  const { translations } = useGlobal();

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
          color:
            'from-yellow-300 via-yellow-400 to-amber-500 dark:from-yellow-400 dark:via-amber-500 dark:to-orange-500',
          bgColor:
            'from-yellow-100/80 via-amber-100/90 to-orange-100/80 dark:from-yellow-900/30 dark:via-amber-900/40 dark:to-orange-900/30',
          particleColor: 'bg-yellow-500 dark:bg-yellow-400',
          ...translations?.game[effectType],
        };
      case 'trap':
        return {
          icon: Bomb,
          color:
            'from-red-400 via-rose-500 to-pink-500 dark:from-red-500 dark:via-rose-600 dark:to-pink-600',
          bgColor:
            'from-red-100/80 via-rose-100/90 to-pink-100/80 dark:from-red-900/30 dark:via-rose-900/40 dark:to-pink-900/30',
          particleColor: 'bg-red-500 dark:bg-red-400',
          ...translations?.game[effectType],
        };
      case 'collision':
        return {
          icon: Zap,
          color:
            'from-purple-400 via-indigo-500 to-blue-500 dark:from-purple-500 dark:via-indigo-600 dark:to-blue-600',
          bgColor:
            'from-purple-100/80 via-indigo-100/90 to-blue-100/80 dark:from-purple-900/30 dark:via-indigo-900/40 dark:to-blue-900/30',
          particleColor: 'bg-purple-500 dark:bg-purple-400',
          ...translations?.game[effectType],
        };
      default:
        return null;
    }
  };

  const config = getEffectConfig();

  if (!effectType || !config) return null;

  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onComplete()}
        style={{ pointerEvents: 'none' }}
        className="fixed inset-0 z-50 flex items-center justify-center"
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
            duration: 0.6,
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
              ease: 'easeInOut',
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
            <h2
              className={`text-3xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent mb-2`}
            >
              {config.title}
            </h2>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
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

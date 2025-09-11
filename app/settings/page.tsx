'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, ListTodo, Play, Volume2, VolumeX, Zap } from 'lucide-react';
import { useGlobal } from '@/contexts/GlobalContext';
import { soundConfig, SoundKey } from '@/contexts/config/sounds';

export default function Settings() {
  const { translations, isMuted, toggleMute, playSound } = useGlobal();
  const t = translations?.settings;

  const [soundSettings, setSoundSettings] = useState<
    Record<SoundKey, { enabled: boolean; volume: number }>
  >(() => {
    return Object.entries(soundConfig).reduce(
      (acc, [key, config]) => {
        const soundKey = key as SoundKey;
        acc[soundKey] = {
          enabled: true,
          volume: config.volume,
        };
        return acc;
      },
      {} as Record<SoundKey, { enabled: boolean; volume: number }>,
    );
  });

  // 从本地存储加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('soundSettings');
    if (savedSettings) {
      try {
        setSoundSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse sound settings:', error);
      }
    }
  }, []);

  // 保存设置到本地存储
  const saveSoundSettings = (newSettings: typeof soundSettings) => {
    setSoundSettings(newSettings);
    localStorage.setItem('soundSettings', JSON.stringify(newSettings));
  };

  // 测试播放声音
  const testPlaySound = (soundKey: SoundKey) => {
    if (!soundSettings[soundKey].enabled || isMuted) return;
    playSound(soundKey);
  };

  // 获取声音名称
  const getSoundName = (soundKey: SoundKey) => {
    return t?.sound.names[soundKey] || soundKey;
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl bg-gradient-to-br from-blue-200/30 to-indigo-300/40 dark:from-blue-600/15 dark:to-indigo-700/20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* 主要内容容器 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <motion.div
          className="sticky top-0 z-50 flex justify-between items-center p-6 sm:p-8 backdrop-blur-2xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Link href="/">
            <motion.button
              className="
  p-3 rounded-2xl backdrop-blur-xl
  bg-white/70 border-white/40 shadow-gray-200/30
  dark:bg-sky-500/30 dark:border-sky-400/40 dark:shadow-sky-500/30 dark:text-sky-200
  border shadow-lg hover:shadow-xl transition-all duration-200
"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={t?.backToHome || '返回主页'}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {t?.title || '设置'}
          </h1>

          <div className="w-12"></div>
          {/* 占位符保持居中 */}
        </motion.div>

        {/* 设置内容 */}
        <div className="flex-1 px-6 sm:px-8 pb-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* 全局静音控制 */}
            <motion.div
              className="backdrop-blur-xl rounded-3xl p-6 shadow-lg border bg-white/70 border-white/40 shadow-gray-200/30 dark:bg-gray-800/70 dark:border-gray-700/40 dark:shadow-black/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <VolumeX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {t?.sound?.globalMute || '全局静音'}
                  </h2>
                </div>

                <motion.label
                  className="relative inline-flex items-center cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!isMuted}
                    onChange={toggleMute}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </motion.label>
              </div>
            </motion.div>

            {/* 声音设置卡片 */}
            <motion.div
              className="backdrop-blur-xl rounded-3xl p-6 shadow-lg border bg-white/70 border-white/40 shadow-gray-200/30 dark:bg-gray-800/70 dark:border-gray-700/40 dark:shadow-black/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Volume2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {t?.sound.title || '声音设置'}
                </h2>
              </div>

              <div className="space-y-4">
                {Object.keys(soundConfig).map((key, index) => {
                  const soundKey = key as SoundKey;
                  const setting = soundSettings[soundKey];

                  return (
                    <motion.div
                      key={soundKey}
                      className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                            {getSoundName(soundKey)}
                          </h3>
                          <motion.button
                            className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800/50 transition-colors disabled:opacity-50"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => testPlaySound(soundKey)}
                            disabled={!setting.enabled || isMuted}
                            title={t?.sound.testPlay || '测试播放'}
                          >
                            <Play className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          </motion.button>
                        </div>

                        <motion.label
                          className="relative inline-flex items-center cursor-pointer"
                          whileHover={{ scale: 1.05 }}
                        >
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={setting.enabled}
                            onChange={(e) => {
                              saveSoundSettings({
                                ...soundSettings,
                                [soundKey]: {
                                  ...setting,
                                  enabled: e.target.checked,
                                },
                              });
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </motion.label>
                      </div>

                      {setting.enabled && (
                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          onTouchStart={(e) => e.stopPropagation()}
                          onTouchMove={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">
                              {t?.sound.volume || '音量'}:
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={setting.volume}
                              onChange={(e) => {
                                saveSoundSettings({
                                  ...soundSettings,
                                  [soundKey]: {
                                    ...setting,
                                    volume: parseFloat(e.target.value),
                                  },
                                });
                              }}
                              onTouchStart={(e) => e.stopPropagation()}
                              onTouchMove={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[35px] text-right">
                              {Math.round(setting.volume * 100)}%
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* 任务模板设置 Item */}

            <motion.div
              className="backdrop-blur-xl rounded-3xl p-6 shadow-lg border bg-white/70 border-white/40 shadow-gray-200/30 dark:bg-gray-800/70 dark:border-gray-700/40 dark:shadow-black/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <Link href={'/settings/task'}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ListTodo className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      {t?.taskTemplate?.title || '任务模板设置'}
                    </h2>
                  </div>

                  <motion.label
                    className="relative inline-flex items-center cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                  </motion.label>
                </div>
              </Link>
            </motion.div>

            <motion.div
              className="backdrop-blur-xl rounded-3xl p-6 shadow-lg border bg-white/70 border-white/40 shadow-gray-200/30 dark:bg-gray-800/70 dark:border-gray-700/40 dark:shadow-black/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <Link href={'/settings/time'}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      {t?.flying?.title}
                    </h2>
                  </div>

                  <motion.label
                    className="relative inline-flex items-center cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                  </motion.label>
                </div>
              </Link>
            </motion.div>

            {/* 其他设置区域预留 */}
            <motion.div
              className="backdrop-blur-xl rounded-3xl p-6 shadow-lg border bg-white/70 border-white/40 shadow-gray-200/30 dark:bg-gray-800/70 dark:border-gray-700/40 dark:shadow-black/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {t?.other.title || '其他设置'}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                {t?.other.comingSoon || '更多设置选项即将推出...'}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider {
          touch-action: pan-x;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          touch-action: pan-x;
        }

        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          touch-action: pan-x;
        }
      `}</style>
    </div>
  );
}

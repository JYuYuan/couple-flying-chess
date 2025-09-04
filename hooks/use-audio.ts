import { useRef, useEffect, useCallback } from 'react';

interface UseAudioOptions {
  /**
   * 音频源路径
   */
  src: string;
  /**
   * 是否预加载音频
   * @default true
   */
  preload?: boolean;
  /**
   * 音频音量 (0.0 到 1.0)
   * @default 1.0
   */
  volume?: number;
  /**
   * 是否循环播放
   * @default false
   */
  loop?: boolean;
}

/**
 * 用于管理音频播放的自定义 Hook
 * @param options 音频配置选项
 * @returns 播放、暂停和停止音频的方法
 */
function useAudio(options: UseAudioOptions) {
  const { src, preload = true, volume = 1.0, loop = false } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音频元素
  useEffect(() => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.loop = loop;

    if (preload) {
      audio.preload = 'auto';
    }

    audioRef.current = audio;

    // 清理函数
    return () => {
      audio.pause();
      // 清除引用，避免内存泄漏
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
      // 释放音频资源
      audio.remove();
    };
  }, [src, volume, loop, preload]);

  // 播放音频
  const play = useCallback(async (options?: { volume?: number }) => {
    if (!audioRef.current) return;

    try {
      // 设置音量（如果提供）
      if (options?.volume !== undefined) {
        audioRef.current.volume = options.volume;
      }

      // 重置到开始位置
      audioRef.current.currentTime = 0;

      // 播放音频
      await audioRef.current.play();
      return true;
    } catch (error) {
      console.error('播放音频失败:', error);
      return false;
    }
  }, []);

  // 暂停音频
  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  // 停止音频（暂停并重置到开始位置）
  const stop = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  return {
    play,
    pause,
    stop,
    /**
     * 直接访问底层的 audio 元素
     * 注意：谨慎使用，直接操作 DOM 元素可能带来副作用
     */
    audio: audioRef.current,
  };
}

export { useAudio };
export type { UseAudioOptions };

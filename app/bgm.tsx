'use client';
import type React from 'react';
import { useEffect } from 'react';
import { useGlobal } from '@/contexts/GlobalContext';

const Bgm: React.FC = () => {
  const { playSound, getAudioRef, stopSound } = useGlobal();

  useEffect(() => {
    // 初次尝试播放（可能被拦截）
    //playSound('bgm');

    const handleUserInteraction = () => {
      const bgmRef = getAudioRef("bgm"); // ✅ 每次事件触发时重新获取
      if (bgmRef && bgmRef.paused) {
        playSound("bgm");
        // 播放成功就解绑所有监听
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      }
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

  }, [playSound, stopSound, getAudioRef]);

  return null;
};

export default Bgm;

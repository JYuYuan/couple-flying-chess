'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

type SoundContextType = {
  isMuted: boolean;
  toggleMute: () => void;
  registerAudio: (audio?: HTMLAudioElement | null) => void;
  unregisterAudio: (audio?: HTMLAudioElement | null) => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isMuted') === 'true';
    }
    return false;
  });

  const audioRefs = useRef<Set<HTMLAudioElement>>(new Set());

  // 注册音频元素
  const registerAudio = (audio?: HTMLAudioElement | null) => {
    if (!audio) return;
    audioRefs.current.add(audio);
    audio.muted = isMuted;
    return () => unregisterAudio(audio);
  };

  // 注销音频元素
  const unregisterAudio = (audio?: HTMLAudioElement | null) => {
    if (!audio) return;
    audioRefs.current.delete(audio);
  };

  // 当静音状态改变时，更新所有已注册的音频元素
  useEffect(() => {
    console.log('Mute state changed to:', isMuted);
    audioRefs.current.forEach((audio) => {
      audio.muted = isMuted;
    });
    localStorage.setItem('isMuted', String(isMuted));
  }, [isMuted]);

  const toggleMute = () => {
    console.log('Toggling mute. Current state:', isMuted);
    setIsMuted((prev) => !prev);
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, registerAudio, unregisterAudio }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

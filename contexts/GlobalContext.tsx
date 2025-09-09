'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  RefObject,
  useCallback,
} from 'react';
import { Language, Translations, loadTranslations } from '@/lib/i18n';
import { soundConfig, SoundKey } from './config/sounds';

type Theme = 'light' | 'dark';

// 声音类型
type SoundOptions = {
  loop?: boolean;
  volume?: number; // 0 ~ 1
};

type GlobalContextType = {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  themeMounted: boolean;

  // Language
  language: Language;
  loadingTranslations: boolean;
  setLanguage: (lang: Language) => void;
  translations?: Translations;

  // Sound
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (key: SoundKey) => void;
  stopSound: (key: SoundKey) => void;
  stopAllSounds: () => void;
  getAudioRef: (key: SoundKey) => HTMLAudioElement | undefined;
  getAllAudioRef: (key: SoundKey) => Map<SoundKey, HTMLAudioElement> | undefined;
};

// ----- Context -----
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // -------- Theme --------
  const [theme, setTheme] = useState<Theme>('light');
  const [themeMounted, setThemeMounted] = useState(false);
  const [loadingTranslations, setLoadingTranslations] = useState<boolean>(true);
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  // -------- Language --------
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language | null;
      return savedLang || 'zh';
    }
    return 'zh';
  });
  const [translations, setTranslations] = useState<Translations>();

  // -------- Sound --------
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isMuted') === 'true';
    }
    return false;
  });

  // 声音池：用 Map 管理
  const soundsRef = useRef<Map<SoundKey, HTMLAudioElement>>(new Map());

  const getAudioRef = useCallback(
    (key: SoundKey) => {
      return soundsRef.current?.get(key);
    },
    [soundsRef.current],
  );

  const getAllAudioRef = useCallback(() => {
    return soundsRef.current;
  }, [soundsRef.current]);

  const playSound = (key: SoundKey) => {
    const config = soundConfig[key];
    if (!config) {
      console.warn(`Sound ${key} not found in config`);
      return;
    }

    let audio = soundsRef.current.get(key);

    if (!audio) {
      audio = new Audio(config.src);
      audio.preload = 'auto';
      soundsRef.current.set(key, audio);
    }

    audio.loop = config.loop ?? false;
    audio.volume = config.volume ?? 1;
    audio.muted = isMuted;

    audio.currentTime = 0;
    audio.play().catch((e) => {
      console.warn(`Audio play blocked: ${key}`, e);
    });
  };

  const stopSound = (key: SoundKey) => {
    const audio = soundsRef.current.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const stopAllSounds = () => {
    soundsRef.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  };

  // mute 切换时，更新所有实例
  useEffect(() => {
    soundsRef.current.forEach((audio) => {
      audio.muted = isMuted;
    });
    localStorage.setItem('isMuted', String(isMuted));
  }, [isMuted]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  // -------- Theme 初始化 --------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      const initialTheme = savedTheme || systemTheme;
      setTheme(initialTheme);
      setThemeMounted(true);
    } catch {
      setThemeMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!themeMounted || typeof document === 'undefined') return;

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme, themeMounted]);

  // -------- 翻译加载 --------
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  useEffect(() => {
    const loadTranslationsAsync = async () => {
      setLoadingTranslations(true);
      try {
        const data = await loadTranslations(language);
        setTranslations(data);
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setLoadingTranslations(false);
      }
    };
    loadTranslationsAsync();
  }, [language]);

  // -------- Context Value --------
  const contextValue: GlobalContextType = {
    theme,
    setTheme,
    toggleTheme,
    themeMounted,

    language,
    setLanguage,
    translations,
    loadingTranslations,

    isMuted,
    toggleMute,

    playSound,
    stopSound,
    stopAllSounds,
    getAudioRef,
    getAllAudioRef,
  };

  if (loadingTranslations) {
    return (
      <div className="game-container start-container">
        <div className="loading-screen flex items-center justify-center h-full">
          <div className="loading-spinner mr-2"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
};

// ----- Hook -----
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};

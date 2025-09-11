'use client';

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Language, loadTranslations, Translations } from '@/lib/i18n';
import { soundConfig, SoundKey } from './config/sounds';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import zh from '@/public/locales/zh.json';

type Theme = 'light' | 'dark';

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
  soundSettings: Record<SoundKey, { enabled: boolean; volume: number }>;
  saveSoundSettings: (sounds: Record<SoundKey, { enabled: boolean; volume: number }>) => void;

  // Dialog
  showToast: (message: string, type?: 'success' | 'error') => void;
  showConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ) => void;
  hideConfirmDialog: () => void;
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
  const [translations, setTranslations] = useState<Translations>(zh as any);

  // -------- Sound --------
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isMuted') === 'true';
    }
    return false;
  });

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

  const saveSoundSettings = (newSettings: typeof soundSettings) => {
    setSoundSettings(newSettings);
    localStorage.setItem('soundSettings', JSON.stringify(newSettings));
  };
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

  const playSound = useCallback((key: SoundKey) => {
    const config = {...soundConfig[key],...soundSettings[key]};
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
    audio.muted = isMuted?isMuted:!config.enabled;
    audio.currentTime = 0;
    
    audio.play().catch((e) => {
      console.warn(`Audio play blocked: ${key}`, e);
    });
  },[soundsRef.current,soundSettings]);


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
    Object.entries(soundConfig).forEach(([key,config]:any)=>{
      const audio = new Audio(config.src);
      audio.preload = 'auto';
      audio.addEventListener("loadedmetadata", () => {
        console.log(key+"：元数据已加载，时长:", audio.duration);
      });

      audio.addEventListener("canplay", () => {
        console.log(key+"：音频可播放");
      });

      audio.addEventListener("canplaythrough", () => {
        console.log(key+"：音频已完全加载，可以流畅播放");
      });

      audio.addEventListener("error", (e) => {
        console.error(key+"：音频加载失败", e);
      });
      soundsRef.current.set(key as any, audio);
    })
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

  // -------- Dialog --------
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirmDialog = useCallback(
    (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        onConfirm,
        onCancel,
      });
    },
    [],
  );

  const hideConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const showToast = useCallback((message: string, type?: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

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
    soundSettings, 
    saveSoundSettings,

    showToast,
    showConfirmDialog,
    hideConfirmDialog,
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

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' && <CheckCircle size={20} />}
          {toast.type === 'error' && <XCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      <AnimatePresence>
        {confirmDialog.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget &&
              (confirmDialog.onCancel ? confirmDialog.onCancel() : hideConfirmDialog())
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="
                bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl
                w-full max-w-sm mx-4 overflow-hidden
                border border-gray-200/20 dark:border-gray-700/20
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* 弹窗标题 */}
              <div className="px-6 pt-6 pb-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {confirmDialog.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>

              {/* 按钮区域 */}
              <div className="flex flex-col">
                {/* 分割线 */}
                <div className="h-px bg-gray-200 dark:bg-gray-700" />

                {/* 确认按钮 */}
                <motion.button
                  onClick={confirmDialog.onConfirm}
                  className="
                    w-full py-4 text-center text-blue-600 dark:text-blue-400 font-semibold text-base
                    hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                    active:bg-blue-100 dark:active:bg-blue-900/40
                  "
                  whileTap={{ scale: 0.98 }}
                >
                  {translations?.common.confirm}
                </motion.button>

                {/* 分割线 */}
                <div className="h-px bg-gray-200 dark:bg-gray-700" />

                {/* 取消按钮 */}
                <motion.button
                  onClick={confirmDialog.onCancel || hideConfirmDialog}
                  className="
                    w-full py-4 text-center text-gray-600 dark:text-gray-400 font-medium text-base
                    hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                    active:bg-gray-100 dark:active:bg-gray-700
                  "
                  whileTap={{ scale: 0.98 }}
                >
                  {translations?.common.cancel}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlobalContext.Provider>
  );
};

// ----- Hook -----
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};

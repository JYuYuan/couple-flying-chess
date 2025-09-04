import { GameMode } from '@/components/game/flying/types/game';

export type Language = 'zh' | 'en' | 'ja';
export type modeContent = { name: string; description: string };

export interface HomeTranslations {
  title: string;
  subtitle: string;
  features: {
    title: string;
    classic: {
      title: string;
      description: string;
    };
    interaction: {
      title: string;
      description: string;
    };
    modes: {
      title: string;
      description: string;
    };
  };
  cta: {
    startGame: string;
    subtext: string;
  };
}

export interface Translations {
  home: HomeTranslations;
  common: {
    loading: string;
    start: string;
    restart: string;
    completed: string;
    failed: string;
    rollDice: string;
    rolling: string;
    moving: string;
    preparing: string;
    skipToHome: string;
    cancel: string;
  };
  game: {
    title: string;
    subtitle: string;
    selectMode: string;
    modeDescription: string;
    redTurn: string;
    blueTurn: string;
    redWin: string;
    blueWin: string;
    backToHome: string;
    selectWinTask: string;
    winTasksTitle: string;
    winTaskExecution: string;
    celebrationMessage: string;
    continueGameMessage: string;
    continueGameTitle: string;
    continueGame: string;
    gameMode: string;
    newGame: string;
    modeTitle: string;
    currentPlayer: string;
    positions: string;
    red: string;
    blue: string;
    lastLocation: string;
    findLocalGame: string;
    star: {
      title: string;
      subtitle: string;
    };
    collision: {
      title: string;
      subtitle: string;
    };
    trap: {
      title: string;
      subtitle: string;
    };
  };
  modes: Record<GameMode, modeContent>;
  modeCategories: {
    basic: string;
    lifestyle: string;
    adult: string;
  };
  customMode: {
    title: string;
    description: string;
    create: string;
    edit: string;
    delete: string;
    deleteConfirm: string;
    creatorType: {
      type: string;
      ai: string;
      custom: string;
    };
    ai: {
      role: string;
      title: string;
      number: string;
      keyword: string;
      deepSeekKey: string;
      loadTasks: string;
      fromExistingModes: string;
      apiKeyRequired: string;
      invalidTaskNumber: string;
      tasksGenerated: string;
      generationFailed: string;
      defaultKeyword: string;
      template: string;
      link: string;
    };
    creator: {
      title: string;
      subTitle: string;
      close: string;
      basicInfo: string;
      modeName: string;
      modeDescription: string;
      modeNamePlaceholder: string;
      modeDescriptionPlaceholder: string;
      taskSelection: string;
      fromExistingModes: string;
      loadTasks: string;
      loading: string;
      manualAdd: string;
      manualAddPlaceholder: string;
      selectedTasks: string;
      taskCount: string;
      createButton: string;
      cancel: string;
      nameRequired: string;
      tasksRequired: string;
      baseInfo: string;
    };
    messages: {
      createSuccess: string;
      deleteSuccess: string;
      loadTasksError: string;
    };
  };
  board: {
    start: string;
    end: string;
    star: string;
    trap: string;
  };
  tasks: {
    challenge: string;
    starTask: string;
    trapTask: string;
    collisionTask: string;
    redExecute: string;
    blueExecute: string;
    completedReward: string;
    failedPenalty: string;
    collisionCompletedReward: string;
    collisionFailedPenalty: string;
    emptyQueue: string;
  };
  tips: {
    twoPlayers: string;
    faceToFace: string;
    improveRelation: string;
  };
  toast: {
    redForward: string;
    blueForward: string;
    redBackward: string;
    blueBackward: string;
    redStay: string;
    blueStay: string;
    redFailedToStart: string;
    blueFailedToStart: string;
    redCompleted: string;
    blueCompleted: string;
  };
}

const translations: Record<string, Translations> = {};

export async function loadTranslations(lang: Language): Promise<Translations> {
  if (translations[lang]) {
    return translations[lang];
  }

  try {
    const response = await fetch(`/locales/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${lang}`);
    }
    const data = await response.json();
    translations[lang] = data;
    return data;
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);
    // Fallback to Chinese if loading fails
    if (lang !== 'zh') {
      return loadTranslations('zh');
    }
    throw error;
  }
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}

export const languageNames: Record<Language, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
};

export const languageFlags: Record<Language, string> = {
  zh: '🇨🇳',
  en: '🇺🇸',
  ja: '🇯🇵',
};

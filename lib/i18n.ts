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

interface CustomModeManager {
  title: string;
  noModes: string;
  createFirstMode: string;
  createMode: string;
  editMode: string;
  importMode: string;
  exportMode: string;
  modeName: string;
  modeDescription: string;
  taskList: string;
  addTask: string;
  taskPlaceholder: string;
  batchAddTasks: string;
  pasteFromClipboard: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  tasksCount: string;
  createdOn: string;
  type: Type;
  deleteConfirm: DeleteConfirm;
  import: Import;
  clipboard: Clipboard;
  validation: Validation;
}

interface Validation {
  nameRequired: string;
  tasksRequired: string;
}

interface Clipboard {
  noTasks: string;
  readError: string;
}

interface Import {
  success: string;
  invalidFile: string;
  invalidFormat: string;
  overwriteConfirm: DeleteConfirm;
  successImport: string;
  importFailed: string;
  fileError: string;
  readError: string;
}

interface DeleteConfirm {
  title: string;
  message: string;
}

interface Type {
  ai: string;
  custom: string;
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
    confirm:string;
  };
  customModeManager: CustomModeManager;
  settings: {
    title: string;
    backToHome: string;
    sound: {
      title: string;
      enabled: string;
      disabled: string;
      volume: string;
      testPlay: string;
      globalMute: string;
      names: {
        bgm: string;
        rollDice: string;
        stepDice: string;
        countDown: string;
        stopDice: string;
      };
    };
    taskTemplate: {
      title: string;
    };
    other: {
      title: string;
      comingSoon: string;
    };
    flying: {
      title: string;
      backToGameMode: string;
      resetToDefaults: string;
      basic: {
        title: string;
        defaultTaskTime: string;
        defaultTaskTimeDesc: string;
        smartTimeDetection: string;
        smartTimeDetectionDesc: string;
      };
      keywords: {
        title: string;
        addNew: string;
        addNewKeyword: string;
        seconds: string;
        deleteKeyword: string;
      };
      test: {
        title: string;
        taskContent: string;
        taskPlaceholder: string;
        detectedTime: string;
        matchedKeywords: string;
        detectionReason: string;
        noMatch: string;
        tryExamples: string;
        useDefault: string;
        matchedKeyword: string;
        multipleKeywords: string;
      };
      usage: {
        title: string;
        point1: string;
        point2: string;
        point3: string;
        point4: string;
        point5: string;
      };
    };
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
    roleplay: string;
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

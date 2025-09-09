// 游戏时间管理工具
import { randomMs } from '@/lib/utils';

export interface TimeSettings {
  defaultTaskTime: number; // 默认任务时间（秒）
  keywordTimes: { [keyword: string]: number }; // 关键词对应时间（秒）
  enableAutoTime: boolean; // 是否启用关键词自动时间
}

// 默认时间设置
export const defaultTimeSettings: TimeSettings = {
  defaultTaskTime: 60,
  keywordTimes: {
    亲吻: 10,
    拥抱: 15,
    按摩: 120,
    做菜: 300,
    运动: 600,
    游戏: 180,
    跳舞: 120,
    唱歌: 60,
    拍照: 30,
    聊天: 300,
    写作: 600,
    阅读: 900,
    绘画: 1200,
    冥想: 300,
    瑜伽: 1800,
    购物: 3600,
    散步: 1200,
    看电影: 7200,
    洗澡: 1800,
    化妆: 1200,
    打扫: 2400,
  },
  enableAutoTime: true,
};

// 从本地存储加载时间设置
export const loadTimeSettings = (): TimeSettings => {
  if (typeof window === 'undefined') {
    return defaultTimeSettings;
  }

  try {
    const savedSettings = localStorage.getItem('flyingTimeSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        ...defaultTimeSettings,
        ...parsed,
        keywordTimes: { ...defaultTimeSettings.keywordTimes, ...parsed.keywordTimes },
      };
    }
  } catch (error) {
    console.error('Failed to load time settings:', error);
  }

  return defaultTimeSettings;
};

// 保存时间设置到本地存储
export const saveTimeSettings = (settings: TimeSettings): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('flyingTimeSettings', JSON.stringify(settings));
  }
};

// 检测任务内容中的关键词并返回对应时间
export const detectTaskTime = (taskContent: string, settings?: TimeSettings): number => {
  const timeSettings = settings || loadTimeSettings();

  // 如果未启用自动时间检测，返回默认时间
  if (!timeSettings.enableAutoTime) {
    return timeSettings.defaultTaskTime;
  }

  let maxTime = 0;
  let matchedKeywords: string[] = [];

  // 检测所有匹配的关键词
  Object.entries(timeSettings.keywordTimes).forEach(([keyword, time]) => {
    if (taskContent.includes(keyword)) {
      matchedKeywords.push(keyword);
      maxTime = Math.max(maxTime, time);
    }
  });

  // 如果找到匹配的关键词，返回最长时间
  if (matchedKeywords.length > 0) {
    console.log(
      `Task: "${taskContent}" matched keywords: [${matchedKeywords.join(', ')}], time: ${maxTime}s`,
    );
    return maxTime;
  }

  // 未找到关键词，返回默认时间
  return timeSettings.defaultTaskTime;
};

// 格式化时间显示（秒转换为易读格式）
export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
  }
};

// 秒转换为毫秒（用于Timer组件）
export const secondsToMilliseconds = (seconds: number): number => {
  return seconds * 1000;
};

// 获取任务建议时间
export const getSuggestedTaskTime = (
  taskContent: string,
): { time: number; reason: string; keywords: string[] } => {
  const timeSettings = loadTimeSettings();
  const min = 5,
    max = timeSettings.defaultTaskTime;
  let maxTime = Math.floor(randomMs(min * 1000, max * 1000) / 1000);
  let matchedKeywords: string[] = [];
  let reason = `使用默认随机时间${min}秒~${max}秒`;

  if (timeSettings.enableAutoTime) {
    Object.entries(timeSettings.keywordTimes).forEach(([keyword, time]) => {
      if (taskContent.includes(keyword)) {
        matchedKeywords.push(keyword);
        maxTime = time;
        reason = `匹配关键词"${keyword}"`;
      }
    });

    if (matchedKeywords.length > 1) {
      reason = `匹配多个关键词，使用最长时间`;
    }
  }

  return {
    reason,
    time: maxTime,
    keywords: matchedKeywords,
  };
};

// 批量检测多个任务的时间
export const detectBatchTaskTimes = (
  tasks: string[],
  settings?: TimeSettings,
): Array<{
  task: string;
  time: number;
  keywords: string[];
}> => {
  return tasks.map((task) => {
    const time = detectTaskTime(task, settings);
    const suggestion = getSuggestedTaskTime(task);
    return {
      task,
      time,
      keywords: suggestion.keywords,
    };
  });
};

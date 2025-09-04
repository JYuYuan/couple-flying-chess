import { useState, useCallback } from 'react';
import type { DeepSeekApiConfig } from '../types/game';
import { Translations } from '@/lib/i18n';

export function useAITaskGeneration() {
  const [deepSeekApi, setDeepSeekApi] = useState<DeepSeekApiConfig>({
    taskNum: '10',
    keyword: '',
    tasks: [],
  });
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  const saveDeepSeekApiKey = useCallback((key: string) => {
    setDeepSeekApi((prev) => ({ ...prev, apiKey: key }));
    localStorage.setItem('deepSeekApiKey', key);
  }, []);

  const loadDeepSeekApiKey = useCallback(() => {
    try {
      const savedKey = localStorage.getItem('deepSeekApiKey');
      if (savedKey) {
        setDeepSeekApi((prev) => ({ ...prev, apiKey: savedKey }));
      }
    } catch (error) {
      console.error('Failed to load DeepSeek API key:', error);
    }
  }, []);

  const generateAITasks = useCallback(
    async (
      newCustomMode: any,
      translations?: Translations,
      onSuccess?: () => void,
      onError?: (message: string) => void,
    ) => {
      setIsGeneratingTasks(true);

      try {
        if (!deepSeekApi.apiKey) {
          onError?.(
            translations?.customMode.ai.apiKeyRequired || 'Please enter your DeepSeek API key',
          );
          return;
        }

        const count = parseInt(deepSeekApi.taskNum) || 5;
        if (count < 1 || count > 30) {
          onError?.(
            translations?.customMode.ai.invalidTaskNumber ||
              'Please enter a number between 1 and 10',
          );
          return;
        }

        const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deepSeekApi.apiKey}`,
          },
          body: JSON.stringify({
            model: 'Qwen/QwQ-32B',
            messages: [
              {
                role: 'user',
                content: translations?.customMode.ai.template
                  .replace(`\${role}`, deepSeekApi.role || '')
                  .replace(
                    `\${keyword}`,
                    deepSeekApi.keyword ||
                      newCustomMode.description ||
                      translations?.customMode.ai.defaultKeyword,
                  )
                  .replace(`\${count}`, `${count}`),
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('No content in API response');
        }

        let tasks: string[] = [];
        try {
          tasks = JSON.parse(content);
          if (!Array.isArray(tasks)) {
            throw new Error('Invalid response format');
          }
        } catch (e) {
          tasks = content
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.match(/^\d+\.\s*/))
            .map((line: string) => line.replace(/^\d+\.\s*/, ''))
            .filter(Boolean);
        }

        if (tasks.length === 0) {
          throw new Error('No tasks generated');
        }

        setDeepSeekApi((prev) => ({
          ...prev,
          tasks: [...new Set([...prev.tasks, ...tasks])],
        }));

        onSuccess?.();
      } catch (error) {
        console.error('Error generating tasks:', error);
        onError?.(
          translations?.customMode.ai.generationFailed ||
            'Failed to generate tasks. Please try again.',
        );
      } finally {
        setIsGeneratingTasks(false);
      }
    },
    [deepSeekApi],
  );

  return {
    deepSeekApi,
    setDeepSeekApi,
    isGeneratingTasks,
    saveDeepSeekApiKey,
    loadDeepSeekApiKey,
    generateAITasks,
  };
}

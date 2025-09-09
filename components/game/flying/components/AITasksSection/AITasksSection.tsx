import React from 'react';
import { Check } from 'lucide-react';
import type { DeepSeekApiConfig, NewCustomMode } from '@/components/game/flying/types/game';
import { Translations } from '@/lib/i18n';
import { useGlobal } from '@/contexts/GlobalContext';

interface AITasksSectionProps {
  deepSeekApi: DeepSeekApiConfig;
  newCustomMode: NewCustomMode;
  isGeneratingTasks: boolean;
  onApiKeyChange: (key: string) => void;
  onApiConfigChange: (updates: Partial<DeepSeekApiConfig>) => void;
  onGenerateTasks: () => void;
  onToggleTask: (task: string) => void;
}

export function AITasksSection({
  deepSeekApi,
  newCustomMode,
  isGeneratingTasks,
  onApiKeyChange,
  onApiConfigChange,
  onGenerateTasks,
  onToggleTask,
}: AITasksSectionProps) {
  const { translations } = useGlobal();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">API 配置</h4>
        <div className="space-y-3">
          <input
            type="text"
            maxLength={100}
            value={deepSeekApi.apiKey}
            placeholder={translations?.customMode.ai.deepSeekKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <a
            href="https://cloud.siliconflow.cn/me/account/ak"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium transition-colors duration-200 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
          >
            {translations?.customMode.ai.link}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {translations?.customMode.ai.role}
          </label>
          <input
            type="text"
            maxLength={100}
            value={deepSeekApi.role}
            placeholder={translations?.customMode.ai.role}
            onChange={(e) => onApiConfigChange({ role: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {translations?.customMode.ai.keyword}
          </label>
          <input
            type="text"
            maxLength={100}
            value={deepSeekApi.keyword}
            placeholder={translations?.customMode.ai.keyword}
            onChange={(e) => onApiConfigChange({ keyword: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {translations?.customMode.ai.number}
          </label>
          <input
            type="text"
            maxLength={30}
            value={deepSeekApi.taskNum}
            placeholder={translations?.customMode.ai.number}
            onChange={(e) => onApiConfigChange({ taskNum: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex items-end">
          <button
            disabled={isGeneratingTasks}
            onClick={onGenerateTasks}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-w-[120px]"
          >
            <div className="flex items-center justify-center space-x-2">
              {isGeneratingTasks && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>
                {isGeneratingTasks
                  ? translations?.customMode.creator.loading
                  : translations?.customMode.ai.loadTasks}
              </span>
            </div>
          </button>
        </div>
      </div>

      {deepSeekApi.tasks && deepSeekApi.tasks?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {translations?.customMode.ai.title}
            </h5>
            <span className="text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full text-xs">
              {deepSeekApi.tasks?.length || 0}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {deepSeekApi.tasks?.map((task, index) => (
              <div
                key={`ai-${index}`}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  newCustomMode.tasks.includes(task)
                    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/30 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-200'
                }`}
                onClick={() => onToggleTask(task)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm flex-1 mr-2">{task}</span>
                  {newCustomMode.tasks.includes(task) && (
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

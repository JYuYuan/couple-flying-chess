'use client';

import React, { useEffect, useState } from 'react';
import { useGlobal } from '@/contexts/GlobalContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clipboard,
  Crown,
  Download,
  Edit2,
  Plus,
  Save,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useTaskManagement } from '@/components/game/flying/hooks/useTaskManagement';
import { useCustomModes } from '@/components/game/flying/hooks/useCustomModes';
import type { CustomMode, GameMode, NewCustomMode } from '@/components/game/flying/types/game';
import Loading from '@/components/Loading';
import { Portal } from '@/components/Portal';
import { useRouter } from 'next/navigation';

// 系统模板接口
interface SystemTemplate {
  mode: GameMode;
  name: string;
  description: string;
  tasks: string[];
}

const SettingTask: React.FC = () => {
  const { translations } = useGlobal();
  const router = useRouter();
  const t = translations?.settings;

  const taskManagement = useTaskManagement();
  const customModes = useCustomModes();

  const {
    customModes: modes,
    loadCustomModes,
    createCustomMode,
    deleteCustomMode,
    updateCustomMode,
  } = customModes;

  const {
    language,
    showToast,
    showConfirmDialog,
    hideConfirmDialog,
    translations: allTranslation,
  } = useGlobal();

  const translation = allTranslation?.customModeManager;

  const [activeTab, setActiveTab] = useState<'custom' | 'system'>('custom');
  const [isCreating, setIsCreating] = useState(false);
  const [editingMode, setEditingMode] = useState<CustomMode | null>(null);
  const [editingSystemTemplate, setEditingSystemTemplate] = useState<SystemTemplate | null>(null);
  const [newMode, setNewMode] = useState<NewCustomMode>({
    name: '',
    type: 'custom',
    description: '',
    tasks: [],
  });
  const [newTask, setNewTask] = useState('');
  const [expandedModes, setExpandedModes] = useState<Set<string>>(new Set());
  const [expandedSystemModes, setExpandedSystemModes] = useState<Set<GameMode>>(new Set());
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editingTaskValue, setEditingTaskValue] = useState('');

  // 获取系统模板数据
  const systemTemplates: SystemTemplate[] = React.useMemo(() => {
    if (!taskManagement.availableModeTasks) return [];

    const modeNames: Record<GameMode, string> = {
      normal: '普通模式',
      love: '恋爱模式',
      couple: '情侣模式',
      advanced: '进阶模式',
      intimate: '亲密模式',
      mixed: '混合模式',
      hetero: '异性模式',
      daily: '日常模式',
      food: '美食模式',
      fitness: '健身模式',
      creative: '创意模式',
      romantic: '浪漫模式',
      game: '游戏模式',
      adult: '成人模式',
      'master-slave-sex': '主从模式',
      custom: '自定义模式',
      'roleplay-workplace': '职场角色扮演',
      'roleplay-fantasy': '奇幻角色扮演',
      'roleplay-uniform': '制服角色扮演',
      'roleplay-ancient': '古代角色扮演',
    };

    const modeDescriptions: Record<GameMode, string> = {
      normal: '适合日常娱乐的轻松任务',
      love: '增进感情的甜蜜挑战',
      couple: '专为情侣设计的互动任务',
      advanced: '更具挑战性的进阶任务',
      intimate: '增进亲密关系的温馨任务',
      mixed: '多种类型任务的完美组合',
      hetero: '异性互动的特色任务',
      daily: '融入生活的日常小任务',
      food: '与美食相关的趣味挑战',
      fitness: '健康运动的活力任务',
      creative: '激发创意的想象力任务',
      romantic: '营造浪漫氛围的温馨任务',
      game: '游戏化的趣味互动任务',
      adult: '成人向的深度互动任务',
      'master-slave-sex': '角色扮演的特殊模式',
      custom: '用户自定义的个性化任务',
      'roleplay-workplace': '职场场景的角色扮演任务',
      'roleplay-fantasy': '奇幻世界的想象力任务',
      'roleplay-uniform': '制服主题的角色扮演',
      'roleplay-ancient': '古代背景的历史角色扮演',
    };

    return Object.entries(taskManagement.availableModeTasks)
      .filter(([mode, tasks]) => mode !== 'custom' && tasks && tasks.length > 0)
      .map(([mode, tasks]) => ({
        mode: mode as GameMode,
        name: modeNames[mode as GameMode] || mode,
        description: modeDescriptions[mode as GameMode] || `${mode} 模式的系统任务`,
        tasks: tasks,
      }));
  }, [taskManagement.availableModeTasks]);

  useEffect(() => {
    loadCustomModes();
  }, [loadCustomModes]);

  useEffect(() => {
    taskManagement.loadAllTasksForSelection(language);
  }, [language]);

  // 控制背景滚动
  useEffect(() => {
    if (isCreating) {
      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复背景滚动
      document.body.style.overflow = '';
    }

    // 清理函数
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreating]);

  const handleSave = async () => {
    if (editingMode) {
      // 更新现有模式
      updateCustomMode(editingMode.id, {
        name: newMode.name.trim(),
        description: newMode.description.trim() || translation?.modeDescription || '自定义模式',
        tasks: [...newMode.tasks],
        type: newMode.type,
      });
      setEditingMode(null);
      resetForm();
    } else if (editingSystemTemplate) {
      // 基于系统模板创建自定义模式
      const success = createCustomMode(
        {
          ...newMode,
          name: newMode.name.trim(),
          description:
            newMode.description.trim() || `基于 ${editingSystemTemplate.name} 的自定义模式`,
          type: 'custom',
        },
        () => {
          setIsCreating(false);
          setEditingSystemTemplate(null);
          resetForm();
          // 切换到自定义模式标签页
          setActiveTab('custom');
        },
      );
      if (!success) {
        showToast(
          `${translation?.validation?.nameRequired || '请填写模式名称'}并${translation?.validation?.tasksRequired || '添加至少一个任务'}`,
          'error',
        );
      }
    } else {
      // 创建新模式
      const success = createCustomMode(newMode, () => {
        setIsCreating(false);
        resetForm();
      });
      if (!success) {
        showToast(
          `${translation?.validation?.nameRequired || '请填写模式名称'}并${translation?.validation?.tasksRequired || '添加至少一个任务'}`,
          'error',
        );
      }
    }
  };

  const resetForm = () => {
    setNewMode({
      name: '',
      type: 'custom',
      description: '',
      tasks: [],
    });
    setNewTask('');
    setIsCreating(false);
    setEditingMode(null);
    setEditingSystemTemplate(null);
    setEditingTaskIndex(null);
    setEditingTaskValue('');
  };

  const handleEdit = (mode: CustomMode) => {
    setEditingMode(mode);
    setNewMode({
      name: mode.name,
      type: mode.type,
      description: mode.description,
      tasks: [...mode.tasks],
    });
    setIsCreating(true);
  };

  const handleEditSystemTemplate = (template: SystemTemplate) => {
    setEditingSystemTemplate(template);
    setNewMode({
      name: `${template.name} (副本)`,
      type: 'custom',
      description: template.description,
      tasks: [...template.tasks],
    });
    setIsCreating(true);
  };

  const handleDelete = (mode: CustomMode) => {
    showConfirmDialog(
      translation?.deleteConfirm?.title || '删除确认',
      translation?.deleteConfirm?.message?.replace('{modeName}', mode.name) ||
        `确定要删除模式"${mode.name}"吗？此操作无法撤销。`,
      () => {
        deleteCustomMode(mode.id);
        showToast(`已删除模式"${mode.name}"`, 'success');
        hideConfirmDialog();
      },
      hideConfirmDialog,
    );
  };

  const addTask = () => {
    if (newTask.trim()) {
      setNewMode((prev) => ({
        ...prev,
        tasks: [...prev.tasks, newTask.trim()],
      }));
      setNewTask('');
    }
  };

  const removeTask = (index: number) => {
    setNewMode((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const startEditingTask = (index: number, currentValue: string) => {
    setEditingTaskIndex(index);
    setEditingTaskValue(currentValue);
  };

  const saveTaskEdit = () => {
    if (editingTaskIndex !== null && editingTaskValue.trim()) {
      setNewMode((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task, index) =>
          index === editingTaskIndex ? editingTaskValue.trim() : task,
        ),
      }));
    }
    setEditingTaskIndex(null);
    setEditingTaskValue('');
  };

  const cancelTaskEdit = () => {
    setEditingTaskIndex(null);
    setEditingTaskValue('');
  };

  const toggleModeExpansion = (modeId: string) => {
    setExpandedModes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modeId)) {
        newSet.delete(modeId);
      } else {
        newSet.add(modeId);
      }
      return newSet;
    });
  };

  const toggleSystemModeExpansion = (mode: GameMode) => {
    setExpandedSystemModes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mode)) {
        newSet.delete(mode);
      } else {
        newSet.add(mode);
      }
      return newSet;
    });
  };

  const parseClipboardTasks = (text: string): string[] => {
    if (!text.trim()) return [];

    // 支持多种分隔符：换行符、逗号、顿号、分号
    const separators = /[\n,，、;；]/;
    return text
      .split(separators)
      .map((task) => task.trim())
      .filter((task) => task.length > 0);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const tasks = parseClipboardTasks(text);

      if (tasks.length > 0) {
        setNewMode((prev) => ({
          ...prev,
          tasks: [...prev.tasks, ...tasks],
        }));

        showToast(
          translation?.import?.success?.replace('{count}', tasks.length.toString()) ||
            `成功添加 ${tasks.length} 个任务`,
          'success',
        );
      } else {
        showToast(translation?.clipboard?.noTasks || '剪切板中没有找到有效的任务内容', 'error');
      }
    } catch (error) {
      console.error('读取剪切板失败:', error);
      showToast(
        translation?.clipboard?.readError || '读取剪切板失败，请检查浏览器权限设置',
        'error',
      );
    }
  };

  const handleDownloadMode = (mode: CustomMode | SystemTemplate) => {
    const modeData = {
      name: mode.name,
      type: 'custom',
      description: mode.description,
      tasks: mode.tasks,
      createdAt: 'createdAt' in mode ? mode.createdAt : new Date().toISOString(),
      exportedAt: new Date().toISOString(),
      isSystemTemplate: !('createdAt' in mode),
    };

    const jsonData = JSON.stringify(modeData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${mode.name}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`模式 "${mode.name}" 已下载`, 'success');
  };

  const handleImportMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert(translation?.import?.invalidFile || '请选择JSON文件(.json)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const modeData = JSON.parse(text);

        // 验证必要字段
        if (!modeData.name || !modeData.tasks || !Array.isArray(modeData.tasks)) {
          alert(translation?.import?.invalidFormat || '文件格式不正确，缺少必要的模式信息');
          return;
        }

        // 检查是否已存在同名模式
        const existingMode = modes.find((mode) => mode.name === modeData.name);
        if (existingMode) {
          showConfirmDialog(
            translation?.import?.overwriteConfirm?.title || '模式覆盖确认',
            translation?.import?.overwriteConfirm?.message?.replace('{name}', modeData.name) ||
              `已存在名为"${modeData.name}"的模式，是否覆盖现有模式？`,
            () => {
              deleteCustomMode(existingMode.id);

              setTimeout(() => {
                const newModeToImport: NewCustomMode = {
                  name: modeData.name,
                  type: modeData.type || 'custom',
                  description:
                    modeData.description ||
                    translation?.import?.successImport?.split('，')[0] ||
                    '导入的自定义模式',
                  tasks: modeData.tasks,
                };

                updateCustomMode(existingMode.id, newModeToImport);
                showToast(
                  translation?.import?.successImport
                    ?.replace('{name}', modeData.name)
                    ?.replace('{count}', modeData.tasks.length.toString()) ||
                    `成功导入模式"${modeData.name}"，包含 ${modeData.tasks.length} 个任务`,
                  'success',
                );
              }, 100);
              hideConfirmDialog();
            },
            hideConfirmDialog,
          );
        } else {
          const newModeToImport: NewCustomMode = {
            name: modeData.name,
            type: modeData.type || 'custom',
            description:
              modeData.description ||
              translation?.import?.successImport?.split('，')[0] ||
              '导入的自定义模式',
            tasks: modeData.tasks,
          };

          const success = createCustomMode(newModeToImport);
          if (success) {
            showToast(
              translation?.import?.successImport
                ?.replace('{name}', modeData.name)
                ?.replace('{count}', modeData.tasks.length.toString()) ||
                `成功导入模式"${modeData.name}"，包含 ${modeData.tasks.length} 个任务`,
              'success',
            );
          } else {
            showToast(translation?.import?.importFailed || `导入失败，请检查文件内容`, 'error');
          }
        }
      } catch (error) {
        console.error('解析JSON失败:', error);
        showToast(
          translation?.import?.fileError || `文件格式错误，请确保是有效的JSON文件`,
          'error',
        );
      }
    };

    reader.onerror = () => {
      alert(translation?.import?.readError || '文件读取失败');
    };

    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  };

  if (taskManagement.isLoadingTasks) return <Loading />;

  return (
    <>
      <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl bg-gradient-to-br from-blue-200/30 to-indigo-300/40 dark:from-blue-600/15 dark:to-indigo-700/20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* 主要内容容器 */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* 顶部导航 */}
          <motion.div
            className="flex justify-between items-center p-6 sm:p-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.button
              className="
  p-3 rounded-2xl backdrop-blur-xl
  bg-white/70 border-white/40 shadow-gray-200/30
  dark:bg-sky-500/30 dark:border-sky-400/40 dark:shadow-sky-500/30 dark:text-sky-200
  border shadow-lg hover:shadow-xl transition-all duration-200
"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={t?.backToHome || '返回主页'}
              onClick={() => {
                router.back();
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {t?.taskTemplate.title || '任务模板设置'}
            </h1>

            <div className="w-12"></div>
            {/* 占位符保持居中 */}
          </motion.div>

          {/* 设置内容 */}
          <div className="flex-1 px-6 sm:px-8 pb-8">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {/* 操作按钮区域 */}
                <motion.div
                  className="flex justify-around items-center gap-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.button
                    className="
            relative flex items-center gap-2 px-4 py-2 rounded-full
            bg-orange-500 hover:bg-orange-600 text-white
            shadow-lg hover:shadow-xl
            transition-all duration-200
          "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={translation?.importMode || '导入自定义模式文件'}
                  >
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportMode}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="import-mode"
                    />
                    {translation?.importMode || '导入模式'}
                  </motion.button>

                  <motion.button
                    onClick={() => setIsCreating(true)}
                    className="
            flex items-center gap-2 px-4 py-2 rounded-full
            bg-blue-500 hover:bg-blue-600 text-white
            shadow-lg hover:shadow-xl
            transition-all duration-200
          "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    {translation?.createMode || '新增模式'}
                  </motion.button>
                </motion.div>

                {/* 标签页切换 */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <motion.button
                      onClick={() => setActiveTab('custom')}
                      className={`
              px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${
                activeTab === 'custom'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }
            `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        自定义模式
                      </div>
                    </motion.button>
                    <motion.button
                      onClick={() => setActiveTab('system')}
                      className={`
              px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${
                activeTab === 'system'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
              }
            `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        系统模板
                      </div>
                    </motion.button>
                  </div>
                </motion.div>

                {/* 内容区域 */}
                <AnimatePresence mode="wait">
                  {activeTab === 'custom' ? (
                    <motion.div
                      key="custom"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      {/* 自定义模式列表 */}
                      <AnimatePresence>
                        {modes.map((mode, index) => (
                          <motion.div
                            key={mode.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="
                    bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl
                    rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20
                    overflow-hidden
                  "
                          >
                            {/* 模式头部 */}
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                      {mode.name}
                                    </h3>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                      {mode.type === 'ai'
                                        ? translation?.type?.ai || 'AI生成'
                                        : translation?.type?.custom || '自定义'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {mode.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {translation?.tasksCount?.replace(
                                        '{count}',
                                        mode.tasks.length.toString(),
                                      ) || `${mode.tasks.length} 个任务`}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(mode.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    onClick={() => toggleModeExpansion(mode.id)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <motion.div
                                      animate={{ rotate: expandedModes.has(mode.id) ? 90 : 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </motion.div>
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleDownloadMode(mode)}
                                    className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={translation?.exportMode || '下载模式文件'}
                                  >
                                    <Download className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleEdit(mode)}
                                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleDelete(mode)}
                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>

                            {/* 展开的任务列表 */}
                            <AnimatePresence>
                              {expandedModes.has(mode.id) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="p-4 bg-gray-50/50 dark:bg-gray-700/20"
                                >
                                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    {translation?.taskList || '任务列表'}
                                  </h4>
                                  <div className="space-y-2">
                                    {mode.tasks.map((task, taskIndex) => (
                                      <motion.div
                                        key={taskIndex}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: taskIndex * 0.05 }}
                                        className="
                                flex items-center gap-3 p-3 rounded-lg
                                bg-white dark:bg-gray-800 shadow-sm
                                border border-gray-200 dark:border-gray-600
                              "
                                      >
                                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                                          {task}
                                        </span>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* 空状态 - 自定义模式 */}
                      {modes.length === 0 && !isCreating && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-12"
                        >
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                            <Tag className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                            {translation?.noModes || '暂无自定义模式'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                            {translation?.createFirstMode ||
                              '创建你的第一个自定义模式，或从系统模板开始'}
                          </p>
                          <motion.button
                            onClick={() => setIsCreating(true)}
                            className="
                    inline-flex items-center gap-2 px-6 py-3 rounded-xl
                    bg-blue-500 hover:bg-blue-600 text-white
                    shadow-lg hover:shadow-xl
                    transition-all duration-200
                  "
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Plus className="w-4 h-4" />
                            {translation?.createMode || '新增模式'}
                          </motion.button>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="system"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* 系统模板列表 */}
                      <AnimatePresence>
                        {systemTemplates.map((template, index) => (
                          <motion.div
                            key={template.mode}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="
                    bg-gradient-to-br from-purple-50/80 to-indigo-50/80
                    dark:from-purple-900/20 dark:to-indigo-900/20
                    backdrop-blur-xl rounded-2xl shadow-lg
                    border border-purple-200/30 dark:border-purple-700/30
                    overflow-hidden
                  "
                          >
                            {/* 模板头部 */}
                            <div className="p-4 border-b border-purple-100 dark:border-purple-800">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                      {template.name}
                                    </h3>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                      系统模板
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {template.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {`${template.tasks.length} 个任务`}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Crown className="w-3 h-3" />
                                      官方提供
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    onClick={() => toggleSystemModeExpansion(template.mode)}
                                    className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <motion.div
                                      animate={{
                                        rotate: expandedSystemModes.has(template.mode) ? 90 : 0,
                                      }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </motion.div>
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleDownloadMode(template)}
                                    className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="下载系统模板"
                                  >
                                    <Download className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleEditSystemTemplate(template)}
                                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="基于此模板创建自定义模式"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>

                            {/* 展开的任务列表 - 系统模板 */}
                            <AnimatePresence>
                              {expandedSystemModes.has(template.mode) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="p-4 bg-purple-50/30 dark:bg-purple-900/10"
                                >
                                  <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3">
                                    系统任务列表
                                  </h4>
                                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {template.tasks.map((task, taskIndex) => (
                                      <motion.div
                                        key={taskIndex}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: taskIndex * 0.05 }}
                                        className="
                                flex items-center gap-3 p-3 rounded-lg
                                bg-white/80 dark:bg-gray-800/80 shadow-sm
                                border border-purple-200/50 dark:border-purple-700/50
                              "
                                      >
                                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                                          {task}
                                        </span>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* 空状态 - 系统模板 */}
                      {systemTemplates.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-12"
                        >
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                            <Crown className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                            暂无系统模板
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            系统模板正在加载中，请稍候...
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 创建/编辑模式弹窗 */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCreating && (
        <Portal>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && resetForm()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="
                bg-white dark:bg-gray-800 rounded-3xl shadow-2xl
                w-full max-w-2xl h-[90vh] flex flex-col
                border border-white/20 dark:border-gray-700/20
              "
                onClick={(e) => e.stopPropagation()}
              >
                {/* 固定的弹窗头部 */}
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {editingMode
                      ? translation?.editMode || '编辑模式'
                      : editingSystemTemplate
                        ? `基于 "${editingSystemTemplate.name}" 创建模式`
                        : translation?.createMode || '新增模式'}
                  </h3>
                  <motion.button
                    onClick={resetForm}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>

                {/* 可滚动的弹窗内容 */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* 提示信息 - 基于系统模板 */}
                    {editingSystemTemplate && (
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                          <Crown className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            正在基于系统模板 "{editingSystemTemplate.name}" 创建自定义模式
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 模式名称 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {translation?.modeName || '模式名称'}
                      </label>
                      <input
                        type="text"
                        value={newMode.name}
                        onChange={(e) => setNewMode((prev) => ({ ...prev, name: e.target.value }))}
                        className="
                        w-full px-4 py-3 rounded-xl
                        bg-gray-50 dark:bg-gray-700
                        border border-gray-200 dark:border-gray-600
                        text-gray-800 dark:text-gray-200
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200
                      "
                        placeholder={translation?.modeName || '输入模式名称'}
                      />
                    </div>

                    {/* 模式描述 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {translation?.modeDescription || '模式描述'}
                      </label>
                      <textarea
                        value={newMode.description}
                        onChange={(e) =>
                          setNewMode((prev) => ({ ...prev, description: e.target.value }))
                        }
                        rows={3}
                        className="
                        w-full px-4 py-3 rounded-xl
                        bg-gray-50 dark:bg-gray-700
                        border border-gray-200 dark:border-gray-600
                        text-gray-800 dark:text-gray-200
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200 resize-none
                      "
                        placeholder={translation?.modeDescription || '输入模式描述'}
                      />
                    </div>

                    {/* 任务管理 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {translation?.taskList || '任务列表'}
                      </label>

                      {/* 添加任务 */}
                      <div className="flex gap-3 mb-4">
                        <input
                          type="text"
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addTask()}
                          className="
                          flex-1 px-4 py-3 rounded-xl
                          bg-gray-50 dark:bg-gray-700
                          border border-gray-200 dark:border-gray-600
                          text-gray-800 dark:text-gray-200
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200
                        "
                          placeholder={translation?.taskPlaceholder || '输入任务内容'}
                        />
                        <motion.button
                          onClick={handlePasteFromClipboard}
                          className="
                          px-4 py-3 rounded-xl bg-green-500 text-white
                          hover:bg-green-600 transition-all duration-200
                        "
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title={
                            translation?.pasteFromClipboard ||
                            '从剪切板批量添加任务（支持换行、逗号、顿号等分隔符）'
                          }
                        >
                          <Clipboard className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={addTask}
                          disabled={!newTask.trim()}
                          className="
                          px-4 py-3 rounded-xl bg-blue-500 text-white
                          hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-200
                        "
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* 任务列表 */}
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        <AnimatePresence>
                          {newMode.tasks.map((task, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="
                              flex items-center gap-3 p-3 rounded-lg
                              bg-white dark:bg-gray-700 shadow-sm
                              border border-gray-200 dark:border-gray-600
                            "
                            >
                              <div
                                className="
                              w-2 h-2 rounded-full
                              bg-gradient-to-r from-blue-500 to-purple-500
                            "
                              />
                              {editingTaskIndex === index ? (
                                <div className="flex-1 flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={editingTaskValue}
                                    onChange={(e) => setEditingTaskValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveTaskEdit();
                                      if (e.key === 'Escape') cancelTaskEdit();
                                    }}
                                    className="
                                    flex-1 px-2 py-1 rounded
                                    bg-gray-50 dark:bg-gray-600
                                    border border-gray-300 dark:border-gray-500
                                    text-sm text-gray-700 dark:text-gray-300
                                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                  "
                                    autoFocus
                                  />
                                  <motion.button
                                    onClick={saveTaskEdit}
                                    className="p-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title={translation?.save || '保存'}
                                  >
                                    <Save className="w-3 h-3" />
                                  </motion.button>
                                  <motion.button
                                    onClick={cancelTaskEdit}
                                    className="p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title={translation?.cancel || '取消'}
                                  >
                                    <X className="w-3 h-3" />
                                  </motion.button>
                                </div>
                              ) : (
                                <>
                                  <span
                                    className="text-sm text-gray-700 dark:text-gray-300 flex-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    onClick={() => startEditingTask(index, task)}
                                    title="点击编辑"
                                  >
                                    {task}
                                  </span>
                                  <motion.button
                                    onClick={() => startEditingTask(index, task)}
                                    className="p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="编辑"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </motion.button>
                                  <motion.button
                                    onClick={() => removeTask(index)}
                                    className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="删除"
                                  >
                                    <X className="w-3 h-3" />
                                  </motion.button>
                                </>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 固定的弹窗底部 */}
                <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
                  <motion.button
                    onClick={resetForm}
                    className="
                    px-6 py-3 rounded-xl
                    bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                    hover:bg-gray-200 dark:hover:bg-gray-600
                    transition-all duration-200
                  "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {translation?.cancel || '取消'}
                  </motion.button>
                  <motion.button
                    onClick={handleSave}
                    disabled={!newMode.name.trim() || newMode.tasks.length === 0}
                    className="
                    flex items-center gap-2 px-6 py-3 rounded-xl
                    bg-blue-500 text-white hover:bg-blue-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                  "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save className="w-4 h-4" />
                    {editingSystemTemplate ? '创建自定义模式' : translation?.save || '保存'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </Portal>
      )}
    </>
  );
};

export default SettingTask;

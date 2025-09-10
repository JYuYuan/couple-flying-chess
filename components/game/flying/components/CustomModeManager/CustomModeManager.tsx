'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronRight,
  Clipboard,
  Download,
  Edit2,
  Plus,
  Save,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { CustomMode, NewCustomMode } from '@/components/game/flying/types/game';
import { useCustomModes } from '@/components/game/flying/hooks/useCustomModes';
import { useGlobal } from '@/contexts/GlobalContext';

const CustomModeManager: React.FC = () => {
  const customModes = useCustomModes();

  const {
    customModes: modes,
    loadCustomModes,
    createCustomMode,
    deleteCustomMode,
    updateCustomMode,
  } = customModes;

  const { showToast, showConfirmDialog, hideConfirmDialog } = useGlobal();

  const [isCreating, setIsCreating] = useState(false);
  const [editingMode, setEditingMode] = useState<CustomMode | null>(null);
  const [newMode, setNewMode] = useState<NewCustomMode>({
    name: '',
    type: 'custom',
    description: '',
    tasks: [],
  });
  const [newTask, setNewTask] = useState('');
  const [expandedModes, setExpandedModes] = useState<Set<string>>(new Set());
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editingTaskValue, setEditingTaskValue] = useState('');

  useEffect(() => {
    loadCustomModes();
  }, [loadCustomModes]);

  const handleSave = async () => {
    if (editingMode) {
      // 更新现有模式
      updateCustomMode(editingMode.id, {
        name: newMode.name.trim(),
        description: newMode.description.trim() || '自定义模式',
        tasks: [...newMode.tasks],
        type: newMode.type,
      });
      setEditingMode(null);
      resetForm();
    } else {
      // 创建新模式
      const success = createCustomMode(newMode, () => {
        setIsCreating(false);
        resetForm();
      });
      if (!success) {
        alert('请填写模式名称并添加至少一个任务');
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

  const handleDelete = (mode: CustomMode) => {
    showConfirmDialog(
      '删除确认',
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

        // 显示成功提示
        alert(`成功添加 ${tasks.length} 个任务`);
      } else {
        alert('剪切板中没有找到有效的任务内容');
      }
    } catch (error) {
      console.error('读取剪切板失败:', error);
      alert('读取剪切板失败，请检查浏览器权限设置');
    }
  };

  const handleDownloadMode = (mode: CustomMode) => {
    const modeData = {
      name: mode.name,
      type: mode.type,
      description: mode.description,
      tasks: mode.tasks,
      createdAt: mode.createdAt,
      exportedAt: new Date().toISOString(),
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
  };

  const handleImportMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert('请选择JSON文件(.json)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const modeData = JSON.parse(text);

        // 验证必要字段
        if (!modeData.name || !modeData.tasks || !Array.isArray(modeData.tasks)) {
          alert('文件格式不正确，缺少必要的模式信息');
          return;
        }

        // 检查是否已存在同名模式
        const existingMode = modes.find((mode) => mode.name === modeData.name);
        if (existingMode) {
          showConfirmDialog(
            '模式覆盖确认',
            `已存在名为"${modeData.name}"的模式，是否覆盖现有模式？`,
            () => {
              // 如果选择覆盖，先删除现有模式
              deleteCustomMode(existingMode.id);

              // 等待状态更新后再创建新模式
              setTimeout(() => {
                const newModeToImport: NewCustomMode = {
                  name: modeData.name,
                  type: modeData.type || 'custom',
                  description: modeData.description || '导入的自定义模式',
                  tasks: modeData.tasks,
                };

                updateCustomMode(existingMode.id, newModeToImport);
                showToast(
                  `成功导入模式"${modeData.name}"，包含 ${modeData.tasks.length} 个任务`,
                  'success',
                );
              }, 100);
              hideConfirmDialog();
            },
            hideConfirmDialog,
          );
        } else {
          // 创建新模式
          const newModeToImport: NewCustomMode = {
            name: modeData.name,
            type: modeData.type || 'custom',
            description: modeData.description || '导入的自定义模式',
            tasks: modeData.tasks,
          };

          const success = createCustomMode(newModeToImport);
          if (success) {
            showToast(
              `成功导入模式"${modeData.name}"，包含 ${modeData.tasks.length} 个任务`,
              'success',
            );
          } else {
            showToast(`导入失败，请检查文件内容`, 'error');
          }
        }
      } catch (error) {
        console.error('解析JSON失败:', error);
        showToast(`文件格式错误，请确保是有效的JSON文件`, 'error');
      }
    };

    reader.onerror = () => {
      alert('文件读取失败');
    };

    reader.readAsText(file, 'utf-8');

    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* 标题和新增按钮 */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center gap-3">
          <motion.button
            className="
            relative
                flex items-center gap-2 px-4 py-2 rounded-full
                bg-orange-500 hover:bg-orange-600 text-white
                shadow-lg hover:shadow-xl
                transition-all duration-200
              "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="导入自定义模式文件"
          >
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={handleImportMode}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="import-mode"
            />
            导入模式
          </motion.button>
        </div>
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
          新增模式
        </motion.button>
      </motion.div>

      {/* 模式列表 */}
      <div className="space-y-4">
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
                      <span
                        className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${
                          mode.type === 'ai'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }
                      `}
                      >
                        {mode.type === 'ai' ? 'AI生成' : '自定义'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {mode.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {mode.tasks.length} 个任务
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
                      title="下载模式文件"
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
                      任务列表
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
                          <div
                            className="
                            w-2 h-2 rounded-full
                            bg-gradient-to-r from-blue-500 to-purple-500
                          "
                          />
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
      </div>

      {/* 创建/编辑模式弹窗 */}
      <AnimatePresence>
        {isCreating && (
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
                w-full max-w-2xl max-h-[90vh] overflow-hidden
                border border-white/20 dark:border-gray-700/20
              "
            >
              {/* 弹窗头部 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {editingMode ? '编辑模式' : '新增模式'}
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

              {/* 弹窗内容 */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-6">
                  {/* 模式名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      模式名称
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
                      placeholder="输入模式名称"
                    />
                  </div>

                  {/* 模式描述 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      模式描述
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
                      placeholder="输入模式描述"
                    />
                  </div>

                  {/* 任务管理 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      任务列表
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
                        placeholder="输入任务内容"
                      />
                      <motion.button
                        onClick={handlePasteFromClipboard}
                        className="
                          px-4 py-3 rounded-xl bg-green-500 text-white
                          hover:bg-green-600 transition-all duration-200
                        "
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="从剪切板批量添加任务（支持换行、逗号、顿号等分隔符）"
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
                    <div className="space-y-2 max-h-40 overflow-y-auto">
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
                                  title="保存"
                                >
                                  <Save className="w-3 h-3" />
                                </motion.button>
                                <motion.button
                                  onClick={cancelTaskEdit}
                                  className="p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="取消"
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

              {/* 弹窗底部 */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
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
                  取消
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
                  保存
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 空状态 */}
      {modes.length === 0 && !isCreating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div
            className="
            w-20 h-20 mx-auto mb-4 rounded-full
            bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20
            flex items-center justify-center
          "
          >
            <Tag className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            暂无自定义模式
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            创建你的第一个自定义模式吧！
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
            新增模式
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default CustomModeManager;

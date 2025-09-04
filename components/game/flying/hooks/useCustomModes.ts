import { useState, useCallback } from 'react';
import type { CustomMode, NewCustomMode } from '../types/game';

export function useCustomModes() {
  const [customModes, setCustomModes] = useState<CustomMode[]>([]);
  const [currentCustomMode, setCurrentCustomMode] = useState<CustomMode | null>(null);
  const [showCustomModeCreator, setShowCustomModeCreator] = useState(false);
  const [newCustomMode, setNewCustomMode] = useState<NewCustomMode>({
    name: '',
    type: 'custom',
    description: '',
    tasks: [],
  });

  const loadCustomModes = useCallback(() => {
    try {
      const saved = localStorage.getItem('customModes');
      if (saved) {
        setCustomModes(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading custom modes:', error);
    }
  }, []);

  const saveCustomModes = useCallback((modes: CustomMode[]) => {
    try {
      localStorage.setItem('customModes', JSON.stringify(modes));
      setCustomModes(modes);
    } catch (error) {
      console.error('Error saving custom modes:', error);
    }
  }, []);

  const createCustomMode = useCallback(
    (onSuccess?: () => void) => {
      if (newCustomMode.name.trim() && newCustomMode.tasks.length > 0) {
        const customMode: CustomMode = {
          id: Date.now().toString(),
          name: newCustomMode.name.trim(),
          type: newCustomMode.type,
          description: newCustomMode.description.trim() || '自定义模式',
          tasks: [...newCustomMode.tasks],
          createdAt: Date.now(),
        };

        const updatedModes = [...customModes, customMode];
        saveCustomModes(updatedModes);

        setNewCustomMode({ name: '', description: '', tasks: [], type: 'custom' });
        setShowCustomModeCreator(false);
        onSuccess?.();
        return true;
      }
      return false;
    },
    [newCustomMode, customModes, saveCustomModes],
  );

  const deleteCustomMode = useCallback(
    (modeId: string) => {
      const updatedModes = customModes.filter((mode) => mode.id !== modeId);
      saveCustomModes(updatedModes);
    },
    [customModes, saveCustomModes],
  );

  return {
    customModes,
    currentCustomMode,
    setCurrentCustomMode,
    showCustomModeCreator,
    setShowCustomModeCreator,
    newCustomMode,
    setNewCustomMode,
    loadCustomModes,
    createCustomMode,
    deleteCustomMode,
  };
}

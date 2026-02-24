"use client";

import { useState, useEffect, useCallback } from "react";
import { WeddingTask, PrenupItem, WeddingSettings, DEFAULT_SETTINGS } from "@/types/index";
import { TASK_TEMPLATES, PRENUP_TEMPLATES } from "@/types/taskData";
import {
  getTasks,
  saveTasks,
  updateTask as storageUpdateTask,
  getPrenupItems,
  savePrenupItems,
  updatePrenupItem as storageUpdatePrenupItem,
  getSettings,
  saveSettings,
  initializeTasksFromTemplates,
  initializePrenupFromTemplates,
} from "./storage";

/**
 * Hook for managing wedding tasks with localStorage sync.
 * Auto-initializes from templates on first use.
 */
export function useWeddingTasks() {
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let loaded = getTasks();
    if (loaded.length === 0) {
      const settings = getSettings();
      loaded = initializeTasksFromTemplates(
        TASK_TEMPLATES,
        settings.language,
        settings.weddingDate
      );
      saveTasks(loaded);
    }
    setTasks(loaded);
    setIsLoaded(true);
  }, []);

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<WeddingTask, "id" | "taskId">>) => {
      const updated = storageUpdateTask(id, updates);
      setTasks(getTasks());
      return updated;
    },
    []
  );

  const updateSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      const allTasks = getTasks();
      const task = allTasks.find((t) => t.id === taskId);
      if (!task) return null;

      const updatedSubtasks = task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );

      const result = storageUpdateTask(taskId, { subtasks: updatedSubtasks });
      setTasks(getTasks());
      return result;
    },
    []
  );

  const searchTasks = useCallback(
    (query: string): WeddingTask[] => {
      if (!query.trim()) return tasks;
      const lower = query.toLowerCase();
      return tasks.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.description.toLowerCase().includes(lower) ||
          t.memo.toLowerCase().includes(lower)
      );
    },
    [tasks]
  );

  const resetTasks = useCallback(() => {
    const settings = getSettings();
    const fresh = initializeTasksFromTemplates(
      TASK_TEMPLATES,
      settings.language,
      settings.weddingDate
    );
    saveTasks(fresh);
    setTasks(fresh);
  }, []);

  return {
    tasks,
    isLoaded,
    updateTask,
    updateSubtask,
    searchTasks,
    resetTasks,
  };
}

/**
 * Hook for managing wedding settings with localStorage sync.
 */
export function useWeddingSettings() {
  const [settings, setSettingsState] = useState<WeddingSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSettingsState(getSettings());
    setIsLoaded(true);
  }, []);

  const updateSettings = useCallback((updates: Partial<WeddingSettings>) => {
    const current = getSettings();
    const newSettings = { ...current, ...updates };
    saveSettings(newSettings);
    setSettingsState(newSettings);
  }, []);

  return { settings, isLoaded, updateSettings };
}

/**
 * Hook for managing prenup checklist items with localStorage sync.
 * Auto-initializes from templates on first use.
 */
export function usePrenupItems() {
  const [items, setItems] = useState<PrenupItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let loaded = getPrenupItems();
    if (loaded.length === 0) {
      const settings = getSettings();
      loaded = initializePrenupFromTemplates(PRENUP_TEMPLATES, settings.language);
      savePrenupItems(loaded);
    }
    setItems(loaded);
    setIsLoaded(true);
  }, []);

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<PrenupItem, "id">>) => {
      const updated = storageUpdatePrenupItem(id, updates);
      setItems(getPrenupItems());
      return updated;
    },
    []
  );

  const resetItems = useCallback(() => {
    const settings = getSettings();
    const fresh = initializePrenupFromTemplates(PRENUP_TEMPLATES, settings.language);
    savePrenupItems(fresh);
    setItems(fresh);
  }, []);

  return {
    items,
    isLoaded,
    updateItem,
    resetItems,
  };
}

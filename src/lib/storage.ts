import {
  WeddingTask,
  PrenupItem,
  WeddingSettings,
  TaskTemplate,
  PrenupTemplate,
  DEFAULT_SETTINGS,
} from "@/types/index";
import { supabase, isSupabaseConfigured } from "./supabase";

const TASKS_KEY = "weddingplan_v1_tasks";
const PRENUP_KEY = "weddingplan_v1_prenup";
const SETTINGS_KEY = "weddingplan_v1_settings";

let tasksCache: WeddingTask[] | null = null;
let prenupCache: PrenupItem[] | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// --- Helper: get current user id (sync-safe) ---

async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// --- DB row mappers ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToTask(row: any): WeddingTask {
  return {
    id: row.id,
    taskId: row.task_id,
    categoryId: row.category_id,
    phaseId: row.phase_id,
    name: row.name,
    description: row.description,
    status: row.status,
    recommendedTiming: row.recommended_timing,
    monthsBefore: row.months_before,
    calculatedDeadline: row.calculated_deadline,
    subtasks: row.subtasks ?? [],
    notes: row.notes ?? [],
    budgetEstimateMin: row.budget_estimate_min,
    budgetEstimateMax: row.budget_estimate_max,
    actualCost: row.actual_cost,
    memo: row.memo ?? "",
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToPrenupItem(row: any): PrenupItem {
  return {
    id: row.id,
    sectionId: row.section_id,
    label: row.label,
    description: row.description,
    completed: row.completed,
    notes: row.notes ?? "",
  };
}

// --- Supabase Task CRUD ---

async function supabaseGetTasks(userId: string): Promise<WeddingTask[]> {
  const { data, error } = await supabase
    .from("weddingplan_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("months_before", { ascending: false });

  if (error || !data) return [];

  return data.map(mapDbToTask);
}

async function supabaseUpsertTask(
  userId: string,
  task: WeddingTask
): Promise<void> {
  await supabase.from("weddingplan_tasks").upsert(
    {
      id: task.id,
      user_id: userId,
      task_id: task.taskId,
      category_id: task.categoryId,
      phase_id: task.phaseId,
      name: task.name,
      description: task.description,
      status: task.status,
      recommended_timing: task.recommendedTiming,
      months_before: task.monthsBefore,
      calculated_deadline: task.calculatedDeadline,
      subtasks: task.subtasks,
      notes: task.notes,
      budget_estimate_min: task.budgetEstimateMin,
      budget_estimate_max: task.budgetEstimateMax,
      actual_cost: task.actualCost,
      memo: task.memo,
      completed_at: task.completedAt,
      updated_at: task.updatedAt,
    },
    { onConflict: "id" }
  );
}

// --- Supabase Prenup CRUD ---

async function supabaseGetPrenupItems(userId: string): Promise<PrenupItem[]> {
  const { data, error } = await supabase
    .from("weddingplan_prenup_items")
    .select("*")
    .eq("user_id", userId)
    .order("section_id", { ascending: true });

  if (error || !data) return [];

  return data.map(mapDbToPrenupItem);
}

async function supabaseUpsertPrenupItem(
  userId: string,
  item: PrenupItem
): Promise<void> {
  await supabase.from("weddingplan_prenup_items").upsert(
    {
      id: item.id,
      user_id: userId,
      section_id: item.sectionId,
      label: item.label,
      description: item.description,
      completed: item.completed,
      notes: item.notes,
    },
    { onConflict: "id" }
  );
}

// --- Supabase Settings CRUD ---

async function supabaseGetSettings(userId: string): Promise<WeddingSettings> {
  const { data, error } = await supabase
    .from("weddingplan_profiles")
    .select("wedding_date, partner1_name, partner2_name, language, total_budget")
    .eq("user_id", userId)
    .single();

  if (error || !data) return DEFAULT_SETTINGS;

  return {
    weddingDate: data.wedding_date ?? DEFAULT_SETTINGS.weddingDate,
    partner1Name: data.partner1_name ?? DEFAULT_SETTINGS.partner1Name,
    partner2Name: data.partner2_name ?? DEFAULT_SETTINGS.partner2Name,
    language: data.language ?? DEFAULT_SETTINGS.language,
    totalBudget: data.total_budget ?? DEFAULT_SETTINGS.totalBudget,
  };
}

async function supabaseSaveSettings(
  userId: string,
  settings: WeddingSettings
): Promise<void> {
  await supabase.from("weddingplan_profiles").upsert(
    {
      user_id: userId,
      wedding_date: settings.weddingDate,
      partner1_name: settings.partner1Name,
      partner2_name: settings.partner2Name,
      language: settings.language,
      total_budget: settings.totalBudget,
    },
    { onConflict: "user_id" }
  );
}

// --- Template initializers ---

export function initializeTasksFromTemplates(
  templates: TaskTemplate[],
  language: "ja" | "en",
  weddingDate?: string | null
): WeddingTask[] {
  const now = new Date().toISOString();

  return templates.map((t) => {
    let calculatedDeadline: string | null = null;
    if (weddingDate && t.monthsBefore > 0) {
      const wedding = new Date(weddingDate);
      const deadline = new Date(wedding);
      deadline.setMonth(deadline.getMonth() - t.monthsBefore);
      calculatedDeadline = deadline.toISOString().split("T")[0];
    }

    return {
      id: crypto.randomUUID(),
      taskId: t.taskId,
      categoryId: t.categoryId,
      phaseId: t.phaseId,
      name: language === "ja" ? t.name : t.nameEn,
      description: language === "ja" ? t.description : t.descriptionEn,
      status: "pending" as const,
      recommendedTiming: language === "ja" ? t.recommendedTiming : t.recommendedTimingEn,
      monthsBefore: t.monthsBefore,
      calculatedDeadline,
      subtasks: t.subtasks.map((st) => ({
        id: crypto.randomUUID(),
        label: language === "ja" ? st.label : st.labelEn,
        completed: false,
      })),
      notes: language === "ja" ? [...t.notes] : [...t.notesEn],
      budgetEstimateMin: t.budgetEstimateMin,
      budgetEstimateMax: t.budgetEstimateMax,
      actualCost: null,
      memo: "",
      completedAt: null,
      updatedAt: now,
    };
  });
}

export function initializePrenupFromTemplates(
  templates: PrenupTemplate[],
  language: "ja" | "en"
): PrenupItem[] {
  return templates.map((t) => ({
    id: crypto.randomUUID(),
    sectionId: t.sectionId,
    label: language === "ja" ? t.label : t.labelEn,
    description: language === "ja" ? t.description : t.descriptionEn,
    completed: false,
    notes: "",
  }));
}

// --- localStorage Tasks ---

export function getTasks(): WeddingTask[] {
  if (!isBrowser()) return [];
  if (tasksCache) return tasksCache;
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    tasksCache = JSON.parse(raw) as WeddingTask[];
    return tasksCache;
  } catch {
    return [];
  }
}

export function saveTasks(tasks: WeddingTask[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  tasksCache = null;
}

export function updateTask(
  id: string,
  updates: Partial<Omit<WeddingTask, "id" | "taskId">>
): WeddingTask | null {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveTasks(tasks);
  return tasks[index];
}

// --- localStorage Prenup Items ---

export function getPrenupItems(): PrenupItem[] {
  if (!isBrowser()) return [];
  if (prenupCache) return prenupCache;
  try {
    const raw = localStorage.getItem(PRENUP_KEY);
    if (!raw) return [];
    prenupCache = JSON.parse(raw) as PrenupItem[];
    return prenupCache;
  } catch {
    return [];
  }
}

export function savePrenupItems(items: PrenupItem[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(PRENUP_KEY, JSON.stringify(items));
  prenupCache = null;
}

export function updatePrenupItem(
  id: string,
  updates: Partial<Omit<PrenupItem, "id">>
): PrenupItem | null {
  const items = getPrenupItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = {
    ...items[index],
    ...updates,
  };
  savePrenupItems(items);
  return items[index];
}

// --- localStorage Settings ---

export function getSettings(): WeddingSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: WeddingSettings): void {
  if (!isBrowser()) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// --- Hybrid async functions (Supabase + localStorage) ---

export async function getTasksAsync(): Promise<WeddingTask[]> {
  const userId = await getCurrentUserId();
  if (userId) {
    try {
      const tasks = await supabaseGetTasks(userId);
      saveTasks(tasks);
      return tasks;
    } catch {
      return getTasks();
    }
  }
  return getTasks();
}

export async function updateTaskAsync(
  id: string,
  updates: Partial<Omit<WeddingTask, "id" | "taskId">>
): Promise<WeddingTask | null> {
  const updated = updateTask(id, updates);
  if (!updated) return null;
  const userId = await getCurrentUserId();
  if (userId) {
    try {
      await supabaseUpsertTask(userId, updated);
    } catch {
      // localStorage already has it as fallback
    }
  }
  return updated;
}

export async function getPrenupItemsAsync(): Promise<PrenupItem[]> {
  const userId = await getCurrentUserId();
  if (userId) {
    try {
      const items = await supabaseGetPrenupItems(userId);
      savePrenupItems(items);
      return items;
    } catch {
      return getPrenupItems();
    }
  }
  return getPrenupItems();
}

export async function updatePrenupItemAsync(
  id: string,
  updates: Partial<Omit<PrenupItem, "id">>
): Promise<PrenupItem | null> {
  const updated = updatePrenupItem(id, updates);
  if (!updated) return null;
  const userId = await getCurrentUserId();
  if (userId) {
    try {
      await supabaseUpsertPrenupItem(userId, updated);
    } catch {
      // localStorage already has it as fallback
    }
  }
  return updated;
}

export async function getSettingsAsync(): Promise<WeddingSettings> {
  const userId = await getCurrentUserId();
  if (userId) {
    try {
      const settings = await supabaseGetSettings(userId);
      saveSettings(settings);
      return settings;
    } catch {
      return getSettings();
    }
  }
  return getSettings();
}

export async function saveSettingsAsync(settings: WeddingSettings): Promise<void> {
  saveSettings(settings);
  const userId = await getCurrentUserId();
  if (userId) {
    try {
      await supabaseSaveSettings(userId, settings);
    } catch {
      // localStorage already has it as fallback
    }
  }
}

/**
 * Sync localStorage data to Supabase when user logs in.
 * Call this after successful authentication to push any guest data to the cloud.
 */
export async function syncLocalToSupabase(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  // Sync tasks
  const localTasks = getTasks();
  if (localTasks.length > 0) {
    const remoteTasks = await supabaseGetTasks(userId);
    const remoteIds = new Set(remoteTasks.map((t) => t.id));

    for (const task of localTasks) {
      if (!remoteIds.has(task.id)) {
        await supabaseUpsertTask(userId, task);
      }
    }
  }

  // Sync prenup items
  const localPrenup = getPrenupItems();
  if (localPrenup.length > 0) {
    const remotePrenup = await supabaseGetPrenupItems(userId);
    const remoteIds = new Set(remotePrenup.map((p) => p.id));

    for (const item of localPrenup) {
      if (!remoteIds.has(item.id)) {
        await supabaseUpsertPrenupItem(userId, item);
      }
    }
  }

  // Sync settings
  const localSettings = getSettings();
  if (
    localSettings.weddingDate !== DEFAULT_SETTINGS.weddingDate ||
    localSettings.partner1Name !== DEFAULT_SETTINGS.partner1Name ||
    localSettings.partner2Name !== DEFAULT_SETTINGS.partner2Name ||
    localSettings.language !== DEFAULT_SETTINGS.language ||
    localSettings.totalBudget !== DEFAULT_SETTINGS.totalBudget
  ) {
    await supabaseSaveSettings(userId, localSettings);
  }
}

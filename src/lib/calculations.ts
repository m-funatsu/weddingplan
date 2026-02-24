import { addMonths, differenceInDays, differenceInMonths, format, parseISO, isBefore } from "date-fns";
import { WeddingTask, CategoryId, PhaseId, CATEGORY_INFO } from "@/types/index";

/**
 * Calculate deadline from wedding date by subtracting monthsBefore.
 */
export function calculateDeadline(weddingDate: string, monthsBefore: number): string {
  const wedding = parseISO(weddingDate);
  const deadline = addMonths(wedding, -monthsBefore);
  return format(deadline, "yyyy-MM-dd");
}

// --- Progress calculations ---

/**
 * Overall progress: completed / (total - skipped).
 */
export function calculateOverallProgress(tasks: WeddingTask[]): number {
  const eligible = tasks.filter((t) => t.status !== "skipped");
  if (eligible.length === 0) return 0;
  const completed = eligible.filter((t) => t.status === "completed").length;
  return Math.round((completed / eligible.length) * 100);
}

/**
 * Progress for a specific phase.
 */
export function calculatePhaseProgress(tasks: WeddingTask[], phaseId: PhaseId): number {
  const phaseTasks = tasks.filter((t) => t.phaseId === phaseId && t.status !== "skipped");
  if (phaseTasks.length === 0) return 0;
  const completed = phaseTasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / phaseTasks.length) * 100);
}

/**
 * Progress for a specific category.
 */
export function calculateCategoryProgress(tasks: WeddingTask[], categoryId: CategoryId): number {
  const catTasks = tasks.filter((t) => t.categoryId === categoryId && t.status !== "skipped");
  if (catTasks.length === 0) return 0;
  const completed = catTasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / catTasks.length) * 100);
}

// --- Budget calculations ---

/**
 * Total estimated budget range across all tasks.
 */
export function calculateTotalEstimate(tasks: WeddingTask[]): { min: number; max: number } {
  return tasks.reduce(
    (acc, t) => ({
      min: acc.min + t.budgetEstimateMin,
      max: acc.max + t.budgetEstimateMax,
    }),
    { min: 0, max: 0 }
  );
}

/**
 * Total actual cost across all tasks (only tasks with actualCost set).
 */
export function calculateTotalActual(tasks: WeddingTask[]): number {
  return tasks.reduce((sum, t) => sum + (t.actualCost ?? 0), 0);
}

/**
 * Budget breakdown for a specific category.
 */
export function calculateCategoryBudget(
  tasks: WeddingTask[],
  categoryId: CategoryId
): { estimateMin: number; estimateMax: number; actual: number } {
  const catTasks = tasks.filter((t) => t.categoryId === categoryId);
  return {
    estimateMin: catTasks.reduce((sum, t) => sum + t.budgetEstimateMin, 0),
    estimateMax: catTasks.reduce((sum, t) => sum + t.budgetEstimateMax, 0),
    actual: catTasks.reduce((sum, t) => sum + (t.actualCost ?? 0), 0),
  };
}

/**
 * Full budget breakdown by category.
 */
export function getBudgetBreakdown(
  tasks: WeddingTask[]
): Array<{ categoryId: CategoryId; label: string; estimateAvg: number; actual: number }> {
  const categoryMap = new Map<
    CategoryId,
    { estimateMin: number; estimateMax: number; actual: number }
  >();

  for (const task of tasks) {
    const existing = categoryMap.get(task.categoryId) || {
      estimateMin: 0,
      estimateMax: 0,
      actual: 0,
    };
    existing.estimateMin += task.budgetEstimateMin;
    existing.estimateMax += task.budgetEstimateMax;
    existing.actual += task.actualCost ?? 0;
    categoryMap.set(task.categoryId, existing);
  }

  return Array.from(categoryMap.entries())
    .map(([categoryId, data]) => ({
      categoryId,
      label: CATEGORY_INFO[categoryId].label,
      estimateAvg: Math.round((data.estimateMin + data.estimateMax) / 2),
      actual: data.actual,
    }))
    .sort((a, b) => b.estimateAvg - a.estimateAvg);
}

// --- Task queries ---

/**
 * Get tasks that are overdue (past deadline and not completed/skipped).
 */
export function getOverdueTasks(tasks: WeddingTask[], today?: Date): WeddingTask[] {
  const now = today ?? new Date();
  return tasks.filter((t) => {
    if (t.status === "completed" || t.status === "skipped") return false;
    if (!t.calculatedDeadline) return false;
    return isBefore(parseISO(t.calculatedDeadline), now);
  });
}

/**
 * Get tasks with deadlines within the next N days.
 */
export function getUpcomingTasks(
  tasks: WeddingTask[],
  daysAhead: number = 30,
  today?: Date
): WeddingTask[] {
  const now = today ?? new Date();
  const cutoff = addMonths(now, 0);
  cutoff.setDate(cutoff.getDate() + daysAhead);

  return tasks
    .filter((t) => {
      if (t.status === "completed" || t.status === "skipped") return false;
      if (!t.calculatedDeadline) return false;
      const deadline = parseISO(t.calculatedDeadline);
      return !isBefore(deadline, now) && isBefore(deadline, cutoff);
    })
    .sort(
      (a, b) =>
        parseISO(a.calculatedDeadline!).getTime() -
        parseISO(b.calculatedDeadline!).getTime()
    );
}

/**
 * Filter tasks by phase.
 */
export function getTasksByPhase(tasks: WeddingTask[], phaseId: PhaseId): WeddingTask[] {
  return tasks.filter((t) => t.phaseId === phaseId);
}

/**
 * Filter tasks by category.
 */
export function getTasksByCategory(tasks: WeddingTask[], categoryId: CategoryId): WeddingTask[] {
  return tasks.filter((t) => t.categoryId === categoryId);
}

/**
 * Determine the current phase based on months until wedding.
 */
export function getCurrentPhase(weddingDate: string | null): PhaseId {
  if (!weddingDate) return "phase_01";

  const now = new Date();
  const wedding = parseISO(weddingDate);
  const monthsUntil = differenceInMonths(wedding, now);
  const daysUntil = differenceInDays(wedding, now);

  if (monthsUntil > 12) return "phase_01";
  if (monthsUntil > 10) return "phase_02";
  if (monthsUntil > 8) return "phase_03";
  if (monthsUntil > 6) return "phase_04";
  if (monthsUntil > 4) return "phase_05";
  if (monthsUntil > 2) return "phase_06";
  if (monthsUntil > 1) return "phase_07";
  if (daysUntil > 0) return "phase_08";
  if (daysUntil === 0) return "phase_09";
  return "phase_10";
}

// --- Formatting ---

/**
 * Format amount as Japanese yen: "¥3,500,000".
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Format a date string based on language.
 */
export function formatDate(dateString: string, lang: "ja" | "en"): string {
  const date = parseISO(dateString);
  if (lang === "ja") {
    return format(date, "yyyy年MM月dd日");
  }
  return format(date, "MMM d, yyyy");
}

/**
 * Get number of days until the wedding.
 */
export function getDaysUntilWedding(weddingDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const wedding = parseISO(weddingDate);
  return differenceInDays(wedding, now);
}

/**
 * Get number of months until the wedding.
 */
export function getMonthsUntilWedding(weddingDate: string): number {
  const now = new Date();
  const wedding = parseISO(weddingDate);
  return differenceInMonths(wedding, now);
}

import { WeddingTask, TaskTemplate } from "@/types/index";

/**
 * Generate default WeddingTask objects from TaskTemplate array.
 * Creates fully initialized tasks with pending status and optional deadline calculation.
 */
export function generateDefaultTasks(
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

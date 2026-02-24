"use client";

import { useState, useMemo } from "react";
import { useWeddingTasks, useWeddingSettings } from "@/lib/hooks";
import type { CategoryId, PhaseId, TaskStatus } from "@/types";
import TaskCard from "@/components/TaskCard";
import TaskFilters from "@/components/TaskFilters";

export default function TasksPage() {
  const { tasks, isLoaded, updateTask, updateSubtask } = useWeddingTasks();
  const { settings } = useWeddingSettings();
  const isJa = settings.language === "ja";

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">("all");
  const [selectedPhase, setSelectedPhase] = useState<PhaseId | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (selectedCategory !== "all") {
      result = result.filter((t) => t.categoryId === selectedCategory);
    }
    if (selectedPhase !== "all") {
      result = result.filter((t) => t.phaseId === selectedPhase);
    }
    if (selectedStatus !== "all") {
      result = result.filter((t) => t.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.memo.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tasks, selectedCategory, selectedPhase, selectedStatus, searchQuery]);

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalActive = tasks.filter((t) => t.status !== "skipped").length;

  function handleStatusChange(taskId: string, status: TaskStatus) {
    updateTask(taskId, {
      status,
      completedAt: status === "completed" ? new Date().toISOString() : null,
    });
  }

  function handleSubtaskToggle(taskId: string, subtaskId: string) {
    updateSubtask(taskId, subtaskId);
  }

  function handleActualCostChange(taskId: string, cost: number | null) {
    updateTask(taskId, { actualCost: cost });
  }

  function handleMemoChange(taskId: string, memo: string) {
    updateTask(taskId, { memo });
  }

  if (!isLoaded) {
    return (
      <div className="page-with-nav min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-with-nav min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isJa ? "タスク管理" : "Task Management"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {completedCount}/{totalActive} {isJa ? "タスク完了" : "tasks completed"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-rose-600">
              {totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          language={settings.language}
          selectedCategory={selectedCategory}
          selectedPhase={selectedPhase}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          onCategoryChange={setSelectedCategory}
          onPhaseChange={setSelectedPhase}
          onStatusChange={setSelectedStatus}
          onSearchChange={setSearchQuery}
        />

        {/* Results count */}
        <p className="text-xs text-gray-400">
          {filteredTasks.length} {isJa ? "件表示" : "results"}
          {(selectedCategory !== "all" || selectedPhase !== "all" || selectedStatus !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedPhase("all");
                setSelectedStatus("all");
                setSearchQuery("");
              }}
              className="ml-2 text-rose-500 hover:text-rose-600 underline underline-offset-2"
            >
              {isJa ? "フィルタをクリア" : "Clear filters"}
            </button>
          )}
        </p>

        {/* Task list */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                language={settings.language}
                onStatusChange={handleStatusChange}
                onSubtaskToggle={handleSubtaskToggle}
                onActualCostChange={handleActualCostChange}
                onMemoChange={handleMemoChange}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-400 text-sm">
                {isJa
                  ? "該当するタスクがありません"
                  : "No matching tasks found"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { ALL_CATEGORY_IDS, ALL_PHASE_IDS, CATEGORY_INFO, PHASE_INFO, type CategoryId, type PhaseId, type TaskStatus } from "@/types";

interface TaskFiltersProps {
  language: "ja" | "en";
  selectedCategory: CategoryId | "all";
  selectedPhase: PhaseId | "all";
  selectedStatus: TaskStatus | "all";
  searchQuery: string;
  onCategoryChange: (category: CategoryId | "all") => void;
  onPhaseChange: (phase: PhaseId | "all") => void;
  onStatusChange: (status: TaskStatus | "all") => void;
  onSearchChange: (query: string) => void;
}

export default function TaskFilters({
  language,
  selectedCategory,
  selectedPhase,
  selectedStatus,
  searchQuery,
  onCategoryChange,
  onPhaseChange,
  onStatusChange,
  onSearchChange,
}: TaskFiltersProps) {
  const isJa = language === "ja";

  const statusOptions: { value: TaskStatus | "all"; label: string }[] = [
    { value: "all", label: isJa ? "すべて" : "All" },
    { value: "pending", label: isJa ? "未着手" : "Pending" },
    { value: "in_progress", label: isJa ? "進行中" : "In Progress" },
    { value: "completed", label: isJa ? "完了" : "Completed" },
    { value: "skipped", label: isJa ? "スキップ" : "Skipped" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isJa ? "タスクを検索..." : "Search tasks..."}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as CategoryId | "all")}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
        >
          <option value="all">{isJa ? "全カテゴリ" : "All Categories"}</option>
          {ALL_CATEGORY_IDS.map((id) => (
            <option key={id} value={id}>
              {CATEGORY_INFO[id].icon} {isJa ? CATEGORY_INFO[id].label : CATEGORY_INFO[id].labelEn}
            </option>
          ))}
        </select>

        {/* Phase filter */}
        <select
          value={selectedPhase}
          onChange={(e) => onPhaseChange(e.target.value as PhaseId | "all")}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
        >
          <option value="all">{isJa ? "全フェーズ" : "All Phases"}</option>
          {ALL_PHASE_IDS.map((id) => (
            <option key={id} value={id}>
              {isJa ? PHASE_INFO[id].label : PHASE_INFO[id].labelEn}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus | "all")}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

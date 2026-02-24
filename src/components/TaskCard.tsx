"use client";

import { useState } from "react";
import { CATEGORY_INFO, type WeddingTask, type TaskStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/calculations";

interface TaskCardProps {
  task: WeddingTask;
  language: "ja" | "en";
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string) => void;
  onActualCostChange: (taskId: string, cost: number | null) => void;
  onMemoChange: (taskId: string, memo: string) => void;
}

export default function TaskCard({
  task,
  language,
  onStatusChange,
  onSubtaskToggle,
  onActualCostChange,
  onMemoChange,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingCost, setEditingCost] = useState(false);
  const [costInput, setCostInput] = useState(
    task.actualCost?.toString() ?? ""
  );
  const [editingMemo, setEditingMemo] = useState(false);
  const [memoInput, setMemoInput] = useState(task.memo);

  const category = CATEGORY_INFO[task.categoryId];
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const isOverdue =
    task.calculatedDeadline &&
    task.status !== "completed" &&
    task.status !== "skipped" &&
    new Date(task.calculatedDeadline) < new Date();

  const statusColors: Record<TaskStatus, string> = {
    pending: "bg-gray-100 text-gray-600",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    skipped: "bg-gray-100 text-gray-400",
  };

  const statusLabels: Record<TaskStatus, { ja: string; en: string }> = {
    pending: { ja: "未着手", en: "Pending" },
    in_progress: { ja: "進行中", en: "In Progress" },
    completed: { ja: "完了", en: "Completed" },
    skipped: { ja: "スキップ", en: "Skipped" },
  };

  function handleCostSave() {
    const val = costInput.trim();
    onActualCostChange(task.id, val ? Number(val) : null);
    setEditingCost(false);
  }

  function handleMemoSave() {
    onMemoChange(task.id, memoInput);
    setEditingMemo(false);
  }

  function cycleStatus() {
    const order: TaskStatus[] = ["pending", "in_progress", "completed", "skipped"];
    const currentIndex = order.indexOf(task.status);
    const nextStatus = order[(currentIndex + 1) % order.length];
    onStatusChange(task.id, nextStatus);
  }

  return (
    <div
      className={`bg-white rounded-xl border transition-all ${
        isOverdue
          ? "border-red-200 shadow-sm shadow-red-100"
          : task.status === "completed"
          ? "border-green-200 opacity-80"
          : task.status === "skipped"
          ? "border-gray-200 opacity-60"
          : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        {/* Status checkbox */}
        <button
          onClick={cycleStatus}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            task.status === "completed"
              ? "border-green-500 bg-green-500 text-white"
              : task.status === "skipped"
              ? "border-gray-300 bg-gray-100 text-gray-400"
              : task.status === "in_progress"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-rose-400"
          }`}
          title={statusLabels[task.status][language === "ja" ? "ja" : "en"]}
        >
          {task.status === "completed" && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {task.status === "skipped" && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {task.status === "in_progress" && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm">{category.icon}</span>
            <h4
              className={`text-sm font-medium ${
                task.status === "completed"
                  ? "line-through text-gray-400"
                  : "text-gray-900"
              }`}
            >
              {task.name}
            </h4>
            {isOverdue && (
              <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">
                {language === "ja" ? "期限超過" : "Overdue"}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {task.recommendedTiming}
            {task.calculatedDeadline && (
              <> · {language === "ja" ? "期限" : "Due"}: {formatDate(task.calculatedDeadline, language)}</>
            )}
          </p>
          {task.budgetEstimateMax > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {language === "ja" ? "予算目安" : "Budget"}: {formatCurrency(task.budgetEstimateMin)}〜{formatCurrency(task.budgetEstimateMax)}
              {task.actualCost !== null && (
                <span className="text-rose-600 font-medium">
                  {" "}→ {language === "ja" ? "実費" : "Actual"}: {formatCurrency(task.actualCost)}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-gray-400 hover:text-gray-600 shrink-0"
        >
          <svg
            className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {/* Description */}
          <p className="text-sm text-gray-600">{task.description}</p>

          {/* Status selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["pending", "in_progress", "completed", "skipped"] as TaskStatus[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(task.id, s)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    task.status === s
                      ? statusColors[s]
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {statusLabels[s][language === "ja" ? "ja" : "en"]}
                </button>
              )
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                {language === "ja" ? "サブタスク" : "Subtasks"} ({completedSubtasks}/{task.subtasks.length})
              </p>
              <div className="space-y-1">
                {task.subtasks.map((st) => (
                  <label
                    key={st.id}
                    className="flex items-center gap-2 py-1 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => onSubtaskToggle(task.id, st.id)}
                      className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span
                      className={`text-sm ${
                        st.completed
                          ? "line-through text-gray-400"
                          : "text-gray-700 group-hover:text-gray-900"
                      }`}
                    >
                      {st.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-700 mb-1">
                💡 {language === "ja" ? "アドバイス" : "Tips"}
              </p>
              <ul className="space-y-0.5">
                {task.notes.map((note, i) => (
                  <li key={i} className="text-xs text-amber-700">
                    · {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actual cost input */}
          {task.budgetEstimateMax > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                {language === "ja" ? "実費入力" : "Actual Cost"}
              </p>
              {editingCost ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    className="w-32 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="0"
                    autoFocus
                  />
                  <button
                    onClick={handleCostSave}
                    className="text-xs px-2 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                  >
                    {language === "ja" ? "保存" : "Save"}
                  </button>
                  <button
                    onClick={() => setEditingCost(false)}
                    className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
                  >
                    {language === "ja" ? "取消" : "Cancel"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setCostInput(task.actualCost?.toString() ?? "");
                    setEditingCost(true);
                  }}
                  className="text-sm text-rose-600 hover:text-rose-700 underline underline-offset-2"
                >
                  {task.actualCost !== null
                    ? `${formatCurrency(task.actualCost)} (${language === "ja" ? "変更" : "edit"})`
                    : language === "ja"
                    ? "実費を入力"
                    : "Enter actual cost"}
                </button>
              )}
            </div>
          )}

          {/* Memo */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">
              {language === "ja" ? "メモ" : "Memo"}
            </p>
            {editingMemo ? (
              <div className="space-y-2">
                <textarea
                  value={memoInput}
                  onChange={(e) => setMemoInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleMemoSave}
                    className="text-xs px-2 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                  >
                    {language === "ja" ? "保存" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setMemoInput(task.memo);
                      setEditingMemo(false);
                    }}
                    className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
                  >
                    {language === "ja" ? "取消" : "Cancel"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingMemo(true)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {task.memo || (language === "ja" ? "メモを追加..." : "Add memo...")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

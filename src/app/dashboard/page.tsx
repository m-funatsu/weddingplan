"use client";

import { useMemo } from "react";
import { useWeddingTasks, useWeddingSettings } from "@/lib/hooks";
import {
  calculateOverallProgress,
  calculateTotalEstimate,
  calculateTotalActual,
  getOverdueTasks,
  getUpcomingTasks,
  getCurrentPhase,
  formatCurrency,
  getDaysUntilWedding,
  formatDate,
} from "@/lib/calculations";
import { CATEGORY_INFO, PHASE_INFO } from "@/types";
import StatCard from "@/components/StatCard";
import ProgressRing from "@/components/ProgressRing";
import TimelineView from "@/components/TimelineView";

export default function DashboardPage() {
  const { tasks, isLoaded } = useWeddingTasks();
  const { settings } = useWeddingSettings();
  const isJa = settings.language === "ja";

  const progress = useMemo(() => calculateOverallProgress(tasks), [tasks]);
  const totalEstimate = useMemo(() => calculateTotalEstimate(tasks), [tasks]);
  const totalActual = useMemo(() => calculateTotalActual(tasks), [tasks]);
  const overdueTasks = useMemo(() => getOverdueTasks(tasks), [tasks]);
  const upcomingTasks = useMemo(
    () => getUpcomingTasks(tasks, 30).slice(0, 5),
    [tasks]
  );
  const currentPhase = useMemo(
    () => getCurrentPhase(settings.weddingDate),
    [settings.weddingDate]
  );

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalCount = tasks.filter((t) => t.status !== "skipped").length;

  const daysUntil = settings.weddingDate
    ? getDaysUntilWedding(settings.weddingDate)
    : null;

  if (!isLoaded) {
    return (
      <div className="page-with-nav min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-with-nav min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isJa ? "ダッシュボード" : "Dashboard"}
          </h1>
          {settings.partner1Name && settings.partner2Name && (
            <p className="text-sm text-gray-500 mt-1">
              {settings.partner1Name} & {settings.partner2Name}
              {settings.weddingDate && (
                <> · {formatDate(settings.weddingDate, settings.language)}</>
              )}
            </p>
          )}
        </div>

        {/* Wedding countdown + progress */}
        {daysUntil !== null && (
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm font-medium">
                  {isJa ? "挙式まであと" : "Days until wedding"}
                </p>
                <p className="text-4xl font-bold mt-1">
                  {daysUntil > 0 ? daysUntil : 0}
                  <span className="text-lg ml-1">{isJa ? "日" : " days"}</span>
                </p>
                {daysUntil <= 0 && (
                  <p className="text-rose-100 text-sm mt-1">
                    {isJa ? "おめでとうございます！🎉" : "Congratulations! 🎉"}
                  </p>
                )}
              </div>
              <ProgressRing
                progress={progress}
                size={80}
                strokeWidth={6}
                color="white"
              />
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title={isJa ? "全体進捗" : "Overall Progress"}
            value={`${Math.round(progress)}%`}
            subtitle={`${completedCount}/${totalCount} ${isJa ? "タスク" : "tasks"}`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          />
          <StatCard
            title={isJa ? "予算消化" : "Budget Used"}
            value={formatCurrency(totalActual)}
            subtitle={`/ ${formatCurrency(settings.totalBudget)}`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
            trend={
              totalActual > settings.totalBudget
                ? { direction: "up", label: isJa ? "予算超過" : "Over budget" }
                : totalActual > 0
                ? { direction: "down", label: `${Math.round((totalActual / settings.totalBudget) * 100)}%` }
                : undefined
            }
          />
          <StatCard
            title={isJa ? "見積平均" : "Estimate Avg"}
            value={formatCurrency((totalEstimate.min + totalEstimate.max) / 2)}
            subtitle={`${formatCurrency(totalEstimate.min)}〜${formatCurrency(totalEstimate.max)}`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            }
          />
          <StatCard
            title={isJa ? "期限超過" : "Overdue"}
            value={`${overdueTasks.length}`}
            subtitle={isJa ? "タスク" : "tasks"}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            }
            trend={
              overdueTasks.length > 0
                ? { direction: "up", label: isJa ? "要対応" : "Action needed" }
                : undefined
            }
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline - left column */}
          <div className="lg:col-span-1">
            <TimelineView
              tasks={tasks}
              currentPhase={currentPhase}
              language={settings.language}
            />
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Overdue tasks warning */}
            {overdueTasks.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-red-700 mb-2">
                  ⚠️ {isJa ? "期限超過タスク" : "Overdue Tasks"}
                </h3>
                <div className="space-y-2">
                  {overdueTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 text-sm text-red-700"
                    >
                      <span>{CATEGORY_INFO[task.categoryId].icon}</span>
                      <span className="flex-1 truncate">{task.name}</span>
                      {task.calculatedDeadline && (
                        <span className="text-xs text-red-500">
                          {formatDate(task.calculatedDeadline, settings.language)}
                        </span>
                      )}
                    </div>
                  ))}
                  {overdueTasks.length > 3 && (
                    <p className="text-xs text-red-500">
                      +{overdueTasks.length - 3} {isJa ? "件" : " more"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming tasks */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                {isJa ? "直近のタスク" : "Upcoming Tasks"}
              </h3>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-2">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-sm">{CATEGORY_INFO[task.categoryId].icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{task.name}</p>
                        <p className="text-xs text-gray-400">{task.recommendedTiming}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          task.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {task.status === "in_progress"
                          ? isJa
                            ? "進行中"
                            : "In Progress"
                          : isJa
                          ? "未着手"
                          : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  {isJa
                    ? "直近のタスクはありません"
                    : "No upcoming tasks"}
                </p>
              )}
            </div>

            {/* Category progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                {isJa ? "カテゴリ別進捗" : "Category Progress"}
              </h3>
              <div className="space-y-3">
                {Object.entries(CATEGORY_INFO).map(([id, info]) => {
                  const catTasks = tasks.filter((t) => t.categoryId === id);
                  const completed = catTasks.filter(
                    (t) => t.status === "completed"
                  ).length;
                  const total = catTasks.filter(
                    (t) => t.status !== "skipped"
                  ).length;
                  const pct = total > 0 ? (completed / total) * 100 : 0;

                  return (
                    <div key={id} className="flex items-center gap-3">
                      <span className="text-sm w-6 text-center">{info.icon}</span>
                      <span className="text-sm text-gray-700 w-28 truncate">
                        {isJa ? info.label : info.labelEn}
                      </span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: info.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {completed}/{total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current phase info */}
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-5">
              <h3 className="text-base font-bold text-rose-800 mb-1">
                {isJa ? "現在のフェーズ" : "Current Phase"}
              </h3>
              <p className="text-sm text-rose-700">
                {isJa
                  ? PHASE_INFO[currentPhase].label
                  : PHASE_INFO[currentPhase].labelEn}
              </p>
              <p className="text-xs text-rose-500 mt-0.5">
                {isJa
                  ? PHASE_INFO[currentPhase].monthRange
                  : PHASE_INFO[currentPhase].monthRangeEn}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

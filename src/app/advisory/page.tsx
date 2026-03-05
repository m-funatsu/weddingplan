"use client";

import { useMemo } from "react";
import { useWeddingTasks, useWeddingSettings } from "@/lib/hooks";
import { generateAdvisory, type AdvisorySeverity } from "@/lib/logic";
import { NATIONAL_AVERAGES } from "@/data/master-data";

function getSeverityStyles(severity: AdvisorySeverity): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: "!!",
      };
    case "warning":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-800",
        icon: "!",
      };
    case "success":
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-800",
        icon: "OK",
      };
    case "info":
    default:
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: "i",
      };
  }
}

function getHealthColor(
  health: "excellent" | "good" | "caution" | "warning"
): string {
  switch (health) {
    case "excellent":
      return "from-emerald-500 to-teal-500";
    case "good":
      return "from-blue-500 to-cyan-500";
    case "caution":
      return "from-amber-500 to-orange-500";
    case "warning":
      return "from-red-500 to-pink-500";
  }
}

export default function AdvisoryPage() {
  const { tasks, isLoaded } = useWeddingTasks();
  const { settings } = useWeddingSettings();
  const isJa = settings.language === "ja";

  const report = useMemo(() => {
    if (!isLoaded || tasks.length === 0) return null;
    return generateAdvisory({
      tasks,
      weddingDate: settings.ceremonyDate,
      marriageDate: settings.marriageDate,
      guestCount: NATIONAL_AVERAGES.averageGuestCount,
      totalBudget: settings.totalBudget,
      hasCeremony: settings.hasCeremony,
      language: settings.language,
    });
  }, [tasks, settings, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="page-with-nav min-h-screen flex items-center justify-center">
        <div
          className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="読み込み中"
        />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page-with-nav min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isJa ? "アドバイザリーレポート" : "Advisory Report"}
          </h1>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-500">
              {isJa
                ? "タスクデータがありません。タスクを追加するとレポートが生成されます。"
                : "No task data available. Add tasks to generate a report."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group items by category
  const grouped = report.items.reduce<
    Record<string, typeof report.items>
  >((acc, item) => {
    const cat = isJa ? item.category : item.categoryEn;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const criticalCount = report.items.filter(
    (i) => i.severity === "critical"
  ).length;
  const warningCount = report.items.filter(
    (i) => i.severity === "warning"
  ).length;
  const successCount = report.items.filter(
    (i) => i.severity === "success"
  ).length;

  return (
    <div className="page-with-nav min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isJa ? "アドバイザリーレポート" : "Advisory Report"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isJa
              ? "現在の準備状況に基づく総合分析とアドバイスです"
              : "Comprehensive analysis and advice based on your preparation status"}
          </p>
        </div>

        {/* Overall health banner */}
        <div
          className={`bg-gradient-to-r ${getHealthColor(
            report.overallHealth
          )} rounded-xl p-6 text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">
                {isJa ? "準備状況" : "Overall Status"}
              </p>
              <p className="text-3xl font-bold mt-1">
                {isJa
                  ? report.overallHealthLabel
                  : report.overallHealthLabelEn}
              </p>
              <p className="text-white/80 text-sm mt-2">
                {isJa ? report.summary : report.summaryEn}
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              {isJa ? "要対策" : "Critical"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{warningCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              {isJa ? "注意" : "Warnings"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {successCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isJa ? "良好" : "Good"}
            </p>
          </div>
        </div>

        {/* Advisory items grouped by category */}
        <div className="space-y-5">
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-base font-bold text-gray-900 mb-3">
                {category}
              </h2>
              <div className="space-y-3">
                {items.map((item, i) => {
                  const styles = getSeverityStyles(item.severity);
                  return (
                    <div
                      key={i}
                      className={`${styles.bg} border ${styles.border} rounded-xl p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${styles.text} ${styles.bg} border ${styles.border}`}
                          aria-hidden="true"
                        >
                          {styles.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-sm font-bold ${styles.text}`}
                          >
                            {isJa ? item.title : item.titleEn}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                            {isJa ? item.message : item.messageEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

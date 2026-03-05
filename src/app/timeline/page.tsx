"use client";

import { useMemo } from "react";
import { useWeddingSettings } from "@/lib/hooks";
import { generateTimeline } from "@/lib/logic";
import { SCHEDULE_TEMPLATE } from "@/data/master-data";

export default function TimelinePage() {
  const { settings, isLoaded } = useWeddingSettings();
  const isJa = settings.language === "ja";

  const weddingDate = settings.ceremonyDate || settings.marriageDate;

  const milestones = useMemo(() => {
    if (!weddingDate) return null;
    return generateTimeline(weddingDate, settings.language);
  }, [weddingDate, settings.language]);

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

  return (
    <div className="page-with-nav min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isJa ? "逆算タイムライン" : "Countdown Timeline"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isJa
              ? "挙式日から逆算したマイルストーンとやるべきことの一覧です"
              : "Milestones and tasks counted back from your ceremony date"}
          </p>
        </div>

        {!weddingDate ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-amber-800 font-medium mb-2">
              {isJa
                ? "挙式日または入籍日を設定してください"
                : "Please set a ceremony or marriage date"}
            </p>
            <p className="text-sm text-amber-600">
              {isJa
                ? "設定ページで日付を登録すると、逆算タイムラインが自動生成されます。"
                : "Set a date in Settings to auto-generate your countdown timeline."}
            </p>
            <a
              href="/settings"
              className="inline-block mt-4 px-5 py-2.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
            >
              {isJa ? "設定を開く" : "Open Settings"}
            </a>
          </div>
        ) : milestones ? (
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200"
              aria-hidden="true"
            />

            <div className="space-y-0">
              {milestones.map((milestone, i) => {
                const isCurrent = milestone.isCurrent;
                const isPast = milestone.isPast;

                return (
                  <div key={i} className="relative pl-10 sm:pl-14 pb-8">
                    {/* Dot on the timeline */}
                    <div
                      className={`absolute left-2.5 sm:left-4.5 top-1 w-3.5 h-3.5 rounded-full border-2 ${
                        isCurrent
                          ? "bg-rose-600 border-rose-600 ring-4 ring-rose-100"
                          : isPast
                          ? "bg-gray-300 border-gray-300"
                          : "bg-white border-gray-300"
                      }`}
                      aria-hidden="true"
                    />

                    <div
                      className={`rounded-xl border p-5 transition-all ${
                        isCurrent
                          ? "bg-rose-50 border-rose-200 shadow-sm"
                          : isPast
                          ? "bg-gray-50 border-gray-200 opacity-60"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3
                            className={`text-base font-bold ${
                              isCurrent ? "text-rose-800" : "text-gray-900"
                            }`}
                          >
                            {isJa ? milestone.label : milestone.labelEn}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {milestone.date}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="px-2 py-1 bg-rose-600 text-white text-xs font-bold rounded-full">
                            {isJa ? "今ここ" : "Current"}
                          </span>
                        )}
                        {isPast && (
                          <span className="px-2 py-1 bg-gray-300 text-white text-xs font-bold rounded-full">
                            {isJa ? "完了" : "Past"}
                          </span>
                        )}
                      </div>

                      {/* Tasks */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1.5">
                          {isJa ? "やること" : "Tasks"}
                        </p>
                        <ul className="space-y-1">
                          {(isJa ? milestone.tasks : milestone.tasksEn).map(
                            (task, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-2 text-sm text-gray-700"
                              >
                                <span
                                  className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                                    isPast ? "bg-gray-300" : "bg-rose-400"
                                  }`}
                                />
                                {task}
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      {/* Tips */}
                      {milestone.tips.length > 0 && (
                        <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
                          <p className="text-xs font-medium text-amber-700 mb-1">
                            {isJa ? "ヒント" : "Tips"}
                          </p>
                          <ul className="space-y-1">
                            {(isJa ? milestone.tips : milestone.tipsEn).map(
                              (tip, j) => (
                                <li
                                  key={j}
                                  className="text-xs text-gray-600 flex items-start gap-1.5"
                                >
                                  <span className="text-amber-500 shrink-0">*</span>
                                  {tip}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Static reference (always shown) */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            {isJa
              ? "一般的なスケジュール参考"
              : "General Schedule Reference"}
          </h2>
          <div className="space-y-3">
            {SCHEDULE_TEMPLATE.map((ms, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full whitespace-nowrap">
                  {isJa ? ms.label : ms.labelEn}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    {(isJa ? ms.tasks : ms.tasksEn).join(" / ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

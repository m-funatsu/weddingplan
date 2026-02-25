"use client";

import { ALL_PHASE_IDS, PHASE_INFO, type PhaseId, type WeddingTask } from "@/types";
import { calculatePhaseProgress } from "@/lib/calculations";

interface TimelineViewProps {
  tasks: WeddingTask[];
  currentPhase: PhaseId;
  language: "ja" | "en";
  onPhaseClick?: (phaseId: PhaseId) => void;
}

export default function TimelineView({
  tasks,
  currentPhase,
  language,
  onPhaseClick,
}: TimelineViewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-base font-bold text-gray-900 mb-4">
        {language === "ja" ? "タイムライン" : "Timeline"}
      </h3>
      <div className="space-y-2">
        {ALL_PHASE_IDS.map((phaseId, index) => {
          const info = PHASE_INFO[phaseId];
          const progress = calculatePhaseProgress(tasks, phaseId);
          const isCurrent = phaseId === currentPhase;
          const isOptional = info.isOptional;
          const phaseTasks = tasks.filter((t) => t.phaseId === phaseId);
          const completedCount = phaseTasks.filter(
            (t) => t.status === "completed"
          ).length;
          const allSkipped = phaseTasks.length > 0 && phaseTasks.every((t) => t.status === "skipped");

          return (
            <button
              key={phaseId}
              onClick={() => onPhaseClick?.(phaseId)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                allSkipped
                  ? "opacity-50 border border-dashed border-gray-200"
                  : isCurrent
                  ? "bg-rose-50 border border-rose-200"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              {/* Phase number */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  allSkipped
                    ? "bg-gray-100 text-gray-400"
                    : progress === 100
                    ? "bg-green-100 text-green-700"
                    : isCurrent
                    ? "bg-rose-600 text-white"
                    : isOptional
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {allSkipped ? "−" : progress === 100 ? "✓" : index + 1}
              </div>

              {/* Phase info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p
                    className={`text-sm font-medium truncate ${
                      allSkipped ? "text-gray-400" : isCurrent ? "text-rose-700" : "text-gray-900"
                    }`}
                  >
                    {language === "ja" ? info.label : info.labelEn}
                  </p>
                  {isOptional && (
                    <span className="text-[10px] text-purple-600 bg-purple-50 px-1 py-0.5 rounded shrink-0">
                      {language === "ja" ? "任意" : "Optional"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {language === "ja" ? info.monthRange : info.monthRangeEn}
                </p>
              </div>

              {/* Progress */}
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-gray-600">
                  {allSkipped
                    ? language === "ja" ? "スキップ" : "Skipped"
                    : `${completedCount}/${phaseTasks.length}`}
                </p>
                {!allSkipped && (
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress === 100 ? "bg-green-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

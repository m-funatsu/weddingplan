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
          const phaseTasks = tasks.filter((t) => t.phaseId === phaseId);
          const completedCount = phaseTasks.filter(
            (t) => t.status === "completed"
          ).length;

          return (
            <button
              key={phaseId}
              onClick={() => onPhaseClick?.(phaseId)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                isCurrent
                  ? "bg-rose-50 border border-rose-200"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              {/* Phase number */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  progress === 100
                    ? "bg-green-100 text-green-700"
                    : isCurrent
                    ? "bg-rose-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {progress === 100 ? "✓" : index + 1}
              </div>

              {/* Phase info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isCurrent ? "text-rose-700" : "text-gray-900"
                  }`}
                >
                  {language === "ja" ? info.label : info.labelEn}
                </p>
                <p className="text-xs text-gray-400">
                  {language === "ja" ? info.monthRange : info.monthRangeEn}
                </p>
              </div>

              {/* Progress */}
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-gray-600">
                  {completedCount}/{phaseTasks.length}
                </p>
                <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progress === 100 ? "bg-green-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

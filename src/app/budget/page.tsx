"use client";

import { useWeddingTasks, useWeddingSettings } from "@/lib/hooks";
import BudgetChart from "@/components/BudgetChart";

export default function BudgetPage() {
  const { tasks, isLoaded } = useWeddingTasks();
  const { settings } = useWeddingSettings();
  const isJa = settings.language === "ja";

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isJa ? "予算管理" : "Budget Management"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isJa
              ? "見積と実費を比較して、予算を管理しましょう"
              : "Compare estimates with actual costs to manage your budget"}
          </p>
        </div>

        <BudgetChart
          tasks={tasks}
          totalBudget={settings.totalBudget}
          language={settings.language}
        />
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { CATEGORY_INFO, type CategoryId, type WeddingTask } from "@/types";
import { getBudgetBreakdown, formatCurrency } from "@/lib/calculations";

interface BudgetChartProps {
  tasks: WeddingTask[];
  totalBudget: number;
  language: "ja" | "en";
}

export default function BudgetChart({ tasks, totalBudget, language }: BudgetChartProps) {
  const isJa = language === "ja";
  const breakdown = useMemo(() => getBudgetBreakdown(tasks), [tasks]);

  const totalEstimateAvg = breakdown.reduce((sum, b) => sum + b.estimateAvg, 0);
  const totalActual = breakdown.reduce((sum, b) => sum + b.actual, 0);

  // Generate conic gradient for donut chart
  const segments = useMemo(() => {
    const filtered = breakdown.filter((b) => b.estimateAvg > 0);
    let cumulative = 0;
    return filtered.map((b) => {
      const pct = totalEstimateAvg > 0 ? (b.estimateAvg / totalEstimateAvg) * 100 : 0;
      const start = cumulative;
      cumulative += pct;
      return {
        ...b,
        percentage: pct,
        start,
        end: cumulative,
        color: CATEGORY_INFO[b.categoryId as CategoryId]?.color ?? "#94a3b8",
      };
    });
  }, [breakdown, totalEstimateAvg]);

  const conicGradient = useMemo(() => {
    if (segments.length === 0) return "conic-gradient(#e2e8f0 0% 100%)";
    const parts = segments.map(
      (s) => `${s.color} ${s.start}% ${s.end}%`
    );
    return `conic-gradient(${parts.join(", ")})`;
  }, [segments]);

  const budgetUsagePercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Budget overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          {isJa ? "予算概要" : "Budget Overview"}
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">{isJa ? "予算総額" : "Total Budget"}</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{isJa ? "見積平均" : "Est. Average"}</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalEstimateAvg)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{isJa ? "実費合計" : "Total Actual"}</p>
            <p className={`text-lg font-bold ${totalActual > totalBudget ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(totalActual)}
            </p>
          </div>
        </div>

        {/* Budget usage bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{isJa ? "予算消化率" : "Budget Usage"}</span>
            <span>{Math.round(budgetUsagePercent)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePercent > 100
                  ? "bg-red-500"
                  : budgetUsagePercent > 80
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
            />
          </div>
          {totalActual > totalBudget && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {isJa
                ? `予算を ${formatCurrency(totalActual - totalBudget)} 超過しています`
                : `Over budget by ${formatCurrency(totalActual - totalBudget)}`}
            </p>
          )}
        </div>
      </div>

      {/* Donut chart + legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          {isJa ? "カテゴリ別内訳" : "Category Breakdown"}
        </h3>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Donut */}
          <div className="relative w-48 h-48 shrink-0">
            <div
              className="w-full h-full rounded-full"
              style={{ background: conicGradient }}
            />
            <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-gray-400">{isJa ? "見積合計" : "Total"}</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(totalEstimateAvg)}</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 w-full">
            {segments.map((seg) => (
              <div key={seg.categoryId} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-sm text-gray-700 flex-1 truncate">{seg.label}</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(seg.estimateAvg)}
                </span>
                <span className="text-xs text-gray-400">
                  ({Math.round(seg.percentage)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estimate vs Actual table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          {isJa ? "見積 vs 実費" : "Estimate vs Actual"}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">
                  {isJa ? "カテゴリ" : "Category"}
                </th>
                <th className="text-right py-2 text-gray-500 font-medium">
                  {isJa ? "見積" : "Estimate"}
                </th>
                <th className="text-right py-2 text-gray-500 font-medium">
                  {isJa ? "実費" : "Actual"}
                </th>
                <th className="text-right py-2 text-gray-500 font-medium">
                  {isJa ? "差額" : "Diff"}
                </th>
              </tr>
            </thead>
            <tbody>
              {breakdown
                .filter((b) => b.estimateAvg > 0 || b.actual > 0)
                .map((b) => {
                  const diff = b.actual - b.estimateAvg;
                  return (
                    <tr key={b.categoryId} className="border-b border-gray-50">
                      <td className="py-2 text-gray-900">
                        {CATEGORY_INFO[b.categoryId as CategoryId]?.icon} {b.label}
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {formatCurrency(b.estimateAvg)}
                      </td>
                      <td className="py-2 text-right text-gray-900 font-medium">
                        {b.actual > 0 ? formatCurrency(b.actual) : "-"}
                      </td>
                      <td
                        className={`py-2 text-right font-medium ${
                          diff > 0
                            ? "text-red-600"
                            : diff < 0
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {b.actual > 0
                          ? `${diff > 0 ? "+" : ""}${formatCurrency(diff)}`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200">
                <td className="py-2 font-bold text-gray-900">{isJa ? "合計" : "Total"}</td>
                <td className="py-2 text-right font-bold text-gray-900">
                  {formatCurrency(totalEstimateAvg)}
                </td>
                <td className="py-2 text-right font-bold text-gray-900">
                  {totalActual > 0 ? formatCurrency(totalActual) : "-"}
                </td>
                <td
                  className={`py-2 text-right font-bold ${
                    totalActual - totalEstimateAvg > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {totalActual > 0
                    ? `${totalActual - totalEstimateAvg > 0 ? "+" : ""}${formatCurrency(
                        totalActual - totalEstimateAvg
                      )}`
                    : "-"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

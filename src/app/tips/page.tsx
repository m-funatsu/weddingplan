"use client";

import { useMemo, useState } from "react";
import { useWeddingSettings } from "@/lib/hooks";
import {
  COST_SAVING_TIPS,
  SEASONAL_PRICING,
  REGIONAL_MULTIPLIERS,
  NATIONAL_AVERAGES,
  HOKKAIDO_FEE_SYSTEM,
} from "@/data/master-data";
import { formatCurrency } from "@/lib/calculations";

type TabId = "savings" | "seasonal" | "regional" | "hokkaido";

export default function TipsPage() {
  const { settings } = useWeddingSettings();
  const isJa = settings.language === "ja";
  const [activeTab, setActiveTab] = useState<TabId>("savings");

  const totalSavingsMin = useMemo(
    () => COST_SAVING_TIPS.reduce((sum, t) => sum + t.savingsRange.min, 0),
    []
  );
  const totalSavingsMax = useMemo(
    () => COST_SAVING_TIPS.reduce((sum, t) => sum + t.savingsRange.max, 0),
    []
  );

  const tabs: { id: TabId; label: string }[] = [
    { id: "savings", label: isJa ? "節約テクニック" : "Saving Tips" },
    { id: "seasonal", label: isJa ? "季節・曜日別" : "Season/Day" },
    { id: "regional", label: isJa ? "地域別相場" : "Regional Costs" },
    { id: "hokkaido", label: isJa ? "北海道会費制" : "Hokkaido System" },
  ];

  return (
    <div className="page-with-nav min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isJa ? "節約ガイド & 相場情報" : "Saving Guide & Cost References"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isJa
              ? "結婚式費用を賢く節約するためのヒントと地域・季節別の相場情報"
              : "Tips to save on wedding costs and regional/seasonal pricing data"}
          </p>
        </div>

        {/* Total savings banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 text-white">
          <p className="text-emerald-100 text-sm font-medium">
            {isJa ? "すべて実行した場合の節約見込み" : "Potential Total Savings"}
          </p>
          <p className="text-2xl font-bold mt-1">
            {formatCurrency(totalSavingsMin)} ~ {formatCurrency(totalSavingsMax)}
          </p>
          <p className="text-emerald-100 text-xs mt-1">
            {isJa
              ? `全国平均 ${formatCurrency(NATIONAL_AVERAGES.totalCeremonyAndReception)} に対して最大 ${Math.round((totalSavingsMax / NATIONAL_AVERAGES.totalCeremonyAndReception) * 100)}% 削減可能`
              : `Up to ${Math.round((totalSavingsMax / NATIONAL_AVERAGES.totalCeremonyAndReception) * 100)}% savings vs national average ${formatCurrency(NATIONAL_AVERAGES.totalCeremonyAndReception)}`}
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 overflow-x-auto" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "savings" && (
          <div className="space-y-3">
            {COST_SAVING_TIPS.map((tip, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        {isJa ? tip.category : tip.categoryEn}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {isJa ? tip.tip : tip.tipEn}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">
                      {isJa ? "節約目安" : "Savings"}
                    </p>
                    <p className="text-sm font-bold text-emerald-600">
                      {formatCurrency(tip.savingsRange.min)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ~ {formatCurrency(tip.savingsRange.max)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "seasonal" && (
          <div className="space-y-3">
            {SEASONAL_PRICING.map((season, i) => {
              const isDiscount = season.multiplier < 1.0;
              const isPremium = season.multiplier > 1.0;
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-5 ${
                    isDiscount
                      ? "bg-emerald-50 border-emerald-200"
                      : isPremium
                      ? "bg-amber-50 border-amber-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`text-sm font-bold ${
                        isDiscount
                          ? "text-emerald-800"
                          : isPremium
                          ? "text-amber-800"
                          : "text-gray-900"
                      }`}
                    >
                      {isJa ? season.period : season.periodEn}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        isDiscount
                          ? "bg-emerald-100 text-emerald-700"
                          : isPremium
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isJa ? season.label : season.labelEn} (x{season.multiplier})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {isJa ? season.description : season.descriptionEn}
                  </p>
                  {isPremium && (
                    <p className="text-xs text-amber-700 mt-2">
                      {isJa
                        ? `全国平均に対して約 ${formatCurrency(Math.round(NATIONAL_AVERAGES.totalCeremonyAndReception * (season.multiplier - 1)))} の上乗せ`
                        : `~${formatCurrency(Math.round(NATIONAL_AVERAGES.totalCeremonyAndReception * (season.multiplier - 1)))} additional vs average`}
                    </p>
                  )}
                  {isDiscount && (
                    <p className="text-xs text-emerald-700 mt-2">
                      {isJa
                        ? `全国平均に対して約 ${formatCurrency(Math.round(NATIONAL_AVERAGES.totalCeremonyAndReception * (1 - season.multiplier)))} の節約が見込めます`
                        : `~${formatCurrency(Math.round(NATIONAL_AVERAGES.totalCeremonyAndReception * (1 - season.multiplier)))} potential savings vs average`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "regional" && (
          <div className="space-y-3">
            {REGIONAL_MULTIPLIERS.map((region, i) => {
              const estimatedTotal = Math.round(
                NATIONAL_AVERAGES.totalCeremonyAndReception * region.multiplier
              );
              const diff = estimatedTotal - NATIONAL_AVERAGES.totalCeremonyAndReception;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900">
                        {isJa ? region.region : region.regionEn}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {isJa ? region.note : region.noteEn}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        x{region.multiplier}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isJa ? "目安" : "Est."}: {formatCurrency(estimatedTotal)}
                      </p>
                      <p
                        className={`text-xs font-medium mt-0.5 ${
                          diff > 0 ? "text-red-500" : diff < 0 ? "text-emerald-600" : "text-gray-400"
                        }`}
                      >
                        {diff > 0 ? "+" : ""}
                        {formatCurrency(diff)}
                      </p>
                    </div>
                  </div>

                  {/* Bar visualization */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          region.multiplier > 1.0
                            ? "bg-amber-400"
                            : region.multiplier < 1.0
                            ? "bg-emerald-400"
                            : "bg-gray-300"
                        }`}
                        style={{
                          width: `${Math.min((region.multiplier / 1.3) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "hokkaido" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="text-base font-bold text-blue-900 mb-2">
                {isJa ? "北海道の会費制とは" : "Hokkaido Fee-Based System"}
              </h3>
              <p className="text-sm text-gray-700">
                {isJa
                  ? HOKKAIDO_FEE_SYSTEM.description
                  : HOKKAIDO_FEE_SYSTEM.descriptionEn}
              </p>
              <div className="mt-3 bg-white/60 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-800 mb-1">
                  {isJa ? "ゲスト1人あたりの会費" : "Fee per Guest"}
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(HOKKAIDO_FEE_SYSTEM.feePerGuest.min)} ~{" "}
                  {formatCurrency(HOKKAIDO_FEE_SYSTEM.feePerGuest.max)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                {isJa ? "ご祝儀制との主な違い" : "Key Differences from Goshugi"}
              </h3>
              <ul className="space-y-2">
                {(isJa
                  ? HOKKAIDO_FEE_SYSTEM.keyDifferences
                  : HOKKAIDO_FEE_SYSTEM.keyDifferencesEn
                ).map((diff, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-blue-500 shrink-0 mt-0.5">*</span>
                    {diff}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

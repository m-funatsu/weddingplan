"use client";

import { useState, useMemo } from "react";
import { useWeddingSettings } from "@/lib/hooks";
import { compareVenues } from "@/lib/logic";
import {
  VENUE_TYPES,
  REGIONAL_MULTIPLIERS,
  NATIONAL_AVERAGES,
  type VenueType,
} from "@/data/master-data";
import { formatCurrency } from "@/lib/calculations";

const ALL_VENUE_TYPES: VenueType[] = VENUE_TYPES.map((v) => v.type);

export default function VenuesPage() {
  const { settings } = useWeddingSettings();
  const isJa = settings.language === "ja";

  const [guestCount, setGuestCount] = useState<number>(
    NATIONAL_AVERAGES.averageGuestCount
  );
  const [regionMultiplier, setRegionMultiplier] = useState<number>(1.0);

  const comparison = useMemo(
    () => compareVenues(ALL_VENUE_TYPES, guestCount, regionMultiplier),
    [guestCount, regionMultiplier]
  );

  function getScoreColor(score: number): string {
    if (score >= 70) return "text-emerald-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  }

  function getScoreBg(score: number): string {
    if (score >= 70) return "bg-emerald-50 border-emerald-200";
    if (score >= 40) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  }

  function getScoreBarColor(score: number): string {
    if (score >= 70) return "bg-emerald-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  }

  return (
    <div className="page-with-nav min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isJa ? "会場タイプ比較" : "Venue Comparison"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isJa
              ? "ゲスト数と地域に合わせて最適な会場タイプを見つけましょう"
              : "Find the best venue type for your guest count and region"}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="venue-guests"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {isJa ? "ゲスト人数" : "Guest Count"}
              </label>
              <input
                id="venue-guests"
                type="number"
                min={1}
                max={500}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label
                htmlFor="venue-region"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {isJa ? "地域" : "Region"}
              </label>
              <select
                id="venue-region"
                value={regionMultiplier}
                onChange={(e) => setRegionMultiplier(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
              >
                <option value={1.0}>
                  {isJa ? "全国平均" : "National Average"}
                </option>
                {REGIONAL_MULTIPLIERS.map((r) => (
                  <option key={r.region} value={r.multiplier}>
                    {isJa ? r.region : r.regionEn} (x{r.multiplier})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Best picks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: isJa ? "コスパ最高" : "Best Value",
              type: comparison.bestValue,
            },
            {
              label: isJa ? "大人数向き" : "Large Groups",
              type: comparison.bestForLargeGroup,
            },
            {
              label: isJa ? "少人数向き" : "Small Groups",
              type: comparison.bestForSmallGroup,
            },
          ].map((pick) => {
            const venueInfo = VENUE_TYPES.find((v) => v.type === pick.type);
            return (
              <div
                key={pick.label}
                className="bg-rose-50 border border-rose-200 rounded-xl p-4"
              >
                <p className="text-xs font-medium text-rose-500 mb-1">
                  {pick.label}
                </p>
                <p className="text-sm font-bold text-rose-800">
                  {isJa ? venueInfo?.label : venueInfo?.labelEn}
                </p>
              </div>
            );
          })}
        </div>

        {/* Venue cards */}
        <div className="space-y-4">
          {comparison.venues.map((venue) => (
            <div
              key={venue.type}
              className={`rounded-xl border p-5 ${getScoreBg(venue.score)}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {isJa ? venue.label : venue.labelEn}
                    </h3>
                    <span
                      className={`text-sm font-bold ${getScoreColor(
                        venue.score
                      )}`}
                    >
                      {venue.score}
                      {isJa ? "点" : "pts"}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(
                        venue.score
                      )}`}
                      style={{ width: `${venue.score}%` }}
                    />
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {isJa ? venue.description : venue.descriptionEn}
                  </p>

                  <p className="text-sm text-gray-700 italic mb-3">
                    {isJa ? venue.recommendation : venue.recommendationEn}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">
                        {isJa ? "費用目安" : "Cost Range"}
                      </span>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(venue.adjustedCost.min)} ~{" "}
                        {formatCurrency(venue.adjustedCost.max)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {isJa ? "収容人数" : "Capacity"}
                      </span>
                      <p className="font-medium text-gray-900">
                        {venue.capacity.min} ~ {venue.capacity.max}
                        {isJa ? "名" : " guests"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-emerald-700 mb-1">
                        {isJa ? "メリット" : "Pros"}
                      </p>
                      <ul className="space-y-1">
                        {(isJa ? venue.pros : venue.prosEn).map((pro, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-600 flex items-start gap-1"
                          >
                            <span className="text-emerald-500 mt-0.5 shrink-0">
                              +
                            </span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-700 mb-1">
                        {isJa ? "デメリット" : "Cons"}
                      </p>
                      <ul className="space-y-1">
                        {(isJa ? venue.cons : venue.consEn).map((con, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-600 flex items-start gap-1"
                          >
                            <span className="text-red-500 mt-0.5 shrink-0">
                              -
                            </span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

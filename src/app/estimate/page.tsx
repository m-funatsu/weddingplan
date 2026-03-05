"use client";

import { useState, useMemo } from "react";
import { useWeddingSettings } from "@/lib/hooks";
import {
  estimateTotalCost,
  estimateGoshugi,
  calculateSelfPayment,
  type VenueOption,
  type CeremonyOptions,
  type GuestEntry,
} from "@/lib/logic";
import {
  VENUE_TYPES,
  REGIONAL_MULTIPLIERS,
  SEASONAL_PRICING,
  GOSHUGI_RATES,
  NATIONAL_AVERAGES,
  type VenueType,
  type GuestRelation,
} from "@/data/master-data";
import { formatCurrency } from "@/lib/calculations";

const RELATION_OPTIONS: { value: GuestRelation; label: string }[] = GOSHUGI_RATES.map(
  (r) => ({ value: r.relation, label: r.label })
);

export default function EstimatePage() {
  const { settings } = useWeddingSettings();
  const isJa = settings.language === "ja";

  // Form state
  const [guestCount, setGuestCount] = useState<number>(
    NATIONAL_AVERAGES.averageGuestCount
  );
  const [venueType, setVenueType] = useState<VenueType>("hotel");
  const [region, setRegion] = useState<string>("");
  const [seasonIdx, setSeasonIdx] = useState<number>(-1);
  const [hasColorDress, setHasColorDress] = useState(true);
  const [hasPreShoot, setHasPreShoot] = useState(true);
  const [hasProfessionalMC, setHasProfessionalMC] = useState(true);
  const [hasEntertainment, setHasEntertainment] = useState(true);
  const [parentSupport, setParentSupport] = useState<number>(0);

  // Guest list for goshugi
  const [guestEntries, setGuestEntries] = useState<
    { relation: GuestRelation; count: number }[]
  >([
    { relation: "friend", count: 15 },
    { relation: "colleague", count: 10 },
    { relation: "boss", count: 3 },
    { relation: "relative_close", count: 8 },
    { relation: "relative_distant", count: 5 },
    { relation: "couple_invite", count: 2 },
  ]);

  const venue: VenueOption = useMemo(
    () => ({ type: venueType, region: region || undefined }),
    [venueType, region]
  );

  const options: CeremonyOptions = useMemo(
    () => ({
      hasColorDress,
      hasPreShoot,
      hasProfessionalMC,
      hasEntertainment,
      seasonMultiplier:
        seasonIdx >= 0 ? SEASONAL_PRICING[seasonIdx].multiplier : 1.0,
    }),
    [hasColorDress, hasPreShoot, hasProfessionalMC, hasEntertainment, seasonIdx]
  );

  const costEstimate = useMemo(
    () => estimateTotalCost(guestCount, venue, options),
    [guestCount, venue, options]
  );

  const guestList: GuestEntry[] = useMemo(
    () => guestEntries.map((e) => ({ relation: e.relation, count: e.count })),
    [guestEntries]
  );

  const goshugiEstimate = useMemo(
    () => estimateGoshugi(guestList),
    [guestList]
  );

  const selfPayment = useMemo(
    () =>
      calculateSelfPayment(
        (costEstimate.total.min + costEstimate.total.max) / 2,
        goshugiEstimate.total.typical,
        parentSupport
      ),
    [costEstimate, goshugiEstimate, parentSupport]
  );

  function updateGuestEntry(
    index: number,
    field: "relation" | "count",
    value: string | number
  ) {
    setGuestEntries((prev) => {
      const next = [...prev];
      if (field === "relation") {
        next[index] = { ...next[index], relation: value as GuestRelation };
      } else {
        next[index] = { ...next[index], count: Number(value) || 0 };
      }
      return next;
    });
  }

  function addGuestEntry() {
    setGuestEntries((prev) => [...prev, { relation: "friend", count: 1 }]);
  }

  function removeGuestEntry(index: number) {
    setGuestEntries((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="page-with-nav min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isJa ? "費用シミュレーター" : "Cost Estimator"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isJa
              ? "ゲスト数・会場・オプションから総費用・ご祝儀・自己負担を見積もります"
              : "Estimate total cost, goshugi, and self-payment based on your choices"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input form */}
          <div className="space-y-5">
            {/* Guest count */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="text-base font-bold text-gray-900">
                {isJa ? "基本条件" : "Basic Conditions"}
              </h2>

              <div>
                <label
                  htmlFor="guest-count"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {isJa ? "ゲスト人数" : "Guest Count"}
                </label>
                <input
                  id="guest-count"
                  type="number"
                  min={1}
                  max={500}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {isJa
                    ? `全国平均: ${NATIONAL_AVERAGES.averageGuestCount}名`
                    : `National average: ${NATIONAL_AVERAGES.averageGuestCount} guests`}
                </p>
              </div>

              <div>
                <label
                  htmlFor="venue-type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {isJa ? "会場タイプ" : "Venue Type"}
                </label>
                <select
                  id="venue-type"
                  value={venueType}
                  onChange={(e) => setVenueType(e.target.value as VenueType)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                >
                  {VENUE_TYPES.map((v) => (
                    <option key={v.type} value={v.type}>
                      {isJa ? v.label : v.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="region"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {isJa ? "地域" : "Region"}
                </label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                >
                  <option value="">
                    {isJa ? "全国平均 (x1.0)" : "National Average (x1.0)"}
                  </option>
                  {REGIONAL_MULTIPLIERS.map((r) => (
                    <option key={r.region} value={r.region}>
                      {isJa ? r.region : r.regionEn} (x{r.multiplier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="season"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {isJa ? "シーズン" : "Season"}
                </label>
                <select
                  id="season"
                  value={seasonIdx}
                  onChange={(e) => setSeasonIdx(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                >
                  <option value={-1}>
                    {isJa ? "通常期 (x1.0)" : "Standard (x1.0)"}
                  </option>
                  {SEASONAL_PRICING.map((s, i) => (
                    <option key={s.period} value={i}>
                      {isJa ? s.period : s.periodEn} - {isJa ? s.label : s.labelEn}{" "}
                      (x{s.multiplier})
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Options */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="text-base font-bold text-gray-900">
                {isJa ? "オプション" : "Options"}
              </h2>
              {[
                {
                  id: "color-dress",
                  label: isJa ? "カラードレス（お色直し）" : "Color Dress Change",
                  checked: hasColorDress,
                  onChange: setHasColorDress,
                },
                {
                  id: "pre-shoot",
                  label: isJa ? "前撮り" : "Pre-Wedding Photo Shoot",
                  checked: hasPreShoot,
                  onChange: setHasPreShoot,
                },
                {
                  id: "pro-mc",
                  label: isJa ? "プロ司会者" : "Professional MC",
                  checked: hasProfessionalMC,
                  onChange: setHasProfessionalMC,
                },
                {
                  id: "entertainment",
                  label: isJa ? "演出・エフェクト" : "Entertainment & Effects",
                  checked: hasEntertainment,
                  onChange: setHasEntertainment,
                },
              ].map((opt) => (
                <div key={opt.id} className="flex items-center justify-between">
                  <label htmlFor={opt.id} className="text-sm text-gray-700">
                    {opt.label}
                  </label>
                  <button
                    id={opt.id}
                    role="switch"
                    aria-checked={opt.checked}
                    onClick={() => opt.onChange(!opt.checked)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      opt.checked ? "bg-rose-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        opt.checked ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </section>

            {/* Guest list for goshugi */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  {isJa ? "ゲスト内訳（ご祝儀見積用）" : "Guest Breakdown (Goshugi)"}
                </h2>
                <button
                  onClick={addGuestEntry}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  aria-label={isJa ? "ゲストグループを追加" : "Add guest group"}
                >
                  + {isJa ? "追加" : "Add"}
                </button>
              </div>
              <div className="space-y-2">
                {guestEntries.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={entry.relation}
                      onChange={(e) => updateGuestEntry(i, "relation", e.target.value)}
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      aria-label={isJa ? "関係性" : "Relation"}
                    >
                      {RELATION_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={entry.count}
                      onChange={(e) =>
                        updateGuestEntry(i, "count", Number(e.target.value))
                      }
                      className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-500"
                      aria-label={isJa ? "人数" : "Count"}
                    />
                    <span className="text-xs text-gray-400">
                      {isJa ? "名" : "ppl"}
                    </span>
                    <button
                      onClick={() => removeGuestEntry(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      aria-label={isJa ? "削除" : "Remove"}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Parent support */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="text-base font-bold text-gray-900">
                {isJa ? "親からの援助" : "Parent Support"}
              </h2>
              <div>
                <label
                  htmlFor="parent-support"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {isJa ? "援助額 (円)" : "Support Amount (JPY)"}
                </label>
                <input
                  id="parent-support"
                  type="number"
                  min={0}
                  step={100000}
                  value={parentSupport}
                  onChange={(e) =>
                    setParentSupport(Number(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </section>
          </div>

          {/* Right: Results */}
          <div className="space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl p-4 text-white">
                <p className="text-rose-100 text-xs font-medium">
                  {isJa ? "総費用見積" : "Total Cost"}
                </p>
                <p className="text-lg font-bold mt-1">
                  {formatCurrency(costEstimate.total.min)}
                </p>
                <p className="text-xs text-rose-100">
                  ~ {formatCurrency(costEstimate.total.max)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 text-white">
                <p className="text-amber-100 text-xs font-medium">
                  {isJa ? "ご祝儀見込" : "Goshugi Est."}
                </p>
                <p className="text-lg font-bold mt-1">
                  {formatCurrency(goshugiEstimate.total.typical)}
                </p>
                <p className="text-xs text-amber-100">
                  {formatCurrency(goshugiEstimate.total.min)} ~{" "}
                  {formatCurrency(goshugiEstimate.total.max)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 text-white">
                <p className="text-emerald-100 text-xs font-medium">
                  {isJa ? "自己負担見込" : "Self-Payment"}
                </p>
                <p className="text-lg font-bold mt-1">
                  {formatCurrency(selfPayment.selfPayment)}
                </p>
                <p className="text-xs text-emerald-100">
                  {selfPayment.comparedToAverage.status === "below"
                    ? isJa
                      ? "全国平均より少なめ"
                      : "Below average"
                    : selfPayment.comparedToAverage.status === "above"
                    ? isJa
                      ? "全国平均より多め"
                      : "Above average"
                    : isJa
                    ? "全国平均並み"
                    : "Around average"}
                </p>
              </div>
            </div>

            {/* Multipliers info */}
            {(costEstimate.multipliers.seasonal !== 1.0 ||
              costEstimate.multipliers.regional !== 1.0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-amber-800 mb-2">
                  {isJa ? "適用された補正" : "Applied Adjustments"}
                </h3>
                <div className="space-y-1 text-sm text-amber-700">
                  {costEstimate.multipliers.regional !== 1.0 && (
                    <p>
                      {isJa ? "地域補正" : "Regional"}: x
                      {costEstimate.multipliers.regional}
                    </p>
                  )}
                  {costEstimate.multipliers.seasonal !== 1.0 && (
                    <p>
                      {isJa ? "季節補正" : "Seasonal"}: x
                      {costEstimate.multipliers.seasonal}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cost breakdown */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                {isJa ? "費用内訳" : "Cost Breakdown"}
              </h2>
              <div className="space-y-3">
                {costEstimate.breakdown
                  .filter((item) => item.included)
                  .map((item) => {
                    const mid = (item.min + item.max) / 2;
                    const maxTotal =
                      (costEstimate.total.min + costEstimate.total.max) / 2;
                    const pct = maxTotal > 0 ? (mid / maxTotal) * 100 : 0;

                    return (
                      <div key={item.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700">{item.label}</span>
                          <span className="text-gray-900 font-medium">
                            {formatCurrency(item.min)} ~ {formatCurrency(item.max)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
              {costEstimate.breakdown.some((item) => !item.included) && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">
                    {isJa ? "除外項目:" : "Excluded:"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {costEstimate.breakdown
                      .filter((item) => !item.included)
                      .map((item) => (
                        <span
                          key={item.id}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full"
                        >
                          {item.label}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </section>

            {/* Goshugi breakdown */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                {isJa ? "ご祝儀内訳" : "Goshugi Breakdown"}
              </h2>
              <div className="space-y-2">
                {goshugiEstimate.byRelation.map((item) => (
                  <div
                    key={item.relation}
                    className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <span className="text-gray-700">{item.label}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {item.count}
                        {isJa ? "名" : " ppl"}
                      </span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(item.subtotal.typical)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Self-payment comparison */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-3">
                {isJa ? "全国平均との比較" : "National Average Comparison"}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {isJa ? "全国平均（総費用）" : "National Avg (Total)"}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(NATIONAL_AVERAGES.totalCeremonyAndReception)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {isJa ? "全国平均（ご祝儀）" : "National Avg (Goshugi)"}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(NATIONAL_AVERAGES.totalGoshugi)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {isJa ? "全国平均（自己負担）" : "National Avg (Self-Payment)"}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(NATIONAL_AVERAGES.selfPayment)}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      {isJa ? "あなたの自己負担" : "Your Self-Payment"}
                    </span>
                    <span
                      className={`font-bold ${
                        selfPayment.comparedToAverage.status === "below"
                          ? "text-emerald-600"
                          : selfPayment.comparedToAverage.status === "above"
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(selfPayment.selfPayment)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {isJa ? "全国平均比" : "vs average"}:{" "}
                    {selfPayment.comparedToAverage.percentage > 0 ? "+" : ""}
                    {selfPayment.comparedToAverage.percentage}%
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type Relationship =
  | "friend"
  | "colleague"
  | "boss"
  | "subordinate"
  | "relative_close"
  | "relative_distant"
  | "parent_friend";

type AgeGroup = "20s" | "30s" | "40s" | "50s" | "60plus";

type AttendanceType = "ceremony_reception" | "reception_only";

type Region = "kanto" | "kansai" | "chubu" | "kyushu" | "tohoku" | "hokkaido" | "other";

interface Guest {
  id: string;
  name: string;
  relationship: Relationship;
  ageGroup: AgeGroup;
  attendance: AttendanceType;
  region: Region;
}

// ── Constants ──────────────────────────────────────────────────────────────

const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  friend: "友人",
  colleague: "同僚",
  boss: "上司",
  subordinate: "部下",
  relative_close: "近い親戚（兄弟・叔父叔母）",
  relative_distant: "遠い親戚",
  parent_friend: "親の友人",
};

const AGE_LABELS: Record<AgeGroup, string> = {
  "20s": "20代",
  "30s": "30代",
  "40s": "40代",
  "50s": "50代",
  "60plus": "60代以上",
};

const ATTENDANCE_LABELS: Record<AttendanceType, string> = {
  ceremony_reception: "挙式+披露宴",
  reception_only: "披露宴のみ",
};

const REGION_LABELS: Record<Region, string> = {
  kanto: "関東",
  kansai: "関西",
  chubu: "中部",
  kyushu: "九州・沖縄",
  tohoku: "東北",
  hokkaido: "北海道",
  other: "その他",
};

// Average goshugi amounts (yen) by relationship x age x region
// Based on Japanese wedding survey data (Zexy, etc.)
// [relationship][ageGroup] = base amount, then regional multiplier
const GOSHUGI_BASE: Record<Relationship, Record<AgeGroup, number>> = {
  friend: {
    "20s": 25_000,
    "30s": 30_000,
    "40s": 30_000,
    "50s": 30_000,
    "60plus": 30_000,
  },
  colleague: {
    "20s": 25_000,
    "30s": 30_000,
    "40s": 30_000,
    "50s": 30_000,
    "60plus": 30_000,
  },
  boss: {
    "20s": 30_000,
    "30s": 30_000,
    "40s": 50_000,
    "50s": 50_000,
    "60plus": 50_000,
  },
  subordinate: {
    "20s": 20_000,
    "30s": 30_000,
    "40s": 30_000,
    "50s": 30_000,
    "60plus": 30_000,
  },
  relative_close: {
    "20s": 50_000,
    "30s": 50_000,
    "40s": 50_000,
    "50s": 100_000,
    "60plus": 100_000,
  },
  relative_distant: {
    "20s": 30_000,
    "30s": 30_000,
    "40s": 30_000,
    "50s": 50_000,
    "60plus": 50_000,
  },
  parent_friend: {
    "20s": 20_000,
    "30s": 30_000,
    "40s": 30_000,
    "50s": 30_000,
    "60plus": 30_000,
  },
};

// Regional multipliers (1.0 = national average)
const REGION_MULTIPLIERS: Record<Region, number> = {
  kanto: 1.05,
  kansai: 0.98,
  chubu: 1.02,
  kyushu: 0.95,
  tohoku: 0.93,
  hokkaido: 0.90,
  other: 0.95,
};

// Reception-only discount
const RECEPTION_ONLY_DISCOUNT = 0.85;

// Confidence range
const CONFIDENCE_MARGIN = 0.15;

const RELATIONSHIP_COLORS: Record<Relationship, string> = {
  friend: "#3b82f6",
  colleague: "#22c55e",
  boss: "#f59e0b",
  subordinate: "#8b5cf6",
  relative_close: "#ef4444",
  relative_distant: "#ec4899",
  parent_friend: "#14b8a6",
};

const STORAGE_KEY = "weddingplan_giftcalc";

// ── Helpers ────────────────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function calcExpectedGift(guest: Guest): number {
  const base = GOSHUGI_BASE[guest.relationship][guest.ageGroup];
  const regionMult = REGION_MULTIPLIERS[guest.region];
  const attendanceMult =
    guest.attendance === "reception_only" ? RECEPTION_ONLY_DISCOUNT : 1.0;
  return Math.round(base * regionMult * attendanceMult);
}

function formatYen(amount: number): string {
  if (amount >= 10_000) {
    return `${Math.round(amount / 10_000)}万円`;
  }
  return `${amount.toLocaleString()}円`;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function GiftCalculatorPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [weddingBudget, setWeddingBudget] = useState(3_500_000);
  const [perGuestCost, setPerGuestCost] = useState(25_000);
  const [loaded, setLoaded] = useState(false);

  // Form state
  const [gName, setGName] = useState("");
  const [gRelationship, setGRelationship] = useState<Relationship>("friend");
  const [gAgeGroup, setGAgeGroup] = useState<AgeGroup>("30s");
  const [gAttendance, setGAttendance] = useState<AttendanceType>("ceremony_reception");
  const [gRegion, setGRegion] = useState<Region>("kanto");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.guests) setGuests(data.guests);
        if (data.weddingBudget) setWeddingBudget(data.weddingBudget);
        if (data.perGuestCost) setPerGuestCost(data.perGuestCost);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ guests, weddingBudget, perGuestCost })
      );
    }
  }, [guests, weddingBudget, perGuestCost, loaded]);

  const addGuest = useCallback(() => {
    if (!gName.trim()) return;
    const guest: Guest = {
      id: generateId(),
      name: gName.trim(),
      relationship: gRelationship,
      ageGroup: gAgeGroup,
      attendance: gAttendance,
      region: gRegion,
    };
    setGuests((prev) => [...prev, guest]);
    setGName("");
  }, [gName, gRelationship, gAgeGroup, gAttendance, gRegion]);

  const removeGuest = useCallback((id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // Calculations
  const guestAnalysis = useMemo(() => {
    return guests.map((g) => ({
      guest: g,
      expected: calcExpectedGift(g),
    }));
  }, [guests]);

  const totalExpected = useMemo(
    () => guestAnalysis.reduce((sum, ga) => sum + ga.expected, 0),
    [guestAnalysis]
  );

  const confidenceLow = Math.round(totalExpected * (1 - CONFIDENCE_MARGIN));
  const confidenceHigh = Math.round(totalExpected * (1 + CONFIDENCE_MARGIN));

  const coverageRatio =
    weddingBudget > 0 ? (totalExpected / weddingBudget) * 100 : 0;

  // Breakdown by relationship
  const byRelationship = useMemo(() => {
    const map = new Map<
      Relationship,
      { count: number; total: number; avgPerGuest: number }
    >();
    guestAnalysis.forEach((ga) => {
      const existing = map.get(ga.guest.relationship);
      if (existing) {
        existing.count++;
        existing.total += ga.expected;
        existing.avgPerGuest = Math.round(existing.total / existing.count);
      } else {
        map.set(ga.guest.relationship, {
          count: 1,
          total: ga.expected,
          avgPerGuest: ga.expected,
        });
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [guestAnalysis]);

  // High value segments
  const highValueGuests = useMemo(() => {
    return guestAnalysis
      .filter((ga) => ga.expected >= 50_000)
      .sort((a, b) => b.expected - a.expected);
  }, [guestAnalysis]);

  // Per-guest profitability
  const guestProfitability = useMemo(() => {
    return guestAnalysis.map((ga) => ({
      ...ga,
      cost: perGuestCost,
      profit: ga.expected - perGuestCost,
      profitRatio:
        perGuestCost > 0
          ? ((ga.expected - perGuestCost) / perGuestCost) * 100
          : 0,
    }));
  }, [guestAnalysis, perGuestCost]);

  const totalHospitalityCost = guests.length * perGuestCost;
  const netIncome = totalExpected - totalHospitalityCost;

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  // Donut chart data
  const donutTotal = byRelationship.reduce((s, [, d]) => s + d.total, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">ご祝儀予測計算機</h1>
        <p className="text-gray-400 mb-6">
          ゲストの属性からご祝儀の予想金額を算出し、結婚式予算との収支を分析します
        </p>

        {/* Budget Settings */}
        <div className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">予算設定</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                結婚式総予算
              </label>
              <input
                type="number"
                min={0}
                step={100_000}
                value={weddingBudget}
                onChange={(e) => setWeddingBudget(parseInt(e.target.value) || 0)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-gray-500">
                {formatYen(weddingBudget)}
              </span>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                1人あたりおもてなし費用
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={perGuestCost}
                onChange={(e) => setPerGuestCost(parseInt(e.target.value) || 0)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-gray-500">
                料理+引出物+飲物の合計
              </span>
            </div>
          </div>
        </div>

        {/* Add Guest Form */}
        <div className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">ゲスト追加</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">名前</label>
              <input
                type="text"
                value={gName}
                onChange={(e) => setGName(e.target.value)}
                placeholder="ゲスト名"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">関係</label>
              <select
                value={gRelationship}
                onChange={(e) =>
                  setGRelationship(e.target.value as Relationship)
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {(Object.keys(RELATIONSHIP_LABELS) as Relationship[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {RELATIONSHIP_LABELS[key]}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">年齢層</label>
              <select
                value={gAgeGroup}
                onChange={(e) => setGAgeGroup(e.target.value as AgeGroup)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {(Object.keys(AGE_LABELS) as AgeGroup[]).map((key) => (
                  <option key={key} value={key}>
                    {AGE_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">出席</label>
              <select
                value={gAttendance}
                onChange={(e) =>
                  setGAttendance(e.target.value as AttendanceType)
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {(Object.keys(ATTENDANCE_LABELS) as AttendanceType[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {ATTENDANCE_LABELS[key]}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">地域</label>
              <select
                value={gRegion}
                onChange={(e) => setGRegion(e.target.value as Region)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {(Object.keys(REGION_LABELS) as Region[]).map((key) => (
                  <option key={key} value={key}>
                    {REGION_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={addGuest}
                disabled={!gName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {guests.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {guests.length}
                </p>
                <p className="text-xs text-gray-400 mt-1">ゲスト数</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
                <p className="text-2xl font-bold text-green-400">
                  {formatYen(totalExpected)}
                </p>
                <p className="text-xs text-gray-400 mt-1">予測ご祝儀総額</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
                <p
                  className={`text-2xl font-bold ${
                    coverageRatio >= 70 ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {coverageRatio.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">予算カバー率</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
                <p
                  className={`text-2xl font-bold ${
                    netIncome >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {netIncome >= 0 ? "+" : ""}
                  {formatYen(netIncome)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  祝儀 - おもてなし費
                </p>
              </div>
            </div>

            {/* Confidence Range */}
            <div className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-3">予測レンジ（信頼区間 ±15%）</h2>
              <div className="flex items-center gap-4">
                <svg width={500} height={60} viewBox="0 0 500 60" className="w-full">
                  {/* Budget line */}
                  {(() => {
                    const maxRange = confidenceHigh * 1.3;
                    const budgetX = Math.min(
                      480,
                      (weddingBudget / maxRange) * 480 + 10
                    );
                    const lowX = (confidenceLow / maxRange) * 480 + 10;
                    const midX = (totalExpected / maxRange) * 480 + 10;
                    const highX = (confidenceHigh / maxRange) * 480 + 10;
                    return (
                      <>
                        {/* Range bar */}
                        <rect
                          x={lowX}
                          y={20}
                          width={highX - lowX}
                          height={16}
                          rx={8}
                          fill="#3b82f6"
                          opacity={0.3}
                        />
                        {/* Mid point */}
                        <circle cx={midX} cy={28} r={6} fill="#3b82f6" />
                        {/* Budget marker */}
                        <line
                          x1={budgetX}
                          y1={10}
                          x2={budgetX}
                          y2={46}
                          stroke="#ef4444"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                        />
                        {/* Labels */}
                        <text
                          x={lowX}
                          y={52}
                          textAnchor="middle"
                          fill="#6b7280"
                          fontSize={9}
                        >
                          {formatYen(confidenceLow)}
                        </text>
                        <text
                          x={midX}
                          y={14}
                          textAnchor="middle"
                          fill="#60a5fa"
                          fontSize={10}
                          fontWeight="bold"
                        >
                          {formatYen(totalExpected)}
                        </text>
                        <text
                          x={highX}
                          y={52}
                          textAnchor="middle"
                          fill="#6b7280"
                          fontSize={9}
                        >
                          {formatYen(confidenceHigh)}
                        </text>
                        <text
                          x={budgetX}
                          y={8}
                          textAnchor="middle"
                          fill="#ef4444"
                          fontSize={9}
                        >
                          予算
                        </text>
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Breakdown Donut */}
            <div className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">関係別内訳</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <svg width={200} height={200} viewBox="0 0 200 200">
                  {(() => {
                    let cumAngle = -Math.PI / 2;
                    return byRelationship.map(([rel, data], idx) => {
                      if (donutTotal === 0) return null;
                      const angle = (data.total / donutTotal) * Math.PI * 2;
                      const startAngle = cumAngle;
                      cumAngle += angle;
                      const endAngle = cumAngle;
                      const largeArc = angle > Math.PI ? 1 : 0;
                      if (angle < 0.01) return null;
                      const x1 = 100 + 80 * Math.cos(startAngle);
                      const y1 = 100 + 80 * Math.sin(startAngle);
                      const x2 = 100 + 80 * Math.cos(endAngle);
                      const y2 = 100 + 80 * Math.sin(endAngle);
                      const ix1 = 100 + 50 * Math.cos(startAngle);
                      const iy1 = 100 + 50 * Math.sin(startAngle);
                      const ix2 = 100 + 50 * Math.cos(endAngle);
                      const iy2 = 100 + 50 * Math.sin(endAngle);
                      return (
                        <path
                          key={rel}
                          d={`M ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A 50 50 0 ${largeArc} 0 ${ix1} ${iy1} Z`}
                          fill={RELATIONSHIP_COLORS[rel]}
                          opacity={0.8}
                        />
                      );
                    });
                  })()}
                  <text
                    x={100}
                    y={95}
                    textAnchor="middle"
                    fill="white"
                    fontSize={14}
                    fontWeight="bold"
                  >
                    合計
                  </text>
                  <text
                    x={100}
                    y={115}
                    textAnchor="middle"
                    fill="#d1d5db"
                    fontSize={11}
                  >
                    {formatYen(totalExpected)}
                  </text>
                </svg>
                <div className="space-y-2 flex-1">
                  {byRelationship.map(([rel, data]) => (
                    <div
                      key={rel}
                      className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: RELATIONSHIP_COLORS[rel],
                          }}
                        />
                        <span className="text-sm">
                          {RELATIONSHIP_LABELS[rel]}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({data.count}名)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">
                          {formatYen(data.total)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          (平均{formatYen(data.avgPerGuest)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* High Value Segment */}
            {highValueGuests.length > 0 && (
              <div className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800">
                <h2 className="text-lg font-semibold mb-4">
                  高額ご祝儀が見込めるゲスト（5万円以上）
                </h2>
                <div className="space-y-2">
                  {highValueGuests.map((hg) => (
                    <div
                      key={hg.guest.id}
                      className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{hg.guest.name}</span>
                        <span className="text-xs text-gray-500">
                          {RELATIONSHIP_LABELS[hg.guest.relationship]} /{" "}
                          {AGE_LABELS[hg.guest.ageGroup]}
                        </span>
                      </div>
                      <span className="text-green-400 font-medium">
                        {formatYen(hg.expected)}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">
                    高額ゲスト合計:{" "}
                    {formatYen(
                      highValueGuests.reduce((s, hg) => s + hg.expected, 0)
                    )}{" "}
                    （全体の
                    {totalExpected > 0
                      ? Math.round(
                          (highValueGuests.reduce(
                            (s, hg) => s + hg.expected,
                            0
                          ) /
                            totalExpected) *
                            100
                        )
                      : 0}
                    %）
                  </p>
                </div>
              </div>
            )}

            {/* Per-Guest Cost Analysis */}
            <div className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">
                ゲスト別 費用対効果
              </h2>
              <div className="overflow-x-auto">
                <svg
                  width={Math.max(500, guests.length * 50 + 100)}
                  height={260}
                  className="block"
                >
                  {/* Zero line */}
                  <line
                    x1={60}
                    y1={130}
                    x2={Math.max(450, guests.length * 50 + 60)}
                    y2={130}
                    stroke="#4b5563"
                    strokeWidth={1}
                  />
                  <text x={55} y={134} textAnchor="end" fill="#6b7280" fontSize={9}>
                    0
                  </text>
                  {guestProfitability.map((gp, idx) => {
                    const x = 70 + idx * 48;
                    const maxProfit = Math.max(
                      ...guestProfitability.map((g) => Math.abs(g.profit))
                    );
                    const barScale = maxProfit > 0 ? 100 / maxProfit : 0;
                    const barH = Math.abs(gp.profit) * barScale;
                    const isPositive = gp.profit >= 0;
                    return (
                      <g key={gp.guest.id}>
                        <rect
                          x={x}
                          y={isPositive ? 130 - barH : 130}
                          width={36}
                          height={barH}
                          rx={3}
                          fill={isPositive ? "#22c55e" : "#ef4444"}
                          opacity={0.7}
                        />
                        <text
                          x={x + 18}
                          y={isPositive ? 125 - barH : 145 + barH}
                          textAnchor="middle"
                          fill={isPositive ? "#86efac" : "#fca5a5"}
                          fontSize={8}
                        >
                          {gp.profit >= 0 ? "+" : ""}
                          {(gp.profit / 10000).toFixed(1)}万
                        </text>
                        <text
                          x={x + 18}
                          y={248}
                          textAnchor="middle"
                          fill="#9ca3af"
                          fontSize={8}
                          transform={`rotate(-45 ${x + 18} 248)`}
                        >
                          {gp.guest.name.length > 5
                            ? gp.guest.name.substring(0, 5) + ".."
                            : gp.guest.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 rounded bg-green-500 opacity-70" />
                  <span className="text-xs text-gray-400">
                    祝儀 &gt; おもてなし費
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 rounded bg-red-500 opacity-70" />
                  <span className="text-xs text-gray-400">
                    祝儀 &lt; おもてなし費
                  </span>
                </div>
              </div>
            </div>

            {/* Guest List */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">
                ゲスト一覧 ({guests.length}名)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-2 text-gray-400">名前</th>
                      <th className="text-left py-2 px-2 text-gray-400">関係</th>
                      <th className="text-left py-2 px-2 text-gray-400">年齢</th>
                      <th className="text-left py-2 px-2 text-gray-400">地域</th>
                      <th className="text-right py-2 px-2 text-gray-400">
                        予測祝儀
                      </th>
                      <th className="text-right py-2 px-2 text-gray-400">
                        収支
                      </th>
                      <th className="text-center py-2 px-2 text-gray-400" />
                    </tr>
                  </thead>
                  <tbody>
                    {guestProfitability.map((gp) => (
                      <tr
                        key={gp.guest.id}
                        className="border-b border-gray-800 hover:bg-gray-800/50"
                      >
                        <td className="py-2 px-2">{gp.guest.name}</td>
                        <td className="py-2 px-2 text-gray-400">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  RELATIONSHIP_COLORS[gp.guest.relationship],
                              }}
                            />
                            {RELATIONSHIP_LABELS[gp.guest.relationship]}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-gray-400">
                          {AGE_LABELS[gp.guest.ageGroup]}
                        </td>
                        <td className="py-2 px-2 text-gray-400">
                          {REGION_LABELS[gp.guest.region]}
                        </td>
                        <td className="py-2 px-2 text-right font-medium">
                          {gp.expected.toLocaleString()}円
                        </td>
                        <td
                          className={`py-2 px-2 text-right ${
                            gp.profit >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {gp.profit >= 0 ? "+" : ""}
                          {gp.profit.toLocaleString()}円
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => removeGuest(gp.guest.id)}
                            className="text-gray-500 hover:text-red-400 text-xs"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-600">
                      <td className="py-2 px-2 font-medium" colSpan={4}>
                        合計
                      </td>
                      <td className="py-2 px-2 text-right font-bold">
                        {totalExpected.toLocaleString()}円
                      </td>
                      <td
                        className={`py-2 px-2 text-right font-bold ${
                          netIncome >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {netIncome >= 0 ? "+" : ""}
                        {netIncome.toLocaleString()}円
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}

        {guests.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">ゲストを追加してご祝儀を予測</p>
            <p className="text-sm">
              ゲストの属性（関係・年齢・地域）から統計データに基づき予測します
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

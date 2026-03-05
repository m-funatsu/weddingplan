// =============================================================================
// logic.ts - Expert Wedding Planning Engine
// Provides estimation, optimization, and advisory functions for Japanese weddings
// =============================================================================

import { addMonths, differenceInDays, differenceInMonths, parseISO, isBefore, format } from "date-fns";
import { WeddingTask, CategoryId } from "@/types/index";
import {
  NATIONAL_AVERAGES,
  COST_ITEMS,
  CostCategory,
  GOSHUGI_RATES,
  GuestRelation,
  SCHEDULE_TEMPLATE,
  VENUE_TYPES,
  VenueType,
  VenueTypeInfo,
  REGIONAL_MULTIPLIERS,
  SEASONAL_PRICING,
  COST_SAVING_TIPS,
} from "@/data/master-data";

// =============================================================================
// Types
// =============================================================================

export interface VenueOption {
  type: VenueType;
  region?: string;
}

export interface CeremonyOptions {
  /** Include color dress change */
  hasColorDress?: boolean;
  /** Include pre-wedding photo shoot */
  hasPreShoot?: boolean;
  /** Professional MC */
  hasProfessionalMC?: boolean;
  /** Entertainment / effects */
  hasEntertainment?: boolean;
  /** Season multiplier override (e.g., from SEASONAL_PRICING) */
  seasonMultiplier?: number;
  /** Regional multiplier override (e.g., from REGIONAL_MULTIPLIERS) */
  regionalMultiplier?: number;
}

export interface CostEstimate {
  /** Total estimated cost */
  total: { min: number; max: number };
  /** Breakdown by cost item */
  breakdown: Array<{
    id: CostCategory;
    label: string;
    min: number;
    max: number;
    included: boolean;
  }>;
  /** Multipliers applied */
  multipliers: {
    seasonal: number;
    regional: number;
  };
}

export interface GuestEntry {
  name?: string;
  relation: GuestRelation;
  /** Number of people in this entry (default 1) */
  count?: number;
}

export interface GoshugiEstimate {
  total: { min: number; max: number; typical: number };
  byRelation: Array<{
    relation: GuestRelation;
    label: string;
    count: number;
    subtotal: { min: number; max: number; typical: number };
  }>;
}

export interface SelfPaymentResult {
  totalCost: number;
  goshugiEstimate: number;
  parentSupport: number;
  selfPayment: number;
  comparedToAverage: {
    amount: number;
    percentage: number;
    status: "below" | "average" | "above";
  };
}

export interface BudgetAllocation {
  category: CostCategory;
  label: string;
  allocated: number;
  percentOfTotal: number;
  priority: "high" | "medium" | "low";
}

export interface BudgetPlan {
  targetBudget: number;
  allocations: BudgetAllocation[];
  totalAllocated: number;
  remaining: number;
  feasibility: "comfortable" | "tight" | "over_budget";
  warnings: string[];
}

export interface BudgetVsActual {
  category: string;
  categoryId: CategoryId;
  budgetMin: number;
  budgetMax: number;
  budgetMid: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: "under" | "on_track" | "over";
}

export interface BudgetTrackingResult {
  items: BudgetVsActual[];
  totalBudgetMid: number;
  totalActual: number;
  totalVariance: number;
  overBudgetItems: BudgetVsActual[];
  healthScore: number;
}

export interface TimelineMilestone {
  date: string;
  monthsBefore: number;
  label: string;
  labelEn: string;
  tasks: string[];
  tasksEn: string[];
  tips: string[];
  tipsEn: string[];
  isPast: boolean;
  isCurrent: boolean;
}

export interface PerGuestCostResult {
  totalExpenses: number;
  guestCount: number;
  costPerGuest: number;
  comparedToAverage: {
    amount: number;
    status: "below" | "average" | "above";
  };
}

export interface GuestCandidate {
  name: string;
  relation: GuestRelation;
  priority: "must_invite" | "should_invite" | "nice_to_have";
  estimatedGoshugi?: number;
}

export interface GuestOptimizationResult {
  recommendedGuests: GuestCandidate[];
  totalGuests: number;
  estimatedCost: number;
  estimatedGoshugi: number;
  estimatedSelfPayment: number;
  excludedGuests: GuestCandidate[];
  message: string;
}

export interface VenueComparison {
  venues: Array<
    VenueTypeInfo & {
      adjustedCost: { min: number; max: number };
      score: number;
      recommendation: string;
      recommendationEn: string;
    }
  >;
  bestValue: VenueType;
  bestForLargeGroup: VenueType;
  bestForSmallGroup: VenueType;
}

export type AdvisorySeverity = "info" | "success" | "warning" | "critical";

export interface AdvisoryItem {
  severity: AdvisorySeverity;
  category: string;
  categoryEn: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
}

export interface AdvisoryReport {
  overallHealth: "excellent" | "good" | "caution" | "warning";
  overallHealthLabel: string;
  overallHealthLabelEn: string;
  items: AdvisoryItem[];
  summary: string;
  summaryEn: string;
}

// =============================================================================
// 1. estimateTotalCost - 総費用見積もり
// =============================================================================

export function estimateTotalCost(
  guestCount: number,
  venue: VenueOption,
  options: CeremonyOptions = {}
): CostEstimate {
  const {
    hasColorDress = true,
    hasPreShoot = true,
    hasProfessionalMC = true,
    hasEntertainment = true,
    seasonMultiplier = 1.0,
    regionalMultiplier,
  } = options;

  // Determine regional multiplier from venue region or option override
  let regionMult = regionalMultiplier ?? 1.0;
  if (!regionalMultiplier && venue.region) {
    const found = REGIONAL_MULTIPLIERS.find(
      (r) => r.region.includes(venue.region!) || r.regionEn.includes(venue.region!)
    );
    if (found) regionMult = found.multiplier;
  }

  const excludeIds = new Set<CostCategory>();
  if (!hasColorDress) excludeIds.add("bride_dress_color");
  if (!hasProfessionalMC) excludeIds.add("mc");
  if (!hasEntertainment) excludeIds.add("entertainment");

  const breakdown: CostEstimate["breakdown"] = COST_ITEMS.map((item) => {
    const included = !excludeIds.has(item.id);
    let min = 0;
    let max = 0;

    if (included) {
      if (item.unit === "per_guest") {
        min = item.min * guestCount;
        max = item.max * guestCount;
      } else {
        min = item.min;
        max = item.max;
      }
    }

    return {
      id: item.id,
      label: item.label,
      min: Math.round(min * regionMult * seasonMultiplier),
      max: Math.round(max * regionMult * seasonMultiplier),
      included,
    };
  });

  const total = breakdown.reduce(
    (acc, item) => ({
      min: acc.min + item.min,
      max: acc.max + item.max,
    }),
    { min: 0, max: 0 }
  );

  return {
    total,
    breakdown,
    multipliers: {
      seasonal: seasonMultiplier,
      regional: regionMult,
    },
  };
}

// =============================================================================
// 2. estimateGoshugi - ご祝儀見込額
// =============================================================================

export function estimateGoshugi(guestList: GuestEntry[]): GoshugiEstimate {
  const byRelationMap = new Map<
    GuestRelation,
    { label: string; count: number; min: number; max: number; typical: number }
  >();

  for (const guest of guestList) {
    const count = guest.count ?? 1;
    const rate = GOSHUGI_RATES.find((r) => r.relation === guest.relation);
    if (!rate) continue;

    const existing = byRelationMap.get(guest.relation) ?? {
      label: rate.label,
      count: 0,
      min: 0,
      max: 0,
      typical: 0,
    };

    existing.count += count;
    existing.min += rate.min * count;
    existing.max += rate.max * count;
    existing.typical += rate.typical * count;
    byRelationMap.set(guest.relation, existing);
  }

  const byRelation = Array.from(byRelationMap.entries()).map(([relation, data]) => ({
    relation,
    label: data.label,
    count: data.count,
    subtotal: { min: data.min, max: data.max, typical: data.typical },
  }));

  const total = byRelation.reduce(
    (acc, item) => ({
      min: acc.min + item.subtotal.min,
      max: acc.max + item.subtotal.max,
      typical: acc.typical + item.subtotal.typical,
    }),
    { min: 0, max: 0, typical: 0 }
  );

  return { total, byRelation };
}

// =============================================================================
// 3. calculateSelfPayment - 自己負担額
// =============================================================================

export function calculateSelfPayment(
  totalCost: number,
  goshugiEstimate: number,
  parentSupport: number = 0
): SelfPaymentResult {
  const selfPayment = totalCost - goshugiEstimate - parentSupport;
  const diff = selfPayment - NATIONAL_AVERAGES.selfPayment;
  const percentage = Math.round((diff / NATIONAL_AVERAGES.selfPayment) * 100);

  let status: "below" | "average" | "above";
  if (percentage < -10) status = "below";
  else if (percentage > 10) status = "above";
  else status = "average";

  return {
    totalCost,
    goshugiEstimate,
    parentSupport,
    selfPayment: Math.max(0, selfPayment),
    comparedToAverage: {
      amount: diff,
      percentage,
      status,
    },
  };
}

// =============================================================================
// 4. generateBudgetPlan - 予算内の最適配分
// =============================================================================

/** Priority weights: higher weight = more budget allocation */
const CATEGORY_DEFAULT_WEIGHT: Record<CostCategory, number> = {
  ceremony_fee: 0.8,
  venue_fee: 0.9,
  food_drink: 1.0,
  bride_dress_wedding: 0.85,
  bride_dress_color: 0.5,
  groom_tuxedo: 0.6,
  photo_video: 0.8,
  flowers: 0.5,
  gifts: 0.7,
  invitations: 0.3,
  hair_makeup: 0.5,
  bouquet: 0.3,
  cake: 0.4,
  mc: 0.4,
  entertainment: 0.4,
};

export type BudgetPriority = "food" | "photo" | "attire" | "venue" | "balanced";

export function generateBudgetPlan(
  targetBudget: number,
  priority: BudgetPriority = "balanced",
  guestCount: number = NATIONAL_AVERAGES.averageGuestCount
): BudgetPlan {
  // Adjust weights based on priority
  const weights = { ...CATEGORY_DEFAULT_WEIGHT };
  switch (priority) {
    case "food":
      weights.food_drink = 1.5;
      weights.flowers = 0.3;
      weights.entertainment = 0.2;
      break;
    case "photo":
      weights.photo_video = 1.5;
      weights.cake = 0.2;
      weights.entertainment = 0.2;
      break;
    case "attire":
      weights.bride_dress_wedding = 1.3;
      weights.bride_dress_color = 0.8;
      weights.groom_tuxedo = 0.9;
      weights.flowers = 0.3;
      break;
    case "venue":
      weights.venue_fee = 1.4;
      weights.ceremony_fee = 1.1;
      weights.entertainment = 0.2;
      break;
    // balanced: use defaults
  }

  // Calculate reference costs (midpoint of each item range)
  const referenceCosts = COST_ITEMS.map((item) => {
    const baseMid = (item.min + item.max) / 2;
    const cost = item.unit === "per_guest" ? baseMid * guestCount : baseMid;
    return { id: item.id, label: item.label, cost, weight: weights[item.id] };
  });

  const totalWeightedRef = referenceCosts.reduce((sum, c) => sum + c.cost * c.weight, 0);

  const allocations: BudgetAllocation[] = referenceCosts.map((ref) => {
    const proportion = (ref.cost * ref.weight) / totalWeightedRef;
    const allocated = Math.round(targetBudget * proportion);
    const priorityLevel: "high" | "medium" | "low" =
      ref.weight >= 0.8 ? "high" : ref.weight >= 0.5 ? "medium" : "low";

    return {
      category: ref.id,
      label: ref.label,
      allocated,
      percentOfTotal: Math.round(proportion * 100),
      priority: priorityLevel,
    };
  });

  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated, 0);
  const remaining = targetBudget - totalAllocated;

  // Determine feasibility
  const minTotal = COST_ITEMS.reduce((sum, item) => {
    return sum + (item.unit === "per_guest" ? item.min * guestCount : item.min);
  }, 0);

  const warnings: string[] = [];
  let feasibility: BudgetPlan["feasibility"];

  if (targetBudget >= minTotal * 1.2) {
    feasibility = "comfortable";
  } else if (targetBudget >= minTotal) {
    feasibility = "tight";
    warnings.push(
      `予算${formatYen(targetBudget)}は最低見積もり${formatYen(minTotal)}に近いため、各項目の節約が必要です`
    );
  } else {
    feasibility = "over_budget";
    warnings.push(
      `予算${formatYen(targetBudget)}は最低見積もり${formatYen(minTotal)}を下回っています。ゲスト数の削減または会場変更を検討してください`
    );
  }

  return {
    targetBudget,
    allocations,
    totalAllocated,
    remaining,
    feasibility,
    warnings,
  };
}

// =============================================================================
// 5. trackBudgetVsActual - 予算vs実績管理
// =============================================================================

export function trackBudgetVsActual(
  tasks: WeddingTask[]
): BudgetTrackingResult {
  const categoryMap = new Map<
    CategoryId,
    { label: string; budgetMin: number; budgetMax: number; actual: number }
  >();

  for (const task of tasks) {
    const existing = categoryMap.get(task.categoryId) ?? {
      label: task.categoryId,
      budgetMin: 0,
      budgetMax: 0,
      actual: 0,
    };
    existing.budgetMin += task.budgetEstimateMin;
    existing.budgetMax += task.budgetEstimateMax;
    existing.actual += task.actualCost ?? 0;
    categoryMap.set(task.categoryId, existing);
  }

  const items: BudgetVsActual[] = Array.from(categoryMap.entries()).map(
    ([categoryId, data]) => {
      const budgetMid = Math.round((data.budgetMin + data.budgetMax) / 2);
      const variance = data.actual - budgetMid;
      const variancePercent = budgetMid > 0 ? Math.round((variance / budgetMid) * 100) : 0;

      let status: "under" | "on_track" | "over";
      if (data.actual === 0) status = "on_track"; // not yet recorded
      else if (data.actual > data.budgetMax) status = "over";
      else if (data.actual < data.budgetMin) status = "under";
      else status = "on_track";

      return {
        category: data.label,
        categoryId,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        budgetMid,
        actual: data.actual,
        variance,
        variancePercent,
        status,
      };
    }
  );

  const totalBudgetMid = items.reduce((sum, i) => sum + i.budgetMid, 0);
  const totalActual = items.reduce((sum, i) => sum + i.actual, 0);
  const totalVariance = totalActual - totalBudgetMid;

  const overBudgetItems = items.filter((i) => i.status === "over");

  // Health score: 100 = perfect, deduct points for over-budget items
  const overRatio = totalBudgetMid > 0 ? Math.max(0, totalVariance) / totalBudgetMid : 0;
  const healthScore = Math.max(0, Math.round(100 - overRatio * 100 - overBudgetItems.length * 5));

  return {
    items,
    totalBudgetMid,
    totalActual,
    totalVariance,
    overBudgetItems,
    healthScore,
  };
}

// =============================================================================
// 6. generateTimeline - 逆算スケジュール生成
// =============================================================================

export function generateTimeline(
  weddingDate: string,
  language: "ja" | "en" = "ja"
): TimelineMilestone[] {
  const wedding = parseISO(weddingDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const monthsUntil = differenceInMonths(wedding, now);

  return SCHEDULE_TEMPLATE.map((milestone) => {
    const milestoneDate = addMonths(wedding, -milestone.monthsBefore);
    const dateStr = format(milestoneDate, "yyyy-MM-dd");

    // "current" if we're within 1 month of this milestone's target date
    const monthDiff = Math.abs(differenceInMonths(milestoneDate, now));
    const isCurrent = monthDiff < 1 && !isBefore(milestoneDate, now);
    const isPast = isBefore(milestoneDate, now) && !isCurrent;

    return {
      date: dateStr,
      monthsBefore: milestone.monthsBefore,
      label: milestone.label,
      labelEn: milestone.labelEn,
      tasks: milestone.tasks,
      tasksEn: milestone.tasksEn,
      tips: milestone.tips,
      tipsEn: milestone.tipsEn,
      isPast,
      isCurrent,
    };
  });
}

// =============================================================================
// 7. calculatePerGuestCost - ゲスト1人あたりコスト
// =============================================================================

export function calculatePerGuestCost(
  expenses: number,
  guestCount: number
): PerGuestCostResult {
  if (guestCount <= 0) {
    return {
      totalExpenses: expenses,
      guestCount: 0,
      costPerGuest: 0,
      comparedToAverage: { amount: 0, status: "average" },
    };
  }

  const costPerGuest = Math.round(expenses / guestCount);
  const diff = costPerGuest - NATIONAL_AVERAGES.costPerGuest;

  let status: "below" | "average" | "above";
  if (diff < -5_000) status = "below";
  else if (diff > 5_000) status = "above";
  else status = "average";

  return {
    totalExpenses: expenses,
    guestCount,
    costPerGuest,
    comparedToAverage: { amount: diff, status },
  };
}

// =============================================================================
// 8. optimizeGuestList - 予算内のゲスト数最適化
// =============================================================================

export function optimizeGuestList(
  budget: number,
  candidates: GuestCandidate[],
  costPerGuestOverride?: number
): GuestOptimizationResult {
  const costPerGuest = costPerGuestOverride ?? NATIONAL_AVERAGES.costPerGuest;

  // Sort by priority: must_invite first, then should_invite, then nice_to_have
  const priorityOrder: Record<GuestCandidate["priority"], number> = {
    must_invite: 0,
    should_invite: 1,
    nice_to_have: 2,
  };

  const sorted = [...candidates].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  // Fixed costs (non-per-guest items)
  const fixedCosts = COST_ITEMS.filter((i) => i.unit === "fixed").reduce(
    (sum, i) => sum + (i.min + i.max) / 2,
    0
  );

  const variableBudget = budget - fixedCosts;
  if (variableBudget <= 0) {
    return {
      recommendedGuests: [],
      totalGuests: 0,
      estimatedCost: fixedCosts,
      estimatedGoshugi: 0,
      estimatedSelfPayment: fixedCosts,
      excludedGuests: sorted,
      message: `予算${formatYen(budget)}は固定費${formatYen(fixedCosts)}を下回っています。予算の見直しが必要です。`,
    };
  }

  const maxGuests = Math.floor(variableBudget / costPerGuest);

  const recommended: GuestCandidate[] = [];
  const excluded: GuestCandidate[] = [];

  for (const candidate of sorted) {
    if (recommended.length < maxGuests) {
      recommended.push(candidate);
    } else {
      excluded.push(candidate);
    }
  }

  // Estimate goshugi for recommended guests
  const guestEntries: GuestEntry[] = recommended.map((g) => ({
    name: g.name,
    relation: g.relation,
    count: 1,
  }));
  const goshugiResult = estimateGoshugi(guestEntries);

  const estimatedCost = fixedCosts + recommended.length * costPerGuest;

  return {
    recommendedGuests: recommended,
    totalGuests: recommended.length,
    estimatedCost: Math.round(estimatedCost),
    estimatedGoshugi: goshugiResult.total.typical,
    estimatedSelfPayment: Math.max(0, Math.round(estimatedCost - goshugiResult.total.typical)),
    excludedGuests: excluded,
    message:
      excluded.length > 0
        ? `予算内に収めるため、${excluded.length}名をゲストリストから除外しました（主に「できれば招待」の優先度）。`
        : `全${recommended.length}名を予算内で招待可能です。`,
  };
}

// =============================================================================
// 9. compareVenues - 会場比較
// =============================================================================

export function compareVenues(
  venueTypes: VenueType[],
  guestCount: number = NATIONAL_AVERAGES.averageGuestCount,
  regionalMultiplier: number = 1.0
): VenueComparison {
  const filtered = VENUE_TYPES.filter((v) => venueTypes.includes(v.type));

  const venues = filtered.map((venue) => {
    const adjustedCost = {
      min: Math.round(venue.costRange.min * regionalMultiplier),
      max: Math.round(venue.costRange.max * regionalMultiplier),
    };

    // Score based on guest count fit, cost, and pros/cons balance
    let score = 50;

    // Capacity fit
    if (guestCount >= venue.capacity.min && guestCount <= venue.capacity.max) {
      score += 20;
      // Bonus for being in the sweet spot (middle 60% of range)
      const range = venue.capacity.max - venue.capacity.min;
      const posInRange = (guestCount - venue.capacity.min) / range;
      if (posInRange >= 0.2 && posInRange <= 0.8) score += 10;
    } else {
      score -= 20;
    }

    // Cost favorability (lower cost = higher score)
    const avgCost = (adjustedCost.min + adjustedCost.max) / 2;
    const nationalAvg = NATIONAL_AVERAGES.totalCeremonyAndReception;
    if (avgCost < nationalAvg * 0.8) score += 15;
    else if (avgCost < nationalAvg) score += 5;
    else if (avgCost > nationalAvg * 1.2) score -= 10;

    // Pros/cons balance
    score += venue.pros.length * 3;
    score -= venue.cons.length * 3;

    score = Math.max(0, Math.min(100, score));

    // Generate recommendation
    let recommendation: string;
    let recommendationEn: string;
    if (score >= 70) {
      recommendation = `${venue.label}はゲスト${guestCount}名に適しています。`;
      recommendationEn = `${venue.labelEn} is well-suited for ${guestCount} guests.`;
    } else if (score >= 40) {
      recommendation = `${venue.label}は検討の余地がありますが、他の選択肢も比較してください。`;
      recommendationEn = `${venue.labelEn} is worth considering, but compare with other options.`;
    } else {
      recommendation = `${venue.label}はゲスト${guestCount}名には向いていない可能性があります。`;
      recommendationEn = `${venue.labelEn} may not be ideal for ${guestCount} guests.`;
    }

    return {
      ...venue,
      adjustedCost,
      score,
      recommendation,
      recommendationEn,
    };
  });

  // Sort by score descending
  venues.sort((a, b) => b.score - a.score);

  const bestValue =
    [...venues].sort(
      (a, b) =>
        (a.adjustedCost.min + a.adjustedCost.max) / 2 -
        (b.adjustedCost.min + b.adjustedCost.max) / 2
    )[0]?.type ?? "restaurant";

  const bestForLargeGroup =
    [...venues].sort((a, b) => b.capacity.max - a.capacity.max)[0]?.type ?? "hotel";

  const bestForSmallGroup =
    [...venues].sort((a, b) => a.capacity.min - b.capacity.min)[0]?.type ?? "restaurant";

  return {
    venues,
    bestValue,
    bestForLargeGroup,
    bestForSmallGroup,
  };
}

// =============================================================================
// 10. generateAdvisory - "So What?" アドバイザリー機能
// =============================================================================

export interface WeddingData {
  tasks: WeddingTask[];
  weddingDate?: string | null;
  marriageDate?: string | null;
  guestCount?: number;
  totalBudget?: number;
  hasCeremony?: boolean;
  language?: "ja" | "en";
}

export function generateAdvisory(data: WeddingData): AdvisoryReport {
  const {
    tasks,
    weddingDate,
    marriageDate,
    guestCount = 0,
    totalBudget = 0,
    hasCeremony = true,
    language = "ja",
  } = data;

  const items: AdvisoryItem[] = [];

  // --- Budget Health ---
  if (totalBudget > 0) {
    const tracking = trackBudgetVsActual(tasks);
    const totalActual = tracking.totalActual;
    const budgetMid = tracking.totalBudgetMid;

    // Self-payment estimate
    const goshugiEstimate = guestCount > 0
      ? guestCount * NATIONAL_AVERAGES.goshugiPerGuest
      : 0;
    const estimatedSelfPayment = Math.max(0, totalBudget - goshugiEstimate);

    items.push({
      severity: "info",
      category: "予算",
      categoryEn: "Budget",
      title: "自己負担見込み",
      titleEn: "Estimated Self-Payment",
      message: `自己負担は約${formatYen(estimatedSelfPayment)}の見込みです（全国平均: ${formatYen(NATIONAL_AVERAGES.selfPayment)}）。`,
      messageEn: `Estimated self-payment: ${formatYen(estimatedSelfPayment)} (national average: ${formatYen(NATIONAL_AVERAGES.selfPayment)}).`,
    });

    // Over-budget items
    if (tracking.overBudgetItems.length > 0) {
      const overItems = tracking.overBudgetItems
        .map((i) => `${i.category}(+${formatYen(i.variance)})`)
        .join(", ");

      items.push({
        severity: "warning",
        category: "予算",
        categoryEn: "Budget",
        title: "予算超過項目あり",
        titleEn: "Over-Budget Items Detected",
        message: `以下の項目で予算を超過しています: ${overItems}`,
        messageEn: `The following items exceed budget: ${overItems}`,
      });
    }

    // Budget health score
    if (tracking.healthScore >= 80) {
      items.push({
        severity: "success",
        category: "予算",
        categoryEn: "Budget",
        title: "予算健全度: 良好",
        titleEn: "Budget Health: Good",
        message: `予算健全度スコアは${tracking.healthScore}/100です。現在のペースは順調です。`,
        messageEn: `Budget health score is ${tracking.healthScore}/100. On track.`,
      });
    } else if (tracking.healthScore >= 50) {
      items.push({
        severity: "warning",
        category: "予算",
        categoryEn: "Budget",
        title: "予算健全度: 注意",
        titleEn: "Budget Health: Caution",
        message: `予算健全度スコアは${tracking.healthScore}/100です。支出の見直しを検討してください。`,
        messageEn: `Budget health score is ${tracking.healthScore}/100. Consider reviewing expenses.`,
      });
    } else {
      items.push({
        severity: "critical",
        category: "予算",
        categoryEn: "Budget",
        title: "予算健全度: 要対策",
        titleEn: "Budget Health: Action Required",
        message: `予算健全度スコアは${tracking.healthScore}/100です。大幅な予算超過のリスクがあります。`,
        messageEn: `Budget health score is ${tracking.healthScore}/100. Significant over-budget risk.`,
      });
    }

    // Cost-saving suggestions
    if (tracking.healthScore < 80 || totalBudget < NATIONAL_AVERAGES.totalCeremonyAndReception) {
      const relevantTips = COST_SAVING_TIPS.slice(0, 3);
      const tipMessages = relevantTips
        .map((t) => `${t.category}: ${t.tip}（節約目安: ${formatYen(t.savingsRange.min)}-${formatYen(t.savingsRange.max)}）`)
        .join("\n");
      const tipMessagesEn = relevantTips
        .map((t) => `${t.categoryEn}: ${t.tipEn} (est. savings: ${formatYen(t.savingsRange.min)}-${formatYen(t.savingsRange.max)})`)
        .join("\n");

      items.push({
        severity: "info",
        category: "節約",
        categoryEn: "Cost Saving",
        title: "コスト削減のヒント",
        titleEn: "Cost Saving Tips",
        message: tipMessages,
        messageEn: tipMessagesEn,
      });
    }
  }

  // --- Schedule Health ---
  const referenceDate = weddingDate ?? marriageDate;
  if (referenceDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = parseISO(referenceDate);
    const daysUntil = differenceInDays(target, now);
    const monthsUntil = differenceInMonths(target, now);

    // Overdue tasks
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "completed" || t.status === "skipped") return false;
      if (!t.calculatedDeadline) return false;
      return isBefore(parseISO(t.calculatedDeadline), now);
    });

    if (overdueTasks.length > 0) {
      const taskNames = overdueTasks
        .slice(0, 5)
        .map((t) => t.name)
        .join(", ");
      const suffix = overdueTasks.length > 5 ? ` 他${overdueTasks.length - 5}件` : "";

      items.push({
        severity: overdueTasks.length > 5 ? "critical" : "warning",
        category: "スケジュール",
        categoryEn: "Schedule",
        title: `${overdueTasks.length}件の期限超過タスク`,
        titleEn: `${overdueTasks.length} Overdue Task(s)`,
        message: `以下のタスクが期限を過ぎています: ${taskNames}${suffix}`,
        messageEn: `The following tasks are past due: ${taskNames}${suffix}`,
      });
    }

    // Upcoming deadlines (next 14 days)
    const twoWeeksOut = new Date(now);
    twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
    const upcomingTasks = tasks.filter((t) => {
      if (t.status === "completed" || t.status === "skipped") return false;
      if (!t.calculatedDeadline) return false;
      const dl = parseISO(t.calculatedDeadline);
      return !isBefore(dl, now) && isBefore(dl, twoWeeksOut);
    });

    if (upcomingTasks.length > 0) {
      items.push({
        severity: "info",
        category: "スケジュール",
        categoryEn: "Schedule",
        title: `今後2週間に${upcomingTasks.length}件のタスク期限`,
        titleEn: `${upcomingTasks.length} Task(s) Due in Next 2 Weeks`,
        message: `直近2週間に期限のあるタスク: ${upcomingTasks.map((t) => t.name).join(", ")}`,
        messageEn: `Tasks due within 2 weeks: ${upcomingTasks.map((t) => t.name).join(", ")}`,
      });
    }

    // Countdown
    if (daysUntil > 0) {
      items.push({
        severity: "info",
        category: "カウントダウン",
        categoryEn: "Countdown",
        title: `あと${daysUntil}日`,
        titleEn: `${daysUntil} Days Remaining`,
        message: `${weddingDate ? "結婚式" : "入籍日"}まであと${daysUntil}日（約${monthsUntil}ヶ月）です。`,
        messageEn: `${daysUntil} days (about ${monthsUntil} months) until ${weddingDate ? "wedding ceremony" : "marriage registration"}.`,
      });
    }
  }

  // --- Task Completion ---
  const eligibleTasks = tasks.filter((t) => t.status !== "skipped");
  const completedTasks = eligibleTasks.filter((t) => t.status === "completed");
  const completionRate =
    eligibleTasks.length > 0
      ? Math.round((completedTasks.length / eligibleTasks.length) * 100)
      : 0;

  items.push({
    severity: completionRate >= 80 ? "success" : completionRate >= 50 ? "info" : "warning",
    category: "進捗",
    categoryEn: "Progress",
    title: `全体進捗: ${completionRate}%`,
    titleEn: `Overall Progress: ${completionRate}%`,
    message: `${eligibleTasks.length}件中${completedTasks.length}件完了。残り${eligibleTasks.length - completedTasks.length}件。`,
    messageEn: `${completedTasks.length} of ${eligibleTasks.length} completed. ${eligibleTasks.length - completedTasks.length} remaining.`,
  });

  // --- Season / Day-of-Week Savings ---
  if (referenceDate && hasCeremony) {
    const target = parseISO(referenceDate);
    const month = target.getMonth() + 1;
    const dayOfWeek = target.getDay();

    const seasonInfo = SEASONAL_PRICING.find((s) => {
      if (s.period.includes(`${month}月`)) return true;
      // Match range like "3-5月"
      const rangeMatch = s.period.match(/(\d+)-(\d+)月/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1]);
        const end = parseInt(rangeMatch[2]);
        return month >= start && month <= end;
      }
      return false;
    });

    if (seasonInfo && seasonInfo.multiplier > 1.0) {
      items.push({
        severity: "info",
        category: "季節",
        categoryEn: "Season",
        title: "ハイシーズンの日程です",
        titleEn: "Peak Season Date",
        message: `${seasonInfo.period}は${seasonInfo.label}のため料金が約${Math.round((seasonInfo.multiplier - 1) * 100)}%割増になります。閑散期なら${formatYen(Math.round(NATIONAL_AVERAGES.totalCeremonyAndReception * (seasonInfo.multiplier - 1)))}程度の節約が見込めます。`,
        messageEn: `${seasonInfo.periodEn} is ${seasonInfo.labelEn}, with ~${Math.round((seasonInfo.multiplier - 1) * 100)}% markup. Off-season could save ~${formatYen(Math.round(NATIONAL_AVERAGES.totalCeremonyAndReception * (seasonInfo.multiplier - 1)))}.`,
      });
    } else if (seasonInfo && seasonInfo.multiplier < 1.0) {
      items.push({
        severity: "success",
        category: "季節",
        categoryEn: "Season",
        title: "閑散期で節約できる日程です",
        titleEn: "Off-Season Savings",
        message: `${seasonInfo.period}は${seasonInfo.label}のため約${Math.round((1 - seasonInfo.multiplier) * 100)}%の割引が期待できます。`,
        messageEn: `${seasonInfo.periodEn} is ${seasonInfo.labelEn}, with ~${Math.round((1 - seasonInfo.multiplier) * 100)}% discounts expected.`,
      });
    }

    // Weekday savings
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      items.push({
        severity: "success",
        category: "曜日",
        categoryEn: "Day of Week",
        title: "平日の日程で節約可能",
        titleEn: "Weekday Savings Available",
        message: "平日の挙式は会場費が20-40%割引になることが多いです。ゲストの出席率に注意してください。",
        messageEn: "Weekday ceremonies often get 20-40% venue discounts. Be mindful of guest attendance.",
      });
    }
  }

  // --- Overall Health ---
  const criticalCount = items.filter((i) => i.severity === "critical").length;
  const warningCount = items.filter((i) => i.severity === "warning").length;

  let overallHealth: AdvisoryReport["overallHealth"];
  let overallHealthLabel: string;
  let overallHealthLabelEn: string;

  if (criticalCount > 0) {
    overallHealth = "warning";
    overallHealthLabel = "要対策";
    overallHealthLabelEn = "Action Required";
  } else if (warningCount > 2) {
    overallHealth = "caution";
    overallHealthLabel = "注意";
    overallHealthLabelEn = "Caution";
  } else if (warningCount > 0) {
    overallHealth = "good";
    overallHealthLabel = "概ね順調";
    overallHealthLabelEn = "Mostly On Track";
  } else {
    overallHealth = "excellent";
    overallHealthLabel = "順調";
    overallHealthLabelEn = "On Track";
  }

  const summary = `準備状況: ${overallHealthLabel}。${items.filter((i) => i.severity === "critical" || i.severity === "warning").length}件の対応が必要な項目があります。`;
  const summaryEn = `Preparation status: ${overallHealthLabelEn}. ${items.filter((i) => i.severity === "critical" || i.severity === "warning").length} item(s) need attention.`;

  return {
    overallHealth,
    overallHealthLabel,
    overallHealthLabelEn,
    items,
    summary,
    summaryEn,
  };
}

// =============================================================================
// Utility
// =============================================================================

function formatYen(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

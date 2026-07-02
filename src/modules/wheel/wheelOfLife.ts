// "Wheel of Life" domain logic. Six life areas, each scored 0–10. Kept free of
// React/DOM so the scoring rules can be unit tested in isolation.

export type AreaId =
  | "financial"
  | "career"
  | "health"
  | "relationships"
  | "personalGrowth"
  | "leisure";

export interface WheelArea {
  id: AreaId;
  /** Translation key reused from the navbar so labels stay in one place. */
  labelKey: string;
  /** Destination page for the "go improve this area" link. */
  href: string;
}

// Order here drives the order of the hexagon's vertices, going clockwise from
// the top. Mirrors the navbar's life-area ordering.
export const WHEEL_AREAS: WheelArea[] = [
  { id: "financial", labelKey: "navFinancial", href: "/finance" },
  { id: "career", labelKey: "navCareer", href: "/career" },
  { id: "health", labelKey: "navHealth", href: "/health" },
  { id: "relationships", labelKey: "navRelationships", href: "/relationships" },
  { id: "personalGrowth", labelKey: "navPersonalGrowth", href: "/personal-growth" },
  { id: "leisure", labelKey: "navLeisure", href: "/leisure" },
];

export type WheelScores = Record<AreaId, number>;

export const MIN_SCORE = 0;
export const MAX_SCORE = 10;

// A neutral midpoint so a first-time visitor sees a balanced wheel to edit.
export const DEFAULT_SCORES: WheelScores = {
  financial: 5,
  career: 5,
  health: 5,
  relationships: 5,
  personalGrowth: 5,
  leisure: 5,
};

// Used when a date range contains no reviews, so the radar collapses to center.
export const EMPTY_SCORES: WheelScores = {
  financial: 0,
  career: 0,
  health: 0,
  relationships: 0,
  personalGrowth: 0,
  leisure: 0,
};

/** Clamp to the valid range and round to a whole point. */
export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return MIN_SCORE;
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(value)));
}

/** Coerce arbitrary parsed JSON into a complete, valid score set. */
export function normalizeScores(raw: unknown): WheelScores {
  const source = (raw ?? {}) as Partial<Record<AreaId, unknown>>;
  const result = {} as WheelScores;
  for (const { id } of WHEEL_AREAS) {
    const value = Number(source[id]);
    result[id] = Number.isFinite(value) ? clampScore(value) : DEFAULT_SCORES[id];
  }
  return result;
}

/** Mean across all six areas, rounded to one decimal. */
export function averageScore(scores: WheelScores): number {
  const total = WHEEL_AREAS.reduce((sum, { id }) => sum + scores[id], 0);
  return Math.round((total / WHEEL_AREAS.length) * 10) / 10;
}

/** Area with the highest score; ties resolve to the first in wheel order. */
export function strongestArea(scores: WheelScores): WheelArea {
  return WHEEL_AREAS.reduce((best, area) =>
    scores[area.id] > scores[best.id] ? area : best,
  );
}

/** Area with the lowest score; ties resolve to the first in wheel order. */
export function weakestArea(scores: WheelScores): WheelArea {
  return WHEEL_AREAS.reduce((worst, area) =>
    scores[area.id] < scores[worst.id] ? area : worst,
  );
}

export type ScoreLevel = "low" | "medium" | "high";

/** Bucket a score for color coding: 0–4 low, 5–7 medium, 8–10 high. */
export function scoreLevel(score: number): ScoreLevel {
  if (score <= 4) return "low";
  if (score <= 7) return "medium";
  return "high";
}

// --- Weekly reviews (time series) ---------------------------------------

// One self-assessment for a given week. Reviews are keyed by the Monday that
// starts their week, so saving twice in the same week overwrites the entry.
export interface WeeklyReview {
  /** Week-start date as a local "YYYY-MM-DD" string (a Monday). */
  weekStart: string;
  scores: WheelScores;
  /** Optional free-text reflection for the week. */
  note?: string;
}

/** Format a Date as a local "YYYY-MM-DD" string (no timezone shift). */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Monday of the week containing `date`, as a "YYYY-MM-DD" string. */
export function startOfWeek(date: Date): string {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (local.getDay() + 6) % 7; // Sun=0 -> 6, Mon=1 -> 0
  local.setDate(local.getDate() - daysSinceMonday);
  return toISODate(local);
}

/** Parse arbitrary JSON into a clean, week-sorted list of reviews. */
export function normalizeReviews(raw: unknown): WeeklyReview[] {
  if (!Array.isArray(raw)) return [];
  const reviews: WeeklyReview[] = [];
  for (const entry of raw) {
    const weekStart = (entry as { weekStart?: unknown })?.weekStart;
    if (typeof weekStart !== "string") continue;
    const note = (entry as { note?: unknown })?.note;
    reviews.push({
      weekStart,
      scores: normalizeScores((entry as { scores?: unknown })?.scores),
      ...(typeof note === "string" && note ? { note } : {}),
    });
  }
  return reviews.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/** Insert or replace the review for its week, returning a new sorted list. */
export function upsertReview(
  reviews: WeeklyReview[],
  review: WeeklyReview,
): WeeklyReview[] {
  const others = reviews.filter((r) => r.weekStart !== review.weekStart);
  return [...others, review].sort((a, b) =>
    a.weekStart.localeCompare(b.weekStart),
  );
}

// Selectable look-back windows for the graph.
export type DateRangeId = "1w" | "1m" | "3m" | "6m" | "ytd" | "all";

export interface DateRangeOption {
  id: DateRangeId;
  labelKey: string;
}

export const DATE_RANGES: DateRangeOption[] = [
  { id: "1w", labelKey: "wheelRange1w" },
  { id: "1m", labelKey: "wheelRange1m" },
  { id: "3m", labelKey: "wheelRange3m" },
  { id: "6m", labelKey: "wheelRange6m" },
  { id: "ytd", labelKey: "wheelRangeYtd" },
  { id: "all", labelKey: "wheelRangeAll" },
];

export const DEFAULT_RANGE: DateRangeId = "1m";

/**
 * The earliest week-start (inclusive) a range admits, as a "YYYY-MM-DD" string,
 * or null for "all" (no lower bound).
 */
function rangeCutoff(range: DateRangeId, now: Date): string | null {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  switch (range) {
    case "1w":
      return toISODate(new Date(y, m, d - 7));
    case "1m":
      return toISODate(new Date(y, m - 1, d));
    case "3m":
      return toISODate(new Date(y, m - 3, d));
    case "6m":
      return toISODate(new Date(y, m - 6, d));
    case "ytd":
      return toISODate(new Date(y, 0, 1));
    case "all":
      return null;
  }
}

/** Keep only reviews whose week falls within `range` counting back from `now`. */
export function filterReviewsByRange(
  reviews: WeeklyReview[],
  range: DateRangeId,
  now: Date = new Date(),
): WeeklyReview[] {
  const cutoff = rangeCutoff(range, now);
  if (cutoff == null) return [...reviews];
  return reviews.filter((r) => r.weekStart >= cutoff);
}

/**
 * Per-area metric for the radar: the mean score across the given reviews,
 * rounded to one decimal. Empty input collapses every area to zero.
 */
export function averageReviewScores(reviews: WeeklyReview[]): WheelScores {
  if (reviews.length === 0) return { ...EMPTY_SCORES };
  const result = {} as WheelScores;
  for (const { id } of WHEEL_AREAS) {
    const total = reviews.reduce((sum, r) => sum + r.scores[id], 0);
    result[id] = Math.round((total / reviews.length) * 10) / 10;
  }
  return result;
}

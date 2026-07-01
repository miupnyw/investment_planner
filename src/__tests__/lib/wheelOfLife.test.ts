import {
  averageReviewScores,
  averageScore,
  clampScore,
  DEFAULT_SCORES,
  EMPTY_SCORES,
  filterReviewsByRange,
  normalizeReviews,
  normalizeScores,
  scoreLevel,
  startOfWeek,
  strongestArea,
  toISODate,
  upsertReview,
  weakestArea,
  type WeeklyReview,
  type WheelScores,
} from "@/lib/wheelOfLife";

// Helper to build a full score set from a partial override.
function scores(overrides: Partial<WheelScores> = {}): WheelScores {
  return { ...DEFAULT_SCORES, ...overrides };
}

describe("clampScore", () => {
  it("rounds to a whole point", () => {
    expect(clampScore(6.4)).toBe(6);
    expect(clampScore(6.5)).toBe(7);
  });

  it("clamps out-of-range values", () => {
    expect(clampScore(-3)).toBe(0);
    expect(clampScore(99)).toBe(10);
  });

  it("treats non-finite input as the minimum", () => {
    expect(clampScore(NaN)).toBe(0);
    expect(clampScore(Infinity)).toBe(0);
  });
});

describe("normalizeScores", () => {
  it("fills missing areas with defaults and clamps the rest", () => {
    expect(normalizeScores({ financial: 12, career: -1 })).toEqual(
      scores({ financial: 10, career: 0 }),
    );
  });

  it("falls back to defaults for junk input", () => {
    expect(normalizeScores(null)).toEqual(DEFAULT_SCORES);
    expect(normalizeScores("nope")).toEqual(DEFAULT_SCORES);
  });
});

describe("averageScore / strongest / weakest", () => {
  it("averages all six areas to one decimal", () => {
    expect(averageScore(scores({ financial: 8, career: 8 }))).toBe(6); // (8+8+5+5+5+5)/6 = 6
  });

  it("finds the strongest and weakest areas", () => {
    const s = scores({ health: 9, leisure: 1 });
    expect(strongestArea(s).id).toBe("health");
    expect(weakestArea(s).id).toBe("leisure");
  });

  it("resolves ties to the first area in wheel order", () => {
    expect(strongestArea(DEFAULT_SCORES).id).toBe("financial");
    expect(weakestArea(DEFAULT_SCORES).id).toBe("financial");
  });
});

describe("scoreLevel", () => {
  it("buckets scores low/medium/high", () => {
    expect(scoreLevel(4)).toBe("low");
    expect(scoreLevel(5)).toBe("medium");
    expect(scoreLevel(7)).toBe("medium");
    expect(scoreLevel(8)).toBe("high");
  });
});

describe("startOfWeek / toISODate", () => {
  it("returns the Monday of the week as a local date string", () => {
    // 2026-06-30 is a Tuesday -> Monday is 2026-06-29.
    expect(startOfWeek(new Date(2026, 5, 30))).toBe("2026-06-29");
  });

  it("treats a Monday as its own week start", () => {
    expect(startOfWeek(new Date(2026, 5, 29))).toBe("2026-06-29");
  });

  it("maps Sunday back to the previous Monday", () => {
    // 2026-07-05 is a Sunday -> Monday is 2026-06-29.
    expect(startOfWeek(new Date(2026, 6, 5))).toBe("2026-06-29");
  });

  it("formats dates without timezone shift", () => {
    expect(toISODate(new Date(2026, 0, 9))).toBe("2026-01-09");
  });
});

describe("normalizeReviews", () => {
  it("drops invalid entries and sorts by week", () => {
    const result = normalizeReviews([
      { weekStart: "2026-02-02", scores: { financial: 7 } },
      { nope: true },
      { weekStart: "2026-01-05", scores: {} },
    ]);
    expect(result.map((r) => r.weekStart)).toEqual([
      "2026-01-05",
      "2026-02-02",
    ]);
    expect(result[1].scores.financial).toBe(7);
  });

  it("returns an empty list for non-array input", () => {
    expect(normalizeReviews(null)).toEqual([]);
  });

  it("carries a string note and omits empty or non-string notes", () => {
    const [withNote, emptyNote, badNote] = normalizeReviews([
      { weekStart: "2026-01-05", scores: {}, note: "good week" },
      { weekStart: "2026-01-12", scores: {}, note: "" },
      { weekStart: "2026-01-19", scores: {}, note: 42 },
    ]);
    expect(withNote.note).toBe("good week");
    expect(emptyNote).not.toHaveProperty("note");
    expect(badNote).not.toHaveProperty("note");
  });
});

describe("upsertReview", () => {
  const base: WeeklyReview[] = [
    { weekStart: "2026-01-05", scores: scores() },
    { weekStart: "2026-01-19", scores: scores() },
  ];

  it("replaces the review for an existing week", () => {
    const updated = upsertReview(base, {
      weekStart: "2026-01-05",
      scores: scores({ financial: 9 }),
    });
    expect(updated).toHaveLength(2);
    expect(updated[0].scores.financial).toBe(9);
  });

  it("inserts a new week in sorted order", () => {
    const updated = upsertReview(base, {
      weekStart: "2026-01-12",
      scores: scores(),
    });
    expect(updated.map((r) => r.weekStart)).toEqual([
      "2026-01-05",
      "2026-01-12",
      "2026-01-19",
    ]);
  });
});

describe("filterReviewsByRange", () => {
  const now = new Date(2026, 5, 30); // 2026-06-30
  const reviews: WeeklyReview[] = [
    { weekStart: "2026-06-29", scores: scores() }, // within 1w
    { weekStart: "2026-06-22", scores: scores() }, // within 1m, not 1w
    { weekStart: "2026-04-20", scores: scores() }, // within 3m, not 1m
    { weekStart: "2025-12-01", scores: scores() }, // last year, ytd excludes
  ];

  it("1 week keeps only the current week", () => {
    const result = filterReviewsByRange(reviews, "1w", now);
    expect(result.map((r) => r.weekStart)).toEqual(["2026-06-29"]);
  });

  it("1 month keeps the recent weeks", () => {
    const result = filterReviewsByRange(reviews, "1m", now);
    expect(result.map((r) => r.weekStart)).toEqual([
      "2026-06-29",
      "2026-06-22",
    ]);
  });

  it("3 months widens the window", () => {
    const result = filterReviewsByRange(reviews, "3m", now);
    expect(result.map((r) => r.weekStart)).toEqual([
      "2026-06-29",
      "2026-06-22",
      "2026-04-20",
    ]);
  });

  it("YTD keeps only weeks in the current calendar year", () => {
    const result = filterReviewsByRange(reviews, "ytd", now);
    expect(result.map((r) => r.weekStart)).toEqual([
      "2026-06-29",
      "2026-06-22",
      "2026-04-20",
    ]);
  });

  it("'all' returns every review", () => {
    expect(filterReviewsByRange(reviews, "all", now)).toHaveLength(4);
  });
});

describe("averageReviewScores", () => {
  it("collapses to zero for an empty range", () => {
    expect(averageReviewScores([])).toEqual(EMPTY_SCORES);
  });

  it("averages each area across reviews to one decimal", () => {
    const result = averageReviewScores([
      { weekStart: "2026-01-05", scores: scores({ financial: 8 }) },
      { weekStart: "2026-01-12", scores: scores({ financial: 5 }) },
    ]);
    expect(result.financial).toBe(6.5);
    expect(result.health).toBe(5);
  });
});

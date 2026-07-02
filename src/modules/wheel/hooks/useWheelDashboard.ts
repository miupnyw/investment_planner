"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  getReviewsServerSnapshot,
  getReviewsSnapshot,
  saveReview,
  subscribeReviews,
} from "@/store/wheelReviewsStore";
import {
  averageReviewScores,
  DEFAULT_RANGE,
  filterReviewsByRange,
  startOfWeek,
  WHEEL_AREAS,
  type AreaId,
  type WeeklyReview,
  type WheelScores,
} from "../wheelOfLife";
import type { DraftScores } from "../components/WheelScoreEditor";

// A fresh review starts with every area unrated. Module-level so the reference
// stays stable across renders (the seed-reset below relies on identity).
const EMPTY_DRAFT: DraftScores = {
  financial: null,
  career: null,
  health: null,
  relationships: null,
  personalGrowth: null,
  leisure: null,
};

/**
 * State + behaviour for the Wheel-of-Life dashboard: the persisted reviews, the
 * date-range filter, and the draft being edited in the modal. The component only
 * renders what this returns.
 */
export function useWheelDashboard() {
  // Reviews are persisted in IndexedDB; the store keeps a synchronous in-memory
  // snapshot and notifies subscribers after each hydrate/save.
  const reviews = useSyncExternalStore(
    subscribeReviews,
    getReviewsSnapshot,
    getReviewsServerSnapshot,
  );

  const [range, setRange] = useState(DEFAULT_RANGE);
  const [modalOpen, setModalOpen] = useState(false);

  // This week's saved review, if any. During hydration `reviews` is the empty
  // server snapshot, so this is null on first paint and only resolves after.
  const seed = useMemo(() => {
    const thisWeek = startOfWeek(new Date());
    return reviews.find((r) => r.weekStart === thisWeek) ?? null;
  }, [reviews]);
  const hasThisWeekReview = seed !== null;

  // The draft scores + note for *this* week's review, edited in the modal.
  // Reset to the seed whenever it changes (e.g. a saved review loads after
  // hydration, or another tab saves).
  const [draft, setDraft] = useState<DraftScores>(seed?.scores ?? EMPTY_DRAFT);
  const [note, setNote] = useState(seed?.note ?? "");
  const [seededFrom, setSeededFrom] = useState(seed);
  if (seed !== seededFrom) {
    setSeededFrom(seed);
    setDraft(seed?.scores ?? EMPTY_DRAFT);
    setNote(seed?.note ?? "");
  }

  // Metrics shown in the graph: average of every review inside the range.
  const filtered = useMemo(
    () => filterReviewsByRange(reviews, range),
    [reviews, range],
  );
  const metrics = useMemo(() => averageReviewScores(filtered), [filtered]);

  function handleDraftChange(id: AreaId, value: number) {
    setDraft((prev) => ({ ...prev, [id]: value }));
  }

  // A review can only be saved once every area has a score.
  const isComplete = WHEEL_AREAS.every((area) => draft[area.id] != null);

  function handleSave() {
    if (!isComplete) return;
    // Every area is rated past the guard, so the nulls are gone.
    const scores = {} as WheelScores;
    for (const area of WHEEL_AREAS) scores[area.id] = draft[area.id]!;
    const trimmed = note.trim();
    const review: WeeklyReview = {
      weekStart: startOfWeek(new Date()),
      scores,
      ...(trimmed ? { note: trimmed } : {}),
    };
    // Fire-and-forget: saveReview updates the shared snapshot optimistically
    // and persists to IndexedDB in the background.
    void saveReview(review);
    setModalOpen(false);
  }

  return {
    range,
    setRange,
    modalOpen,
    setModalOpen,
    hasThisWeekReview,
    metrics,
    filtered,
    draft,
    note,
    setNote,
    handleDraftChange,
    handleSave,
    isComplete,
  };
}

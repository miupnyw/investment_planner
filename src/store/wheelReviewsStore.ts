"use client";

// IndexedDB persistence (via Dexie) for weekly Wheel-of-Life reviews.
//
// Each review is stored as one flat record — a column per life area plus an
// id, the free-text note, and the week-start date — so the store reads like a
// simple table:
//
//   id | financial | career | health | relationships | personalGrowth |
//      leisure | note | weekStart (first date of the week)
//
// The rest of the app still speaks the `WeeklyReview` domain type, so this
// module converts records <-> reviews at its edges. IndexedDB is async while
// useSyncExternalStore needs a synchronous snapshot, so we keep an in-memory
// cache that is hydrated on first subscribe and kept in step on every write.

import Dexie, { type EntityTable } from "dexie";
import {
  normalizeReviews,
  upsertReview,
  type AreaId,
  type WeeklyReview,
  type WheelScores,
} from "@/modules/wheel/wheelOfLife";

const DB_NAME = "investment_planner";

// Legacy localStorage key; migrated into IndexedDB once, then removed.
const LS_KEY = "wheel_reviews";

/** One row in the object store: flat, one column per scored area. */
export interface ReviewRecord {
  /** Stable primary key (uuid). Distinct from the week it describes. */
  id: string;
  /** Week-start date, a local "YYYY-MM-DD" string (the first date of week). */
  weekStart: string;
  financial: number;
  career: number;
  health: number;
  relationships: number;
  personalGrowth: number;
  leisure: number;
  /** Optional free-text reflection. */
  note?: string;
}

// Dexie subclass so the typed `reviews` table (and its schema) live in one
// place. `id` is the primary key; `&weekStart` is a unique index enforcing one
// review per week and driving the upsert lookup.
class WheelDatabase extends Dexie {
  reviews!: EntityTable<ReviewRecord, "id">;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      wheel_reviews: "id, &weekStart",
    });
    // Map the descriptive store name onto a friendlier accessor.
    this.reviews = this.table("wheel_reviews");
  }
}

// A stable empty reference for the server/first-paint snapshot. Reusing one
// reference keeps useSyncExternalStore from looping before hydration.
const EMPTY: WeeklyReview[] = [];

let db: WheelDatabase | null = null;
let reviewsCache: WeeklyReview[] = EMPTY;
let hydrated = false;
let hydrating: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function hasIndexedDB(): boolean {
  return typeof indexedDB !== "undefined";
}

/** Lazily construct the Dexie database (only in a browser with IndexedDB). */
function getDb(): WheelDatabase {
  if (!db) db = new WheelDatabase();
  return db;
}

function recordToReview(record: ReviewRecord): WeeklyReview {
  const { weekStart, note, financial, career, health } = record;
  const { relationships, personalGrowth, leisure } = record;
  const scores: WheelScores = {
    financial,
    career,
    health,
    relationships,
    personalGrowth,
    leisure,
  };
  return { weekStart, scores, ...(note ? { note } : {}) };
}

function reviewToRecord(review: WeeklyReview, id: string): ReviewRecord {
  return {
    id,
    weekStart: review.weekStart,
    ...review.scores,
    ...(review.note ? { note: review.note } : {}),
  };
}

async function readAll(database: WheelDatabase): Promise<WeeklyReview[]> {
  const records = await database.reviews.toArray();
  return records
    .map(recordToReview)
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/** One-time copy of any localStorage reviews into an empty store. */
async function migrateFromLocalStorage(database: WheelDatabase): Promise<void> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(LS_KEY);
  } catch {
    return; // no localStorage access; nothing to migrate
  }
  if (!raw) return;

  let legacy: WeeklyReview[] = [];
  try {
    legacy = normalizeReviews(JSON.parse(raw));
  } catch {
    legacy = [];
  }

  await database.transaction("rw", database.reviews, async () => {
    if ((await database.reviews.count()) === 0) {
      await database.reviews.bulkPut(
        legacy.map((review) => reviewToRecord(review, crypto.randomUUID())),
      );
    }
  });

  // Migration done — drop the legacy copy so it isn't re-imported.
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

function hydrate(): Promise<void> {
  if (hydrated) return Promise.resolve();
  if (hydrating) return hydrating;
  if (!hasIndexedDB()) {
    hydrated = true;
    return Promise.resolve();
  }
  hydrating = (async () => {
    try {
      const database = getDb();
      await migrateFromLocalStorage(database);
      reviewsCache = await readAll(database);
      hydrated = true;
      emit();
    } catch {
      // Leave the cache empty; a later write will retry the open.
    } finally {
      hydrating = null;
    }
  })();
  return hydrating;
}

/** Subscribe to review changes (for useSyncExternalStore). */
export function subscribeReviews(callback: () => void): () => void {
  listeners.add(callback);
  void hydrate();
  return () => {
    listeners.delete(callback);
  };
}

/** Synchronous in-memory snapshot of the current reviews. */
export function getReviewsSnapshot(): WeeklyReview[] {
  return reviewsCache;
}

/** The server (and first-paint) snapshot: no persisted data yet. */
export function getReviewsServerSnapshot(): WeeklyReview[] {
  return EMPTY;
}

/** Insert or replace the review for its week, then refresh the cache. */
export async function saveReview(review: WeeklyReview): Promise<void> {
  // Optimistically update the cache so the UI reflects the save immediately.
  reviewsCache = upsertReview(reviewsCache, review);
  emit();

  if (!hasIndexedDB()) return;

  const database = getDb();
  // Reuse the existing row's id for this week so we overwrite rather than
  // create a duplicate (the weekStart index is unique).
  const existing = await database.reviews
    .where("weekStart")
    .equals(review.weekStart)
    .first();
  await database.reviews.put(
    reviewToRecord(review, existing?.id ?? crypto.randomUUID()),
  );
}

// Re-exported for callers that need to reference the area keys of a record.
export type { AreaId };

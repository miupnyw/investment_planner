"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useLanguage } from "@/context/LanguageContext";
import { notifyStorage, subscribeStorage } from "@/lib/persistentStore";
import {
  averageReviewScores,
  DEFAULT_RANGE,
  filterReviewsByRange,
  normalizeReviews,
  startOfWeek,
  upsertReview,
  WHEEL_AREAS,
  type AreaId,
  type DateRangeId,
  type WeeklyReview,
  type WheelScores,
} from "@/lib/wheelOfLife";
import { WheelMetricBoxes } from "./WheelMetricBoxes";
import { WheelRadarChart } from "./WheelRadarChart";
import { WheelRangeSelector } from "./WheelRangeSelector";
import { WheelReviewModal } from "./WheelReviewModal";
import type { DraftScores } from "./WheelScoreEditor";

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

const LS_KEY = "wheel_reviews";

// useSyncExternalStore needs a stable snapshot reference, so cache the parsed
// list and only rebuild it when the raw localStorage string changes.
let cachedRaw: string | null = null;
let cachedReviews: WeeklyReview[] = [];

function getReviewsSnapshot(): WeeklyReview[] {
  const raw = localStorage.getItem(LS_KEY);
  if (raw === cachedRaw) return cachedReviews;
  cachedRaw = raw;
  try {
    cachedReviews = raw ? normalizeReviews(JSON.parse(raw)) : [];
  } catch {
    cachedReviews = [];
  }
  return cachedReviews;
}

// The server has no localStorage; render an empty history to match first paint.
function getReviewsServerSnapshot(): WeeklyReview[] {
  return [];
}

function saveReviews(reviews: WeeklyReview[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(reviews));
  notifyStorage();
}

export function WheelOfLifeDashboard() {
  const { t } = useLanguage();

  const reviews = useSyncExternalStore(
    subscribeStorage,
    getReviewsSnapshot,
    getReviewsServerSnapshot,
  );

  const [range, setRange] = useState<DateRangeId>(DEFAULT_RANGE);
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
    saveReviews(upsertReview(reviews, review));
    setModalOpen(false);
  }

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={1} sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t("wheelTitle")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            {t("wheelSubtitle")}
          </Typography>
        </Stack>

        <Grid container spacing={4} sx={{ alignItems: "stretch" }}>
          {/* Radar chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: 1,
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CardContent>
                {/* Constrain the chart so it stays hexagonal at full width */}
                <Box sx={{ maxWidth: 560, mx: "auto" }}>
                  <WheelRadarChart scores={metrics} />
                </Box>
                {/* Date range filter, directly under the graph */}
                <Stack sx={{ alignItems: "center", mt: 1 }}>
                  <WheelRangeSelector value={range} onChange={setRange} />
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", textAlign: "center", mt: 1 }}
                >
                  {filtered.length === 0
                    ? t("wheelEmpty")
                    : `${t("wheelBasedOn")} ${filtered.length} ${t("wheelReviewsWord")}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Overall + per-area average metrics, to the right of the chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <WheelMetricBoxes scores={metrics} />
          </Grid>

          {/* Weekly review call-to-action, opens the scoring modal */}
          <Grid size={{ xs: 12 }}>
            <Stack sx={{ alignItems: "center" }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<EditNoteIcon />}
                onClick={() => setModalOpen(true)}
                sx={{ borderRadius: 8, px: 4 }}
              >
                {hasThisWeekReview ? t("wheelEditReview") : t("wheelAddReview")}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <WheelReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        scores={draft}
        onScoreChange={handleDraftChange}
        note={note}
        onNoteChange={setNote}
        onSave={handleSave}
        isComplete={isComplete}
      />
    </Box>
  );
}

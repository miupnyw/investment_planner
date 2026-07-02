"use client";

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
import { useWheelDashboard } from "../hooks/useWheelDashboard";
import { WheelMetricBoxes } from "./WheelMetricBoxes";
import { WheelRadarChart } from "./WheelRadarChart";
import { WheelRangeSelector } from "./WheelRangeSelector";
import { WheelReviewModal } from "./WheelReviewModal";

export function WheelOfLifeDashboard() {
  const { t } = useLanguage();
  const {
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
  } = useWheelDashboard();

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: { xs: "center", sm: "left" },
            mb: 5,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t("wheelTitle")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 600 }}
            >
              {t("wheelSubtitle")}
            </Typography>
          </Stack>

          {/* Weekly review call-to-action, opens the scoring modal */}
          <Button
            variant="contained"
            size="large"
            startIcon={<EditNoteIcon />}
            onClick={() => setModalOpen(true)}
            sx={{ px: 4, flexShrink: 0 }}
          >
            {hasThisWeekReview ? t("wheelEditReview") : t("wheelAddReview")}
          </Button>
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

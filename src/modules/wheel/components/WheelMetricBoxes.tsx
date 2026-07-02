"use client";

import {
  Box,
  Card,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useLanguage } from "@/context/LanguageContext";
import {
  averageScore,
  MAX_SCORE,
  scoreLevel,
  WHEEL_AREAS,
  type ScoreLevel,
  type WheelScores,
} from "../wheelOfLife";
import { AREA_ICONS } from "../areaIcons";

interface WheelMetricBoxesProps {
  scores: WheelScores;
}

// Theme palette key + qualitative label per score bucket.
const LEVEL_PALETTE: Record<ScoreLevel, "error" | "warning" | "success"> = {
  low: "error",
  medium: "warning",
  high: "success",
};

const RATING_LABEL: Record<ScoreLevel, string> = {
  low: "wheelRatingLow",
  medium: "wheelRatingMedium",
  high: "wheelRatingHigh",
};

export function WheelMetricBoxes({ scores }: WheelMetricBoxesProps) {
  const { t } = useLanguage();

  const overall = averageScore(scores);
  const overallLevel = scoreLevel(overall);
  const overallPalette = LEVEL_PALETTE[overallLevel];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: 1,
        borderColor: "divider",
        borderRadius: 4,
        p: { xs: 2, md: 3 },
      }}
    >
      {/* Header: title + overall score with its rating */}
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t("wheelOverall")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("wheelOverallCaption")}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right", ml: 2 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, lineHeight: 1, color: `${overallPalette}.main` }}
          >
            {overall}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: `${overallPalette}.main` }}
          >
            {t(RATING_LABEL[overallLevel])}
          </Typography>
        </Box>
      </Stack>

      {/* Overall progress */}
      <LinearProgress
        variant="determinate"
        value={(overall / MAX_SCORE) * 100}
        color={overallPalette}
        sx={{ height: 10, borderRadius: 5, mb: 3 }}
      />

      {/* Per-area metric boxes */}
      <Grid container spacing={2}>
        {WHEEL_AREAS.map((area) => {
          const value = scores[area.id];
          const palette = LEVEL_PALETTE[scoreLevel(value)];
          const Icon = AREA_ICONS[area.id];
          return (
            <Grid key={area.id} size={{ xs: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  p: 2.5,
                  borderRadius: 3,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                {/* Icon chip + score */}
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: `${palette}.main`,
                      bgcolor: (theme) => alpha(theme.palette[palette].main, 0.14),
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, lineHeight: 1, color: "text.primary" }}
                    >
                      {value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      /{MAX_SCORE}
                    </Typography>
                  </Box>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1.5 }}
                  noWrap
                  title={t(area.labelKey)}
                >
                  {t(area.labelKey)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(value / MAX_SCORE) * 100}
                  color={palette}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    bgcolor: (theme) => alpha(theme.palette[palette].main, 0.14),
                  }}
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
}

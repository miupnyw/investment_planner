"use client";

import { Box, Stack, Typography } from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";
import {
  MAX_SCORE,
  scoreLevel,
  WHEEL_AREAS,
  type AreaId,
} from "../wheelOfLife";
import { AREA_ICONS } from "../areaIcons";

// A draft allows "not yet rated" (null) per area, shown as "-".
export type DraftScores = Record<AreaId, number | null>;

interface WheelScoreEditorProps {
  scores: DraftScores;
  onChange: (id: AreaId, value: number) => void;
}

// Theme palette key per score bucket, used for the chosen button and label.
const LEVEL_PALETTE = {
  low: "error",
  medium: "warning",
  high: "success",
} as const;

// The 1..10 scale rendered as a row of buttons.
const SCALE = Array.from({ length: MAX_SCORE }, (_, i) => i + 1);

export function WheelScoreEditor({ scores, onChange }: WheelScoreEditorProps) {
  const { t } = useLanguage();

  return (
    <Stack spacing={3}>
      {WHEEL_AREAS.map((area) => {
        const value = scores[area.id];
        const palette = value != null ? LEVEL_PALETTE[scoreLevel(value)] : null;
        const Icon = AREA_ICONS[area.id];
        return (
          <Box key={area.id}>
            {/* Label with icon, and the current score on the right */}
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                <Icon fontSize="small" sx={{ color: "text.secondary" }} />
                <Typography sx={{ fontWeight: 600 }} noWrap>
                  {t(area.labelKey)}
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  color: palette ? `${palette}.main` : "text.disabled",
                }}
              >
                {value != null ? `${value} / ${MAX_SCORE}` : "-"}
              </Typography>
            </Stack>

            {/* 1–10 picker; the chosen number fills with its level color */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(5, 1fr)",
                  sm: `repeat(${MAX_SCORE}, 1fr)`,
                },
                gap: 1,
              }}
            >
              {SCALE.map((n) => {
                const selected = value === n;
                return (
                  <Box
                    key={n}
                    component="button"
                    type="button"
                    aria-label={`${t(area.labelKey)}: ${n}`}
                    aria-pressed={selected}
                    onClick={() => onChange(area.id, n)}
                    sx={{
                      cursor: "pointer",
                      font: "inherit",
                      fontWeight: selected ? 700 : 500,
                      py: 1.25,
                      borderRadius: 2,
                      border: 1,
                      transition: "background-color .15s, border-color .15s, color .15s",
                      borderColor:
                        selected && palette ? `${palette}.main` : "divider",
                      bgcolor:
                        selected && palette ? `${palette}.main` : "transparent",
                      color: selected ? "common.white" : "text.primary",
                      "&:hover":
                        selected
                          ? {}
                          : { borderColor: "text.secondary", bgcolor: "action.hover" },
                    }}
                  >
                    {n}
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

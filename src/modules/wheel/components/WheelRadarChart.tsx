"use client";

import { useTheme } from "@mui/material/styles";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useLanguage } from "@/context/LanguageContext";
import {
  MAX_SCORE,
  WHEEL_AREAS,
  type WheelScores,
} from "../wheelOfLife";

interface WheelRadarChartProps {
  scores: WheelScores;
}

export function WheelRadarChart({ scores }: WheelRadarChartProps) {
  const { t } = useLanguage();
  const theme = useTheme();

  // One datum per vertex of the hexagon, in wheel order.
  const data = WHEEL_AREAS.map((area) => ({
    area: t(area.labelKey),
    score: scores[area.id],
  }));

  const accent = theme.palette.primary.main;
  const gridColor = theme.palette.divider;
  const labelColor = theme.palette.text.secondary;

  return (
    <ResponsiveContainer width="100%" height={340}>
      <RadarChart data={data} outerRadius="72%">
        {/* gridType="polygon" renders the hexagonal web instead of circles. */}
        <PolarGrid gridType="polygon" stroke={gridColor} />
        <PolarAngleAxis
          dataKey="area"
          tick={{ fill: labelColor, fontSize: 13 }}
        />
        <Radar
          name={t("wheelScoreLabel")}
          dataKey="score"
          stroke={accent}
          fill={accent}
          fillOpacity={0.35}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Tooltip
          formatter={(value) => [`${value}/${MAX_SCORE}`, t("wheelScoreLabel")]}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
            color: theme.palette.text.primary,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

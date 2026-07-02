"use client";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";
import { DATE_RANGES, type DateRangeId } from "../wheelOfLife";

interface WheelRangeSelectorProps {
  value: DateRangeId;
  onChange: (value: DateRangeId) => void;
}

export function WheelRangeSelector({ value, onChange }: WheelRangeSelectorProps) {
  const { t } = useLanguage();

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size="small"
      color="primary"
      aria-label={t("wheelRangeLabel")}
      onChange={(_, next: DateRangeId | null) => {
        // Ignore deselection clicks so a range is always active.
        if (next) onChange(next);
      }}
      sx={{
        flexWrap: "wrap",
        "& .MuiToggleButton-root": {
          border: 0,
          borderRadius: 2,
          px: 1.75,
          py: 0.5,
          fontWeight: 600,
          color: "text.secondary",
          "&.Mui-selected": {
            color: "primary.main",
            bgcolor: "action.selected",
            "&:hover": { bgcolor: "action.selected" },
          },
        },
      }}
    >
      {DATE_RANGES.map((range) => (
        <ToggleButton key={range.id} value={range.id}>
          {t(range.labelKey)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

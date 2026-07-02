"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useLanguage } from "@/context/LanguageContext";
import type { AreaId } from "@/modules/wheel/wheelOfLife";
import { WheelScoreEditor, type DraftScores } from "./WheelScoreEditor";

interface WheelReviewModalProps {
  open: boolean;
  onClose: () => void;
  scores: DraftScores;
  onScoreChange: (id: AreaId, value: number) => void;
  note: string;
  onNoteChange: (note: string) => void;
  onSave: () => void;
  isComplete: boolean;
}

export function WheelReviewModal({
  open,
  onClose,
  scores,
  onScoreChange,
  note,
  onNoteChange,
  onSave,
  isComplete,
}: WheelReviewModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="body">
      <DialogTitle sx={{ fontWeight: 700 }}>{t("wheelThisWeek")}</DialogTitle>
      <DialogContent dividers>
        <WheelScoreEditor scores={scores} onChange={onScoreChange} />
        <TextField
          label={t("wheelNoteLabel")}
          placeholder={t("wheelNotePlaceholder")}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          multiline
          minRows={3}
          fullWidth
          sx={{ mt: 4 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {!isComplete && (
          <Typography variant="caption" color="text.secondary" sx={{ mr: "auto" }}>
            {t("wheelReviewIncomplete")}
          </Typography>
        )}
        <Button onClick={onClose} color="inherit">
          {t("cancel")}
        </Button>
        <Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={!isComplete}
            sx={{ borderRadius: 8 }}
          >
            {t("wheelSaveReview")}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

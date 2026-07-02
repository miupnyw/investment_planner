import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { IncomeItem } from "@/modules/tax/tax";
import { useLanguage } from "@/context/LanguageContext";

interface IncomeListProps {
  items: IncomeItem[];
  symbol: string;
  toDisplay: (thb: number) => number;
  toTHB: (display: number) => number;
  onChange: (items: IncomeItem[]) => void;
}

export function IncomeList({
  items,
  symbol,
  toDisplay,
  toTHB,
  onChange,
}: IncomeListProps) {
  const { t } = useLanguage();

  function addItem() {
    onChange([...items, { id: crypto.randomUUID(), note: "", amountTHB: 0 }]);
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function updateNote(id: string, note: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, note } : item)));
  }

  function updateAmount(id: string, displayVal: string) {
    const thb =
      displayVal === "" ? 0 : Math.round(toTHB(parseFloat(displayVal) || 0));
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, amountTHB: thb } : item,
      ),
    );
  }

  const total = items.reduce((sum, item) => sum + item.amountTHB, 0);

  return (
    <Stack spacing={1.5}>
      {items.map((item, idx) => (
        <Stack
          key={item.id}
          direction="row"
          spacing={1}
          sx={{ alignItems: "flex-start" }}
        >
          <TextField
            label={t("taxIncomeNote")}
            placeholder={t("taxIncomeNotePlaceholder")}
            value={item.note}
            onChange={(e) => updateNote(item.id, e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            label={t("taxIncomeAmount")}
            type="number"
            value={
              item.amountTHB === 0
                ? ""
                : String(Math.round(toDisplay(item.amountTHB)))
            }
            onChange={(e) => updateAmount(item.id, e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            slotProps={{
              htmlInput: { min: 0 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">{symbol}</InputAdornment>
                ),
              },
            }}
          />
          <Tooltip title={t("taxIncomeRemove")}>
            <span>
              <IconButton
                size="small"
                onClick={() => removeItem(item.id)}
                disabled={items.length === 1 && idx === 0}
                sx={{ mt: 0.5 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ))}

      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Box
          component="button"
          onClick={addItem}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "primary.main",
            fontSize: "0.8125rem",
            fontWeight: 600,
            p: 0,
            "&:hover": { opacity: 0.75 },
          }}
        >
          <AddIcon fontSize="small" />
          {t("taxIncomeAdd")}
        </Box>
        {items.length > 1 && (
          <Typography variant="body2" color="text.secondary">
            {t("taxIncomeTotal")}:{" "}
            <strong>
              {symbol} {Math.round(toDisplay(total)).toLocaleString()}
            </strong>
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

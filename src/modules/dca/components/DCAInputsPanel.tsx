import {
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";

interface DCAInputsPanelProps {
  startAge: string;
  endAge: string;
  retireAge: string;
  annualReturn: string;
  startPrincipalDisplay: string;
  monthlyDCADisplay: string;
  withdrawalRate: string;
  investYears: number;
  coastYears: number;
  symbol: string;
  onStartAgeChange: (v: string) => void;
  onEndAgeChange: (v: string) => void;
  onRetireAgeChange: (v: string) => void;
  onAnnualReturnChange: (v: string) => void;
  onStartPrincipalChange: (raw: string) => void;
  onMonthlyDCAChange: (raw: string) => void;
  onWithdrawalRateChange: (v: string) => void;
}

export function DCAInputsPanel({
  startAge,
  endAge,
  retireAge,
  annualReturn,
  startPrincipalDisplay,
  monthlyDCADisplay,
  withdrawalRate,
  investYears,
  coastYears,
  symbol,
  onStartAgeChange,
  onEndAgeChange,
  onRetireAgeChange,
  onAnnualReturnChange,
  onStartPrincipalChange,
  onMonthlyDCAChange,
  onWithdrawalRateChange,
}: DCAInputsPanelProps) {
  const { t } = useLanguage();

  return (
    <Card
      elevation={0}
      sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          {t("dcaInputs")}
        </Typography>
        <Stack spacing={3}>
          <TextField
            label={t("dcaStartAge")}
            type="number"
            value={startAge}
            onChange={(e) => onStartAgeChange(e.target.value)}
            slotProps={{ htmlInput: { min: 1, max: 100 } }}
            fullWidth
          />
          <TextField
            label={t("dcaEndAge")}
            type="number"
            value={endAge}
            onChange={(e) => onEndAgeChange(e.target.value)}
            slotProps={{ htmlInput: { min: 1, max: 100 } }}
            fullWidth
          />
          <TextField
            label={t("dcaRetireAge")}
            type="number"
            value={retireAge}
            onChange={(e) => onRetireAgeChange(e.target.value)}
            slotProps={{ htmlInput: { min: 1, max: 100 } }}
            fullWidth
          />
          <TextField
            label={t("dcaTotalYears")}
            value={investYears}
            slotProps={{ input: { readOnly: true } }}
            fullWidth
            sx={{ "& .MuiInputBase-input": { color: "text.secondary" } }}
          />
          <TextField
            label={t("dcaCoastYears")}
            value={coastYears}
            slotProps={{ input: { readOnly: true } }}
            fullWidth
            sx={{ "& .MuiInputBase-input": { color: "text.secondary" } }}
          />

          <Divider />

          <TextField
            label={t("dcaAnnualReturn")}
            type="number"
            value={annualReturn}
            onChange={(e) => onAnnualReturnChange(e.target.value)}
            slotProps={{
              htmlInput: { min: 0, max: 100, step: 0.1 },
              input: {
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              },
            }}
            fullWidth
          />
          <TextField
            label={t("dcaStartPrincipal")}
            type="number"
            value={startPrincipalDisplay}
            onChange={(e) => onStartPrincipalChange(e.target.value)}
            slotProps={{
              htmlInput: { min: 0 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">{symbol}</InputAdornment>
                ),
              },
            }}
            fullWidth
          />
          <TextField
            label={t("dcaMonthlyCost")}
            type="number"
            value={monthlyDCADisplay}
            onChange={(e) => onMonthlyDCAChange(e.target.value)}
            slotProps={{
              htmlInput: { min: 0 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">{symbol}</InputAdornment>
                ),
              },
            }}
            fullWidth
          />

          <Divider />

          <TextField
            label={t("dcaWithdrawalRate")}
            type="number"
            value={withdrawalRate}
            onChange={(e) => onWithdrawalRateChange(e.target.value)}
            slotProps={{
              htmlInput: { min: 0, max: 100, step: 0.1 },
              input: {
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              },
            }}
            fullWidth
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

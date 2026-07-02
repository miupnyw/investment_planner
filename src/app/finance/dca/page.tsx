"use client";

import { Box, Container, Stack, Typography } from "@mui/material";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useDcaPlanner } from "@/modules/dca/hooks/useDcaPlanner";
import { StatCard } from "@/modules/dca/components/StatCard";
import { DCAInputsPanel } from "@/modules/dca/components/DCAInputsPanel";
import { DCAChart } from "@/modules/dca/components/DCAChart";
import { DCAPassiveIncomeCard } from "@/modules/dca/components/DCAPassiveIncomeCard";

export default function DCAPage() {
  const { t } = useLanguage();
  const {
    fmt,
    symbol,
    startAge,
    endAge,
    retireAge,
    annualReturn,
    withdrawalRate,
    startPrincipalDisplay,
    monthlyDCADisplay,
    investYears,
    coastYears,
    currentYear,
    coastStartYear,
    retireYear,
    retireAgeNum,
    result,
    chartData,
    annualPassiveIncome,
    monthlyPassiveIncome,
    update,
    setStartPrincipal,
    setMonthlyDCA,
  } = useDcaPlanner();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {t("dcaTitle")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("dcaSubtitle")}
          </Typography>
        </Stack>

        <Stack spacing={4}>
          <DCAInputsPanel
            startAge={startAge}
            endAge={endAge}
            retireAge={retireAge}
            annualReturn={annualReturn}
            startPrincipalDisplay={startPrincipalDisplay}
            monthlyDCADisplay={monthlyDCADisplay}
            withdrawalRate={withdrawalRate}
            investYears={investYears}
            coastYears={coastYears}
            symbol={symbol}
            onStartAgeChange={(v) => update({ startAge: v })}
            onEndAgeChange={(v) => update({ endAge: v })}
            onRetireAgeChange={(v) => update({ retireAge: v })}
            onAnnualReturnChange={(v) => update({ annualReturn: v })}
            onStartPrincipalChange={setStartPrincipal}
            onMonthlyDCAChange={setMonthlyDCA}
            onWithdrawalRateChange={(v) => update({ withdrawalRate: v })}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <StatCard
              label={t("dcaTotalPrincipal")}
              value={fmt(result.totalPrincipal)}
            />
            <StatCard
              label={t("dcaTotalProfit")}
              value={fmt(result.totalProfit)}
              color="success.main"
            />
            <StatCard
              label={t("dcaTotalBalance")}
              value={fmt(result.totalBalance)}
              color="primary.main"
            />
          </Stack>

          <DCAChart
            data={chartData}
            currentYear={currentYear}
            retireYear={retireYear}
            coastStartYear={coastStartYear}
            coastYears={coastYears}
            fmt={fmt}
          />

          <DCAPassiveIncomeCard
            monthlyPassiveIncome={monthlyPassiveIncome}
            annualPassiveIncome={annualPassiveIncome}
            totalBalance={result.totalBalance}
            retireAge={retireAgeNum}
            fmt={fmt}
          />
        </Stack>
      </Container>
    </Box>
  );
}

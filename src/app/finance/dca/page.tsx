"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { notifyStorage, subscribeStorage } from "@/lib/persistentStore";
import { computeDCA } from "@/lib/dca";
import { StatCard } from "@/modules/dca/components/StatCard";
import { DCAInputsPanel } from "@/modules/dca/components/DCAInputsPanel";
import { DCAChart } from "@/modules/dca/components/DCAChart";
import { DCAPassiveIncomeCard } from "@/modules/dca/components/DCAPassiveIncomeCard";

const LS_KEY = "dca_inputs";

interface DCAInputs {
  startAge: string;
  endAge: string;
  retireAge: string;
  annualReturn: string;
  startPrincipalTHB: string;
  monthlyDCABase: string;
  withdrawalRate: string;
}

const DEFAULTS: DCAInputs = {
  startAge: "25",
  endAge: "40",
  retireAge: "60",
  annualReturn: "7",
  startPrincipalTHB: "100000",
  monthlyDCABase: "1000",
  withdrawalRate: "4",
};

// useSyncExternalStore requires a stable snapshot reference, so cache the
// parsed object and only rebuild it when the raw localStorage string changes.
let cachedRaw: string | null = null;
let cachedInputs: DCAInputs = DEFAULTS;

function getInputsSnapshot(): DCAInputs {
  const raw = localStorage.getItem(LS_KEY);
  if (raw === cachedRaw) return cachedInputs;
  cachedRaw = raw;
  try {
    cachedInputs = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    cachedInputs = DEFAULTS;
  }
  return cachedInputs;
}

// The server has no localStorage; render defaults to match the first paint.
function getInputsServerSnapshot(): DCAInputs {
  return DEFAULTS;
}

function saveInputs(inputs: DCAInputs) {
  localStorage.setItem(LS_KEY, JSON.stringify(inputs));
  notifyStorage();
}

export default function DCAPage() {
  const { t } = useLanguage();
  const { fmt, symbol, toTHB, toDisplay } = useCurrency();

  // Inputs are persisted in localStorage and read via an external store, so
  // writes go straight to storage instead of through a setState-in-effect.
  const inputs = useSyncExternalStore(
    subscribeStorage,
    getInputsSnapshot,
    getInputsServerSnapshot,
  );
  const {
    startAge,
    endAge,
    retireAge,
    annualReturn,
    startPrincipalTHB,
    monthlyDCABase,
    withdrawalRate,
  } = inputs;
  const update = (patch: Partial<DCAInputs>) =>
    saveInputs({ ...inputs, ...patch });

  const startPrincipalDisplay =
    startPrincipalTHB === ""
      ? ""
      : String(Math.round(toDisplay(parseFloat(startPrincipalTHB) || 0)));
  const monthlyDCADisplay =
    monthlyDCABase === ""
      ? ""
      : String(Math.round(toDisplay(parseFloat(monthlyDCABase) || 0)));

  const startAgeNum = parseFloat(startAge) || 0;
  const endAgeNum = parseFloat(endAge) || 0;
  const retireAgeNum = parseFloat(retireAge) || 0;
  const investYears = Math.max(0, endAgeNum - startAgeNum);
  const coastYears = Math.max(0, retireAgeNum - endAgeNum);

  const currentYear = new Date().getFullYear();
  const coastStartYear = currentYear + investYears;
  const retireYear = currentYear + Math.max(0, retireAgeNum - startAgeNum);

  const result = useMemo(
    () =>
      computeDCA(
        parseFloat(startPrincipalTHB) || 0,
        parseFloat(monthlyDCABase) || 0,
        parseFloat(annualReturn) || 0,
        investYears,
        coastYears,
      ),
    [startPrincipalTHB, monthlyDCABase, annualReturn, investYears, coastYears],
  );

  const withdrawalRateNum = parseFloat(withdrawalRate) || 0;
  const annualPassiveIncome = (result.totalBalance * withdrawalRateNum) / 100;
  const monthlyPassiveIncome = annualPassiveIncome / 12;

  const chartData = useMemo(
    () =>
      result.data.map((point) => ({
        ...point,
        calendarYear: currentYear + point.year,
      })),
    [result.data, currentYear],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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
            onStartPrincipalChange={(raw) =>
              update({
                startPrincipalTHB:
                  raw === ""
                    ? ""
                    : String(Math.round(toTHB(parseFloat(raw) || 0))),
              })
            }
            onMonthlyDCAChange={(raw) =>
              update({
                monthlyDCABase:
                  raw === ""
                    ? ""
                    : String(Math.round(toTHB(parseFloat(raw) || 0))),
              })
            }
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

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: "center",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} {t("appTitle")} — {t("footerRights")}
        </Typography>
      </Box>
    </Box>
  );
}

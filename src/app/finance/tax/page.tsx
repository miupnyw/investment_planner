"use client";

import { Box, Container, Stack, Typography } from "@mui/material";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useTaxCalculator } from "@/modules/tax/hooks/useTaxCalculator";
import { TaxInputsPanel } from "@/modules/tax/components/TaxInputsPanel";
import { TaxSummaryCards } from "@/modules/tax/components/TaxSummaryCards";
import { TaxDeductionsTable } from "@/modules/tax/components/TaxDeductionsTable";
import { TaxBreakdownTable } from "@/modules/tax/components/TaxBreakdownTable";

export default function TaxPage() {
  const { t } = useLanguage();
  const { fmt, symbol, toTHB, toDisplay } = useCurrency();

  const { inputs, patch, handleIncomeChange, result } = useTaxCalculator();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {t("taxTitle")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("taxSubtitle")}
          </Typography>
        </Stack>

        <Stack spacing={4}>
          <TaxInputsPanel
            inputs={inputs}
            symbol={symbol}
            toDisplay={toDisplay}
            toTHB={toTHB}
            donationCap={result.donationCap}
            fmt={fmt}
            onChange={patch}
            onIncomeChange={handleIncomeChange}
          />

          <TaxSummaryCards
            grossIncome={result.grossIncome}
            totalDeductions={result.deductions.total}
            netIncome={result.netIncome}
            totalTax={result.totalTax}
            effectiveRate={result.effectiveRate}
            fmt={fmt}
          />
          <TaxDeductionsTable deductions={result.deductions} fmt={fmt} />
          <TaxBreakdownTable
            brackets={result.brackets}
            totalTax={result.totalTax}
            fmt={fmt}
          />
        </Stack>
      </Container>
    </Box>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { computeTax, IncomeItem, TaxInputs } from "@/lib/tax";
import { TaxInputsPanel } from "@/modules/tax/components/TaxInputsPanel";
import { TaxSummaryCards } from "@/modules/tax/components/TaxSummaryCards";
import { TaxDeductionsTable } from "@/modules/tax/components/TaxDeductionsTable";
import { TaxBreakdownTable } from "@/modules/tax/components/TaxBreakdownTable";

const DEFAULTS: TaxInputs = {
    incomeItems: [{ id: "1", note: "", amountTHB: 600_000 }],
    hasSpouse: false,
    numChildren: 0,
    numChildren2ndPlus: 0,
    pregnancyExpense: 0,
    numParents: 0,
    numDisabled: 0,
    socialSecurity: 9_000,
    homeLoanInterest: 0,
    lifeInsurance: 0,
    healthInsurance: 0,
    pensionInsurance: 0,
    rmf: 0,
    thaiEsg: 0,
    generalDonation: 0,
    eduDonation: 0,
};

export default function TaxPage() {
    const { t } = useLanguage();
    const { fmt, symbol, toTHB, toDisplay } = useCurrency();

    const [inputs, setInputs] = useState<TaxInputs>(DEFAULTS);

    function patch(p: Partial<TaxInputs>) {
        setInputs((prev) => ({ ...prev, ...p }));
    }

    function handleIncomeChange(items: IncomeItem[]) {
        patch({ incomeItems: items });
    }

    const result = useMemo(() => computeTax(inputs), [inputs]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
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
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Stack spacing={4}>
                            <TaxSummaryCards
                                grossIncome={result.grossIncome}
                                totalDeductions={result.deductions.total}
                                netIncome={result.netIncome}
                                totalTax={result.totalTax}
                                effectiveRate={result.effectiveRate}
                                fmt={fmt}
                            />
                            <TaxDeductionsTable
                                deductions={result.deductions}
                                fmt={fmt}
                            />
                            <TaxBreakdownTable
                                brackets={result.brackets}
                                totalTax={result.totalTax}
                                fmt={fmt}
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            <Box
                component="footer"
                sx={{ py: 3, textAlign: "center", borderTop: 1, borderColor: "divider" }}
            >
                <Typography variant="body2" color="text.secondary">
                    © {new Date().getFullYear()} {t("appTitle")} — {t("footerRights")}
                </Typography>
            </Box>
        </Box>
    );
}

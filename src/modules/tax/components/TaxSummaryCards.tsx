import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";

interface TaxSummaryCardsProps {
    grossIncome: number;
    totalDeductions: number;
    netIncome: number;
    totalTax: number;
    effectiveRate: number;
    fmt: (v: number) => string;
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, flex: 1 }}>
            <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: color ?? "text.primary" }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

export function TaxSummaryCards({ grossIncome, totalDeductions, netIncome, totalTax, effectiveRate, fmt }: TaxSummaryCardsProps) {
    const { t } = useLanguage();

    return (
        <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <SummaryCard label={t("taxGrossIncome")} value={fmt(grossIncome)} />
                <SummaryCard label={t("taxTotalDeductions")} value={fmt(totalDeductions)} color="success.main" />
                <SummaryCard label={t("taxNetIncome")} value={fmt(netIncome)} color="info.main" />
            </Stack>

            {/* Tax due highlight */}
            <Box
                sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    background: (theme) =>
                        theme.palette.mode === "dark"
                            ? "linear-gradient(135deg, #3b1a1a 0%, #5c2a2a 100%)"
                            : "linear-gradient(135deg, #fde8e8 0%, #fbc9c9 100%)",
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", gap: 3 }}
                    >
                        <Box>
                            <Typography variant="overline" sx={{ color: "error.dark", fontWeight: 600, letterSpacing: 1.5 }}>
                                {t("taxDue")}
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 800, color: "error.dark", lineHeight: 1.1, mt: 0.5 }}>
                                {fmt(totalTax)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "error.dark", opacity: 0.75, mt: 0.5 }}>
                                {t("taxYear2569")}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                bgcolor: "rgba(255,255,255,0.35)",
                                borderRadius: 2,
                                px: 2,
                                py: 1.5,
                                backdropFilter: "blur(6px)",
                                minWidth: 160,
                            }}
                        >
                            <Typography variant="caption" sx={{ color: "error.dark", opacity: 0.8 }}>
                                {t("taxEffectiveRate")}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "error.dark" }}>
                                {effectiveRate.toFixed(2)}%
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </Stack>
    );
}

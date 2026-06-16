import { Box, Stack, Typography } from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";

interface DCAPassiveIncomeCardProps {
    monthlyPassiveIncome: number;
    annualPassiveIncome: number;
    totalBalance: number;
    retireAge: number;
    fmt: (v: number) => string;
}

export function DCAPassiveIncomeCard({
    monthlyPassiveIncome,
    annualPassiveIncome,
    totalBalance,
    retireAge,
    fmt,
}: DCAPassiveIncomeCardProps) {
    const { t } = useLanguage();

    return (
        <Box
            sx={{
                borderRadius: 4,
                overflow: "hidden",
                background: (theme) =>
                    theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)"
                        : "linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 100%)",
            }}
        >
            <Box sx={{ p: 3 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", gap: 3 }}
                >
                    <Box>
                        <Typography
                            variant="overline"
                            sx={{ color: "success.dark", fontWeight: 600, letterSpacing: 1.5 }}
                        >
                            {t("dcaPassiveIncomeTitle")}
                        </Typography>
                        <Typography
                            variant="h2"
                            sx={{ fontWeight: 800, color: "success.dark", lineHeight: 1.1, mt: 0.5 }}
                        >
                            {fmt(monthlyPassiveIncome)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "success.dark", opacity: 0.75, mt: 0.5 }}>
                            / {t("dcaMonthlyIncome").toLowerCase()}
                        </Typography>
                    </Box>

                    <Stack spacing={2} sx={{ minWidth: 180 }}>
                        <Box
                            sx={{
                                bgcolor: "rgba(255,255,255,0.35)",
                                borderRadius: 2,
                                px: 2,
                                py: 1.5,
                                backdropFilter: "blur(6px)",
                            }}
                        >
                            <Typography variant="caption" sx={{ color: "success.dark", opacity: 0.8 }}>
                                {t("dcaAnnualIncome")}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "success.dark" }}>
                                {fmt(annualPassiveIncome)}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                bgcolor: "rgba(255,255,255,0.35)",
                                borderRadius: 2,
                                px: 2,
                                py: 1.5,
                                backdropFilter: "blur(6px)",
                            }}
                        >
                            <Typography variant="caption" sx={{ color: "success.dark", opacity: 0.8 }}>
                                {t("dcaTotalBalance")} @ {retireAge}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "success.dark" }}>
                                {fmt(totalBalance)}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}

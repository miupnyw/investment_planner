"use client";

import { useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Container,
    Divider,
    Grid,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { computeDCA } from "@/lib/dca";

const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

interface StatCardProps {
    label: string;
    value: string;
    color?: string;
}

const START_AGE_DEFAULT = "25";
const END_AGE_DEFAULT = "40";
const RETIRE_AGE_DEFAULT = "60";
const ANNUAL_RETURN_DEFAULT = "7";
const START_PRINCIPAL_DEFAULT = "100000";
const MONTHLY_DCA_DEFAULT = "1000";

function StatCard({ label, value, color }: StatCardProps) {
    return (
        <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, flex: 1 }}>
            <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: color ?? "text.primary" }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default function DCAPage() {
    const { t } = useLanguage();

    const [startAge, setStartAge] = useState(START_AGE_DEFAULT);
    const [endAge, setEndAge] = useState(END_AGE_DEFAULT);
    const [retireAge, setRetireAge] = useState(RETIRE_AGE_DEFAULT);
    const [annualReturn, setAnnualReturn] = useState(ANNUAL_RETURN_DEFAULT);
    const [startPrincipal, setStartPrincipal] = useState(START_PRINCIPAL_DEFAULT);
    const [monthlyDCA, setMonthlyDCA] = useState(MONTHLY_DCA_DEFAULT);

    const startAgeNum = parseFloat(startAge) || 0;
    const endAgeNum = parseFloat(endAge) || 0;
    const retireAgeNum = parseFloat(retireAge) || 0;
    const investYears = Math.max(0, endAgeNum - startAgeNum);
    const coastYears = Math.max(0, retireAgeNum - endAgeNum);

    const currentYear = new Date().getFullYear();
    const coastStartYear = currentYear + investYears;
    const retireYear = currentYear + Math.max(0, retireAgeNum - startAgeNum);

    const result = useMemo(
        () => computeDCA(
            parseFloat(startPrincipal) || 0,
            parseFloat(monthlyDCA) || 0,
            parseFloat(annualReturn) || 0,
            investYears,
            coastYears,
        ),
        [startPrincipal, monthlyDCA, annualReturn, investYears, coastYears],
    );

    const chartData = useMemo(
        () => result.data.map((point) => ({ ...point, calendarYear: currentYear + point.year })),
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

                <Grid container spacing={4}>
                    {/* Inputs */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                                    {t("dcaInputs")}
                                </Typography>
                                <Stack spacing={3}>
                                    <TextField
                                        label={t("dcaStartAge")}
                                        type="number"
                                        value={startAge}
                                        onChange={(e) => setStartAge(e.target.value)}
                                        slotProps={{ htmlInput: { min: 1, max: 100 } }}
                                        fullWidth
                                    />
                                    <TextField
                                        label={t("dcaEndAge")}
                                        type="number"
                                        value={endAge}
                                        onChange={(e) => setEndAge(e.target.value)}
                                        slotProps={{ htmlInput: { min: 1, max: 100 } }}
                                        fullWidth
                                    />
                                    <TextField
                                        label={t("dcaRetireAge")}
                                        type="number"
                                        value={retireAge}
                                        onChange={(e) => setRetireAge(e.target.value)}
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
                                        onChange={(e) => setAnnualReturn(e.target.value)}
                                        slotProps={{
                                            htmlInput: { min: 0, max: 100, step: 0.1 },
                                            input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                                        }}
                                        fullWidth
                                    />
                                    <TextField
                                        label={t("dcaStartPrincipal")}
                                        type="number"
                                        value={startPrincipal}
                                        onChange={(e) => setStartPrincipal(e.target.value)}
                                        slotProps={{ htmlInput: { min: 0 } }}
                                        fullWidth
                                    />
                                    <TextField
                                        label={t("dcaMonthlyCost")}
                                        type="number"
                                        value={monthlyDCA}
                                        onChange={(e) => setMonthlyDCA(e.target.value)}
                                        slotProps={{ htmlInput: { min: 0 } }}
                                        fullWidth
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Results + Chart */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Stack spacing={4}>
                            {/* Stat cards */}
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

                            {/* Chart */}
                            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                                        {t("dcaChartTitle")}
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={360}>
                                        <LineChart
                                            data={chartData}
                                            margin={{ top: 4, right: 24, left: 16, bottom: 4 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis
                                                dataKey="calendarYear"
                                                type="number"
                                                domain={[currentYear, retireYear]}
                                            />
                                            <YAxis
                                                tickFormatter={(v) => fmt(v)}
                                                width={80}
                                                label={{
                                                    value: t("dcaChartBalance"),
                                                    angle: -90,
                                                    position: "insideLeft",
                                                    offset: -4,
                                                }}
                                            />
                                            <Tooltip
                                                formatter={(value) => fmt(Number(value))}
                                                labelFormatter={(label) => String(label)}
                                            />
                                            {coastYears > 0 && (
                                                <ReferenceLine
                                                    x={coastStartYear}
                                                    stroke="#ed6c02"
                                                    strokeDasharray="4 4"
                                                    label={{ value: t("dcaEndInvestAge"), fill: "#ed6c02", fontSize: 11, position: "insideTopRight" }}
                                                />
                                            )}
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="balance"
                                                name={t("dcaChartBalance")}
                                                stroke="#1976d2"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="principal"
                                                name={t("dcaChartPrincipal")}
                                                stroke="#9c27b0"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            {/* Footer */}
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

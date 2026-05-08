"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SyncIcon from "@mui/icons-material/Sync";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as ReTooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";

const PIE_COLORS = ["#1976d2", "#9c27b0", "#ed6c02", "#2e7d32", "#d32f2f", "#0288d1", "#f57c00", "#00796b"];

const LS_KEY = "portfolio_state";

let nextHoldingId = 1;
let nextPortfolioId = 2;
let nextPlanItemId = 1;

interface Holding {
    id: number;
    name: string;
    amount: string;
    avgCost: string;
    currentPrice: string;
}

interface PlanItem {
    id: number;
    name: string;
    targetPct: string;
}

interface Portfolio {
    id: number;
    name: string;
    holdings: Holding[];
    planItems: PlanItem[];
    totalInvestment: string;
}

function makeHolding(): Holding {
    return { id: nextHoldingId++, name: "", amount: "", avgCost: "", currentPrice: "" };
}

function makePlanItem(): PlanItem {
    return { id: nextPlanItemId++, name: "", targetPct: "" };
}

function makePortfolio(name: string): Portfolio {
    return { id: nextPortfolioId++, name, holdings: [makeHolding()], planItems: [makePlanItem()], totalInvestment: "" };
}

function computeHolding(h: Holding) {
    const amountNum = parseFloat(h.amount) || 0;
    const avgCostNum = parseFloat(h.avgCost) || 0;
    const currentPriceNum = parseFloat(h.currentPrice) || 0;
    const totalCost = amountNum * avgCostNum;
    const value = amountNum * currentPriceNum;
    const pl = value - totalCost;
    const plPct = totalCost > 0 ? (pl / totalCost) * 100 : 0;
    return { totalCost, value, pl, plPct };
}

const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
const fmtWeight = (n: number) => `${n.toFixed(1)}%`;

export default function PortfolioPage() {
    const { t } = useLanguage();
    const { fmt, symbol } = useCurrency();

    const [mode, setMode] = useState<"tracker" | "planner">("tracker");
    const [portfolios, setPortfolios] = useState<Portfolio[]>([
        { id: 1, name: `${t("portfolioNewPortfolio")} 1`, holdings: [makeHolding()], planItems: [makePlanItem()], totalInvestment: "" },
    ]);
    const [activeId, setActiveId] = useState(1);
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
    const [errorIds, setErrorIds] = useState<Set<number>>(new Set());

    // Restore from localStorage after mount to avoid SSR hydration mismatch
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (Array.isArray(saved.portfolios)) {
                setPortfolios(saved.portfolios);
                // Advance ID counters past any restored IDs to prevent collisions
                for (const p of saved.portfolios) {
                    nextPortfolioId = Math.max(nextPortfolioId, p.id + 1);
                    for (const h of p.holdings ?? []) nextHoldingId = Math.max(nextHoldingId, h.id + 1);
                    for (const pi of p.planItems ?? []) nextPlanItemId = Math.max(nextPlanItemId, pi.id + 1);
                }
            }
            if (typeof saved.activeId === "number") setActiveId(saved.activeId);
            if (saved.mode === "tracker" || saved.mode === "planner") setMode(saved.mode);
        } catch {
            // ignore malformed data
        }
    }, []);

    // Persist whenever portfolios, active tab, or mode changes
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify({ portfolios, activeId, mode }));
    }, [portfolios, activeId, mode]);

    const activePortfolio = portfolios.find((p) => p.id === activeId) ?? portfolios[0];

    // ── Portfolio CRUD ─────────────────────────────────────────────
    function addPortfolio() {
        const newP = makePortfolio(`${t("portfolioNewPortfolio")} ${portfolios.length + 1}`);
        setPortfolios((prev) => [...prev, newP]);
        setActiveId(newP.id);
    }

    function removePortfolio(id: number) {
        if (portfolios.length === 1) return;
        setPortfolios((prev) => prev.filter((p) => p.id !== id));
        setActiveId((prev) => {
            if (prev !== id) return prev;
            const remaining = portfolios.filter((p) => p.id !== id);
            return remaining[0]?.id ?? portfolios[0].id;
        });
    }

    function renamePortfolio(id: number, name: string) {
        setPortfolios((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
    }

    // ── Holding CRUD ──────────────────────────────────────────────
    function updateHolding(portfolioId: number, holdingId: number, field: Exclude<keyof Holding, "id">, value: string) {
        setPortfolios((prev) =>
            prev.map((p) =>
                p.id !== portfolioId ? p : {
                    ...p,
                    holdings: p.holdings.map((h) => h.id === holdingId ? { ...h, [field]: value } : h),
                }
            )
        );
    }

    function addHolding(portfolioId: number) {
        setPortfolios((prev) =>
            prev.map((p) => p.id !== portfolioId ? p : { ...p, holdings: [...p.holdings, makeHolding()] })
        );
    }

    function removeHolding(portfolioId: number, holdingId: number) {
        setPortfolios((prev) =>
            prev.map((p) =>
                p.id !== portfolioId ? p : { ...p, holdings: p.holdings.filter((h) => h.id !== holdingId) }
            )
        );
    }

    async function fetchPrice(portfolioId: number, holdingId: number, tickerSymbol: string) {
        if (!tickerSymbol.trim()) return;
        setLoadingIds((prev) => new Set(prev).add(holdingId));
        setErrorIds((prev) => { const s = new Set(prev); s.delete(holdingId); return s; });
        try {
            const res = await fetch(`/api/stock-price?symbol=${encodeURIComponent(tickerSymbol.trim())}`);
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error);
            updateHolding(portfolioId, holdingId, "currentPrice", String(data.price));
        } catch {
            setErrorIds((prev) => new Set(prev).add(holdingId));
        } finally {
            setLoadingIds((prev) => { const s = new Set(prev); s.delete(holdingId); return s; });
        }
    }

    // ── Plan item CRUD ────────────────────────────────────────────
    function updatePlanItem(portfolioId: number, planItemId: number, field: Exclude<keyof PlanItem, "id">, value: string) {
        setPortfolios((prev) =>
            prev.map((p) =>
                p.id !== portfolioId ? p : {
                    ...p,
                    planItems: p.planItems.map((item) => item.id === planItemId ? { ...item, [field]: value } : item),
                }
            )
        );
    }

    function addPlanItem(portfolioId: number) {
        setPortfolios((prev) =>
            prev.map((p) => p.id !== portfolioId ? p : { ...p, planItems: [...p.planItems, makePlanItem()] })
        );
    }

    function removePlanItem(portfolioId: number, planItemId: number) {
        setPortfolios((prev) =>
            prev.map((p) =>
                p.id !== portfolioId ? p : { ...p, planItems: p.planItems.filter((item) => item.id !== planItemId) }
            )
        );
    }

    function setTotalInvestment(portfolioId: number, value: string) {
        setPortfolios((prev) => prev.map((p) => p.id !== portfolioId ? p : { ...p, totalInvestment: value }));
    }

    // ── Tracker computed ──────────────────────────────────────────
    const computed = activePortfolio.holdings.map((h) => ({ ...h, ...computeHolding(h) }));
    const totalValue = computed.reduce((sum, h) => sum + h.value, 0);
    const totalCost = computed.reduce((sum, h) => sum + h.totalCost, 0);
    const totalPL = totalValue - totalCost;
    const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

    const trackerPieData = computed
        .filter((h) => h.value > 0 && h.name)
        .map((h) => ({
            name: h.name,
            value: h.value,
            weight: totalValue > 0 ? (h.value / totalValue) * 100 : 0,
        }));

    // ── Planner computed ──────────────────────────────────────────
    const totalInvestmentNum = parseFloat(activePortfolio.totalInvestment) || 0;
    const planComputed = activePortfolio.planItems.map((item) => {
        const pct = parseFloat(item.targetPct) || 0;
        return { ...item, pct, requiredAmount: totalInvestmentNum * pct / 100 };
    });
    const totalTargetPct = planComputed.reduce((sum, item) => sum + item.pct, 0);
    const planPieData = planComputed
        .filter((item) => item.pct > 0 && item.name)
        .map((item) => ({ name: item.name, value: item.pct }));

    const moneyInput = (value: string, onChange: (v: string) => void, label: string) => (
        <TextField
            label={label}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            slotProps={{
                htmlInput: { min: 0, step: "any" },
                input: { startAdornment: <InputAdornment position="start">{symbol}</InputAdornment> },
            }}
            sx={{ minWidth: 130 }}
        />
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />

            <Container maxWidth="xl" sx={{ py: 6, flex: 1 }}>
                {/* Header */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 4, gap: 2 }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {t("portfolioTitle")}
                    </Typography>

                    {/* Tracker summary cards */}
                    {mode === "tracker" && (
                        <Stack direction="row" spacing={2}>
                            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, minWidth: 130 }}>
                                <CardContent sx={{ pb: "12px !important" }}>
                                    <Typography variant="caption" color="text.secondary">{t("portfolioTotalBalance")}</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{fmt(totalValue)}</Typography>
                                </CardContent>
                            </Card>
                            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, minWidth: 130 }}>
                                <CardContent sx={{ pb: "12px !important" }}>
                                    <Typography variant="caption" color="text.secondary">{t("portfolioTotalCost")}</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{fmt(totalCost)}</Typography>
                                </CardContent>
                            </Card>
                            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, minWidth: 130 }}>
                                <CardContent sx={{ pb: "12px !important" }}>
                                    <Typography variant="caption" color="text.secondary">{t("portfolioTotalPL")}</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: totalPL >= 0 ? "success.main" : "error.main" }}>
                                        {fmt(totalPL)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: totalPL >= 0 ? "success.main" : "error.main" }}>
                                        {fmtPct(totalPLPct)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                    )}

                    {/* Planner summary cards */}
                    {mode === "planner" && (
                        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, minWidth: 200 }}>
                                <CardContent sx={{ pb: "12px !important" }}>
                                    <Typography variant="caption" color="text.secondary">{t("portfolioPlanTotalInvestment")}</Typography>
                                    <TextField
                                        type="number"
                                        value={activePortfolio.totalInvestment}
                                        onChange={(e) => setTotalInvestment(activePortfolio.id, e.target.value)}
                                        variant="standard"
                                        size="small"
                                        slotProps={{
                                            htmlInput: { min: 0 },
                                            input: { startAdornment: <InputAdornment position="start">{symbol}</InputAdornment> },
                                        }}
                                        sx={{ mt: 0.5, display: "block" }}
                                    />
                                </CardContent>
                            </Card>
                            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, minWidth: 130 }}>
                                <CardContent sx={{ pb: "12px !important" }}>
                                    <Typography variant="caption" color="text.secondary">{t("portfolioTotalPct")}</Typography>
                                    <Stack direction="row" sx={{ alignItems: "center", gap: 1, mt: 0.5 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: Math.abs(totalTargetPct - 100) < 0.01 ? "success.main" : totalTargetPct > 100 ? "error.main" : "warning.main" }}>
                                            {totalTargetPct.toFixed(1)}%
                                        </Typography>
                                        {Math.abs(totalTargetPct - 100) >= 0.01 && (
                                            <Chip label={`${totalTargetPct > 100 ? "+" : ""}${(totalTargetPct - 100).toFixed(1)}%`} size="small" color={totalTargetPct > 100 ? "error" : "warning"} />
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, minWidth: 130 }}>
                                <CardContent sx={{ pb: "12px !important" }}>
                                    <Typography variant="caption" color="text.secondary">{t("portfolioTotalBalance")}</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{fmt(totalInvestmentNum)}</Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                    )}
                </Stack>

                {/* Portfolio tabs + mode toggle */}
                <Stack direction="row" sx={{ alignItems: "center", borderBottom: 1, borderColor: "divider", mb: 3 }}>
                    <Tabs
                        value={activeId}
                        onChange={(_e, val) => setActiveId(val)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ flex: 1 }}
                    >
                        {portfolios.map((p) => (
                            <Tab
                                key={p.id}
                                value={p.id}
                                label={
                                    <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                                        <TextField
                                            value={p.name}
                                            onChange={(e) => { e.stopPropagation(); renamePortfolio(p.id, e.target.value); }}
                                            onClick={(e) => e.stopPropagation()}
                                            variant="standard"
                                            size="small"
                                            slotProps={{ input: { disableUnderline: activeId !== p.id } }}
                                            sx={{ "& input": { fontSize: "0.875rem", fontWeight: activeId === p.id ? 700 : 400, cursor: "pointer", width: Math.max(60, p.name.length * 8) } }}
                                        />
                                        {portfolios.length > 1 && (
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); removePortfolio(p.id); }} sx={{ p: 0.25 }}>
                                                <CloseIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        )}
                                    </Stack>
                                }
                                sx={{ textTransform: "none", minHeight: 48 }}
                            />
                        ))}
                    </Tabs>
                    <Stack direction="row" sx={{ alignItems: "center", gap: 1, ml: 1 }}>
                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={mode}
                            onChange={(_e, val) => val && setMode(val)}
                            sx={{ "& .MuiToggleButton-root": { px: 1.5, py: 0.5, fontSize: "0.75rem", textTransform: "none" } }}
                        >
                            <ToggleButton value="tracker">{t("portfolioModeTracker")}</ToggleButton>
                            <ToggleButton value="planner">{t("portfolioModePlanner")}</ToggleButton>
                        </ToggleButtonGroup>
                        <Tooltip title={t("portfolioAddPortfolio")}>
                            <IconButton onClick={addPortfolio} size="small">
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* ── TRACKER MODE ─────────────────────────────────── */}
                {mode === "tracker" && (
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, lg: 8 }}>
                            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
                                <Box sx={{ overflowX: "auto" }}>
                                    <Table size="small" sx={{ minWidth: 680 }}>
                                        <TableHead>
                                            <TableRow sx={{ "& th": { fontWeight: 700, whiteSpace: "nowrap" } }}>
                                                <TableCell>{t("portfolioStockName")}</TableCell>
                                                <TableCell>{t("portfolioAmount")}</TableCell>
                                                <TableCell>{t("portfolioAvgCost")}</TableCell>
                                                <TableCell>{t("portfolioCurrentPrice")}</TableCell>
                                                <TableCell align="right">{t("portfolioValue")}</TableCell>
                                                <TableCell align="right">{t("portfolioPL")}</TableCell>
                                                <TableCell align="right">{t("portfolioPLPct")}</TableCell>
                                                <TableCell align="right">{t("portfolioWeight")}</TableCell>
                                                <TableCell />
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {computed.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                        {t("portfolioEmpty")}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                computed.map((h, i) => {
                                                    const weight = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
                                                    const color = PIE_COLORS[i % PIE_COLORS.length];
                                                    return (
                                                        <TableRow key={h.id} sx={{ "& td": { borderBottom: 1, borderColor: "divider" } }}>
                                                            <TableCell>
                                                                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                                                                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
                                                                    <TextField
                                                                        placeholder="AAPL"
                                                                        value={h.name}
                                                                        onChange={(e) => updateHolding(activePortfolio.id, h.id, "name", e.target.value)}
                                                                        size="small"
                                                                        variant="standard"
                                                                        sx={{ width: 90 }}
                                                                    />
                                                                    <Tooltip title={errorIds.has(h.id) ? t("portfolioPriceError") : t("portfolioFetchPrice")}>
                                                                        <span>
                                                                            <IconButton
                                                                                size="small"
                                                                                disabled={loadingIds.has(h.id) || !h.name.trim()}
                                                                                onClick={() => fetchPrice(activePortfolio.id, h.id, h.name)}
                                                                                sx={{ color: errorIds.has(h.id) ? "error.main" : "text.secondary" }}
                                                                            >
                                                                                {loadingIds.has(h.id) ? <CircularProgress size={14} /> : <SyncIcon sx={{ fontSize: 16 }} />}
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    type="number"
                                                                    value={h.amount}
                                                                    onChange={(e) => updateHolding(activePortfolio.id, h.id, "amount", e.target.value)}
                                                                    size="small"
                                                                    variant="standard"
                                                                    slotProps={{ htmlInput: { min: 0, step: "any" } }}
                                                                    sx={{ width: 80 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {moneyInput(h.avgCost, (v) => updateHolding(activePortfolio.id, h.id, "avgCost", v), t("portfolioAvgCost"))}
                                                            </TableCell>
                                                            <TableCell>
                                                                {moneyInput(h.currentPrice, (v) => updateHolding(activePortfolio.id, h.id, "currentPrice", v), t("portfolioCurrentPrice"))}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmt(h.value)}</Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" sx={{ color: h.pl >= 0 ? "success.main" : "error.main", fontWeight: 600 }}>
                                                                    {fmt(h.pl)}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" sx={{ color: h.plPct >= 0 ? "success.main" : "error.main" }}>
                                                                    {fmtPct(h.plPct)}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" color="text.secondary">{fmtWeight(weight)}</Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Tooltip title="Remove">
                                                                    <IconButton size="small" onClick={() => removeHolding(activePortfolio.id, h.id)}>
                                                                        <DeleteOutlineIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    <Tooltip title={t("portfolioAddStock")}>
                                        <IconButton onClick={() => addHolding(activePortfolio.id)} color="primary">
                                            <AddCircleOutlineIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, lg: 4 }}>
                            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, height: "100%" }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t("portfolioAllocation")}</Typography>
                                    {trackerPieData.length === 0 ? (
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "text.secondary" }}>
                                            <Typography variant="body2">{t("portfolioEmpty")}</Typography>
                                        </Box>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={320}>
                                            <PieChart>
                                                <Pie data={trackerPieData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={60} outerRadius={110} paddingAngle={2}>
                                                    {trackerPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                                </Pie>
                                                <ReTooltip formatter={(value, name) => [fmt(Number(value)), String(name)]} />
                                                <Legend formatter={(name, entry) => `${name} ${fmtWeight((entry.payload as { weight: number }).weight)}`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* ── PLANNER MODE ─────────────────────────────────── */}
                {mode === "planner" && (
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, lg: 8 }}>
                            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
                                <Box sx={{ overflowX: "auto" }}>
                                    <Table size="small" sx={{ minWidth: 420 }}>
                                        <TableHead>
                                            <TableRow sx={{ "& th": { fontWeight: 700, whiteSpace: "nowrap" } }}>
                                                <TableCell>{t("portfolioStockName")}</TableCell>
                                                <TableCell align="right">{t("portfolioTargetPct")}</TableCell>
                                                <TableCell align="right">{t("portfolioRequiredAmount")}</TableCell>
                                                <TableCell />
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {planComputed.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                        {t("portfolioPlanEmpty")}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                planComputed.map((item, i) => {
                                                    const color = PIE_COLORS[i % PIE_COLORS.length];
                                                    return (
                                                        <TableRow key={item.id} sx={{ "& td": { borderBottom: 1, borderColor: "divider" } }}>
                                                            <TableCell>
                                                                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                                                                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
                                                                    <TextField
                                                                        placeholder="AAPL"
                                                                        value={item.name}
                                                                        onChange={(e) => updatePlanItem(activePortfolio.id, item.id, "name", e.target.value)}
                                                                        size="small"
                                                                        variant="standard"
                                                                        sx={{ width: 100 }}
                                                                    />
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <TextField
                                                                    type="number"
                                                                    value={item.targetPct}
                                                                    onChange={(e) => updatePlanItem(activePortfolio.id, item.id, "targetPct", e.target.value)}
                                                                    size="small"
                                                                    variant="standard"
                                                                    slotProps={{
                                                                        htmlInput: { min: 0, max: 100, step: 0.1 },
                                                                        input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                                                                    }}
                                                                    sx={{ width: 90 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {totalInvestmentNum > 0 ? fmt(item.requiredAmount) : "—"}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Tooltip title="Remove">
                                                                    <IconButton size="small" onClick={() => removePlanItem(activePortfolio.id, item.id)}>
                                                                        <DeleteOutlineIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}

                                            {/* Total row */}
                                            {planComputed.length > 0 && (
                                                <TableRow sx={{ bgcolor: "action.hover" }}>
                                                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: Math.abs(totalTargetPct - 100) < 0.01 ? "success.main" : totalTargetPct > 100 ? "error.main" : "warning.main" }}>
                                                            {totalTargetPct.toFixed(1)}%
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                            {totalInvestmentNum > 0 ? fmt(totalInvestmentNum) : "—"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell />
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    <Tooltip title={t("portfolioAddStock")}>
                                        <IconButton onClick={() => addPlanItem(activePortfolio.id)} color="primary">
                                            <AddCircleOutlineIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, lg: 4 }}>
                            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, height: "100%" }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t("portfolioAllocation")}</Typography>
                                    {planPieData.length === 0 ? (
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "text.secondary" }}>
                                            <Typography variant="body2">{t("portfolioPlanEmpty")}</Typography>
                                        </Box>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={320}>
                                            <PieChart>
                                                <Pie data={planPieData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={60} outerRadius={110} paddingAngle={2}>
                                                    {planPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                                </Pie>
                                                <ReTooltip formatter={(value, name) => [`${Number(value).toFixed(1)}%`, String(name)]} />
                                                <Legend formatter={(name, entry) => `${name} ${fmtWeight((entry.payload as { value: number }).value)}`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Container>

            <Box component="footer" sx={{ py: 3, textAlign: "center", borderTop: 1, borderColor: "divider" }}>
                <Typography variant="body2" color="text.secondary">
                    © {new Date().getFullYear()} {t("appTitle")} — {t("footerRights")}
                </Typography>
            </Box>
        </Box>
    );
}

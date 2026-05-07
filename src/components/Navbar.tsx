"use client";

import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    Tooltip,
    Select,
    MenuItem,
    SelectChangeEvent,
    Button,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, Language } from "@/context/LanguageContext";

const LANGUAGES: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "th", label: "TH" },
];

const NAV_LINKS = [
    { href: "/", labelKey: "navHome" },
    { href: "/dca", labelKey: "navDCA" },
];

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { t, language, setLanguage } = useLanguage();
    const pathname = usePathname();

    return (
        <AppBar position="sticky" elevation={0} color="default" sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Toolbar sx={{ justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TrendingUpIcon color="primary" />
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        {NAV_LINKS.map(({ href, labelKey }) => (
                            <Button
                                key={href}
                                component={Link}
                                href={href}
                                size="small"
                                color={pathname === href ? "primary" : "inherit"}
                                sx={{ fontWeight: pathname === href ? 700 : 400 }}
                            >
                                {t(labelKey)}
                            </Button>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Select
                        size="small"
                        value={language}
                        onChange={(e: SelectChangeEvent) => setLanguage(e.target.value as Language)}
                        sx={{ fontSize: "0.875rem" }}
                    >
                        {LANGUAGES.map(({ code, label }) => (
                            <MenuItem key={code} value={code}>
                                {label}
                            </MenuItem>
                        ))}
                    </Select>
                    <Tooltip title={theme === "dark" ? "Light mode" : "Dark mode"}>
                        <IconButton onClick={toggleTheme}>
                            {theme === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

"use client";

import { useState } from "react";
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
  ToggleButtonGroup,
  ToggleButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useCurrency, Currency } from "@/context/CurrencyContext";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "th", label: "TH" },
];

const NAV_LINKS = [
  { href: "/", labelKey: "navHome" },
  { href: "/dca", labelKey: "navDCA" },
  { href: "/tax", labelKey: "navTax" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const pathname = usePathname();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"), {
    defaultMatches: true,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="default"
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isMobile && (
            <IconButton
              edge="start"
              aria-label={t("navMenu")}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          {!isMobile && (
            <Box
              component={Link}
              href="/"
              aria-label={t("navHome")}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <TrendingUpIcon color="primary" />
            </Box>
          )}
          {!isMobile && (
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
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={currency}
            onChange={(_e, val) => val && setCurrency(val as Currency)}
            sx={{
              "& .MuiToggleButton-root": {
                px: 1.5,
                py: 0.5,
                fontSize: "0.75rem",
                fontWeight: 600,
              },
            }}
          >
            <ToggleButton value="THB">THB</ToggleButton>
            <ToggleButton value="USD">USD</ToggleButton>
          </ToggleButtonGroup>
          <Select
            size="small"
            value={language}
            onChange={(e: SelectChangeEvent) =>
              setLanguage(e.target.value as Language)
            }
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

      <Drawer
        anchor="left"
        open={drawerOpen && isMobile}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <Box
            component={Link}
            href="/"
            aria-label={t("navHome")}
            onClick={() => setDrawerOpen(false)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <TrendingUpIcon color="primary" />
          </Box>
          <List>
            {NAV_LINKS.map(({ href, labelKey }) => (
              <ListItem key={href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={href}
                  selected={pathname === href}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText
                    primary={t(labelKey)}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: pathname === href ? 700 : 400,
                          color: pathname === href ? "primary.main" : "inherit",
                        },
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

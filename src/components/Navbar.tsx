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
  ListItemIcon,
  ListItemText,
  Menu,
  Collapse,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useCurrency, Currency } from "@/context/CurrencyContext";
import { NAV_LINKS, type NavItem } from "@/constants/navLinks";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "th", label: "TH" },
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
  const [financeMenuAnchor, setFinanceMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [financeSubmenuOpen, setFinanceSubmenuOpen] = useState(false);

  // A parent with children is "active" when its own route or any child route
  // is the current path.
  const isItemActive = (item: NavItem) =>
    pathname === item.href ||
    (item.children?.some((child) => pathname === child.href) ?? false);

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
              aria-label={t("appTitle")}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <TrendingUpIcon color="primary" />
            </Box>
          )}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {NAV_LINKS.map((item) => {
                const active = isItemActive(item);
                const Icon = item.icon;
                if (item.children) {
                  return (
                    <Box key={item.href}>
                      <Button
                        size="small"
                        color={active ? "primary" : "inherit"}
                        onClick={(e) => setFinanceMenuAnchor(e.currentTarget)}
                        startIcon={<Icon fontSize="small" />}
                        endIcon={<ArrowDropDownIcon />}
                        sx={{ fontWeight: active ? 700 : 400 }}
                      >
                        {t(item.labelKey)}
                      </Button>
                      <Menu
                        anchorEl={financeMenuAnchor}
                        open={Boolean(financeMenuAnchor)}
                        onClose={() => setFinanceMenuAnchor(null)}
                      >
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <MenuItem
                              key={child.href}
                              component={Link}
                              href={child.href}
                              selected={pathname === child.href}
                              onClick={() => setFinanceMenuAnchor(null)}
                            >
                              <ListItemIcon>
                                <ChildIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText>{t(child.labelKey)}</ListItemText>
                            </MenuItem>
                          );
                        })}
                      </Menu>
                    </Box>
                  );
                }
                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    size="small"
                    color={active ? "primary" : "inherit"}
                    startIcon={<Icon fontSize="small" />}
                    sx={{ fontWeight: active ? 700 : 400 }}
                  >
                    {t(item.labelKey)}
                  </Button>
                );
              })}
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
            aria-label={t("appTitle")}
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
            {NAV_LINKS.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;
              if (item.children) {
                return (
                  <Box key={item.href}>
                    <ListItem disablePadding>
                      <ListItemButton
                        selected={active}
                        onClick={() => setFinanceSubmenuOpen((prev) => !prev)}
                      >
                        <ListItemIcon>
                          <Icon />
                        </ListItemIcon>
                        <ListItemText
                          primary={t(item.labelKey)}
                          slotProps={{
                            primary: {
                              sx: {
                                fontWeight: active ? 700 : 400,
                                color: active ? "primary.main" : "inherit",
                              },
                            },
                          }}
                        />
                        {financeSubmenuOpen ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </ListItemButton>
                    </ListItem>
                    <Collapse
                      in={financeSubmenuOpen}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List disablePadding>
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <ListItem key={child.href} disablePadding>
                              <ListItemButton
                                component={Link}
                                href={child.href}
                                selected={pathname === child.href}
                                onClick={() => setDrawerOpen(false)}
                                sx={{ pl: 4 }}
                              >
                                <ListItemIcon>
                                  <ChildIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={t(child.labelKey)}
                                  slotProps={{
                                    primary: {
                                      sx: {
                                        fontWeight:
                                          pathname === child.href ? 700 : 400,
                                        color:
                                          pathname === child.href
                                            ? "primary.main"
                                            : "inherit",
                                      },
                                    },
                                  }}
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                  </Box>
                );
              }
              return (
                <ListItem key={item.href} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={active}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ListItemIcon>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={t(item.labelKey)}
                      slotProps={{
                        primary: {
                          sx: {
                            fontWeight: active ? 700 : 400,
                            color: active ? "primary.main" : "inherit",
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

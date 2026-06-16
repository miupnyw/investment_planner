"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "@/lib/theme";
import { notifyStorage, subscribeStorage } from "@/lib/persistentStore";

// Define the shape of our theme context value
type ThemeMode = "light" | "dark";

// Define the theme interface
interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
}

// Create the theme context with a default value of null
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Read the active theme from localStorage, falling back to the OS preference.
function getThemeSnapshot(): ThemeMode {
  const stored = localStorage.getItem("theme") as ThemeMode | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// The server has no localStorage; render light to match the first paint.
function getThemeServerSnapshot(): ThemeMode {
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Subscribe to the theme stored in localStorage. useSyncExternalStore reads
  // getServerSnapshot during SSR/hydration and switches to getThemeSnapshot
  // afterwards, so there's no hydration mismatch and no setState-in-effect.
  const theme = useSyncExternalStore(
    subscribeStorage,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  // Keep the document class in sync with the current theme (external DOM).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Toggling writes to localStorage and notifies subscribers, which re-reads
  // the snapshot and re-renders.
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    notifyStorage();
  }

  return (
    // Provide the theme context value to the component tree
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

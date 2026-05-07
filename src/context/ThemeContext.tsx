"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "@/lib/theme";

// Define the shape of our theme context value
type ThemeMode = "light" | "dark";

// Define the theme interface
interface ThemeContextValue {
    theme: ThemeMode;
    toggleTheme: () => void;
}

// Create the theme context with a default value of null
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // State to hold the current theme mode
    const [theme, setTheme] = useState<ThemeMode>("light");

    // On component mount, 
    // check for stored theme preference or system preference
    useEffect(() => {
        const stored = localStorage.getItem("theme") as ThemeMode | null;
        const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setTheme(stored ?? preferred);
    }, []);

    // Whenever the theme changes, 
    // update the document class and localStorage
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Function to toggle between light and dark themes
    function toggleTheme() {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
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

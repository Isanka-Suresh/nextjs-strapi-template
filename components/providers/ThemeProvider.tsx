"use client";

import { useEffect, useState, createContext, useContext } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read theme from DOM attribute that was already set by the blocking
  // inline script in layout.tsx. This avoids the mounted-guard pattern
  // that caused FOUC.
  const [theme, setTheme] = useState<Theme>(() => {
    // Server-side: default to light (will sync on client immediately)
    if (typeof window === "undefined") return "light";
    return (document.documentElement.getAttribute("data-theme") as Theme) ?? "light";
  });

  // Sync DOM attribute and localStorage when theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // localStorage unavailable in some contexts
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

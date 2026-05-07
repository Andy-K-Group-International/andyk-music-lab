"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("andyk-ml-theme") as Theme) ?? "dark";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("andyk-ml-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : "dark", toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

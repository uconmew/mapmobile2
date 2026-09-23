"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateTheme = () => {
      let resolved: "light" | "dark" = "dark";
      
      if (theme === "system") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        resolved = theme;
      }
      
      if (resolved === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    };

    updateTheme();
    localStorage.setItem("theme", theme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const cycleTheme = () => {
    if (theme === "system") setThemeState("light");
    else if (theme === "light") setThemeState("dark");
    else setThemeState("system");
  };

  if (!mounted) {
    return (
      <div className="p-2 rounded-xl bg-white/5 border border-white/10 w-9 h-9" />
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      aria-label="Toggle theme"
      title={`Theme: ${theme}`}
    >
      <div className="relative w-5 h-5">
        {theme === "light" && (
          <Sun className="h-5 w-5 text-amber-500 transition-all" />
        )}
        {theme === "dark" && (
          <Moon className="h-5 w-5 text-blue-400 transition-all" />
        )}
        {theme === "system" && (
          <Monitor className="h-5 w-5 text-foreground/60 transition-all" />
        )}
      </div>
    </button>
  );
}

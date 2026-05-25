"use client";

import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/store/useThemeStore";

type ThemeProviderProps = {
  children: ReactNode;
};

/** Keeps `document.documentElement` in sync when theme preference is `system`. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setPreference("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference, setPreference]);

  return children;
}

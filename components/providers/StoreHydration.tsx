"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";

/** Runs once on the client — same as Vite `main.tsx` store hydration. */
export function StoreHydration() {
  useEffect(() => {
    useThemeStore.getState().hydrate();
    useAuthStore.getState().hydrate();
  }, []);

  return null;
}

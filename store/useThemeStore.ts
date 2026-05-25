import { create } from "zustand";
import {
  applyResolvedTheme,
  getStoredThemePreference,
  resolveTheme,
  setStoredThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  hydrate: () => void;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
}

function commit(
  preference: ThemePreference,
): Pick<ThemeState, "preference" | "resolved"> {
  setStoredThemePreference(preference);
  const resolved = resolveTheme(preference);
  applyResolvedTheme(resolved);
  return { preference, resolved };
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: "system",
  resolved: "light",
  hydrate: () => set(commit(getStoredThemePreference())),
  setPreference: (preference) => set(commit(preference)),
  toggle: () => {
    const next: ThemePreference = get().resolved === "dark" ? "light" : "dark";
    set(commit(next));
  },
}));

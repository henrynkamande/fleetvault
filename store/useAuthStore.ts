import { create } from "zustand";
import {
  clearTokens,
  getAccessToken,
  setTokens,
} from "@/lib/tokenStorage";
import type { JwtTokens } from "@/types/auth";

/**
 * Session flag + invalidation `version` so components re-check `localStorage` after login/logout.
 */
interface AuthState {
  ready: boolean;
  version: number;
  setSession: (tokens: JwtTokens) => void;
  clearSession: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  ready: false,
  version: 0,
  setSession: (tokens) => {
    setTokens(tokens.access, tokens.refresh);
    set((s) => ({ version: s.version + 1, ready: true }));
  },
  clearSession: () => {
    clearTokens();
    set((s) => ({ version: s.version + 1 }));
  },
  hydrate: () =>
    set((s) => ({
      ready: true,
      version: getAccessToken() ? s.version + 1 : s.version,
    })),
}));

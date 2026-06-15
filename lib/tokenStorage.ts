import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./constants";

const SESSION_EXPIRES_AT_KEY = "fleetflow_session_expires_at";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

function isSessionExpired(): boolean {
  if (typeof window === "undefined") return false;
  const expiresAt = Number(localStorage.getItem(SESSION_EXPIRES_AT_KEY));
  return Number.isFinite(expiresAt) && Date.now() >= expiresAt;
}

function clearExpiredSession(): boolean {
  if (!isSessionExpired()) return false;
  clearTokens();
  return true;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  if (clearExpiredSession()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  if (clearExpiredSession()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

type SetTokensOptions = {
  resetExpiresAt?: boolean;
};

export function setTokens(
  access: string,
  refresh: string,
  options: SetTokensOptions = {},
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  if (options.resetExpiresAt || !localStorage.getItem(SESSION_EXPIRES_AT_KEY)) {
    localStorage.setItem(
      SESSION_EXPIRES_AT_KEY,
      String(Date.now() + SESSION_DURATION_MS),
    );
  }
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(SESSION_EXPIRES_AT_KEY);
}

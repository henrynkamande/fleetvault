import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/tokenStorage";
import { apiBaseUrl } from "@/lib/httpClient/config";

type InternalConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  _retry?: boolean;
};

let refreshChain: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return null;
  }
  try {
    const res = await axios.post<{
      tokens: { access: string; refresh: string };
    }>(
      `${apiBaseUrl}/auth/token/refresh/`,
      { refresh },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json; version=1.0",
        },
      },
    );
    const { access, refresh: nextRefresh } = res.data.tokens;
    setTokens(access, nextRefresh);
    return access;
  } catch {
    clearTokens();
    return null;
  }
}

function getRefreshedAccess(): Promise<string | null> {
  if (!refreshChain) {
    refreshChain = refreshAccessToken().finally(() => {
      refreshChain = null;
    });
  }
  return refreshChain;
}

/** Authenticated axios for other Django mounts (`vehicles/api`, `trips/api`, …). */
export function createFleetApiClient(baseURL: string) {
  const instance = axios.create({
    baseURL: baseURL.replace(/\/$/, ""),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json; version=1.0",
    },
  });

  instance.interceptors.request.use((config) => {
    const cfg = config as InternalConfig;
    if (!cfg.skipAuth) {
      const token = getAccessToken();
      if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as InternalConfig | undefined;
      if (!original || original.skipAuth || original._retry) {
        return Promise.reject(error);
      }
      if (error.response?.status !== 401) {
        return Promise.reject(error);
      }
      if (original.url?.includes("/auth/token/refresh/")) {
        clearTokens();
        return Promise.reject(error);
      }

      const newAccess = await getRefreshedAccess();
      if (!newAccess) {
        return Promise.reject(error);
      }

      original._retry = true;
      original.headers.Authorization = `Bearer ${newAccess}`;
      return instance.request(original);
    },
  );

  return instance;
}

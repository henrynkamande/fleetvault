import { apiBaseUrl } from "@/lib/httpClient/config";

/** Derives `http://host:port` from `NEXT_PUBLIC_API_URL`. */
export function getApiOrigin(): string {
  const raw = apiBaseUrl;
  if (raw.includes("/users/api")) {
    return raw.replace(/\/users\/api$/, "");
  }
  return raw;
}

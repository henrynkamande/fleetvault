"use client";

import { usePathname } from "next/navigation";
import { DRIVER_APP_ENABLED, DRIVER_LIVE_API } from "@/lib/constants";
import { isDriverStaticPreviewEnabled } from "@/lib/driverStaticPreview";
import { getAccessToken } from "@/lib/tokenStorage";

/**
 * Static demo UI on `/driver/*` (no driver API / role redirect).
 * In dev, driver routes use demo data by default unless `NEXT_PUBLIC_DRIVER_LIVE_API=true`.
 */
export function useDriverStaticPreview(): boolean {
  const pathname = usePathname() ?? "";
  if (!DRIVER_APP_ENABLED) return false;
  const onDriverRoute = pathname.startsWith("/driver");
  if (!onDriverRoute) return false;
  if (DRIVER_LIVE_API) return false;
  if (process.env.NODE_ENV === "development") return true;
  if (!getAccessToken()) return isDriverStaticPreviewEnabled();
  return isDriverStaticPreviewEnabled();
}

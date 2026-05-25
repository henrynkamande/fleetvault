import { DRIVER_APP_ENABLED } from "@/lib/constants";

/** When true, driver routes render with demo data (no API / auth required). */
export function isDriverStaticPreviewEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_DRIVER_STATIC_PREVIEW === "true") return true;
  try {
    return localStorage.getItem("fleetflow-driver-static-preview") === "1";
  } catch {
    return false;
  }
}

export function enableDriverStaticPreview(): void {
  if (!DRIVER_APP_ENABLED) return;
  try {
    localStorage.setItem("fleetflow-driver-static-preview", "1");
  } catch {
    /* ignore */
  }
}

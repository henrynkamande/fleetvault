import { AppRoutesPaths } from "@/route/paths";

export type DriverAppPage =
  | "dashboard"
  | "trips"
  | "activeTrip"
  | "vehicle"
  | "documents"
  | "profile"
  | "settings";

export function driverPageToPath(page: DriverAppPage): string {
  switch (page) {
    case "dashboard":
      return AppRoutesPaths.driver.root;
    case "trips":
      return AppRoutesPaths.driver.trips;
    case "activeTrip":
      return AppRoutesPaths.driver.activeTrip;
    case "vehicle":
      return AppRoutesPaths.driver.vehicle;
    case "documents":
      return AppRoutesPaths.driver.documents;
    case "profile":
      return AppRoutesPaths.driver.profile;
    case "settings":
      return AppRoutesPaths.driver.settings;
  }
}

export function resolveActiveDriverPage(pathname: string): DriverAppPage {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === AppRoutesPaths.driver.root) return "dashboard";
  if (path === AppRoutesPaths.driver.activeTrip) return "activeTrip";
  if (path.startsWith(`${AppRoutesPaths.driver.trips}/`)) {
    if (path === AppRoutesPaths.driver.activeTrip) return "activeTrip";
    return "trips";
  }
  if (path === AppRoutesPaths.driver.trips) return "trips";
  if (path === AppRoutesPaths.driver.vehicle) return "vehicle";
  if (path === AppRoutesPaths.driver.documents) return "documents";
  if (path === AppRoutesPaths.driver.profile) return "profile";
  if (path === AppRoutesPaths.driver.settings) return "settings";

  return "dashboard";
}

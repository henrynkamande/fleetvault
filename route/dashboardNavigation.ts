import type { AppPage } from "@/types/dashboard";
import { AppRoutesPaths } from "@/route/paths";

export function appPageToPath(page: AppPage): string {
  switch (page) {
    case "dashboard":
      return AppRoutesPaths.dashboard.root;
    case "vehicles":
      return AppRoutesPaths.dashboard.vehicles;
    case "drivers":
      return AppRoutesPaths.dashboard.drivers;
    case "trips":
      return AppRoutesPaths.dashboard.trips;
    case "income":
      return AppRoutesPaths.dashboard.income;
    case "expenses":
      return AppRoutesPaths.dashboard.expenses;
    case "reports":
      return AppRoutesPaths.dashboard.reports;
    case "settings":
      return AppRoutesPaths.dashboard.settings;
  }
}

/** Map current URL to sidebar section (supports nested profile routes). */
export function resolveActiveAppPage(pathname: string): AppPage {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === AppRoutesPaths.dashboard.root) return "dashboard";
  if (
    path.startsWith(`${AppRoutesPaths.dashboard.vehicles}/`) ||
    path === AppRoutesPaths.dashboard.vehicles
  ) {
    return "vehicles";
  }
  if (
    path.startsWith(`${AppRoutesPaths.dashboard.drivers}/`) ||
    path === AppRoutesPaths.dashboard.drivers
  ) {
    return "drivers";
  }
  if (
    path.startsWith(`${AppRoutesPaths.dashboard.trips}/`) ||
    path === AppRoutesPaths.dashboard.trips
  ) {
    return "trips";
  }
  if (
    path.startsWith(`${AppRoutesPaths.dashboard.income}/`) ||
    path === AppRoutesPaths.dashboard.income
  ) {
    return "income";
  }
  if (
    path.startsWith(`${AppRoutesPaths.dashboard.expenses}/`) ||
    path === AppRoutesPaths.dashboard.expenses
  ) {
    return "expenses";
  }
  if (
    path.startsWith(`${AppRoutesPaths.dashboard.reports}/`) ||
    path === AppRoutesPaths.dashboard.reports
  ) {
    return "reports";
  }
  if (
    path.startsWith(`${AppRoutesPaths.dashboard.settings}/`) ||
    path === AppRoutesPaths.dashboard.settings
  ) {
    return "settings";
  }

  return "dashboard";
}

export function isAppPageActive(pathname: string, page: AppPage): boolean {
  return resolveActiveAppPage(pathname) === page;
}

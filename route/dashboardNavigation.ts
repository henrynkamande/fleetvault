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
    case "admin-overview":
      return AppRoutesPaths.dashboard.root;
    case "admin-users":
      return AppRoutesPaths.dashboard.admin.users;
    case "admin-vehicles":
      return AppRoutesPaths.dashboard.admin.vehicles;
    case "admin-subscriptions":
      return AppRoutesPaths.dashboard.admin.subscriptions;
    case "admin-system-expenses":
      return AppRoutesPaths.dashboard.admin.systemExpenses;
    case "admin-settings":
      return AppRoutesPaths.dashboard.admin.settings;
    case "admin-blog":
      return AppRoutesPaths.dashboard.admin.blog;
  }
}

const ADMIN_PREFIX = "/dashboard/admin";

export function isAdminDashboardPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === AppRoutesPaths.dashboard.root) {
    return false;
  }
  return path.startsWith(ADMIN_PREFIX);
}

/** Map current URL to sidebar section (supports nested profile routes). */
export function resolveActiveAppPage(
  pathname: string,
  role?: string | null,
): AppPage {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (role === "PLATFORM_ADMIN" && path === AppRoutesPaths.dashboard.root) {
    return "admin-overview";
  }

  if (path.startsWith(`${AppRoutesPaths.dashboard.admin.companies}/`)) {
    return "admin-overview";
  }
  if (path === AppRoutesPaths.dashboard.admin.users) return "admin-users";
  if (path === AppRoutesPaths.dashboard.admin.vehicles) return "admin-vehicles";
  if (
    path === AppRoutesPaths.dashboard.admin.subscriptions ||
    path === AppRoutesPaths.dashboard.admin.billing
  ) {
    return "admin-subscriptions";
  }
  if (path === AppRoutesPaths.dashboard.admin.systemExpenses) {
    return "admin-system-expenses";
  }
  if (path === AppRoutesPaths.dashboard.admin.settings) return "admin-settings";
  if (path === AppRoutesPaths.dashboard.admin.blog) return "admin-blog";

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

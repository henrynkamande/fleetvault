import type { AppPage } from "@/types/dashboard";

export type DashboardPageMeta = {
  pageTitle: string;
  showPeriodFilter: boolean;
};

const DEFAULT_META: Record<AppPage, DashboardPageMeta> = {
  dashboard: { pageTitle: "Dashboard Overview", showPeriodFilter: true },
  vehicles: { pageTitle: "Vehicle Management", showPeriodFilter: false },
  drivers: { pageTitle: "Driver Management", showPeriodFilter: false },
  trips: { pageTitle: "Trip Management", showPeriodFilter: false },
  income: { pageTitle: "Income Management", showPeriodFilter: false },
  expenses: { pageTitle: "Expense Management", showPeriodFilter: true },
  reports: { pageTitle: "P&L Reports", showPeriodFilter: true },
  settings: { pageTitle: "System Settings", showPeriodFilter: false },
};

export function getDashboardPageMeta(
  pathname: string,
  page: AppPage,
): DashboardPageMeta {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path.includes("/vehicles/profile/")) {
    return { pageTitle: "Vehicle profile", showPeriodFilter: false };
  }
  const driversBase = "/dashboard/drivers";
  if (path.startsWith(`${driversBase}/`) && path !== driversBase) {
    return { pageTitle: "Driver profile", showPeriodFilter: false };
  }
  const tripsBase = "/dashboard/trips";
  if (path.startsWith(`${tripsBase}/`) && path !== tripsBase) {
    return { pageTitle: "Trip details", showPeriodFilter: false };
  }
  return DEFAULT_META[page];
}

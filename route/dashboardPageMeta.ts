import type { AppPage } from "@/types/dashboard";
import { isAdminAppPage } from "@/types/dashboard";

export type DashboardPageMeta = {
  pageTitle: string;
  showPeriodFilter: boolean;
};

const FLEET_META: Record<
  Extract<AppPage, "dashboard" | "vehicles" | "drivers" | "trips" | "income" | "expenses" | "reports" | "settings">,
  DashboardPageMeta
> = {
  dashboard: { pageTitle: "Dashboard Overview", showPeriodFilter: true },
  vehicles: { pageTitle: "Vehicle Management", showPeriodFilter: false },
  drivers: { pageTitle: "Driver Management", showPeriodFilter: false },
  trips: { pageTitle: "Trip Management", showPeriodFilter: false },
  income: { pageTitle: "Income Management", showPeriodFilter: false },
  expenses: { pageTitle: "Expense Management", showPeriodFilter: true },
  reports: { pageTitle: "P&L Reports", showPeriodFilter: true },
  settings: { pageTitle: "System Settings", showPeriodFilter: false },
};

const ADMIN_META: Record<
  Extract<
    AppPage,
    | "admin-overview"
    | "admin-users"
    | "admin-vehicles"
    | "admin-subscriptions"
    | "admin-system-expenses"
    | "admin-settings"
    | "admin-blog"
  >,
  DashboardPageMeta
> = {
  "admin-overview": { pageTitle: "Dashboard", showPeriodFilter: true },
  "admin-users": { pageTitle: "Users", showPeriodFilter: false },
  "admin-vehicles": { pageTitle: "Vehicles", showPeriodFilter: false },
  "admin-subscriptions": { pageTitle: "Subscriptions & Payments", showPeriodFilter: false },
  "admin-system-expenses": { pageTitle: "System Expenses", showPeriodFilter: false },
  "admin-settings": { pageTitle: "Settings", showPeriodFilter: false },
  "admin-blog": { pageTitle: "Blog", showPeriodFilter: false },
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
  if (path.startsWith(`${"/dashboard/admin/companies"}/`) && path !== "/dashboard/admin/companies") {
    return { pageTitle: "Company", showPeriodFilter: true };
  }
  if (isAdminAppPage(page)) {
    return ADMIN_META[page];
  }
  return FLEET_META[page as keyof typeof FLEET_META];
}

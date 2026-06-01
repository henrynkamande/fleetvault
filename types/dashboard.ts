export type FleetAppPage =
  | "dashboard"
  | "vehicles"
  | "drivers"
  | "trips"
  | "income"
  | "expenses"
  | "reports"
  | "settings";

export type AdminAppPage =
  | "admin-overview"
  | "admin-users"
  | "admin-vehicles"
  | "admin-subscriptions"
  | "admin-system-expenses"
  | "admin-settings";

export type AppPage = FleetAppPage | AdminAppPage;

export function isAdminAppPage(page: AppPage): page is AdminAppPage {
  return page.startsWith("admin-");
}

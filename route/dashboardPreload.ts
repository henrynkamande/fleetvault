import type { AppPage } from "@/types/dashboard";

/** Warm route chunks before navigation (Next.js dynamic imports). */
export function preloadDashboardPage(page: AppPage): void {
  switch (page) {
    case "dashboard":
      void import("@/features/dashboard/user/Dashboard");
      break;
    case "vehicles":
      void import("@/features/dashboard/user/Vehicles");
      break;
    case "drivers":
      void import("@/features/dashboard/user/Drivers");
      break;
    case "trips":
      void import("@/features/dashboard/user/Trips");
      break;
    case "income":
      void import("@/features/dashboard/user/Income");
      break;
    case "expenses":
      void import("@/features/dashboard/user/Expenses");
      break;
    case "reports":
      void import("@/features/dashboard/user/PLReports");
      break;
    case "settings":
      void import("@/features/dashboard/user/Settings");
      break;
    case "admin-overview":
      void import("@/features/dashboard/admin/AdminOverview");
      break;
    case "admin-companies":
      void import("@/features/dashboard/admin/AdminCompanies");
      break;
    default:
      break;
  }
}

import type { AppPage } from "@/types/dashboard";

/** Warm route chunks before navigation (Next.js dynamic imports). */
export function preloadDashboardPage(page: AppPage): void {
  switch (page) {
    case "dashboard":
      void import("@/features/dashboard/Dashboard");
      break;
    case "vehicles":
      void import("@/features/dashboard/Vehicles");
      break;
    case "drivers":
      void import("@/features/dashboard/Drivers");
      break;
    case "trips":
      void import("@/features/dashboard/Trips");
      break;
    case "income":
      void import("@/features/dashboard/Income");
      break;
    case "expenses":
      void import("@/features/dashboard/Expenses");
      break;
    case "reports":
      void import("@/features/dashboard/PLReports");
      break;
    case "settings":
      void import("@/features/dashboard/Settings");
      break;
    default:
      break;
  }
}

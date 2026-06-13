import type { QueryClient } from "@tanstack/react-query";
import { dashboardOverviewQueryKey } from "@/hooks/queries/useDashboardOverview";
import { financeQueryKey } from "@/hooks/queries/useFinanceReports";
import { listStaleTime } from "@/lib/queryKeys";
import { getAccessToken } from "@/lib/tokenStorage";
import { contentAdminApi } from "@/lib/contentApi";
import { platformApi } from "@/lib/platformApi";
import {
  fetchDashboardOverview,
  fetchExpensesReport,
  fetchIncomeReport,
  fetchPlReport,
} from "@/services/financeService";
import { listCompanyUsers } from "@/services/companyUsersService";
import { listCustomers } from "@/services/customerService";
import { listTrips } from "@/services/tripService";
import { listVehicles } from "@/services/vehicleService";
import { useAuthStore } from "@/store/useAuthStore";
import type { AppPage } from "@/types/dashboard";
import type { FinancePeriodPreset, FinanceQueryParams } from "@/types/finance";
import type { PlatformOverview } from "@/types/platform";

export type DashboardPrefetchContext = {
  period?: FinancePeriodPreset;
};

function scheduleIdle(run: () => void, timeout = 2500): void {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(run, { timeout });
  } else {
    setTimeout(run, 400);
  }
}

function authReadyForPrefetch(): boolean {
  return useAuthStore.getState().ready && !!getAccessToken();
}

function authVersion(): number {
  return useAuthStore.getState().version;
}

/** Warm React Query cache for a dashboard section (pair with route chunk preload). */
export function prefetchDashboardPageData(
  queryClient: QueryClient,
  page: AppPage,
  ctx: DashboardPrefetchContext = {},
): void {
  if (!authReadyForPrefetch()) return;

  const period = ctx.period ?? "30d";
  const version = authVersion();

  switch (page) {
    case "dashboard":
      void queryClient.prefetchQuery({
        queryKey: [...dashboardOverviewQueryKey({ period }), version],
        queryFn: () => fetchDashboardOverview({ period }),
        staleTime: 30_000,
      });
      break;
    case "vehicles":
      void queryClient.prefetchQuery({
        queryKey: ["vehicles", { page: 1 }],
        queryFn: () => listVehicles({ page: 1 }),
        staleTime: listStaleTime.vehicles,
      });
      break;
    case "drivers":
      void queryClient.prefetchQuery({
        queryKey: ["companyUsers", "DRIVER", "list", version],
        queryFn: () => listCompanyUsers({ role: "DRIVER" }),
        staleTime: listStaleTime.drivers,
      });
      void queryClient.prefetchQuery({
        queryKey: ["vehicles", { page: 1 }],
        queryFn: () => listVehicles({ page: 1 }),
        staleTime: listStaleTime.vehicles,
      });
      break;
    case "customers":
      void queryClient.prefetchQuery({
        queryKey: ["customers", "list", "", version],
        queryFn: () => listCustomers(undefined),
        staleTime: listStaleTime.customers,
      });
      break;
    case "trips":
      void queryClient.prefetchQuery({
        queryKey: ["trips", "list", "all", version],
        queryFn: () => listTrips(undefined),
        staleTime: listStaleTime.trips,
      });
      break;
    case "income": {
      const params: FinanceQueryParams = { period: "90d" };
      void queryClient.prefetchQuery({
        queryKey: financeQueryKey("income", params),
        queryFn: () => fetchIncomeReport(params),
        staleTime: 60_000,
      });
      break;
    }
    case "expenses": {
      const params: FinanceQueryParams = {
        period: "90d",
        granularity: "monthly",
      };
      void queryClient.prefetchQuery({
        queryKey: financeQueryKey("expenses", params),
        queryFn: () => fetchExpensesReport(params),
        staleTime: 60_000,
      });
      break;
    }
    case "reports": {
      const params: FinanceQueryParams = { period: "ytd" };
      void queryClient.prefetchQuery({
        queryKey: financeQueryKey("pl", params),
        queryFn: () => fetchPlReport(params),
        staleTime: 60_000,
      });
      break;
    }
    case "admin-overview":
      void queryClient.prefetchQuery({
        queryKey: ["platform", "overview", period],
        queryFn: async () => {
          const res = await platformApi.get<PlatformOverview>("/overview/", {
            params: { period },
          });
          return res.data;
        },
        staleTime: 60_000,
      });
      break;
    case "admin-users":
      void queryClient.prefetchQuery({
        queryKey: ["platform", "users", { page: 1, role: "FLEET_OWNER" }],
        queryFn: async () => {
          const res = await platformApi.get("/users/", {
            params: { page: 1, role: "FLEET_OWNER" },
          });
          return res.data;
        },
        staleTime: 60_000,
      });
      break;
    case "admin-vehicles":
      void queryClient.prefetchQuery({
        queryKey: ["platform", "vehicles", { page: 1 }],
        queryFn: async () => {
          const res = await platformApi.get("/vehicles/", { params: { page: 1 } });
          return res.data;
        },
        staleTime: 60_000,
      });
      break;
    case "admin-subscriptions":
      void queryClient.prefetchQuery({
        queryKey: ["platform", "subscriptions", { page: 1 }],
        queryFn: async () => {
          const res = await platformApi.get("/subscriptions/", {
            params: { page: 1 },
          });
          return res.data;
        },
        staleTime: 60_000,
      });
      break;
    case "admin-system-expenses":
      void queryClient.prefetchQuery({
        queryKey: ["platform", "system-expenses", { page: 1 }],
        queryFn: async () => {
          const res = await platformApi.get("/system-expenses/", {
            params: { page: 1 },
          });
          return res.data;
        },
        staleTime: 60_000,
      });
      break;
    case "admin-blog":
      void queryClient.prefetchQuery({
        queryKey: ["content", "admin", "posts", { page: 1, page_size: 50 }],
        queryFn: async () => {
          const res = await contentAdminApi.get("/admin/posts/", {
            params: { page: 1, page_size: 50 },
          });
          return res.data;
        },
        staleTime: 60_000,
      });
      break;
    default:
      break;
  }
}

export function getNextLikelyDashboardPage(
  page: AppPage,
  role: string | undefined,
): AppPage | null {
  if (role === "PLATFORM_ADMIN") {
    switch (page) {
      case "admin-overview":
        return "admin-users";
      case "admin-users":
        return "admin-vehicles";
      case "admin-vehicles":
        return "admin-subscriptions";
      default:
        return "admin-overview";
    }
  }

  switch (page) {
    case "dashboard":
      return "trips";
    case "trips":
      return "vehicles";
    case "vehicles":
      return "drivers";
    case "drivers":
      return "customers";
    case "customers":
      return "trips";
    case "income":
      return "reports";
    case "expenses":
      return "reports";
    case "reports":
      return "income";
    case "settings":
      return "dashboard";
    default:
      return "dashboard";
  }
}

/** Low-priority warm for the next likely page only, after the current page is usable. */
export function prefetchNextLikelyDashboardPage(
  queryClient: QueryClient,
  role: string | undefined,
  currentPage: AppPage,
  ctx: DashboardPrefetchContext = {},
): void {
  if (!authReadyForPrefetch()) return;

  const nextPage = getNextLikelyDashboardPage(currentPage, role);
  if (!nextPage || nextPage === currentPage) return;

  scheduleIdle(() => prefetchDashboardPageData(queryClient, nextPage, ctx));
}

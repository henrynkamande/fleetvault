"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBillingStatus } from "@/hooks/queries/useBilling";
import { useCurrentUser } from "@/hooks/queries/useUsers";
import { DRIVER_APP_ENABLED } from "@/lib/constants";
import { fleetDashboardSignInUrl } from "@/lib/fleetEntry";
import { getAccessToken } from "@/lib/tokenStorage";
import { AppRoutesPaths } from "@/route/paths";
import { isAdminDashboardPath } from "@/route/dashboardNavigation";

const BILLING_EXEMPT_PREFIXES = [
  AppRoutesPaths.onboarding.startTrial,
  AppRoutesPaths.onboarding.billingSuccess,
];

const FLEET_ONLY_PREFIXES = [
  AppRoutesPaths.dashboard.vehicles,
  AppRoutesPaths.dashboard.drivers,
  AppRoutesPaths.dashboard.trips,
  AppRoutesPaths.dashboard.income,
  AppRoutesPaths.dashboard.expenses,
  AppRoutesPaths.dashboard.reports,
  AppRoutesPaths.dashboard.settings,
];

function isFleetOnlyPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return FLEET_ONLY_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
      Loading…
    </div>
  );
}

export default function FleetOwnerRouteGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const userQuery = useCurrentUser();
  const billingQuery = useBillingStatus();
  const hasToken = !!getAccessToken();
  const billingExempt = BILLING_EXEMPT_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );
  const role = userQuery.data?.role;
  const isPlatformAdmin = role === "PLATFORM_ADMIN";
  const isDriver = role === "DRIVER";

  useEffect(() => {
    if (!hasToken) {
      router.replace(fleetDashboardSignInUrl());
      return;
    }
    if (userQuery.isError && !userQuery.data) {
      router.replace(fleetDashboardSignInUrl());
      return;
    }
    if (isDriver) {
      router.replace(
        DRIVER_APP_ENABLED
          ? AppRoutesPaths.driver.root
          : AppRoutesPaths.driverAppUnavailable,
      );
      return;
    }
    if (isPlatformAdmin) {
      if (!isAdminDashboardPath(pathname) && isFleetOnlyPath(pathname)) {
        router.replace(AppRoutesPaths.dashboard.root);
      }
      return;
    }
    if (role === "FLEET_OWNER" && isAdminDashboardPath(pathname)) {
      router.replace(AppRoutesPaths.dashboard.root);
      return;
    }
    if (
      role === "FLEET_OWNER" &&
      !billingExempt &&
      billingQuery.data?.requires_checkout &&
      billingQuery.data?.stripe_configured
    ) {
      router.replace(AppRoutesPaths.onboarding.startTrial);
    }
  }, [
    hasToken,
    userQuery.isError,
    userQuery.data,
    role,
    isPlatformAdmin,
    isDriver,
    billingQuery.data,
    billingExempt,
    pathname,
    router,
  ]);

  if (!hasToken) return <LoadingScreen />;
  if (userQuery.isLoading && !userQuery.data) return <LoadingScreen />;
  if (userQuery.isError && !userQuery.data) return <LoadingScreen />;
  if (isDriver) return <LoadingScreen />;
  if (isPlatformAdmin && isFleetOnlyPath(pathname)) return <LoadingScreen />;
  if (role === "FLEET_OWNER" && isAdminDashboardPath(pathname)) return <LoadingScreen />;
  if (
    role === "FLEET_OWNER" &&
    !billingExempt &&
    billingQuery.data?.requires_checkout &&
    billingQuery.data?.stripe_configured
  ) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

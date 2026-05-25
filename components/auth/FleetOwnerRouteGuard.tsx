"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBillingStatus } from "@/hooks/queries/useBilling";
import { useCurrentUser } from "@/hooks/queries/useUsers";
import { DRIVER_APP_ENABLED } from "@/lib/constants";
import { getAccessToken } from "@/lib/tokenStorage";
import { AppRoutesPaths } from "@/route/paths";

const BILLING_EXEMPT_PREFIXES = [
  AppRoutesPaths.onboarding.startTrial,
  AppRoutesPaths.onboarding.billingSuccess,
];

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

  useEffect(() => {
    if (!hasToken) {
      router.replace(AppRoutesPaths.auth.signin);
      return;
    }
    if (userQuery.isError && !userQuery.data) {
      router.replace(AppRoutesPaths.auth.signin);
      return;
    }
    if (userQuery.data?.role === "DRIVER") {
      router.replace(
        DRIVER_APP_ENABLED
          ? AppRoutesPaths.driver.root
          : AppRoutesPaths.driverAppUnavailable,
      );
      return;
    }
    if (
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
    billingQuery.data,
    billingExempt,
    router,
  ]);

  if (!hasToken) return <LoadingScreen />;
  if (userQuery.isLoading && !userQuery.data) return <LoadingScreen />;

  if (userQuery.isError && !userQuery.data) return <LoadingScreen />;

  if (userQuery.data?.role === "DRIVER") return <LoadingScreen />;

  if (
    !billingExempt &&
    billingQuery.data?.requires_checkout &&
    billingQuery.data?.stripe_configured
  ) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/queries/useUsers";
import { getAccessToken } from "@/lib/tokenStorage";
import { AppRoutesPaths } from "@/route/paths";

export default function PlatformGuestRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const userQuery = useCurrentUser();
  const hasToken = !!getAccessToken();

  useEffect(() => {
    if (hasToken && userQuery.data?.role === "PLATFORM_ADMIN") {
      router.replace(AppRoutesPaths.dashboard.root);
    }
  }, [hasToken, userQuery.data, router]);

  if (hasToken && userQuery.data?.role === "PLATFORM_ADMIN") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-600">
        Redirecting…
      </div>
    );
  }

  return children;
}

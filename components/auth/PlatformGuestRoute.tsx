"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCurrentUser } from "@/hooks/queries/useUsers";
import { getAccessToken } from "@/lib/tokenStorage";
import { AppRoutesPaths } from "@/route/paths";
import { useAuthStore } from "@/store/useAuthStore";

export default function PlatformGuestRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);
  const userQuery = useCurrentUser();
  const hasToken = !!getAccessToken();

  const isVerifiedPlatformAdmin =
    userQuery.isSuccess && userQuery.data?.role === "PLATFORM_ADMIN";

  useEffect(() => {
    if (isVerifiedPlatformAdmin) {
      router.replace(AppRoutesPaths.dashboard.root);
    }
  }, [isVerifiedPlatformAdmin, router]);

  useEffect(() => {
    if (!hasToken || !userQuery.isError) return;
    clearSession();
    queryClient.removeQueries({ queryKey: ["currentUser"] });
  }, [hasToken, userQuery.isError, clearSession, queryClient]);

  if (!hasToken) {
    return children;
  }

  if (userQuery.isPending || userQuery.isFetching) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-600">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isVerifiedPlatformAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-600">
        Redirecting…
      </div>
    );
  }

  return children;
}

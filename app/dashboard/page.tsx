"use client";

import { LazyAdminOverview, LazyDashboard } from "@/lib/lazyDashboardPage";
import { useCurrentUser } from "@/hooks/queries/useUsers";
import { LoadingState } from "@/components/ui/LoadingSpinner"

export default function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading && !user) {
    return (
      <LoadingState />
    );
  }

  if (user?.role === "PLATFORM_ADMIN") {
    return <LazyAdminOverview />;
  }

  return <LazyDashboard />;
}

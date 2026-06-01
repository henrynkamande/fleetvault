"use client";

import Dashboard from "@/features/dashboard/user/Dashboard";
import AdminOverview from "@/features/dashboard/admin/AdminOverview";
import { useCurrentUser } from "@/hooks/queries/useUsers";
import { LoadingCard, LoadingSpinner, LoadingState } from "@/components/ui/LoadingSpinner"

export default function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading && !user) {
    return (
      <LoadingState />
    );
  }

  if (user?.role === "PLATFORM_ADMIN") {
    return <AdminOverview />;
  }

  return <Dashboard />;
}

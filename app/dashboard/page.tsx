"use client";

import Dashboard from "@/features/dashboard/user/Dashboard";
import AdminOverview from "@/features/dashboard/admin/AdminOverview";
import { useCurrentUser } from "@/hooks/queries/useUsers";

export default function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading && !user) {
    return (
      <p className="text-slate-600 dark:text-slate-400">Loading dashboard…</p>
    );
  }

  if (user?.role === "PLATFORM_ADMIN") {
    return <AdminOverview />;
  }

  return <Dashboard />;
}

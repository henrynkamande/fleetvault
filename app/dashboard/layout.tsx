"use client";

import FleetOwnerRouteGuard from "@/components/auth/FleetOwnerRouteGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-1 flex-col">
      <FleetOwnerRouteGuard>
        <DashboardShell>{children}</DashboardShell>
      </FleetOwnerRouteGuard>
    </div>
  );
}

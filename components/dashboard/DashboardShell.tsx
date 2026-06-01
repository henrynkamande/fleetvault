"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardPeriodProvider } from "@/context/DashboardPeriodContext";
import DashboardLayout from "@/features/dashboard/DashboardLayout";
import { useCurrentUser } from "@/hooks/queries/useUsers";
import { resolveActiveAppPage } from "@/route/dashboardNavigation";
import { getDashboardPageMeta } from "@/route/dashboardPageMeta";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const userQuery = useCurrentUser();
  const activePage = resolveActiveAppPage(pathname, userQuery.data?.role);
  const meta = getDashboardPageMeta(pathname, activePage);

  return (
    <DashboardPeriodProvider>
      <DashboardLayout
        pageTitle={meta.pageTitle}
        activeItem={activePage}
        showPeriodFilter={meta.showPeriodFilter}
      >
        {children}
      </DashboardLayout>
    </DashboardPeriodProvider>
  );
}

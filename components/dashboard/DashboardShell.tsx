"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardPeriodProvider } from "@/context/DashboardPeriodContext";
import DashboardLayout from "@/features/dashboard/DashboardLayout";
import { appPageToPath, resolveActiveAppPage } from "@/route/dashboardNavigation";
import { getDashboardPageMeta } from "@/route/dashboardPageMeta";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const activePage = resolveActiveAppPage(pathname);
  const meta = getDashboardPageMeta(pathname, activePage);

  return (
    <DashboardPeriodProvider>
      <DashboardLayout
        pageTitle={meta.pageTitle}
        activeItem={activePage}
        showPeriodFilter={meta.showPeriodFilter}
        onNavigate={(page) => router.push(appPageToPath(page))}
      >
        {children}
      </DashboardLayout>
    </DashboardPeriodProvider>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/tokenStorage";
import { fleetDashboardSignInUrl } from "@/lib/fleetEntry";
import { AppRoutesPaths } from "@/route/paths";

/** Legacy /fleet URL — same behavior as Fleet nav (dashboard or auth). */
export default function FleetEntryPage() {
  const router = useRouter();

  useEffect(() => {
    if (getAccessToken()) {
      router.replace(AppRoutesPaths.dashboard.root);
    } else {
      router.replace(fleetDashboardSignInUrl());
    }
  }, [router]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#F9F9F9] text-slate-600">
      Redirecting…
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { dismissFleetSwal } from "@/lib/fleetAlert";

/** Prevent modals/alerts from blocking navigation after the URL changes. */
export function useRouteChangeCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    void dismissFleetSwal();
  }, [pathname]);
}

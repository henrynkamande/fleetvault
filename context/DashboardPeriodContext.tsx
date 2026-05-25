"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FinancePeriodPreset } from "@/types/finance";

type DashboardPeriodContextValue = {
  period: FinancePeriodPreset;
  setPeriod: (period: FinancePeriodPreset) => void;
};

const DashboardPeriodContext =
  createContext<DashboardPeriodContextValue | null>(null);

export function DashboardPeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<FinancePeriodPreset>("30d");
  const value = useMemo(() => ({ period, setPeriod }), [period]);
  return (
    <DashboardPeriodContext.Provider value={value}>
      {children}
    </DashboardPeriodContext.Provider>
  );
}

export function useDashboardPeriod() {
  const ctx = useContext(DashboardPeriodContext);
  if (!ctx) {
    throw new Error(
      "useDashboardPeriod must be used within DashboardPeriodProvider",
    );
  }
  return ctx;
}

export function useDashboardPeriodOptional() {
  return useContext(DashboardPeriodContext);
}

import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platformApi";
import type { PlatformOverview } from "@/types/platform";
import type { FinancePeriodPreset } from "@/types/finance";

export function usePlatformOverview(period: FinancePeriodPreset = "30d") {
  return useQuery({
    queryKey: ["platform", "overview", period],
    queryFn: async () => {
      const res = await platformApi.get<PlatformOverview>("/overview/", {
        params: { period },
      });
      return res.data;
    },
    staleTime: 60_000,
  });
}

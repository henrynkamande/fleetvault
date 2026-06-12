import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platformApi";
import type { PlatformSubscriptionRow } from "@/types/platform";

type SubscriptionsResponse = {
  count: number;
  page: number;
  page_size: number;
  summary: {
    active: number;
    trialing: number;
    pending_payment: number;
    mrr: number;
    outstanding_revenue: number;
  };
  results: PlatformSubscriptionRow[];
};

export function usePlatformSubscriptions(params?: {
  page?: number;
  search?: string;
  billing_status?: string;
}) {
  return useQuery({
    queryKey: ["platform", "subscriptions", params],
    queryFn: async () => {
      const res = await platformApi.get<SubscriptionsResponse>("/subscriptions/", {
        params,
      });
      return res.data;
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

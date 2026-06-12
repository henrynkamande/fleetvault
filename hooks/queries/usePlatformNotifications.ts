import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platformApi";
import type { PlatformNotification, PlatformPaginated } from "@/types/platform";

export function usePlatformNotifications(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ["platform", "notifications", params],
    queryFn: async () => {
      const res = await platformApi.get<PlatformPaginated<PlatformNotification>>(
        "/notifications/",
        { params },
      );
      return res.data;
    },
    staleTime: 30_000,
  });
}

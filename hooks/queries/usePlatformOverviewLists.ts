import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platformApi";
import type {
  PlatformPaginated,
  PlatformRecentActivity,
  PlatformRecentSignup,
} from "@/types/platform";

export function usePlatformRecentSignups(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ["platform", "overview", "signups", params],
    queryFn: async () => {
      const res = await platformApi.get<PlatformPaginated<PlatformRecentSignup>>(
        "/overview/signups/",
        { params },
      );
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function usePlatformRecentActivity(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ["platform", "overview", "activity", params],
    queryFn: async () => {
      const res = await platformApi.get<PlatformPaginated<PlatformRecentActivity>>(
        "/overview/activity/",
        { params },
      );
      return res.data;
    },
    staleTime: 60_000,
  });
}

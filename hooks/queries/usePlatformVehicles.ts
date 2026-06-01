import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platformApi";
import type { PlatformVehicleListItem } from "@/types/platform";

type VehiclesResponse = {
  count: number;
  page: number;
  page_size: number;
  stats: {
    total: number;
    active: number;
    inactive: number;
    maintenance: number;
  };
  results: PlatformVehicleListItem[];
};

export function usePlatformVehicles(params?: {
  page?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["platform", "vehicles", params],
    queryFn: async () => {
      const res = await platformApi.get<VehiclesResponse>("/vehicles/", { params });
      return res.data;
    },
  });
}

export function usePlatformVehicleDetail(vehicleId: string | null) {
  return useQuery({
    queryKey: ["platform", "vehicles", vehicleId],
    enabled: !!vehicleId,
    queryFn: async () => {
      const res = await platformApi.get<PlatformVehicleListItem>(
        `/vehicles/${vehicleId}/`,
      );
      return res.data;
    },
  });
}

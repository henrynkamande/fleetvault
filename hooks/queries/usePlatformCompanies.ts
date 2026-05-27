import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platformApi";
import type { PlatformCompanyListItem } from "@/types/platform";

type CompaniesResponse = {
  count: number;
  page: number;
  page_size: number;
  results: PlatformCompanyListItem[];
};

export function usePlatformCompanies(params?: {
  page?: number;
  search?: string;
  billing_status?: string;
}) {
  return useQuery({
    queryKey: ["platform", "companies", params],
    queryFn: async () => {
      const res = await platformApi.get<CompaniesResponse>("/companies/", {
        params,
      });
      return res.data;
    },
  });
}

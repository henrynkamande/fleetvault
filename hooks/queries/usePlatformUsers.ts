import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/platformApi";
import type { PlatformUserListItem } from "@/types/platform";

type UsersResponse = {
  count: number;
  page: number;
  page_size: number;
  results: PlatformUserListItem[];
};

export function usePlatformUsers(params?: {
  page?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}) {
  return useQuery({
    queryKey: ["platform", "users", params],
    queryFn: async () => {
      const res = await platformApi.get<UsersResponse>("/users/", { params });
      return res.data;
    },
  });
}

export function usePlatformUserStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      is_active,
    }: {
      userId: string;
      is_active: boolean;
    }) => {
      const res = await platformApi.patch<PlatformUserListItem>(
        `/users/${userId}/`,
        { is_active },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform", "users"] });
    },
  });
}

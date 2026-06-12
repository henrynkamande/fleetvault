import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  contentAdminApi,
  type AdminBlogPost,
  type AdminBlogPostInput,
} from "@/lib/contentApi";

type AdminPostsResponse = {
  count: number;
  results: AdminBlogPost[];
};

export function useAdminBlogPosts(params?: { page?: number; page_size?: number; status?: string }) {
  return useQuery({
    queryKey: ["content", "admin", "posts", params],
    queryFn: async () => {
      const res = await contentAdminApi.get<AdminPostsResponse>("/admin/posts/", { params });
      return res.data;
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useCreateBlogPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminBlogPostInput) => {
      const res = await contentAdminApi.post<AdminBlogPost>("/admin/posts/", payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["content", "admin", "posts"] });
    },
  });
}

export function useUpdateBlogPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<AdminBlogPostInput>;
    }) => {
      const res = await contentAdminApi.patch<AdminBlogPost>(`/admin/posts/${id}/`, payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["content", "admin", "posts"] });
    },
  });
}

export function useDeleteBlogPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await contentAdminApi.delete(`/admin/posts/${id}/`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["content", "admin", "posts"] });
    },
  });
}

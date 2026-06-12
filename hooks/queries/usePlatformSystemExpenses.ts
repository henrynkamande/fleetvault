import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/platformApi";
import type { PlatformSystemExpense } from "@/types/platform";

type ExpensesResponse = {
  count: number;
  page: number;
  page_size: number;
  summary: {
    total_expenses: number;
    expenses_this_month: number;
    expenses_this_year: number;
    average_monthly_expense: number;
  };
  results: PlatformSystemExpense[];
};

export type PlatformExpenseInput = {
  name: string;
  description?: string;
  category: string;
  amount: string | number;
  recorded_at: string;
};


function platformExpensePayload(payload: PlatformExpenseInput) {
  return {
    name: payload.name,
    category: payload.category,
    amount: payload.amount,
    recorded_at: payload.recorded_at,
  };
}

export function usePlatformSystemExpenses(params?: {
  page?: number;
  search?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: ["platform", "system-expenses", params],
    queryFn: async () => {
      const res = await platformApi.get<ExpensesResponse>("/system-expenses/", {
        params,
      });
      return res.data;
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function usePlatformExpenseMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["platform", "system-expenses"] });
  };

  const create = useMutation({
    mutationFn: async (payload: PlatformExpenseInput) => {
      const res = await platformApi.post<PlatformSystemExpense>(
        "/system-expenses/",
        platformExpensePayload(payload),
      );
      return res.data;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: PlatformExpenseInput & { id: string }) => {
      const res = await platformApi.patch<PlatformSystemExpense>(
        `/system-expenses/${id}/`,
        platformExpensePayload(payload),
      );
      return res.data;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await platformApi.delete(`/system-expenses/${id}/`);
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

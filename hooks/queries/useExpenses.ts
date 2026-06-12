import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import expensesApi from "@/lib/expensesApi";
import type { Expense, ExpenseInput, ExpenseListParams, ExpenseListResponse } from "@/types/expense";

export const expensesQueryKey = (params?: ExpenseListParams) => ["expenses", params] as const;

export function useExpenses(params?: ExpenseListParams) {
  return useQuery({
    queryKey: expensesQueryKey(params),
    queryFn: async () => {
      const res = await expensesApi.get<ExpenseListResponse>("/", { params });
      return res.data;
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useExpenseMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["expenses"] });
    void queryClient.invalidateQueries({ queryKey: ["finance"] });
  };

  const create = useMutation({
    mutationFn: async (payload: ExpenseInput) => {
      const res = await expensesApi.post<{ message: string; expense: Expense }>("/create/", payload);
      return res.data.expense;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<ExpenseInput> & { id: string }) => {
      const res = await expensesApi.patch<{ message: string; expense: Expense }>(`/${id}/`, payload);
      return res.data.expense;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await expensesApi.delete(`/${id}/`);
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchExpensesReport, fetchIncomeReport, fetchPlReport } from '@/services/financeService'
import type { FinanceQueryParams } from '@/types/finance'

export function financeQueryKey(scope: string, params?: FinanceQueryParams) {
  return ['finance', scope, params ?? {}] as const
}

export function useIncomeReportQuery(params?: FinanceQueryParams) {
  return useQuery({
    queryKey: financeQueryKey('income', params),
    queryFn: () => fetchIncomeReport(params),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}

export function useExpensesReportQuery(params?: FinanceQueryParams) {
  return useQuery({
    queryKey: financeQueryKey('expenses', params),
    queryFn: () => fetchExpensesReport(params),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}

export function usePlReportQuery(params?: FinanceQueryParams) {
  return useQuery({
    queryKey: financeQueryKey('pl', params),
    queryFn: () => fetchPlReport(params),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}

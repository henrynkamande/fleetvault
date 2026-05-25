import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/tokenStorage'
import { fetchDashboardOverview } from '@/services/financeService'
import { useAuthStore } from '@/store/useAuthStore'
import type { FinanceQueryParams } from '@/types/finance'

export function dashboardOverviewQueryKey(params?: FinanceQueryParams) {
  return ['dashboard', 'overview', params ?? {}] as const
}

export function useDashboardOverviewQuery(params?: FinanceQueryParams) {
  const ready = useAuthStore((s) => s.ready)
  const version = useAuthStore((s) => s.version)
  void version

  return useQuery({
    queryKey: [...dashboardOverviewQueryKey(params), version],
    queryFn: () => fetchDashboardOverview(params),
    enabled: ready && !!getAccessToken(),
    staleTime: 30_000,
  })
}

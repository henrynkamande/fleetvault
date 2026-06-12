import { useQuery } from '@tanstack/react-query'
import { listStaleTime } from '@/lib/queryKeys'
import { fetchCompany } from '@/services/companyService'
import { useCurrentUser } from './useUsers'

/**
 * Internal fleet workspace details used for billing and tenant-scoped data.
 * Fleet owners get a workspace automatically; there is no separate company creation step.
 */
export function useCompany(options: { enabled?: boolean } = {}) {
  const userQuery = useCurrentUser()
  const enabled = options.enabled ?? true

  return useQuery({
    queryKey: ['company'],
    queryFn: fetchCompany,
    enabled:
      enabled &&
      userQuery.isSuccess &&
      (!!userQuery.data?.has_company || userQuery.data?.role === 'FLEET_OWNER'),
    staleTime: listStaleTime.settings,
  })
}

import { useQuery } from '@tanstack/react-query'
import { fetchCompany } from '@/services/companyService'
import { useCurrentUser } from './useUsers'

/**
 * Company details for the authenticated user’s tenant.
 * Runs only when `currentUser` is loaded and `has_company` is true (avoids expected 404 noise).
 */
export function useCompany() {
  const userQuery = useCurrentUser()

  return useQuery({
    queryKey: ['company'],
    queryFn: fetchCompany,
    enabled:
      userQuery.isSuccess &&
      (!!userQuery.data?.has_company || userQuery.data?.role === 'FLEET_OWNER'),
    staleTime: 60_000,
  })
}

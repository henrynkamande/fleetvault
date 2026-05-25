import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/tokenStorage'
import { listCompanyDrivers } from '@/services/driverAssignmentService'

/** For fleet-owner vehicle forms (assign driver). Uses `GET /users/drivers/`. */
export function useCompanyDriversQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['companyDrivers', 'active'],
    queryFn: () => listCompanyDrivers({ is_active: 'true' }),
    enabled: enabled && !!getAccessToken(),
    staleTime: 60_000,
  })
}

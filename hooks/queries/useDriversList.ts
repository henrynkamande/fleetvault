import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/tokenStorage'
import { listStaleTime } from '@/lib/queryKeys'
import { listCompanyUsers } from '@/services/companyUsersService'
import { useAuthStore } from '@/store/useAuthStore'

/** Fleet owner: all driver users in the company (for driver management grid). */
export function useDriversListQuery() {
  const ready = useAuthStore((s) => s.ready)
  const version = useAuthStore((s) => s.version)
  void version

  return useQuery({
    queryKey: ['companyUsers', 'DRIVER', 'list', version],
    queryFn: () => listCompanyUsers({ role: 'DRIVER' }),
    enabled: ready && !!getAccessToken(),
    staleTime: listStaleTime.drivers,
  })
}

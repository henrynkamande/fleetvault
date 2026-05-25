import { useQuery } from '@tanstack/react-query'
import { getCompanyUser } from '@/services/companyUsersService'

export function useCompanyUserQuery(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['companyUser', userId],
    queryFn: () => getCompanyUser(userId!),
    enabled: enabled && !!userId,
    staleTime: 30_000,
  })
}

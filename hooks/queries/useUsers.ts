import { useQuery } from '@tanstack/react-query'
import { listStaleTime } from '@/lib/queryKeys'
import { getAccessToken } from '@/lib/tokenStorage'
import { fetchCurrentUser } from '@/services/userService'
import { useAuthStore } from '@/store/useAuthStore'

export function useCurrentUser() {
  const ready = useAuthStore((s) => s.ready)
  const version = useAuthStore((s) => s.version)
  void version

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    enabled: ready && !!getAccessToken(),
    staleTime: listStaleTime.settings,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403) return false
      return failureCount < 1
    },
  })
}

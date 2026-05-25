import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/tokenStorage'
import { listTrips } from '@/services/tripService'
import { useAuthStore } from '@/store/useAuthStore'
import type { TripApiStatus } from '@/types/trip'

export function useTripsListQuery(filters?: { status?: TripApiStatus }) {
  const ready = useAuthStore((s) => s.ready)
  const version = useAuthStore((s) => s.version)
  void version

  return useQuery({
    queryKey: ['trips', 'list', filters?.status ?? 'all', version],
    queryFn: () => listTrips(filters?.status ? { status: filters.status } : undefined),
    enabled: ready && !!getAccessToken(),
    staleTime: 30_000,
  })
}

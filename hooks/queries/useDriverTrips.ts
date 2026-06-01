import { useQuery } from '@tanstack/react-query'
import { STATIC_DRIVER_TRIPS } from '@/features/driver/driverStaticData'
import { useDriverStaticPreview } from '../useDriverStaticPreview'
import { listTrips } from '@/services/tripService'
import { getAccessToken } from '@/lib/tokenStorage'
import { useAuthStore } from '@/store/useAuthStore'

export function useDriverTripsQuery(status?: string) {
  const staticPreview = useDriverStaticPreview()
  const ready = useAuthStore((s) => s.ready)

  return useQuery({
    queryKey: ['driverTrips', status ?? 'all'],
    queryFn: () => listTrips(status ? { status } : undefined),
    enabled: ready && !!getAccessToken() && !staticPreview,
    staleTime: 15_000,
    select: (data) => {
      let trips = data.trips
      if (status) trips = trips.filter((t) => t.status === status)
      return {
        count: trips.length,
        page: data.page,
        page_size: data.page_size,
        total_pages: data.total_pages,
        trips,
      }
    },
    initialData: staticPreview
      ? {
          count: STATIC_DRIVER_TRIPS.filter((t) => (status ? t.status === status : true)).length,
          page: 1,
          page_size: 20,
          total_pages: 1,
          trips: STATIC_DRIVER_TRIPS.filter((t) => (status ? t.status === status : true)),
        }
      : undefined,
  })
}

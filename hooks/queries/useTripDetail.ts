import { useQuery } from '@tanstack/react-query'
import { getTrip } from '@/services/tripService'

export function useTripDetailQuery(tripRef: string | undefined) {
  return useQuery({
    queryKey: ['trips', 'detail', tripRef],
    queryFn: () => getTrip(tripRef!),
    enabled: !!tripRef,
    staleTime: 30_000,
  })
}

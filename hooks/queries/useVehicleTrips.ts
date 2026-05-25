import { useQuery } from '@tanstack/react-query'
import { listTrips } from '@/services/tripService'

export function useVehicleTripsQuery(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ['trips', 'vehicle', vehicleId],
    queryFn: () => listTrips({ vehicle: vehicleId! }),
    enabled: !!vehicleId,
    staleTime: 30_000,
  })
}

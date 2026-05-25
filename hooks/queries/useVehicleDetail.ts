import { useQuery } from '@tanstack/react-query'
import { getVehicle } from '@/services/vehicleService'

export function useVehicleQuery(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => getVehicle(vehicleId!),
    enabled: !!vehicleId,
    staleTime: 30_000,
  })
}

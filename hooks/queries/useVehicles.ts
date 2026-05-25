import { useQuery } from '@tanstack/react-query'
import { listVehicles } from '@/services/vehicleService'
import type { VehicleApiStatus } from '@/types/vehicle'

export function useVehiclesQuery(apiStatus?: VehicleApiStatus) {
  return useQuery({
    queryKey: ['vehicles', apiStatus ?? 'all'],
    queryFn: () => listVehicles(apiStatus ? { status: apiStatus } : undefined),
    staleTime: 30_000,
  })
}

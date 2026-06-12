import { useQuery } from '@tanstack/react-query'
import { listStaleTime } from '@/lib/queryKeys'
import { listVehicles } from '@/services/vehicleService'
import type { VehicleApiStatus } from '@/types/vehicle'

export type VehicleListParams = {
  status?: VehicleApiStatus
  vehicle_type?: string
  assigned_driver?: string
  is_active?: boolean
  search?: string
  page?: number
  page_size?: number
  fields?: string
}

function normalizeVehicleListParams(params?: VehicleListParams): VehicleListParams {
  return {
    status: params?.status,
    vehicle_type: params?.vehicle_type,
    assigned_driver: params?.assigned_driver,
    is_active: params?.is_active,
    search: params?.search?.trim() || undefined,
    page: params?.page ?? 1,
    page_size: params?.page_size,
    fields: params?.fields,
  }
}

export function useVehiclesQuery(apiStatusOrParams?: VehicleApiStatus | VehicleListParams) {
  const params = normalizeVehicleListParams(
    typeof apiStatusOrParams === 'string' ? { status: apiStatusOrParams } : apiStatusOrParams,
  )

  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => listVehicles(params),
    staleTime: listStaleTime.vehicles,
  })
}

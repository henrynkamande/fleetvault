import type { QueryClient, QueryKey } from '@tanstack/react-query'
import type { ListVehiclesResponse, VehicleDto, VehicleListDto } from '@/types/vehicle'

type VehiclesQueryParams = {
  status?: string
  vehicle_type?: string
  assigned_driver?: string
  is_active?: boolean
  search?: string
  page?: number
  fields?: string
}

function getVehiclesQueryParams(queryKey: QueryKey): VehiclesQueryParams {
  const [, raw] = Array.isArray(queryKey) ? queryKey : []
  if (!raw || raw === 'all') return {}
  if (typeof raw === 'string') return { status: raw }
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as VehiclesQueryParams
  return {}
}

function vehicleMatchesParams(vehicle: VehicleListDto | VehicleDto, params: VehiclesQueryParams): boolean {
  if (params.status && vehicle.status !== params.status) return false
  if (params.vehicle_type && vehicle.vehicle_type !== params.vehicle_type) return false
  if (params.assigned_driver) {
    if (params.assigned_driver === 'unassigned') {
      if (vehicle.assigned_driver) return false
    } else if (vehicle.assigned_driver !== params.assigned_driver) {
      return false
    }
  }
  if (params.is_active !== undefined && vehicle.is_active !== params.is_active) return false
  if (params.search) {
    const q = params.search.trim().toLowerCase()
    const haystack =
      `${vehicle.registration_number} ${vehicle.make} ${vehicle.model} ${vehicle.assigned_driver_name ?? ''} ${vehicle.company_name ?? ''}`.toLowerCase()
    if (q && !haystack.includes(q)) return false
  }
  return true
}

export function getVehicleListSnapshots(queryClient: QueryClient) {
  return queryClient.getQueriesData<ListVehiclesResponse>({ queryKey: ['vehicles'] })
}

export function restoreVehicleListSnapshots(
  queryClient: QueryClient,
  snapshots: Array<[QueryKey, ListVehiclesResponse | undefined]>,
) {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data)
  })
}

export function upsertVehicleInLists(queryClient: QueryClient, vehicle: VehicleDto) {
  for (const [queryKey, previous] of getVehicleListSnapshots(queryClient)) {
    if (!previous) continue
    const params = getVehiclesQueryParams(queryKey)
    const exists = previous.vehicles.some((item) => item.id === vehicle.id)
    const matches = vehicleMatchesParams(vehicle, params)

    if (exists && !matches) {
      queryClient.setQueryData<ListVehiclesResponse>(queryKey, {
        ...previous,
        count: Math.max(0, previous.count - 1),
        vehicles: previous.vehicles.filter((item) => item.id !== vehicle.id),
      })
      continue
    }

    if (!matches) continue

    if (!exists && params.page && params.page > 1) {
      queryClient.setQueryData<ListVehiclesResponse>(queryKey, {
        ...previous,
        count: previous.count + 1,
      })
      continue
    }

    queryClient.setQueryData<ListVehiclesResponse>(queryKey, {
      ...previous,
      count: exists ? previous.count : previous.count + 1,
      vehicles: exists
        ? previous.vehicles.map((item) => (item.id === vehicle.id ? vehicle : item))
        : [vehicle, ...previous.vehicles],
    })
  }
}

export function removeVehicleFromLists(queryClient: QueryClient, vehicleId: string) {
  for (const [queryKey, previous] of getVehicleListSnapshots(queryClient)) {
    if (!previous) continue
    const nextVehicles = previous.vehicles.filter((vehicle) => vehicle.id !== vehicleId)
    const removedCount = previous.vehicles.length - nextVehicles.length
    if (removedCount === 0) continue
    queryClient.setQueryData<ListVehiclesResponse>(queryKey, {
      ...previous,
      count: Math.max(0, previous.count - removedCount),
      vehicles: nextVehicles,
    })
  }
}

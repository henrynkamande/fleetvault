import vehiclesApi from '@/lib/vehiclesApi'
import type { CreateVehiclePayload, CreateVehicleResponse, ListVehiclesResponse, VehicleDto } from '@/types/vehicle'

export async function listVehicles(params?: {
  status?: string
  vehicle_type?: string
  assigned_driver?: string
}): Promise<ListVehiclesResponse> {
  const res = await vehiclesApi.get<ListVehiclesResponse>('/', { params })
  return res.data
}

export async function getVehicle(vehicleId: string): Promise<VehicleDto> {
  const res = await vehiclesApi.get<VehicleDto>(`/${vehicleId}/`)
  return res.data
}

export async function createVehicle(payload: CreateVehiclePayload): Promise<CreateVehicleResponse> {
  const res = await vehiclesApi.post<CreateVehicleResponse>('/create/', payload)
  return res.data
}

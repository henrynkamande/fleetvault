import vehiclesApi from '@/lib/vehiclesApi'
import type {
  CreateVehiclePayload,
  ListVehiclesResponse,
  UpdateVehiclePayload,
  VehicleDto,
  VehicleMutationResponse,
} from '@/types/vehicle'

export const DEFAULT_VEHICLE_LIST_FIELDS = [
  'id',
  'registration_number',
  'make',
  'model',
  'year',
  'color',
  'vehicle_type',
  'status',
  'current_odometer',
  'assigned_driver',
  'assigned_driver_name',
  'is_active',
  'updated_at',
  'created_at',
].join(',')

export async function listVehicles(params?: {
  status?: string
  vehicle_type?: string
  assigned_driver?: string
  is_active?: boolean
  search?: string
  page?: number
  page_size?: number
  fields?: string
}): Promise<ListVehiclesResponse> {
  const res = await vehiclesApi.get<ListVehiclesResponse>('/', {
    params: { fields: DEFAULT_VEHICLE_LIST_FIELDS, ...params },
  })
  return res.data
}

export async function getVehicle(vehicleId: string): Promise<VehicleDto> {
  const res = await vehiclesApi.get<VehicleDto>(`/${vehicleId}/`)
  return res.data
}

export async function createVehicle(payload: CreateVehiclePayload): Promise<VehicleMutationResponse> {
  const res = await vehiclesApi.post<VehicleMutationResponse>('/create/', payload)
  return res.data
}

export async function updateVehicle(
  vehicleId: string,
  payload: UpdateVehiclePayload,
): Promise<VehicleMutationResponse> {
  const res = await vehiclesApi.patch<VehicleMutationResponse>(`/${vehicleId}/update/`, payload)
  return res.data
}

export async function deleteVehicle(vehicleId: string): Promise<VehicleMutationResponse> {
  const res = await vehiclesApi.delete<VehicleMutationResponse>(`/${vehicleId}/delete/`)
  return res.data
}

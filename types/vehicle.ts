/** Mirrors `VehicleSerializer` from Django `vehicles` app. */

/** Matches `Vehicle.VehicleType` in `vehicles/models.py`. */
export type VehicleTypeCode =
  | 'TRUCK'
  | 'VAN'
  | 'PICKUP'
  | 'BUS'
  | 'MINIBUS'
  | 'CAR'
  | 'MOTORCYCLE'
  | 'TRAILER'
  | 'OTHER'

export type VehicleApiStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE'

export interface VehicleDto {
  id: string
  company: string
  company_name: string | null
  registration_number: string
  make: string
  model: string
  year: number | null
  color: string
  vehicle_type: VehicleTypeCode
  status: VehicleApiStatus
  current_odometer: number
  assigned_driver: string | null
  assigned_driver_name: string | null
  notes: string | null
  image: string | null
  load_capacity: string | null
  fuel_type: string
  is_active: boolean
  updated_at: string
  created_at: string
}

export interface ListVehiclesResponse {
  count: number
  vehicles: VehicleDto[]
}

export interface CreateVehiclePayload {
  registration_number: string
  make: string
  model: string
  color: string
  vehicle_type: VehicleTypeCode
  year?: number
  load_capacity?: string
  current_odometer?: number
  status?: VehicleApiStatus
  assigned_driver?: string | null
  fuel_type?: string
  notes?: string
}

export interface CreateVehicleResponse {
  message: string
  vehicle: VehicleDto
}

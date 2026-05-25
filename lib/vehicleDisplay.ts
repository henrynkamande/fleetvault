import type { VehicleApiStatus, VehicleDto, VehicleTypeCode } from '@/types/vehicle'
import { getApiOrigin } from '@/lib/apiOrigin'

/** Labels for `VehicleTypeCode` — must stay in sync with `Vehicle.VehicleType` in `vehicles/models.py`. */
export const VEHICLE_TYPE_OPTIONS: readonly { value: VehicleTypeCode; label: string }[] = [
  { value: 'TRUCK', label: 'Truck' },
  { value: 'VAN', label: 'Van' },
  { value: 'PICKUP', label: 'Pickup' },
  { value: 'BUS', label: 'Bus' },
  { value: 'MINIBUS', label: 'Minibus' },
  { value: 'CAR', label: 'Car' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'TRAILER', label: 'Trailer' },
  { value: 'OTHER', label: 'Other' },
]

export function vehicleTypeLabel(code: string): string {
  const found = VEHICLE_TYPE_OPTIONS.find((o) => o.value === code)
  return found?.label ?? code.replace(/_/g, ' ')
}

const STATUS_LABEL: Record<VehicleApiStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  UNDER_MAINTENANCE: 'Maintenance',
  OUT_OF_SERVICE: 'Out of service',
}

export function vehicleStatusLabel(status: VehicleApiStatus): string {
  return STATUS_LABEL[status] ?? status
}

export function apiStatusFromModal(
  ui: 'Active' | 'Maintenance' | 'Inactive',
): VehicleApiStatus {
  if (ui === 'Active') return 'ACTIVE'
  if (ui === 'Maintenance') return 'UNDER_MAINTENANCE'
  return 'INACTIVE'
}

export function formatOdometerKm(n: number): string {
  return `${n.toLocaleString()} km`
}

/** Resolver for uploaded vehicle `image` path from DRF. */
export function vehicleImageUrl(vehicle: VehicleDto): string | null {
  if (!vehicle.image) return null
  if (vehicle.image.startsWith('http')) return vehicle.image
  const origin = getApiOrigin()
  const path = vehicle.image.startsWith('/') ? vehicle.image : `/${vehicle.image}`
  return `${origin}${path}`
}

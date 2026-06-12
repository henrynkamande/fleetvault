import api from '@/lib/api'
import vehiclesApi from '@/lib/vehiclesApi'
import type { LoginResponse } from '@/types/auth'
import type {
  DriverDashboardResponse,
  DriverProfileDto,
  KycListResponse,
  VerifyDriverOtpPayload,
} from '@/types/driver'
import type { CreateDriverPayload, CreateDriverResponse } from '@/types/driverCreate'

/** Fleet owner: add a driver record (no platform invite). */
export async function createDriver(payload: CreateDriverPayload): Promise<CreateDriverResponse> {
  const res = await api.post<CreateDriverResponse>('/drivers/create/', payload)
  return res.data
}

export async function assignDriverToVehicle(vehicleId: string, driverUserId: string): Promise<void> {
  await vehiclesApi.post(`/${vehicleId}/assign-driver/`, { driver_id: driverUserId })
}

export function splitFullName(fullName: string): { first_name: string; last_name: string } {
  const trimmed = fullName.trim().replace(/\s+/g, ' ')
  if (!trimmed) return { first_name: '', last_name: '' }
  const space = trimmed.indexOf(' ')
  if (space === -1) return { first_name: trimmed, last_name: '—' }
  return {
    first_name: trimmed.slice(0, space),
    last_name: trimmed.slice(space + 1).trim(),
  }
}

export async function fetchDriverDashboard(): Promise<DriverDashboardResponse> {
  const res = await api.get<DriverDashboardResponse>('/dashboard/driver/')
  return res.data
}

export async function fetchDriverExtendedProfile(): Promise<DriverProfileDto> {
  const res = await api.get<DriverProfileDto>('/profile/extended/')
  return res.data
}

export async function updateDriverExtendedProfile(payload: {
  first_name?: string
  last_name?: string
  phone_number?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}): Promise<{ message: string; profile: DriverProfileDto }> {
  const res = await api.patch<{ message: string; profile: DriverProfileDto }>(
    '/profile/extended/update/',
    payload,
  )
  return res.data
}

export { changePassword } from '@/services/authService'

export async function verifyDriverOtp(payload: VerifyDriverOtpPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/verify-otp/', payload, { skipAuth: true })
  return res.data
}

export async function listDriverKycDocuments(): Promise<KycListResponse> {
  return { count: 0, documents: [] }
}

export async function uploadKycDocument(_formData: FormData): Promise<unknown> {
  void _formData
  throw new Error('KYC document uploads are no longer part of this FleetFlow workspace.')
}

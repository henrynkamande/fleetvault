import api from '@/lib/api'
import type { User } from '@/types/user'

/** Response from `GET /users/drivers/` (fleet owners only). */
export interface ListCompanyDriversResponse {
  count: number
  drivers: User[]
}

/**
 * Drivers in the current company for vehicle assignment dropdowns.
 * Backend: `GET users/api/users/drivers/?is_active=true`
 */
export async function listCompanyDrivers(params?: { is_active?: string }): Promise<ListCompanyDriversResponse> {
  const res = await api.get<ListCompanyDriversResponse>('/users/drivers/', { params })
  return res.data
}

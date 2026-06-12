import api from '@/lib/api'
import type { User } from '@/types/user'

export interface ListCompanyUsersResponse {
  count: number
  users: User[]
}

/** Fleet owners: company drivers for assignment dropdowns (`role=DRIVER`). */
export async function listCompanyUsers(params?: {
  role?: string
  is_active?: string
}): Promise<ListCompanyUsersResponse> {
  const res = await api.get<ListCompanyUsersResponse>('/users/', { params })
  return res.data
}

/** Fleet owner: single user in company (detail view). */
export async function getCompanyUser(userId: string): Promise<User> {
  const res = await api.get<User>(`/users/${userId}/`)
  return res.data
}

/** Deactivates a driver (or other company user); fleet owner only. */
export async function deactivateCompanyUser(userId: string): Promise<{ message: string; user: User }> {
  const res = await api.post<{ message: string; user: User }>(`/users/${userId}/deactivate/`)
  return res.data
}

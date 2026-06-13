import api from '@/lib/api'
import type { User } from '@/types/user'

/** GET `profile/` — matches `oauth.urls` under `users/api/`. */
export async function fetchCurrentUser(): Promise<User> {
  const res = await api.get<User>('/profile/')
  return res.data
}

export type UpdateProfilePayload = {
  first_name?: string
  last_name?: string
  phone_number?: string
  preferred_currency?: string
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const res = await api.patch<{ message: string; user: User }>('/profile/update/', payload)
  return res.data.user
}

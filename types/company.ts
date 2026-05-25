import type { JwtTokens } from './auth'
import type { User } from './user'

/** Subset of `CompanySerializer` used after login. */
export interface Company {
  id: string
  name: string
  registration_number: string | null
  address: string | null
  contact_email: string | null
  contact_phone: string | null
  logo: string | null
  is_active: boolean
  subscription_plan: string
  billing_status?: string
  trial_ends_at?: string | null
  billing_quantity?: number
  owner: User
  total_drivers: number
  total_vehicles: number
  created_at: string
  updated_at: string
}

/** POST `company/register/` body (all optional except `name` per serializer). */
export interface RegisterCompanyPayload {
  name: string
  registration_number?: string
  address?: string
  contact_email?: string
  contact_phone?: string
  logo?: File | null
}

export interface RegisterCompanyResponse {
  message: string
  company: Company
  tokens: JwtTokens
  next_step: string
}

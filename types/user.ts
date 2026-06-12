export type UserRole = 'FLEET_OWNER' | 'DRIVER' | 'PLATFORM_ADMIN'

/** Mirrors `UserSerializer` from the Django oauth app. */
export interface User {
  id: string
  email: string
  phone_number: string
  first_name: string
  last_name: string
  full_name: string
  role: UserRole
  avatar: string | null
  avatar_url: string | null
  is_verified: boolean
  is_active: boolean
  date_joined: string
  last_login: string | null
  fleet_owner_id?: string | null
  company_id: string | null
  company_name: string | null
  has_company: boolean
  /** Present for users with role DRIVER; use when assigning `Trip.driver` (DriverProfile PK). */
  driver_profile_id?: string | null
}

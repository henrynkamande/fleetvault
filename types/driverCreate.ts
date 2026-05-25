import type { User } from './user'

export interface CreateDriverPayload {
  phone_number: string
  first_name: string
  last_name: string
  drivers_license_number?: string
  employment_status?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'
}

export interface CreateDriverResponse {
  message: string
  driver: User
}

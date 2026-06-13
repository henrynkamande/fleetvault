import type { User } from './user'
import type { DriverPaymentMode } from './trip'

export interface CreateDriverPayload {
  phone_number: string
  first_name: string
  last_name: string
  drivers_license_number?: string
  employment_status?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'
  payment_rate?: string | number
  payment_type?: DriverPaymentMode
}

export interface CreateDriverResponse {
  message: string
  driver: User
}

import type { User } from './user'

export interface DriverProfileDto {
  user: User
  date_of_birth: string | null
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  drivers_license_number: string | null
  license_type: string | null
  license_expiry_date: string | null
  license_issuing_country: string | null
  employment_status: string | null
  date_hired: string | null
  employee_id: string | null
  payment_rate: string
  payment_type: string
  bank_account_number: string | null
  bank_name: string | null
  max_daily_hours: string
  max_weekly_hours: string
  total_trips: number
  completed_trips: number
  on_time_percentage: string
  average_rating: string
  is_active: boolean
  is_available: boolean
  is_license_expired: boolean
  completion_rate: number
}

export interface DriverDashboardStats {
  total_trips: number
  completed_trips: number
  completion_rate: number
  on_time_percentage: number
  average_rating: number
  pending_kyc_documents: number
}

export interface DriverDashboardResponse {
  user: User
  profile: DriverProfileDto
  stats: DriverDashboardStats
}

export type KycVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'

export interface KycDocumentDto {
  id: string
  driver: string
  driver_name: string
  document_type: string
  document_number: string | null
  issuing_country: string | null
  issuing_authority: string | null
  front_image: string | null
  back_image: string | null
  issue_date: string | null
  expiry_date: string | null
  verification_status: KycVerificationStatus
  verified_by: string | null
  verified_by_name: string | null
  verification_date: string | null
  rejection_reason: string | null
  uploaded_at: string
  updated_at: string
  is_expired: boolean
}

export interface KycListResponse {
  count: number
  documents: KycDocumentDto[]
}

export interface TempPasswordStatusResponse {
  needs_password_change: boolean
  hours_remaining: number | null
  temp_password_expired: boolean
  password_changed: boolean
}

export interface VerifyDriverOtpPayload {
  email: string
  otp: string
  new_password: string
  confirm_password: string
}

export interface VerifyDriverTempLoginPayload {
  email: string
  password: string
  is_temporary_login: true
}

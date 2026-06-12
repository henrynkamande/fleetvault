import type { Company } from './company'
import type { User } from './user'

export interface JwtTokens {
  access: string
  refresh: string
}

export interface FleetOwnerRegisterPayload {
  email: string
  phone_number: string
  first_name: string
  last_name: string
  password: string
  confirm_password: string
}

export interface RegisterFleetOwnerResponse {
  message: string
  email: string
  requires_verification: boolean
  email_sent?: boolean
  otp_expires_minutes?: number
  resend_cooldown_seconds?: number
  dev_otp?: string
  /** Present only when server still returns tokens (legacy). */
  user?: User
  tokens?: JwtTokens
  next_step?: string
  requires_company?: boolean
  billing_status?: string | null
  requires_billing_checkout?: boolean
  has_billing_access?: boolean
}

export interface VerifySignupOtpPayload {
  email: string
  otp: string
}

export interface ResendSignupOtpPayload {
  email: string
}

export interface AuthCodeMessageResponse {
  message: string
  email?: string
  resend_cooldown_seconds?: number
  otp_expires_minutes?: number
  code_expires_minutes?: number
  dev_otp?: string
  dev_code?: string
  user?: User
  tokens?: JwtTokens
  requires_verification?: boolean
  billing_status?: string | null
  requires_billing_checkout?: boolean
  has_billing_access?: boolean
}

export interface ForgotPasswordPayload {
  email: string
}

export interface VerifyResetCodePayload {
  email: string
  code: string
}

export interface ResetPasswordPayload {
  email: string
  code: string
  new_password: string
  confirm_password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  tokens: JwtTokens
  user: User
  redirect_url?: string
  requires_company?: boolean
  next_step?: string
  company?: Company
  billing_status?: string
  requires_billing_checkout?: boolean
  has_billing_access?: boolean
  requires_verification?: boolean
  requires_password_change?: boolean
  message?: string
  temp_password_hours_remaining?: number
}

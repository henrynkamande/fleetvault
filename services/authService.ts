import api from '@/lib/api'
import type {
  AuthCodeMessageResponse,
  FleetOwnerRegisterPayload,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterFleetOwnerResponse,
  ResendSignupOtpPayload,
  ResetPasswordPayload,
  VerifyResetCodePayload,
  VerifySignupOtpPayload,
} from '@/types/auth'

export async function registerFleetOwner(
  payload: FleetOwnerRegisterPayload,
): Promise<RegisterFleetOwnerResponse> {
  const res = await api.post<RegisterFleetOwnerResponse>('/auth/register/', payload, {
    skipAuth: true,
  })
  return res.data
}

export async function verifySignupOtp(payload: VerifySignupOtpPayload): Promise<AuthCodeMessageResponse> {
  const res = await api.post<AuthCodeMessageResponse>('/auth/verify-signup-otp/', payload, {
    skipAuth: true,
  })
  return res.data
}

export async function resendSignupOtp(payload: ResendSignupOtpPayload): Promise<AuthCodeMessageResponse> {
  const res = await api.post<AuthCodeMessageResponse>('/auth/resend-signup-otp/', payload, {
    skipAuth: true,
  })
  return res.data
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login/', payload, { skipAuth: true })
  return res.data
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout/', { refresh: refreshToken })
}

export async function requestPasswordReset(payload: ForgotPasswordPayload): Promise<AuthCodeMessageResponse> {
  const res = await api.post<AuthCodeMessageResponse>('/password/forgot/', payload, { skipAuth: true })
  return res.data
}

export async function verifyPasswordResetCode(
  payload: VerifyResetCodePayload,
): Promise<AuthCodeMessageResponse & { verified?: boolean }> {
  const res = await api.post('/password/verify-reset-code/', payload, { skipAuth: true })
  return res.data
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<AuthCodeMessageResponse> {
  const res = await api.post<AuthCodeMessageResponse>('/password/reset/', payload, { skipAuth: true })
  return res.data
}

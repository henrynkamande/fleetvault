import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getRefreshToken } from '@/lib/tokenStorage'
import {
  login,
  logout,
  registerFleetOwner,
  requestPasswordReset,
  resendSignupOtp,
  resetPassword,
  verifyPasswordResetCode,
  verifySignupOtp,
} from '@/services/authService'
import type {
  FleetOwnerRegisterPayload,
  ForgotPasswordPayload,
  LoginPayload,
  ResendSignupOtpPayload,
  ResetPasswordPayload,
  VerifyResetCodePayload,
  VerifySignupOtpPayload,
} from '@/types/auth'
import { useAuthStore } from '@/store/useAuthStore'

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      setSession(data.tokens)
      queryClient.setQueryData(['currentUser'], data.user)
    },
  })
}

export function useRegisterFleetOwnerMutation() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: (payload: FleetOwnerRegisterPayload) => registerFleetOwner(payload),
    onSuccess: (data) => {
      if (data.tokens) {
        setSession(data.tokens)
      }
      if (data.user) {
        queryClient.setQueryData(['currentUser'], data.user)
      }
    },
  })
}

export function useVerifySignupOtpMutation() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: (payload: VerifySignupOtpPayload) => verifySignupOtp(payload),
    onSuccess: (data) => {
      if (data.tokens) {
        setSession(data.tokens)
      }
      if (data.user) {
        queryClient.setQueryData(['currentUser'], data.user)
      }
    },
  })
}

export function useResendSignupOtpMutation() {
  return useMutation({
    mutationFn: (payload: ResendSignupOtpPayload) => resendSignupOtp(payload),
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => requestPasswordReset(payload),
  })
}

export function useVerifyResetCodeMutation() {
  return useMutation({
    mutationFn: (payload: VerifyResetCodePayload) => verifyPasswordResetCode(payload),
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((s) => s.clearSession)

  return useMutation({
    mutationFn: async () => {
      const rt = getRefreshToken()
      if (!rt) return
      try {
        await logout(rt)
      } catch {
        // Blacklisting the refresh token is best-effort; client session must still end.
      }
    },
    onSettled: () => {
      clearSession()
      queryClient.removeQueries({ queryKey: ['currentUser'] })
      queryClient.removeQueries({ queryKey: ['company'] })
    },
  })
}

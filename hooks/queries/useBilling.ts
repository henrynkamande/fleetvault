import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CHECKOUT_SESSION_STORAGE_KEY,
  confirmCheckoutSession,
  createCheckoutSession,
  createPortalSession,
  fetchBillingConfig,
  fetchBillingStatus,
  startTrialWithoutPayment,
  type BillingConfig,
} from '@/lib/billingApi'
import { SKIP_BILLING } from '@/lib/constants'
import { getAccessToken } from '@/lib/tokenStorage'
import { AppRoutesPaths } from '@/route/paths'

function billingRedirectUrls() {
  const origin = window.location.origin
  return {
    success_url: `${origin}${AppRoutesPaths.onboarding.billingSuccess}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${AppRoutesPaths.onboarding.startTrial}`,
  }
}

export function useBillingConfig() {
  return useQuery({
    queryKey: ['billing', 'config'],
    queryFn: fetchBillingConfig,
    staleTime: 1000 * 60 * 10,
  })
}

export function useBillingStatus() {
  const hasToken = !!getAccessToken()
  return useQuery({
    queryKey: ['billing', 'status'],
    queryFn: fetchBillingStatus,
    enabled: hasToken,
    refetchOnWindowFocus: true,
  })
}

export function useStartTrialCheckout() {
  return useMutation({
    mutationFn: () => createCheckoutSession(billingRedirectUrls()),
    onSuccess: (data) => {
      if (data.session_id) {
        sessionStorage.setItem(CHECKOUT_SESSION_STORAGE_KEY, data.session_id)
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    },
  })
}

export function useStartTrialWithoutPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => startTrialWithoutPayment(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['billing', 'status'] })
    },
  })
}

/** True when user can enter the app without Stripe Checkout. */
export function canSkipPaymentCheckout(config?: BillingConfig | null): boolean {
  if (SKIP_BILLING) return true
  return Boolean(config?.allow_trial_without_payment)
}

export function useConfirmCheckout() {
  return useMutation({
    mutationFn: (sessionId: string) => confirmCheckoutSession(sessionId),
    onSuccess: () => {
      sessionStorage.removeItem(CHECKOUT_SESSION_STORAGE_KEY)
    },
  })
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: createPortalSession,
    onSuccess: (data) => {
      if (data.portal_url) {
        window.location.href = data.portal_url
      }
    },
  })
}

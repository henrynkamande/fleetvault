import { getApiOrigin } from '@/lib/apiOrigin'
import { getAccessToken } from '@/lib/tokenStorage'

const billingBase = `${getApiOrigin()}/billing/api`

async function billingFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
  }
  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${billingBase}${path}`, { ...init, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = typeof data.detail === 'string' ? data.detail : 'Billing request failed'
    throw new Error(message)
  }
  return data as T
}

export interface BillingConfig {
  stripe_publishable_key: string
  stripe_configured: boolean
  billing_enforced: boolean
  allow_trial_without_payment: boolean
  pricing: {
    currency: string
    unit_amount_cents: number
    unit_amount_display: string
    per_vehicle_label: string
    trial_days: number
    note: string
  }
}

export interface BillingStatus {
  billing_status: string
  subscription_plan: string
  trial_ends_at: string | null
  vehicle_count: number
  billing_quantity: number
  has_access: boolean
  requires_checkout: boolean
  stripe_configured: boolean
}

export function fetchBillingConfig() {
  return billingFetch<BillingConfig>('/config/')
}

export function fetchBillingStatus() {
  return billingFetch<BillingStatus>('/status/')
}

export function createCheckoutSession(body?: { success_url?: string; cancel_url?: string }) {
  return billingFetch<{ checkout_url: string; session_id: string }>('/checkout-session/', {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  })
}

export function startTrialWithoutPayment() {
  return billingFetch<{
    billing_status: string
    has_access: boolean
    requires_checkout: boolean
    trial_ends_at: string | null
  }>('/start-trial-without-payment/', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function confirmCheckoutSession(sessionId: string) {
  return billingFetch<{
    billing_status: string
    has_access: boolean
    requires_checkout: boolean
  }>('/confirm-checkout/', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  })
}

export const CHECKOUT_SESSION_STORAGE_KEY = 'fleetflow_pending_checkout_session_id'

export function createPortalSession(body?: { return_url?: string }) {
  return billingFetch<{ portal_url: string }>('/portal-session/', {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  })
}

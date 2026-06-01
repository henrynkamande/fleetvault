import { DRIVER_APP_ENABLED, DRIVER_LIVE_API, SKIP_BILLING } from "@/lib/constants";
import { AppRoutesPaths } from "@/route/paths";
import type { LoginResponse, RegisterFleetOwnerResponse } from "@/types/auth";

const driverUnavailable = () => AppRoutesPaths.driverAppUnavailable

export const BACKEND_REDIRECT_URLS = [
  '/fleet-owner/dashboard',
  '/fleet-owner/register-company',
  '/driver/dashboard',
  '/driver/verify',
] as const

export type BackendRedirectUrl = (typeof BACKEND_REDIRECT_URLS)[number]

function isBackendRedirectUrl(url: string): url is BackendRedirectUrl {
  return (BACKEND_REDIRECT_URLS as readonly string[]).includes(url)
}

export const BACKEND_REDIRECT_TO_APP = {
  '/fleet-owner/dashboard': AppRoutesPaths.dashboard.root,
  '/fleet-owner/register-company': AppRoutesPaths.dashboard.root,
  '/driver/dashboard': DRIVER_APP_ENABLED ? AppRoutesPaths.driver.root : driverUnavailable(),
  '/driver/verify': DRIVER_APP_ENABLED ? AppRoutesPaths.driver.verify : driverUnavailable(),
} as const satisfies Record<BackendRedirectUrl, string>

export type PostAuthRule =
  | 'requires_verification'
  | 'requires_password_change'
  | 'requires_billing_checkout'
  | 'backend_redirect_allowlist'
  | 'default'

export type PostAuthInput = Pick<RegisterFleetOwnerResponse, 'requires_company'> | LoginResponse

export interface PostAuthResolution {
  path: string
  rule: PostAuthRule
  backendRedirect?: BackendRedirectUrl
}

function isDriverSession(data: PostAuthInput): boolean {
  return 'user' in data && data.user?.role === 'DRIVER'
}

function warnUnknownBackendRedirect(url: string): void {
  if (process.env.NODE_ENV === "development") {
    console.warn('[authNavigation] Unknown redirect_url:', url)
  }
}

export function resolvePostAuthNavigation(data: PostAuthInput): PostAuthResolution {
  const isDriver = isDriverSession(data)

  if ('requires_verification' in data && data.requires_verification) {
    return {
      path: DRIVER_APP_ENABLED ? AppRoutesPaths.driver.verify : driverUnavailable(),
      rule: 'requires_verification',
    }
  }

  if (
    'requires_billing_checkout' in data &&
    data.requires_billing_checkout &&
    !isDriver &&
    !SKIP_BILLING
  ) {
    return {
      path: AppRoutesPaths.onboarding.startTrial,
      rule: 'requires_billing_checkout',
    }
  }

  if ('requires_password_change' in data && data.requires_password_change) {
    return {
      path: isDriver
        ? DRIVER_APP_ENABLED
          ? AppRoutesPaths.driver.settings
          : driverUnavailable()
        : AppRoutesPaths.dashboard.settings,
      rule: 'requires_password_change',
    }
  }

  if ('redirect_url' in data && data.redirect_url) {
    const url = data.redirect_url
    if (isBackendRedirectUrl(url)) {
      return {
        path: BACKEND_REDIRECT_TO_APP[url],
        rule: 'backend_redirect_allowlist',
        backendRedirect: url,
      }
    }
    warnUnknownBackendRedirect(url)
  }

  return {
    path: isDriver
      ? DRIVER_APP_ENABLED
        ? AppRoutesPaths.driver.root
        : driverUnavailable()
      : AppRoutesPaths.dashboard.root,
    rule: 'default',
  }
}

export function resolvePostAuthPath(data: PostAuthInput): string {
  return resolvePostAuthNavigation(data).path
}

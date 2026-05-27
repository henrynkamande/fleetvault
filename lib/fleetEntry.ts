import { AppRoutesPaths } from '@/route/paths'

/** Where unauthenticated users go when opening the fleet owner dashboard. */
export function fleetDashboardSignInUrl(): string {
  const next = encodeURIComponent(AppRoutesPaths.dashboard.root)
  return `${AppRoutesPaths.auth.signin}?next=${next}`
}

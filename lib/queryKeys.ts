/**
 * Canonical React Query keys for cache invalidation (Metsamdti-style).
 * Extend as hooks migrate from fleetflow-frontend.
 */
export const queryKeys = {
  auth: {
    currentUser: () => ["currentUser"] as const,
    company: () => ["company"] as const,
  },
  billing: {
    config: () => ["billing", "config"] as const,
    status: () => ["billing", "status"] as const,
    root: () => ["billing"] as const,
  },
  fleet: {
    trips: () => ["trips"] as const,
    customers: () => ["customers"] as const,
    vehicles: () => ["vehicles"] as const,
    companyUsers: () => ["companyUsers"] as const,
    companyDrivers: () => ["companyDrivers"] as const,
    dashboard: () => ["dashboard"] as const,
    finance: () => ["finance"] as const,
  },
} as const;

export const listStaleTime = {
  vehicles: 1000 * 60 * 5,
  drivers: 1000 * 60 * 5,
  customers: 1000 * 60 * 5,
  trips: 1000 * 60 * 5,
  settings: 1000 * 60 * 10,
} as const;

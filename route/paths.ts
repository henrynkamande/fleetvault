export const AppRoutesPaths = {
  landing: "/",
  auth: {
    signin: "/auth/signin",
    signup: "/auth/signup",
    forgotPassword: "/auth/forgot-password",
  },
  onboarding: {
    registerCompany: "/onboarding/register-company",
    startTrial: "/onboarding/start-trial",
    billingSuccess: "/onboarding/billing-success",
  },
  dashboard: {
    root: "/dashboard",
    vehicles: "/dashboard/vehicles",
    vehicleProfile: (vehicleId: string) =>
      `/dashboard/vehicles/profile/${encodeURIComponent(vehicleId)}`,
    drivers: "/dashboard/drivers",
    driverProfile: (driverId: string) =>
      `/dashboard/drivers/${encodeURIComponent(driverId)}`,
    trips: "/dashboard/trips",
    tripProfile: (tripRef: string) =>
      `/dashboard/trips/${encodeURIComponent(tripRef)}`,
    income: "/dashboard/income",
    expenses: "/dashboard/expenses",
    reports: "/dashboard/reports",
    settings: "/dashboard/settings",
  },
  driverAppUnavailable: "/driver-app-unavailable",
  driver: {
    root: "/driver/dashboard",
    trips: "/driver/trips",
    tripDetail: (tripId: string) =>
      `/driver/trips/${encodeURIComponent(tripId)}`,
    activeTrip: "/driver/trips/active",
    vehicle: "/driver/vehicle",
    documents: "/driver/documents",
    profile: "/driver/profile",
    settings: "/driver/settings",
    verify: "/driver/verify",
  },
  notFound: "*",
} as const;

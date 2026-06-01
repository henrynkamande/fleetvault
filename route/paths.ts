export const AppRoutesPaths = {
  landing: "/",
  marketing: {
    pricing: "/pricing",
    about: "/about",
    blog: "/blog",
  },
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
    admin: {
      companies: "/dashboard/admin/companies",
      companyDetail: (companyId: string) =>
        `/dashboard/admin/companies/${encodeURIComponent(companyId)}`,
      users: "/dashboard/admin/users",
      vehicles: "/dashboard/admin/vehicles",
      subscriptions: "/dashboard/admin/subscriptions",
      billing: "/dashboard/admin/billing",
      systemExpenses: "/dashboard/admin/system-expenses",
      settings: "/dashboard/admin/settings",
      blog: "/dashboard/admin/blog",
    },
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
  authSuperAdmin: {
    signin: "/auth/platform/signin",
    signup: "/auth/platform/signup",
  },
  blog: {
    index: "/blog",
    post: (slug: string) => `/blog/${encodeURIComponent(slug)}`,
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

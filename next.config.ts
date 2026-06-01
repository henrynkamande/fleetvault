import type { NextConfig } from "next";
import { AppRoutesPaths } from "./route/paths";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/vehicles", destination: AppRoutesPaths.dashboard.vehicles, permanent: true },
      {
        source: "/vehicles/profile/:vehicleId",
        destination: "/dashboard/vehicles/profile/:vehicleId",
        permanent: true,
      },
      { source: "/drivers", destination: AppRoutesPaths.dashboard.drivers, permanent: true },
      {
        source: "/drivers/profile/:driverId",
        destination: "/dashboard/drivers/:driverId",
        permanent: true,
      },
      { source: "/trips", destination: AppRoutesPaths.dashboard.trips, permanent: true },
      { source: "/income", destination: AppRoutesPaths.dashboard.income, permanent: true },
      { source: "/expenses", destination: AppRoutesPaths.dashboard.expenses, permanent: true },
      { source: "/reports", destination: AppRoutesPaths.dashboard.reports, permanent: true },
      { source: "/settings", destination: AppRoutesPaths.dashboard.settings, permanent: true },
      {
        source: "/platform/auth/signin",
        destination: AppRoutesPaths.authSuperAdmin.signin,
        permanent: false,
      },
      {
        source: "/platform/auth/signup",
        destination: AppRoutesPaths.authSuperAdmin.signup,
        permanent: false,
      },
      {
        source: "/platform/companies/:id",
        destination: "/dashboard/admin/companies/:id",
        permanent: false,
      },
      {
        source: "/platform/companies",
        destination: AppRoutesPaths.dashboard.admin.companies,
        permanent: false,
      },
      {
        source: "/platform/users",
        destination: AppRoutesPaths.dashboard.admin.users,
        permanent: false,
      },
      {
        source: "/platform/billing",
        destination: AppRoutesPaths.dashboard.admin.subscriptions,
        permanent: false,
      },
      {
        source: "/platform/subscriptions",
        destination: AppRoutesPaths.dashboard.admin.subscriptions,
        permanent: false,
      },
      {
        source: "/platform/vehicles",
        destination: AppRoutesPaths.dashboard.admin.vehicles,
        permanent: false,
      },
      {
        source: "/platform/system-expenses",
        destination: AppRoutesPaths.dashboard.admin.systemExpenses,
        permanent: false,
      },
      {
        source: "/platform/settings",
        destination: AppRoutesPaths.dashboard.admin.settings,
        permanent: false,
      },
      {
        source: "/platform/blog",
        destination: AppRoutesPaths.dashboard.admin.blog,
        permanent: false,
      },
      { source: "/platform", destination: AppRoutesPaths.dashboard.root, permanent: false },
    ];
  },
};

export default nextConfig;

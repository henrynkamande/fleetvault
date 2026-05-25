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
    ];
  },
};

export default nextConfig;

import dynamic from "next/dynamic";
import { LoadingCard } from "@/components/ui/LoadingSpinner";

const loading = () => (
  <LoadingCard className="border-0 bg-transparent shadow-none" />
);

export const LazyDashboard = dynamic(
  () => import("@/features/dashboard/user/Dashboard"),
  { loading },
);
export const LazyVehicles = dynamic(
  () => import("@/features/dashboard/user/Vehicles"),
  { loading },
);
export const LazyDrivers = dynamic(
  () => import("@/features/dashboard/user/Drivers"),
  { loading },
);
export const LazyTrips = dynamic(
  () => import("@/features/dashboard/user/Trips"),
  { loading },
);
export const LazyIncome = dynamic(
  () => import("@/features/dashboard/user/Income"),
  { loading },
);
export const LazyExpenses = dynamic(
  () => import("@/features/dashboard/user/Expenses"),
  { loading },
);
export const LazyReports = dynamic(
  () => import("@/features/dashboard/user/PLReports"),
  { loading },
);
export const LazySettings = dynamic(
  () => import("@/features/dashboard/user/Settings"),
  { loading },
);

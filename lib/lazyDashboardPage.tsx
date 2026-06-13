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
export const LazyCustomers = dynamic(
  () => import("@/features/dashboard/user/Customers"),
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
export const LazyAdminOverview = dynamic(
  () => import("@/features/dashboard/admin/AdminOverview"),
  { loading },
);
export const LazyAdminUsers = dynamic(
  () => import("@/features/dashboard/admin/AdminUsers"),
  { loading },
);
export const LazyAdminVehicles = dynamic(
  () => import("@/features/dashboard/admin/AdminVehicles"),
  { loading },
);
export const LazyAdminSubscriptions = dynamic(
  () => import("@/features/dashboard/admin/AdminSubscriptions"),
  { loading },
);
export const LazyAdminSystemExpenses = dynamic(
  () => import("@/features/dashboard/admin/AdminSystemExpenses"),
  { loading },
);
export const LazyAdminSettings = dynamic(
  () => import("@/features/dashboard/admin/AdminSettings"),
  { loading },
);
export const LazyAdminBlog = dynamic(
  () => import("@/features/dashboard/admin/AdminBlog"),
  { loading },
);
export const LazyAdminCompanies = dynamic(
  () => import("@/features/dashboard/admin/AdminCompanies"),
  { loading },
);

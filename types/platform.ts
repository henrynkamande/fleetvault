export type PlatformOverview = {
  period: { start: string; end: string; preset: string };
  companies: {
    total: number;
    new_in_period: number;
    billing_breakdown: Record<string, number>;
  };
  users: {
    total: number;
    fleet_owners: number;
    drivers: number;
    drivers_verified: number;
    drivers_unverified: number;
  };
  fleet_ops: {
    vehicles: number;
    trips_total: number;
    trips_in_period: number;
    revenue: number;
    expenses: number;
    profit: number;
    revenue_previous: number;
  };
  subscriptions: {
    active: number;
    trialing: number;
    pending_payment: number;
    mrr: number;
    outstanding_revenue: number;
  };
  risk: { kyc_pending: number };
  recent_signups: Array<{
    id: string;
    name: string;
    owner_email: string | null;
    subscription_plan: string;
    billing_status: string;
    created_at: string;
  }>;
  recent_activity: Array<{
    type: string;
    at: string;
    title: string;
    detail: string;
  }>;
  companies_needing_attention: Array<{
    id: string;
    name: string;
    billing_status: string;
    trial_ends_at: string | null;
    owner_email: string | null;
  }>;
};

export type PlatformCompanyListItem = {
  id: string;
  name: string;
  owner_email: string | null;
  owner_name: string | null;
  subscription_plan: string;
  billing_status: string;
  driver_count: number;
  vehicle_count: number;
  trip_count: number;
  created_at: string;
  is_active: boolean;
};

export type PlatformUserListItem = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
  last_login: string | null;
};

export type PlatformVehicleListItem = {
  id: string;
  vehicle_name: string;
  registration_number: string;
  vehicle_type: string;
  status: string;
  company_id: string | null;
  company_name: string | null;
  assigned_owner_name: string | null;
  assigned_owner_email: string | null;
  created_at: string;
};

export type PlatformSubscriptionRow = {
  company_id: string;
  company_name: string;
  subscription_plan: string;
  billing_status: string;
  payment_status: string;
  amount_paid: number;
  amount_due: number;
  renewal_date: string | null;
  trial_status: string;
  vehicle_count: number;
};

export type PlatformSystemExpense = {
  id: string;
  name: string;
  description: string;
  category: string;
  amount: string;
  recorded_at: string;
  added_by_name: string | null;
  created_at: string;
  updated_at: string;
};

export const PLATFORM_EXPENSE_CATEGORIES = [
  "HOSTING",
  "INFRASTRUCTURE",
  "MARKETING",
  "STAFF",
  "SOFTWARE_LICENSES",
  "OPERATIONS",
  "OTHER",
] as const;

export function formatPlatformRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function formatBillingStatus(status: string): string {
  const map: Record<string, string> = {
    NOT_STARTED: "Not started",
    TRIALING: "Trialing",
    ACTIVE: "Active",
    PAST_DUE: "Past due",
    CANCELED: "Cancelled",
    INCOMPLETE: "Pending payment",
  };
  return map[status] ?? status;
}

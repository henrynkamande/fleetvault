export type PlatformOverview = {
  period: { start: string; end: string; preset: string };
  companies: {
    total: number;
    new_in_period: number;
    billing_breakdown: Record<string, number>;
  };
  users: {
    fleet_owners: number;
    drivers: number;
    drivers_verified: number;
    drivers_unverified: number;
  };
  fleet_ops: {
    vehicles: number;
    trips_in_period: number;
    revenue: number;
    expenses: number;
    profit: number;
    revenue_previous: number;
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

export type ExpenseScope = "FLEET" | "VEHICLE" | "TRIP" | "PLATFORM";
export type ExpenseStatus = "PAID" | "PENDING" | "OVERDUE";

export type ExpenseCategory =
  | "FUEL"
  | "MAINTENANCE"
  | "INSURANCE"
  | "REGISTRATION"
  | "TOLL"
  | "PARKING"
  | "DRIVER_WAGES"
  | "HOSTING"
  | "MARKETING"
  | "OPERATIONS"
  | "SOFTWARE"
  | "OTHER";

export interface Expense {
  id: string;
  fleet_owner: string | null;
  vehicle: string | null;
  vehicle_registration: string | null;
  trip: string | null;
  trip_number: string | null;
  scope: ExpenseScope;
  category: ExpenseCategory;
  status: ExpenseStatus;
  amount: string;
  description: string;
  vendor: string;
  expense_date: string;
  odometer_reading: number | null;
  receipt: string | null;
  notes: string;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseListResponse {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  expenses: Expense[];
}

export type ExpenseListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  scope?: ExpenseScope;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  vehicle?: string;
  trip?: string;
};

export type ExpenseInput = {
  scope: ExpenseScope;
  category: ExpenseCategory;
  status?: ExpenseStatus;
  amount: string | number;
  description: string;
  vendor?: string;
  expense_date: string;
  vehicle?: string | null;
  trip?: string | null;
  odometer_reading?: number | null;
  notes?: string;
};

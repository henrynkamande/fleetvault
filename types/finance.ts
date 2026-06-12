export type FinancePeriodPreset = '7d' | '30d' | '90d' | 'ytd' | 'custom'
export type FinanceGranularity = 'monthly' | 'quarterly' | 'yearly'

export interface FinanceSummary {
  period: { date_from: string; date_to: string }
  trip_count: number
  revenue_total: number
  expenses_total: number
  profit_total: number
  collected: number
  outstanding: number
  overdue: number
  revenue_change_pct: number | null
  expenses_change_pct: number | null
  profit_change_pct: number | null
}

export interface FinanceTrendPoint {
  period: string
  period_key: string
  amount?: number
  total?: number
  revenue?: number
  expenses?: number
  profit?: number
}

export interface IncomeRecordDto {
  invoice_id: string
  trip_id: string
  trip_number: string
  client: string
  driver_name: string | null
  vehicle_registration: string | null
  date: string
  amount: number
  status: 'Paid' | 'Pending' | 'Overdue'
  trip_status: string
}

export interface IncomeReportResponse {
  summary: FinanceSummary
  trend: FinanceTrendPoint[]
  top_clients: { name: string; total: number }[]
  records: IncomeRecordDto[]
}

export interface ExpenseRecordDto {
  id: string
  trip_id: string
  trip_number: string
  category: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  vendor: string | null
  notes: string | null
}

export interface ExpensesReportResponse {
  summary: FinanceSummary
  trend: FinanceTrendPoint[]
  by_category: { category: string; total: number }[]
  records: ExpenseRecordDto[]
}

export interface PlStatementRowDto {
  section: 'Income' | 'Expenses'
  account: string
  amount: number
  percent_of_revenue: number
}

export interface PlReportResponse {
  summary: FinanceSummary
  trend: FinanceTrendPoint[]
  statement: PlStatementRowDto[]
}

export interface FinanceQueryParams {
  period?: FinancePeriodPreset
  date_from?: string
  date_to?: string
  vehicle?: string
  driver?: string
  granularity?: FinanceGranularity
}

export type DashboardTripDisplayStatus = 'On Schedule' | 'Delayed' | 'Flagged'

export interface DashboardOngoingTripDto {
  trip_id: string
  trip_uuid: string
  driver_vehicle: string
  route: string
  status: DashboardTripDisplayStatus
  trip_status: string
}

export interface DashboardExpenseSegmentDto {
  label: string
  amount: number
  ratio: number
  tone: 'warning' | 'negative' | 'positive'
}

export interface DashboardTopDriverDto {
  driver_id: string
  name: string
  trip_count: number
  on_time_pct: number
}

export interface DashboardTopVehicleDto {
  vehicle_id: string
  name: string
  registration: string
  distance_km: number
  net_profit: number
}

export interface DashboardOverviewResponse {
  summary: FinanceSummary
  trip_count_change: number
  active_trip_count: number
  ongoing_trips: DashboardOngoingTripDto[]
  expense_breakdown: DashboardExpenseSegmentDto[]
  expense_total: number
  top_drivers: DashboardTopDriverDto[]
  top_vehicles: DashboardTopVehicleDto[]
  most_profitable_vehicle: DashboardTopVehicleDto | null
  worst_performing_vehicle: DashboardTopVehicleDto | null
}

/** Fields used from `TripSerializer` list responses. */

export type TripApiStatus =
  | 'PLANNED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FLAGGED'
  | 'DELAYED'

export type TripRevenueModel = 'FIXED_RATE' | 'PER_KM' | 'PER_DELIVERY' | 'CONTRACT' | 'HOURLY'
export type DriverPaymentMode = 'MONTHLY_FIXED' | 'WEEKLY_TRIPS' | 'FIXED_DAILY' | 'PER_TRIP'
export type TripIncomeStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'

export interface TripDetailDto extends TripListDto {
  vehicle?: string
  planned_arrival_time?: string | null
  revenue_model?: TripRevenueModel
  customer?: string | null
  customer_display_name?: string | null
  customer_name?: string | null
  customer_contact?: string | null
  customer_reference?: string | null
  cargo_description?: string | null
  driver_notes?: string | null
  manager_notes?: string | null
  profit_margin?: number | null
  duration_hours?: number | null
  fleet_owner?: string | null
  company_name?: string | null
  created_by_name?: string | null
}

export interface TripListDto {
  id: string
  trip_number: string
  status: TripApiStatus
  pickup_location: string
  destination: string
  vehicle_registration: string | null
  driver: string | null
  driver_name: string | null
  planned_departure_time: string | null
  actual_departure_time?: string | null
  actual_arrival_time?: string | null
  updated_at?: string
  is_flagged: boolean
  flag_reason?: string | null
  distance_km?: number | null
  distance_is_estimated?: boolean
  planned_distance_km?: number | null
  revenue_amount: string | null
  fuel_cost: string | null
  driver_payment: string | null
  driver_payment_mode: DriverPaymentMode
  driver_payment_mode_label: string
  driver_payment_rate: string | null
  driver_payment_auto_calculated: boolean
  income_status: TripIncomeStatus
  income_status_label: string
  toll_cost: string | null
  other_expenses: string | null
  total_expenses: string | null
  profit: string | null
  created_at: string
}

export interface TripListStats {
  active: number
  completed_today: number
  flagged: number
  open_revenue: string
}

export interface ListTripsResponse {
  count: number
  page: number
  page_size: number
  total_pages: number
  trips: TripListDto[]
  stats?: TripListStats
}

export interface CreateTripPayload {
  vehicle: string
  pickup_location: string
  destination: string
  planned_departure_time: string
  planned_arrival_time?: string | null
  planned_distance_km?: number | null
  revenue_model: TripRevenueModel
  revenue_amount: string | number
  driver?: string | null
  customer?: string | null
  customer_name?: string | null
  cargo_description?: string | null
  fuel_cost?: string | number
  driver_payment?: string | number
  driver_payment_mode?: DriverPaymentMode
  driver_payment_rate?: string | number
  driver_payment_auto_calculated?: boolean
  toll_cost?: string | number
  other_expenses?: string | number
  manager_notes?: string | null
}

export interface CreateTripResponse {
  message: string
  trip: TripListDto
}

export interface UpdateTripPayload {
  vehicle?: string
  pickup_location?: string
  destination?: string
  planned_departure_time?: string
  planned_arrival_time?: string | null
  planned_distance_km?: number | null
  revenue_model?: TripRevenueModel
  revenue_amount?: string | number
  driver?: string | null
  customer?: string | null
  customer_name?: string | null
  income_status?: TripIncomeStatus
  cargo_description?: string | null
  fuel_cost?: string | number
  driver_payment?: string | number
  driver_payment_mode?: DriverPaymentMode
  driver_payment_rate?: string | number
  driver_payment_auto_calculated?: boolean
  toll_cost?: string | number
  other_expenses?: string | number
  manager_notes?: string | null
}

export interface UpdateTripResponse {
  message: string
  trip: TripDetailDto
}

export type UpdateTripIncomeStatusResponse = UpdateTripResponse

export interface CancelTripResponse {
  message: string
  trip: TripDetailDto
}

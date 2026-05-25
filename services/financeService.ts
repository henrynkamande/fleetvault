import reportsApi from '@/lib/reportsApi'
import type {
  DashboardOverviewResponse,
  ExpensesReportResponse,
  FinanceQueryParams,
  IncomeReportResponse,
  PlReportResponse,
} from '@/types/finance'

function toParams(params?: FinanceQueryParams): Record<string, string> | undefined {
  if (!params) return undefined
  const out: Record<string, string> = {}
  if (params.period) out.period = params.period
  if (params.date_from) out.date_from = params.date_from
  if (params.date_to) out.date_to = params.date_to
  if (params.vehicle) out.vehicle = params.vehicle
  if (params.driver) out.driver = params.driver
  if (params.granularity) out.granularity = params.granularity
  return Object.keys(out).length ? out : undefined
}

export async function fetchIncomeReport(params?: FinanceQueryParams): Promise<IncomeReportResponse> {
  const res = await reportsApi.get<IncomeReportResponse>('/income/', { params: toParams(params) })
  return res.data
}

export async function fetchExpensesReport(params?: FinanceQueryParams): Promise<ExpensesReportResponse> {
  const res = await reportsApi.get<ExpensesReportResponse>('/expenses/', { params: toParams(params) })
  return res.data
}

export async function fetchPlReport(params?: FinanceQueryParams): Promise<PlReportResponse> {
  const res = await reportsApi.get<PlReportResponse>('/pl/', { params: toParams(params) })
  return res.data
}

export async function fetchDashboardOverview(params?: FinanceQueryParams): Promise<DashboardOverviewResponse> {
  const res = await reportsApi.get<DashboardOverviewResponse>('/overview/', { params: toParams(params) })
  return res.data
}

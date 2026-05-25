import type { FinancePeriodPreset, FinanceQueryParams } from '@/types/finance'
import { useCompanyDriversQuery } from '@/hooks/queries/useCompanyDrivers'
import { useVehiclesQuery } from '@/hooks/queries/useVehicles'

export type FinanceFiltersState = {
  period: FinancePeriodPreset
  vehicle: string
  driver: string
}

type FinanceFiltersBarProps = {
  value: FinanceFiltersState
  onChange: (next: FinanceFiltersState) => void
}

export function financeFiltersToParams(state: FinanceFiltersState): FinanceQueryParams {
  return {
    period: state.period === 'custom' ? undefined : state.period,
    vehicle: state.vehicle || undefined,
    driver: state.driver || undefined,
  }
}

export default function FinanceFiltersBar({ value, onChange }: FinanceFiltersBarProps) {
  const vehiclesQuery = useVehiclesQuery(undefined)
  const driversQuery = useCompanyDriversQuery(true)

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Period</label>
        <select
          value={value.period}
          onChange={(e) => onChange({ ...value, period: e.target.value as FinancePeriodPreset })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
        >
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="ytd">Year to date</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Vehicle</label>
        <select
          value={value.vehicle}
          onChange={(e) => onChange({ ...value, vehicle: e.target.value })}
          className="min-w-[10rem] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
        >
          <option value="">All vehicles</option>
          {(vehiclesQuery.data?.vehicles ?? []).map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration_number}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Driver</label>
        <select
          value={value.driver}
          onChange={(e) => onChange({ ...value, driver: e.target.value })}
          className="min-w-[10rem] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
        >
          <option value="">All drivers</option>
          {(driversQuery.data?.drivers ?? [])
            .filter((d) => d.driver_profile_id)
            .map((d) => (
              <option key={d.driver_profile_id!} value={d.driver_profile_id!}>
                {d.full_name}
              </option>
            ))}
        </select>
      </div>
      <p className="text-xs text-gray-500">
        Figures are aggregated from trip revenue and trip expenses (fuel, tolls, other).
      </p>
    </div>
  )
}

"use client";

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState } from 'react'
import { HiArrowLeft } from 'react-icons/hi2'
import { AppRoutesPaths } from '@/route/paths'
import { useVehicleQuery } from '@/hooks/queries/useVehicleDetail'
import { useVehicleTripsQuery } from '@/hooks/queries/useVehicleTrips'
import type { TripListDto } from '@/types/trip'
import {
  formatOdometerKm,
  vehicleImageUrl,
  vehicleStatusLabel,
  vehicleTypeLabel,
} from '@/lib/vehicleDisplay'
import type { VehicleApiStatus } from '@/types/vehicle'

type TripFilterStatus = 'All' | TripListDto['status']

function statusClasses(status: VehicleApiStatus): string {
  if (status === 'ACTIVE') return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  if (status === 'UNDER_MAINTENANCE') return 'bg-amber-100 text-amber-700 ring-amber-200'
  if (status === 'OUT_OF_SERVICE') return 'bg-rose-100 text-rose-700 ring-rose-200'
  return 'bg-slate-100 text-slate-600 ring-slate-200'
}

function parseDecimal(value: string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const n = Number.parseFloat(String(value))
  return Number.isFinite(n) ? n : 0
}

function formatMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function tripStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PLANNED: 'Planned',
    ONGOING: 'In progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    FLAGGED: 'Flagged',
    DELAYED: 'Delayed',
  }
  return map[status] ?? status
}

function tripStatusBadge(status: string): string {
  if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  if (status === 'ONGOING') return 'bg-indigo-50 text-indigo-700 ring-indigo-100'
  if (status === 'PLANNED') return 'bg-slate-50 text-slate-700 ring-slate-100'
  if (status === 'CANCELLED') return 'bg-rose-50 text-rose-700 ring-rose-100'
  return 'bg-amber-50 text-amber-800 ring-amber-100'
}

function OverviewCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle?: string
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-[#111827]">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
    </article>
  )
}

function formatTripDate(t: TripListDto): string {
  const raw = t.planned_departure_time ?? t.created_at
  if (!raw) return '—'
  try {
    return new Date(raw).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return raw
  }
}

export default function VehicleProfilePage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const router = useRouter()
  const vehicleQuery = useVehicleQuery(vehicleId)
  const tripsQuery = useVehicleTripsQuery(vehicleId)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TripFilterStatus>('All')

  const trips = tripsQuery.data?.trips ?? []

  const overview = useMemo(() => {
    const totalIncome = trips.reduce((acc, t) => acc + parseDecimal(t.revenue_amount), 0)
    const totalExpenses = trips.reduce((acc, t) => acc + parseDecimal(t.total_expenses), 0)
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const monthTrips = trips.filter((t) => {
      const raw = t.planned_departure_time ?? t.created_at
      if (!raw) return false
      const dt = new Date(raw)
      return dt.getFullYear() === y && dt.getMonth() === m
    })
    const monthlyProfit = monthTrips.reduce((acc, t) => acc + parseDecimal(t.profit), 0)

    return {
      tripsCount: tripsQuery.data?.count ?? trips.length,
      totalIncome,
      totalExpenses,
      monthlyProfit,
    }
  }, [trips, tripsQuery.data?.count])

  const filteredTrips = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return trips.filter((t) => {
      const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter
      const haystack =
        `${t.trip_number} ${t.pickup_location} ${t.destination} ${t.driver_name ?? ''} ${t.driver ?? ''}`.toLowerCase()
      const matchesSearch = q.length === 0 ? true : haystack.includes(q)
      return matchesStatus && matchesSearch
    })
  }, [trips, searchTerm, statusFilter])

  const vehicle = vehicleQuery.data
  const imgUrl = vehicle ? vehicleImageUrl(vehicle) : null

  if (!vehicleId) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#111827]">Vehicle not found</p>
          <p className="mt-2 text-sm text-gray-600">No vehicle ID in the URL.</p>
          <Link
            href={AppRoutesPaths.dashboard.vehicles}
            className="mt-6 inline-flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <HiArrowLeft className="h-4 w-4" />
            Back to vehicles
          </Link>
        </section>
)
  }

  if (vehicleQuery.isLoading) {
    return (
      <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">Loading vehicle…</p>
)
  }

  if (vehicleQuery.isError || !vehicle) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#111827]">Vehicle not found</p>
          <p className="mt-2 text-sm text-gray-600">This vehicle does not exist or you do not have access.</p>
          <Link
            href={AppRoutesPaths.dashboard.vehicles}
            className="mt-6 inline-flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <HiArrowLeft className="h-4 w-4" />
            Back to vehicles
          </Link>
        </section>
)
  }

  const titleBits = [vehicle.make, vehicle.model].filter(Boolean).join(' ')
  const yearBit = vehicle.year ? ` (${vehicle.year})` : ''

  return (
    <section className="space-y-4 rounded-2xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.push(AppRoutesPaths.dashboard.vehicles)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-[#111827]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600">
              <HiArrowLeft className="h-4 w-4" />
            </span>
            Back to vehicles
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt=""
                  className="h-28 w-40 shrink-0 rounded-xl border border-gray-100 object-cover"
                />
              ) : null}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Vehicle profile</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#111827]">{vehicle.registration_number}</h2>
                <p className="mt-1 text-gray-700">
                  {titleBits}
                  {yearBit}
                </p>
                {vehicle.company_name ? (
                  <p className="mt-1 text-sm text-gray-600">{vehicle.company_name}</p>
                ) : null}
              </div>
            </div>
            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses(vehicle.status)}`}
            >
              {vehicleStatusLabel(vehicle.status)}
            </span>
          </div>

          <div className="mt-6 grid gap-3 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div>
              <p className="text-xs text-gray-500">Assigned driver</p>
              <p className="mt-1 font-semibold text-[#111827]">{vehicle.assigned_driver_name ?? 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Color</p>
              <p className="mt-1 font-semibold text-[#111827]">{vehicle.color}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Vehicle type</p>
              <p className="mt-1 font-semibold text-[#111827]">{vehicleTypeLabel(vehicle.vehicle_type)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Odometer</p>
              <p className="mt-1 font-semibold text-[#111827]">{formatOdometerKm(vehicle.current_odometer)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last updated</p>
              <p className="mt-1 font-semibold text-[#111827]">
                {new Date(vehicle.updated_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          {vehicle.notes ? (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">{vehicle.notes}</p>
          ) : null}
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-[#111827]">Overview</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewCard title="Trips (recorded)" value={String(overview.tripsCount)} subtitle="Trips for this vehicle" />
            <OverviewCard title="Total revenue" value={formatMoney(overview.totalIncome)} subtitle="Sum of trip revenue" />
            <OverviewCard title="Total expenses" value={formatMoney(overview.totalExpenses)} subtitle="Fuel, tolls, other" />
            <OverviewCard
              title="Profit (this month)"
              value={formatMoney(overview.monthlyProfit)}
              subtitle={overview.monthlyProfit >= 0 ? 'Based on trip dates this month' : 'Below break-even'}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Totals reflect trips returned by the API for this vehicle (same scope as the table below).
          </p>
        </div>

        <div>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#111827]">Trips</h3>
              <p className="text-sm text-gray-600">Routes and drivers for this vehicle. Filter by status or search.</p>
            </div>
          </div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search trip number, route, driver…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 sm:max-w-md"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TripFilterStatus)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 sm:w-56"
            >
              <option value="All">Status: All</option>
              <option value="COMPLETED">Completed</option>
              <option value="ONGOING">In progress</option>
              <option value="PLANNED">Planned</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="FLAGGED">Flagged</option>
              <option value="DELAYED">Delayed</option>
            </select>
          </div>

          {tripsQuery.isLoading ? (
            <p className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">Loading trips…</p>
          ) : tripsQuery.isError ? (
            <p className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-800 shadow-sm">
              Could not load trips for this vehicle.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Trip #</th>
                      <th className="px-4 py-3 font-medium">Route</th>
                      <th className="px-4 py-3 font-medium">Driver</th>
                      <th className="px-4 py-3 font-medium">Driver ID</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Revenue</th>
                      <th className="px-4 py-3 font-medium text-right">Expenses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                          No trips match your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredTrips.map((row) => (
                        <tr key={row.id} className="border-b border-gray-100 last:border-none">
                          <td className="px-4 py-3 font-medium text-[#111827]">{row.trip_number}</td>
                          <td className="max-w-xs px-4 py-3 text-gray-700">
                            {row.pickup_location} → {row.destination}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{row.driver_name ?? '—'}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.driver ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{formatTripDate(row)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${tripStatusBadge(row.status)}`}
                            >
                              {tripStatusLabel(row.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-700">
                            {formatMoney(parseDecimal(row.revenue_amount))}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-rose-700">
                            {formatMoney(parseDecimal(row.total_expenses))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
)
}

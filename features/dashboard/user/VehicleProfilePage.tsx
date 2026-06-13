"use client";

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { HiArrowLeft } from 'react-icons/hi2'
import { AppRoutesPaths } from '@/route/paths'
import { useVehicleQuery } from '@/hooks/queries/useVehicleDetail'
import { useVehicleTripsQuery } from '@/hooks/queries/useVehicleTrips'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { useDeleteVehicleMutation } from '@/hooks/queries/useDeleteVehicle'
import { fleetAlertSuccess, fleetConfirm } from '@/lib/fleetAlert'
import { getErrorDetail } from '@/lib/apiErrors'
import { toast } from 'react-toastify'
import type { TripListDto } from '@/types/trip'
import {
  formatOdometerKm,
  vehicleImageUrl,
  vehicleStatusLabel,
  vehicleTypeLabel,
} from '@/lib/vehicleDisplay'
import type { ListVehiclesResponse, VehicleApiStatus, VehicleDto, VehicleListDto } from '@/types/vehicle'
import { LoadingCard } from "@/components/ui/LoadingSpinner"

type TripFilterStatus = 'All' | TripListDto['status']
type VehicleProfileDisplay = VehicleDto | VehicleListDto

function statusClasses(status: VehicleApiStatus): string {
  if (status === 'ACTIVE') return 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900'
  if (status === 'UNDER_MAINTENANCE') return 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900'
  if (status === 'OUT_OF_SERVICE') return 'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900'
  return 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
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
  if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900'
  if (status === 'ONGOING') return 'bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-900'
  if (status === 'PLANNED') return 'bg-slate-50 text-slate-700 ring-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
  if (status === 'CANCELLED') return 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900'
  return 'bg-amber-50 text-amber-800 ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900'
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
    <article className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold ff-heading">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
    </article>
  )
}


function findVehicleInListCache(
  queryClient: ReturnType<typeof useQueryClient>,
  vehicleId: string | undefined,
): VehicleListDto | null {
  if (!vehicleId) return null
  for (const [, data] of queryClient.getQueriesData<ListVehiclesResponse>({ queryKey: ['vehicles'] })) {
    const match = data?.vehicles.find((item) => item.id === vehicleId)
    if (match) return match
  }
  return null
}

function getVehicleImageUrl(vehicle: VehicleProfileDisplay): string | null {
  return 'image' in vehicle ? vehicleImageUrl(vehicle) : null
}

function getVehicleNotes(vehicle: VehicleProfileDisplay): string | null {
  return 'notes' in vehicle ? vehicle.notes : null
}

function getVehicleCompanyName(vehicle: VehicleProfileDisplay): string | null | undefined {
  return 'company_name' in vehicle ? vehicle.company_name : null
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
  const queryClient = useQueryClient()
  const vehicleQuery = useVehicleQuery(vehicleId)
  const userQuery = useCurrentUser()
  const deleteVehicleMutation = useDeleteVehicleMutation()
  const tripsQuery = useVehicleTripsQuery(vehicleId)
  const isFleetOwner = userQuery.data?.role === 'FLEET_OWNER'

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TripFilterStatus>('All')

  const cachedVehicle = useMemo(
    () => findVehicleInListCache(queryClient, vehicleId),
    [queryClient, vehicleId],
  )
  const trips = useMemo(() => tripsQuery.data?.trips ?? [], [tripsQuery.data?.trips])

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

  const vehicle: VehicleProfileDisplay | null = vehicleQuery.data ?? cachedVehicle
  const imgUrl = vehicle ? getVehicleImageUrl(vehicle) : null
  const notes = vehicle ? getVehicleNotes(vehicle) : null
  const companyName = vehicle ? getVehicleCompanyName(vehicle) : null

  if (!vehicleId) {
    return (
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
          <p className="text-lg font-semibold ff-heading">Vehicle not found</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">No vehicle ID in the URL.</p>
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

  if (vehicleQuery.isLoading && !vehicle) {
    return (
      <LoadingCard />
)
  }

  if ((vehicleQuery.isError && !vehicle) || !vehicle) {
    return (
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
          <p className="text-lg font-semibold ff-heading">Vehicle not found</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">This vehicle does not exist or you do not have access.</p>
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:text-slate-900 dark:hover:text-slate-100"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <HiArrowLeft className="h-4 w-4" />
            </span>
            Back to vehicles
          </button>
          {isFleetOwner ? (
            <button
              type="button"
              disabled={deleteVehicleMutation.isPending}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70"
              onClick={async () => {
                const confirmed = await fleetConfirm({
                  title: 'Delete this vehicle?',
                  html: `<p class="text-sm text-slate-600"><strong>${vehicle.registration_number}</strong> will be permanently removed.</p>`,
                  confirmText: 'Yes, delete',
                  cancelText: 'Cancel',
                  icon: 'warning',
                })
                if (!confirmed || !vehicleId) return
                try {
                  const data = await deleteVehicleMutation.mutateAsync(vehicleId)
                  await fleetAlertSuccess('Vehicle deleted', data.message)
                  router.push(AppRoutesPaths.dashboard.vehicles)
                } catch (err) {
                  toast.error(getErrorDetail(err) ?? 'Could not delete vehicle.')
                }
              }}
            >
              {deleteVehicleMutation.isPending ? 'Deleting…' : 'Delete vehicle'}
            </button>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {imgUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- Vehicle photos are served from backend media URLs. */}
                  <img
                    src={imgUrl}
                    alt=""
                    className="h-28 w-40 shrink-0 rounded-xl border border-slate-100 dark:border-slate-800 object-cover"
                  />
                </>
              ) : null}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Vehicle profile</p>
                <h2 className="mt-1 text-2xl font-semibold ff-heading">{vehicle.registration_number}</h2>
                <p className="mt-1 text-slate-700 dark:text-slate-300">
                  {titleBits}
                  {yearBit}
                </p>
                {companyName ? (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{companyName}</p>
                ) : null}
              </div>
            </div>
            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses(vehicle.status)}`}
            >
              {vehicleStatusLabel(vehicle.status)}
            </span>
          </div>

          <div className="mt-6 grid gap-3 border-t border-slate-100 dark:border-slate-800 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Assigned driver</p>
              <p className="mt-1 font-semibold ff-heading">{vehicle.assigned_driver_name ?? 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Color</p>
              <p className="mt-1 font-semibold ff-heading">{vehicle.color}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Vehicle type</p>
              <p className="mt-1 font-semibold ff-heading">{vehicleTypeLabel(vehicle.vehicle_type)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Odometer</p>
              <p className="mt-1 font-semibold ff-heading">{formatOdometerKm(vehicle.current_odometer)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Last updated</p>
              <p className="mt-1 font-semibold ff-heading">
                {new Date(vehicle.updated_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          {notes ? (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{notes}</p>
          ) : null}
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold ff-heading">Overview</h3>
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
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Totals reflect trips returned by the API for this vehicle (same scope as the table below).
          </p>
        </div>

        <div>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold ff-heading">Trips</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Routes and drivers for this vehicle. Filter by status or search.</p>
            </div>
          </div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search trip number, route, driver…"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 sm:max-w-md"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TripFilterStatus)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 sm:w-56"
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
            <LoadingCard />
          ) : tripsQuery.isError ? (
            <p className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-800 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              Could not load trips for this vehicle.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
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
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                          No trips match your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredTrips.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 last:border-none">
                          <td className="px-4 py-3 font-medium ff-heading">{row.trip_number}</td>
                          <td className="max-w-xs px-4 py-3 text-slate-700 dark:text-slate-300">
                            {row.pickup_location} → {row.destination}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.driver_name ?? '—'}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{row.driver ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatTripDate(row)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${tripStatusBadge(row.status)}`}
                            >
                              {tripStatusLabel(row.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-700 dark:text-emerald-300">
                            {formatMoney(parseDecimal(row.revenue_amount))}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-rose-700 dark:text-rose-300">
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

"use client";

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState } from 'react'
import { HiArrowLeft } from 'react-icons/hi2'
import { AppRoutesPaths } from '@/route/paths'
import { useCompanyUserQuery } from '@/hooks/queries/useCompanyUser'
import { useDriverCompletedTripsQuery } from '@/hooks/queries/useDriverCompletedTrips'
import { useVehiclesQuery } from '@/hooks/queries/useVehicles'
import type { TripPeriodFilter } from '@/lib/tripDateRange'
import { formatDriverEmailForDisplay } from '@/lib/userDisplay'
import type { TripListDto } from '@/types/trip'
import type { User } from '@/types/user'
import { LoadingCard, LoadingSpinner, LoadingState } from "@/components/ui/LoadingSpinner"

function parseDecimal(value: string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const n = Number.parseFloat(String(value))
  return Number.isFinite(n) ? n : 0
}

function formatMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function tripWhenLabel(t: TripListDto): string {
  const raw = t.actual_arrival_time ?? t.planned_departure_time ?? t.created_at
  if (!raw) return '—'
  try {
    return new Date(raw).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return raw
  }
}

function OverviewCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-[#111827]">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
    </article>
  )
}

function PeriodToggle({
  period,
  onChange,
}: {
  period: TripPeriodFilter
  onChange: (p: TripPeriodFilter) => void
}) {
  return (
    <div className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-[#f8fafc] p-1 text-xs font-semibold shadow-sm">
      {(['weekly', 'monthly'] as const).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-md px-3 py-1.5 capitalize transition ${
            period === key ? 'bg-[#fbbd26] text-[#111827]' : 'text-gray-700 hover:bg-white'
          }`}
        >
          {key}
        </button>
      ))}
    </div>
  )
}

export default function DriverProfilePage() {
  const { driverId } = useParams<{ driverId: string }>()
  const router = useRouter()
  const [period, setPeriod] = useState<TripPeriodFilter>('weekly')

  const userQuery = useCompanyUserQuery(driverId, !!driverId)
  const vehiclesQuery = useVehiclesQuery(undefined)
  const user = userQuery.data
  const driverProfileId = user?.driver_profile_id ?? driverId
  const tripsQuery = useDriverCompletedTripsQuery(driverProfileId, period, !!driverProfileId)

  const assignedVehicleLabel = useMemo(() => {
    if (!user) return 'Unassigned'
    const profileKey = user.driver_profile_id ?? user.id
    const v = vehiclesQuery.data?.vehicles.find((x) => x.assigned_driver === profileKey)
    if (!v) return 'Unassigned'
    return `${v.make} ${v.model} (${v.registration_number})`
  }, [user, vehiclesQuery.data?.vehicles])

  const trips = tripsQuery.data?.trips ?? []
  const displayEmail = user ? formatDriverEmailForDisplay(user.email) : null

  const overview = useMemo(() => {
    const totalRevenue = trips.reduce((acc, t) => acc + parseDecimal(t.revenue_amount), 0)
    const totalExpenses = trips.reduce((acc, t) => acc + parseDecimal(t.total_expenses), 0)
    const totalProfit = trips.reduce((acc, t) => acc + parseDecimal(t.profit), 0)
    return {
      tripCount: tripsQuery.data?.count ?? trips.length,
      totalRevenue,
      totalExpenses,
      totalProfit,
    }
  }, [trips, tripsQuery.data?.count])

  if (!driverId) {
    return <DriverNotFound />
  }

  if (userQuery.isLoading) {
    return (
      <LoadingCard />
    )
  }

  if (userQuery.isError || !user) {
    return <DriverNotFound />
  }

  return (
    <section className="space-y-4 rounded-2xl p-4">
      <button
        type="button"
        onClick={() => router.push(AppRoutesPaths.dashboard.drivers)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-[#111827]"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600">
          <HiArrowLeft className="h-4 w-4" />
        </span>
        Back to drivers
      </button>

      <DriverSummaryCard user={user} displayEmail={displayEmail} assignedVehicleLabel={assignedVehicleLabel} />

      <div>
        <h3 className="mb-3 text-lg font-semibold text-[#111827]">Overview</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            title={`Completed trips (${period})`}
            value={String(overview.tripCount)}
            subtitle="Filtered by planned departure"
          />
          <OverviewCard title="Revenue" value={formatMoney(overview.totalRevenue)} />
          <OverviewCard title="Expenses" value={formatMoney(overview.totalExpenses)} />
          <OverviewCard
            title="Profit"
            value={formatMoney(overview.totalProfit)}
            subtitle={overview.totalProfit >= 0 ? 'For selected period' : 'Below break-even'}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#111827]">Completed trips</h3>
          <p className="text-sm text-gray-600">Routes, timing, and financials for this driver.</p>
        </div>
        <PeriodToggle period={period} onChange={setPeriod} />
      </div>

      {tripsQuery.isLoading ? (
        <LoadingCard />
      ) : tripsQuery.isError ? (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-800 shadow-sm">
          Could not load trips for this driver.
        </p>
      ) : trips.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
          No completed trips in this {period === 'weekly' ? 'week' : 'month'}.
        </p>
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <TripListItem key={trip.id} trip={trip} />
          ))}
        </ul>
      )}
    </section>
  )
}

function DriverNotFound() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <p className="text-lg font-semibold text-[#111827]">Driver not found</p>
      <p className="mt-2 text-sm text-gray-600">This driver does not exist or you do not have access.</p>
      <Link
        href={AppRoutesPaths.dashboard.drivers}
        className="mt-6 inline-flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700"
      >
        <HiArrowLeft className="h-4 w-4" />
        Back to drivers
      </Link>
    </section>
  )
}

function DriverSummaryCard({
  user,
  displayEmail,
  assignedVehicleLabel,
}: {
  user: User
  displayEmail: string | null
  assignedVehicleLabel: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Driver profile</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#111827]">{user.full_name}</h2>
          <p className="mt-1 text-sm text-gray-700">{user.phone_number || '—'}</p>
          {displayEmail ? <p className="mt-1 text-sm text-gray-600">{displayEmail}</p> : null}
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            user.is_active
              ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
              : 'bg-slate-100 text-slate-600 ring-slate-200'
          }`}
        >
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <DriverSummaryGrid assignedVehicleLabel={assignedVehicleLabel} />
    </div>
  )
}

function DriverSummaryGrid({ assignedVehicleLabel }: { assignedVehicleLabel: string }) {
  return (
    <div className="mt-6 grid gap-3 border-t border-gray-100 pt-6 sm:grid-cols-2">
      <div>
        <p className="text-xs text-gray-500">Assigned vehicle</p>
        <p className="mt-1 font-semibold text-[#111827]">{assignedVehicleLabel}</p>
      </div>
    </div>
  )
}

function TripListItem({ trip }: { trip: TripListDto }) {
  const profit = parseDecimal(trip.profit)
  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Link
          href={AppRoutesPaths.dashboard.tripProfile(trip.trip_number)}
          className="font-semibold text-indigo-700 hover:text-indigo-800"
        >
          {trip.trip_number}
        </Link>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
          Completed
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-700">
        <span className="font-medium text-[#111827]">Route:</span> {trip.pickup_location} → {trip.destination}
      </p>
      {trip.vehicle_registration ? (
        <p className="mt-1 text-sm text-gray-600">Vehicle: {trip.vehicle_registration}</p>
      ) : null}
      <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-3">
        <p>
          <span className="text-gray-500">When:</span> {tripWhenLabel(trip)}
        </p>
        {trip.distance_km != null ? (
          <p>
            <span className="text-gray-500">Distance:</span> {trip.distance_km} km
          </p>
        ) : null}
        <p>
          <span className="text-gray-500">Revenue:</span>{' '}
          <span className="font-medium text-emerald-700">{formatMoney(parseDecimal(trip.revenue_amount))}</span>
        </p>
        <p>
          <span className="text-gray-500">Expenses:</span> {formatMoney(parseDecimal(trip.total_expenses))}
        </p>
        <p>
          <span className="text-gray-500">Profit:</span>{' '}
          <span className={profit >= 0 ? 'font-medium text-emerald-700' : 'font-medium text-rose-700'}>
            {formatMoney(profit)}
          </span>
        </p>
      </div>
    </li>
  )
}

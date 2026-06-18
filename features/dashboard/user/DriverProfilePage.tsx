"use client";

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { HiArrowLeft } from 'react-icons/hi2'
import { AppRoutesPaths } from '@/route/paths'
import { useCompanyUserQuery } from '@/hooks/queries/useCompanyUser'
import type { ListCompanyUsersResponse } from '@/services/companyUsersService'
import type { ListCompanyDriversResponse } from '@/services/driverAssignmentService'
import { useDriverCompletedTripsQuery } from '@/hooks/queries/useDriverCompletedTrips'
import { useVehiclesQuery } from '@/hooks/queries/useVehicles'
import type { TripPeriodFilter } from '@/lib/tripDateRange'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { useDeactivateDriverMutation } from '@/hooks/queries/useDeactivateDriver'
import { fleetAlertSuccess, fleetConfirm } from '@/lib/fleetAlert'
import { getErrorDetail } from '@/lib/apiErrors'
import { formatDriverEmailForDisplay } from '@/lib/userDisplay'
import { toast } from 'react-toastify'
import type { TripListDto } from '@/types/trip'
import type { User } from '@/types/user'
import { normalizeCurrency } from '@/lib/currencies'
import { formatMoneyAmount, parseAmount } from './finance/financeFormat'
import { LoadingCard } from "@/components/ui/LoadingSpinner"

function parseDecimal(value: string | null | undefined): number {
  return parseAmount(value)
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

function findDriverInListCache(
  queryClient: ReturnType<typeof useQueryClient>,
  driverId: string | undefined,
): User | null {
  if (!driverId) return null

  for (const [, data] of queryClient.getQueriesData<ListCompanyUsersResponse>({ queryKey: ['companyUsers'] })) {
    const match = data?.users.find((item) => item.id === driverId || item.driver_profile_id === driverId)
    if (match) return match
  }

  for (const [, data] of queryClient.getQueriesData<ListCompanyDriversResponse>({ queryKey: ['companyDrivers'] })) {
    const match = data?.drivers.find((item) => item.id === driverId || item.driver_profile_id === driverId)
    if (match) return match
  }

  return null
}

function OverviewCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold ff-heading">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
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
            period === key ? 'bg-[#fbbd26] text-[#111827]' : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900'
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
  const queryClient = useQueryClient()
  const [period, setPeriod] = useState<TripPeriodFilter>('weekly')

  const userQuery = useCompanyUserQuery(driverId, !!driverId)
  const currentUserQuery = useCurrentUser()
  const currency = normalizeCurrency(currentUserQuery.data?.preferred_currency)
  const deactivateMutation = useDeactivateDriverMutation()
  const vehiclesQuery = useVehiclesQuery(undefined)
  const cachedUser = useMemo(
    () => findDriverInListCache(queryClient, driverId),
    [queryClient, driverId],
  )
  const user = userQuery.data ?? cachedUser
  const driverProfileId = user?.driver_profile_id ?? driverId
  const tripsQuery = useDriverCompletedTripsQuery(driverProfileId, period, !!driverProfileId)

  const assignedVehicleLabel = useMemo(() => {
    if (!user) return 'Unassigned'
    const profileKey = user.driver_profile_id ?? user.id
    const v = vehiclesQuery.data?.vehicles.find((x) => x.assigned_driver === profileKey)
    if (!v) return 'Unassigned'
    return `${v.make} ${v.model} (${v.registration_number})`
  }, [user, vehiclesQuery.data?.vehicles])

  const trips = useMemo(() => tripsQuery.data?.trips ?? [], [tripsQuery.data?.trips])
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

  if (userQuery.isLoading && !user) {
    return (
      <LoadingCard />
    )
  }

  if ((userQuery.isError && !user) || !user) {
    return <DriverNotFound />
  }

  return (
    <section className="space-y-4 rounded-2xl p-4">
      <button
        type="button"
        onClick={() => router.push(AppRoutesPaths.dashboard.drivers)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:text-slate-900 dark:hover:text-slate-100"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <HiArrowLeft className="h-4 w-4" />
        </span>
        Back to drivers
      </button>

      <DriverSummaryCard
        user={user}
        displayEmail={displayEmail}
        assignedVehicleLabel={assignedVehicleLabel}
        onRemove={
          currentUserQuery.data?.role === 'FLEET_OWNER' && user.is_active
            ? async () => {
                const confirmed = await fleetConfirm({
                  title: 'Remove this driver?',
                  html: `<p class="text-sm text-slate-600"><strong>${user.full_name}</strong> will be deactivated and can no longer sign in.</p>`,
                  confirmText: 'Yes, remove',
                  cancelText: 'Cancel',
                  icon: 'warning',
                })
                if (!confirmed) return
                try {
                  const data = await deactivateMutation.mutateAsync(user.id)
                  await fleetAlertSuccess('Driver removed', data.message)
                  router.push(AppRoutesPaths.dashboard.drivers)
                } catch (err) {
                  toast.error(getErrorDetail(err) ?? 'Could not remove driver.')
                }
              }
            : undefined
        }
        removePending={deactivateMutation.isPending}
      />

      <div>
        <h3 className="mb-3 text-lg font-semibold ff-heading">Overview</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            title={`Completed trips (${period})`}
            value={String(overview.tripCount)}
            subtitle="Filtered by planned departure"
          />
          <OverviewCard title="Revenue" value={formatMoneyAmount(overview.totalRevenue, currency)} />
          <OverviewCard title="Expenses" value={formatMoneyAmount(overview.totalExpenses, currency)} />
          <OverviewCard
            title="Profit"
            value={formatMoneyAmount(overview.totalProfit, currency)}
            subtitle={overview.totalProfit >= 0 ? 'For selected period' : 'Below break-even'}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold ff-heading">Completed trips</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Routes, timing, and financials for this driver.</p>
        </div>
        <PeriodToggle period={period} onChange={setPeriod} />
      </div>

      {tripsQuery.isLoading ? (
        <LoadingCard />
      ) : tripsQuery.isError ? (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-800 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          Could not load trips for this driver.
        </p>
      ) : trips.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-600 dark:text-slate-400 shadow-sm">
          No completed trips in this {period === 'weekly' ? 'week' : 'month'}.
        </p>
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <TripListItem key={trip.id} trip={trip} currency={currency} />
          ))}
        </ul>
      )}
    </section>
  )
}

function DriverNotFound() {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
      <p className="text-lg font-semibold ff-heading">Driver not found</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">This driver does not exist or you do not have access.</p>
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
  onRemove,
  removePending,
}: {
  user: User
  displayEmail: string | null
  assignedVehicleLabel: string
  onRemove?: () => void
  removePending?: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Driver profile</p>
          <h2 className="mt-1 text-2xl font-semibold ff-heading">{user.full_name}</h2>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{user.phone_number || '—'}</p>
          {displayEmail ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{displayEmail}</p> : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
              user.is_active
                ? 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900'
                : 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
            }`}
          >
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
          {onRemove ? (
            <button
              type="button"
              onClick={() => void onRemove()}
              disabled={removePending}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70"
            >
              {removePending ? 'Removing…' : 'Remove driver'}
            </button>
          ) : null}
        </div>
      </div>

      <DriverSummaryGrid assignedVehicleLabel={assignedVehicleLabel} />
    </div>
  )
}

function DriverSummaryGrid({ assignedVehicleLabel }: { assignedVehicleLabel: string }) {
  return (
    <div className="mt-6 grid gap-3 border-t border-slate-100 dark:border-slate-800 pt-6 sm:grid-cols-2">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Assigned vehicle</p>
        <p className="mt-1 font-semibold ff-heading">{assignedVehicleLabel}</p>
      </div>
    </div>
  )
}

function TripListItem({ trip, currency }: { trip: TripListDto; currency: string }) {
  const profit = parseDecimal(trip.profit)
  return (
    <li className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Link
          href={AppRoutesPaths.dashboard.tripProfile(trip.id)}
          className="font-semibold text-indigo-700 hover:text-indigo-800"
        >
          {trip.trip_number}
        </Link>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900">
          Completed
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
        <span className="font-medium ff-heading">Route:</span> {trip.pickup_location} → {trip.destination}
      </p>
      {trip.vehicle_registration ? (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Vehicle: {trip.vehicle_registration}</p>
      ) : null}
      <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
        <p>
          <span className="text-slate-500 dark:text-slate-400">When:</span> {tripWhenLabel(trip)}
        </p>
        {trip.distance_km != null ? (
          <p>
            <span className="text-slate-500 dark:text-slate-400">Distance:</span> {trip.distance_km} km
          </p>
        ) : null}
        <p>
          <span className="text-slate-500 dark:text-slate-400">Revenue:</span>{' '}
          <span className="font-medium text-emerald-700 dark:text-emerald-300">{formatMoneyAmount(trip.revenue_amount, currency)}</span>
        </p>
        <p>
          <span className="text-slate-500 dark:text-slate-400">Expenses:</span> {formatMoneyAmount(trip.total_expenses, currency)}
        </p>
        <p>
          <span className="text-slate-500 dark:text-slate-400">Profit:</span>{' '}
          <span className={profit >= 0 ? 'font-medium text-emerald-700 dark:text-emerald-300' : 'font-medium text-rose-700 dark:text-rose-300'}>
            {formatMoneyAmount(profit, currency)}
          </span>
        </p>
      </div>
    </li>
  )
}

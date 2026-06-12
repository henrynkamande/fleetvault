"use client";

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { AppRoutesPaths } from '@/route/paths'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { useDeleteTripMutation } from '@/hooks/queries/useTripMutations'
import { useTripsListQuery } from '@/hooks/queries/useTripsList'
import { fleetAlertSuccess, fleetConfirm } from '@/lib/fleetAlert'
import { getErrorDetail } from '@/lib/apiErrors'
import { getAccessToken } from '@/lib/tokenStorage'
import { useAuthStore } from '@/store/useAuthStore'
import type { TripListDto } from '@/types/trip'
import { LoadingCard } from "@/components/ui/LoadingSpinner"

const LogTripModal = dynamic(() => import('./modals/LogTripModal'), {
  ssr: false,
})

type TripStatusUi = 'Ongoing' | 'Completed' | 'Flagged' | 'Planned' | 'Cancelled' | 'Delayed'

type TripSummary = {
  label: string
  value: string
  statusColor: 'green' | 'yellow' | 'neutral'
}

type TripRow = {
  id: string
  detailHref: string
  tripNumber: string
  status: TripStatusUi
  start: string
  destination: string
  driver: string
  vehicle: string
  distance: string
  income: string
  flagReason?: string
}

type TripSummaryCardProps = TripSummary

type TripCardProps = TripRow & {
  onDelete?: () => void
  deletePending?: boolean
}

type TripListProps = {
  trips: TripRow[]
  onDeleteTrip?: (trip: TripRow) => void
  deletePending?: boolean
}

type TripsPageHeaderProps = {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  statusFilter: 'All' | TripStatusUi
  onStatusFilterChange: (value: 'All' | TripStatusUi) => void
  onOpenLogTrip: () => void
  canLogTrips: boolean
}

function summaryTone(statusColor: TripSummary['statusColor']): string {
  if (statusColor === 'green') return 'text-emerald-700 bg-emerald-50 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900'
  if (statusColor === 'yellow') return 'text-amber-700 bg-amber-50 ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900'
  return 'text-slate-700 bg-slate-100 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
}

function TripSummaryCard({ label, value, statusColor }: TripSummaryCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-2xl font-semibold ring-1 ${summaryTone(statusColor)}`}>
        {value}
      </p>
    </article>
  )
}

function statusBadge(status: TripStatusUi): string {
  if (status === 'Ongoing') return 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900'
  if (status === 'Completed') return 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
  if (status === 'Flagged') return 'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900'
  if (status === 'Cancelled') return 'bg-rose-50 text-rose-800 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900'
  if (status === 'Delayed') return 'bg-amber-100 text-amber-800 ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900'
  if (status === 'Planned') return 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900'
  return 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
}

function TripCard({
  detailHref,
  status,
  start,
  destination,
  driver,
  vehicle,
  distance,
  income,
  flagReason,
  onDelete,
  deletePending,
}: TripCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#fbbd26]/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadge(status)}`}>
            {status}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href={detailHref}
            prefetch
            className="text-sm font-semibold text-[#111827] hover:text-[#f4b20a] dark:text-slate-100"
          >
            View Details
          </Link>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deletePending}
              className="text-sm font-semibold text-rose-700 hover:text-rose-800 disabled:opacity-50"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700 dark:text-slate-300 md:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400">Start Location</p>
          <p className="font-semibold text-[#111827] dark:text-slate-100">{start}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400">Destination</p>
          <p className="font-semibold text-[#111827] dark:text-slate-100">{destination}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400">Driver</p>
          <p className="font-semibold text-[#111827] dark:text-slate-100">{driver}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400">Vehicle</p>
          <p className="font-semibold text-[#111827] dark:text-slate-100">{vehicle}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f8fafc] p-3 dark:bg-slate-800/50 md:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400">Distance</p>
          <p className="font-semibold text-[#111827] dark:text-slate-100">{distance}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400">Income</p>
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">{income}</p>
        </div>
      </div>

      {status === 'Flagged' && flagReason ? (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 ring-1 ring-rose-100">
          {flagReason}
        </p>
      ) : null}
    </article>
  )
}

function TripList({ trips, onDeleteTrip, deletePending }: TripListProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#111827] dark:text-slate-100">Trip List</h3>
      </div>
      <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
        {trips.map((trip) => (
          <TripCard
            key={trip.id || trip.tripNumber}
            {...trip}
            onDelete={
              onDeleteTrip && trip.status !== 'Ongoing'
                ? () => onDeleteTrip(trip)
                : undefined
            }
            deletePending={deletePending}
          />
        ))}
      </div>
    </section>
  )
}

function TripsPageHeader({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  onOpenLogTrip,
  canLogTrips,
}: TripsPageHeaderProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-[#111827] dark:text-slate-100">Trips (GPS-Free)</h2>
        <button
          type="button"
          onClick={onOpenLogTrip}
          disabled={!canLogTrips}
          title={!canLogTrips ? 'Only vehicle owners can log new trips.' : undefined}
          className="inline-flex items-center gap-2 rounded-lg bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a] focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Log New Trip
        </button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Search trip number or driver..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 sm:max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as 'All' | TripStatusUi)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:w-52"
        >
          <option value="All">Status: All</option>
          <option value="Planned">Status: Planned</option>
          <option value="Ongoing">Status: Ongoing</option>
          <option value="Delayed">Status: Delayed</option>
          <option value="Completed">Status: Completed</option>
          <option value="Cancelled">Status: Cancelled</option>
          <option value="Flagged">Status: Flagged</option>
        </select>
      </div>
    </section>
  )
}

function parseDecimal(value: string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const n = Number.parseFloat(String(value))
  return Number.isFinite(n) ? n : 0
}

function formatMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function toUiStatus(t: TripListDto): TripStatusUi {
  if (t.is_flagged || t.status === 'FLAGGED') return 'Flagged'
  switch (t.status) {
    case 'ONGOING':
      return 'Ongoing'
    case 'COMPLETED':
      return 'Completed'
    case 'PLANNED':
      return 'Planned'
    case 'CANCELLED':
      return 'Cancelled'
    case 'DELAYED':
      return 'Delayed'
    default:
      return 'Planned'
  }
}

function tripDetailHref(t: TripListDto): string {
  const id = typeof t.id === 'string' ? t.id.trim() : ''
  const ref = id || (typeof t.trip_number === 'string' ? t.trip_number.trim() : '')
  if (!ref) return AppRoutesPaths.dashboard.trips
  return AppRoutesPaths.dashboard.tripProfile(ref)
}

function tripToRow(t: TripListDto): TripRow {
  const ui = toUiStatus(t)
  const dist =
    t.distance_km !== null && t.distance_km !== undefined
      ? `${t.distance_km} km${t.distance_is_estimated ? ' (est.)' : ''}`
      : '—'
  const id = typeof t.id === 'string' && t.id.trim() ? t.id.trim() : t.trip_number
  return {
    id,
    detailHref: tripDetailHref(t),
    tripNumber: t.trip_number,
    status: ui,
    start: t.pickup_location,
    destination: t.destination,
    driver: t.driver_name?.trim() ? t.driver_name : 'Unassigned',
    vehicle: t.vehicle_registration?.trim() ? t.vehicle_registration : '—',
    distance: dist,
    income: formatMoney(parseDecimal(t.revenue_amount)),
    flagReason: t.flag_reason ?? undefined,
  }
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function isCompletedToday(t: TripListDto): boolean {
  if (t.status !== 'COMPLETED') return false
  const raw = t.actual_arrival_time ?? t.updated_at
  if (!raw) return false
  const dt = new Date(raw)
  if (Number.isNaN(dt.getTime())) return false
  return dt >= startOfToday()
}

export default function Trips() {
  const ready = useAuthStore((s) => s.ready)
  const version = useAuthStore((s) => s.version)
  void version

  const tripsQuery = useTripsListQuery()
  const userQuery = useCurrentUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | TripStatusUi>('All')
  const [isLogTripOpen, setIsLogTripOpen] = useState(false)
  const token = ready ? getAccessToken() : null

  const rows = useMemo(() => {
    const list = tripsQuery.data?.trips ?? []
    return list.map(tripToRow)
  }, [tripsQuery.data?.trips])

  const summaryCards: TripSummary[] = useMemo(() => {
    const list = tripsQuery.data?.trips ?? []
    const active = list.filter((t) => t.status === 'ONGOING' || t.status === 'DELAYED').length
    const completedToday = list.filter(isCompletedToday).length
    const flagged = list.filter((t) => t.is_flagged || t.status === 'FLAGGED').length
    const openRevenue = list
      .filter((t) => t.status === 'PLANNED' || t.status === 'ONGOING' || t.status === 'DELAYED')
      .reduce((sum, t) => sum + parseDecimal(t.revenue_amount), 0)
    return [
      { label: 'Active Trips', value: String(active), statusColor: 'green' },
      { label: 'Completed Today', value: String(completedToday), statusColor: 'green' },
      { label: 'Flagged Issues', value: String(flagged), statusColor: 'yellow' },
      { label: 'Open-trip revenue', value: formatMoney(openRevenue), statusColor: 'neutral' },
    ]
  }, [tripsQuery.data?.trips])

  const filteredTrips = useMemo(() => {
    return rows.filter((trip) => {
      const matchesStatus = statusFilter === 'All' ? true : trip.status === statusFilter
      const query = searchTerm.trim().toLowerCase()
      const searchable =
        `${trip.tripNumber} ${trip.driver} ${trip.start} ${trip.destination} ${trip.vehicle}`.toLowerCase()
      const matchesSearch = query.length === 0 ? true : searchable.includes(query)
      return matchesStatus && matchesSearch
    })
  }, [searchTerm, statusFilter, rows])

  const canLogTrips = !!token && userQuery.data?.role === 'FLEET_OWNER'
  const isFleetOwner = userQuery.data?.role === 'FLEET_OWNER'
  const deleteTripMutation = useDeleteTripMutation()

  async function handleDeleteTrip(trip: TripRow) {
    const confirmed = await fleetConfirm({
      title: 'Delete this trip?',
      html: `<p class="text-sm text-slate-600">Trip <strong>${trip.tripNumber}</strong> will be permanently removed. This cannot be undone.</p>`,
      confirmText: 'Yes, delete',
      cancelText: 'Cancel',
      icon: 'warning',
    })
    if (!confirmed) return
    try {
      const data = await deleteTripMutation.mutateAsync(trip.id)
      await fleetAlertSuccess('Trip deleted', data.message)
    } catch (err) {
      toast.error(getErrorDetail(err) ?? 'Could not delete trip.')
    }
  }

  return (
    <>
    <section className="space-y-4 rounded-2xl p-4">
        {!token ? (
          <p className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Sign in to view and manage trips.
          </p>
        ) : null}

        {token && tripsQuery.isLoading ? (
          <LoadingCard className="border-0 bg-transparent shadow-none" />
        ) : null}

        {token && tripsQuery.isError ? (
          <p className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
            {getErrorDetail(tripsQuery.error)}
          </p>
        ) : null}

        {token && tripsQuery.isSuccess && tripsQuery.data.trips.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            No trips yet. Log your first trip to see it here.
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <TripSummaryCard key={card.label} {...card} />
          ))}
        </div>

        <TripsPageHeader
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onOpenLogTrip={() => setIsLogTripOpen(true)}
          canLogTrips={canLogTrips}
        />

        {token && tripsQuery.isSuccess ? (
          <TripList
            trips={filteredTrips}
            onDeleteTrip={isFleetOwner ? handleDeleteTrip : undefined}
            deletePending={deleteTripMutation.isPending}
          />
        ) : null}
      </section>
      <LogTripModal isOpen={isLogTripOpen} onClose={() => setIsLogTripOpen(false)} />
    </>
  )
}

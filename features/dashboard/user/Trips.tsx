"use client";

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react'
import LogTripModal from './modals/LogTripModal'
import { AppRoutesPaths } from '@/route/paths'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { useTripsListQuery } from '@/hooks/queries/useTripsList'
import { getErrorDetail } from '@/lib/apiErrors'
import { getAccessToken } from '@/lib/tokenStorage'
import { useAuthStore } from '@/store/useAuthStore'
import type { TripListDto } from '@/types/trip'

type TripStatusUi = 'Ongoing' | 'Completed' | 'Flagged' | 'Planned' | 'Cancelled' | 'Delayed'

type TripSummary = {
  label: string
  value: string
  statusColor: 'green' | 'yellow' | 'neutral'
}

type TripRow = {
  id: string
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

type TripCardProps = TripRow & { onViewDetails: () => void }

type TripListProps = {
  trips: TripRow[]
  onViewTrip: (tripNumber: string) => void
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
  if (statusColor === 'green') return 'text-emerald-700 bg-emerald-50 ring-emerald-100'
  if (statusColor === 'yellow') return 'text-amber-700 bg-amber-50 ring-amber-100'
  return 'text-slate-700 bg-slate-100 ring-slate-200'
}

function TripSummaryCard({ label, value, statusColor }: TripSummaryCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-2xl font-semibold ring-1 ${summaryTone(statusColor)}`}>
        {value}
      </p>
    </article>
  )
}

function statusBadge(status: TripStatusUi): string {
  if (status === 'Ongoing') return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  if (status === 'Completed') return 'bg-slate-100 text-slate-700 ring-slate-200'
  if (status === 'Flagged') return 'bg-rose-100 text-rose-700 ring-rose-200'
  if (status === 'Cancelled') return 'bg-rose-50 text-rose-800 ring-rose-100'
  if (status === 'Delayed') return 'bg-amber-100 text-amber-800 ring-amber-100'
  if (status === 'Planned') return 'bg-amber-100 text-amber-700 ring-amber-200'
  return 'bg-slate-100 text-slate-600 ring-slate-200'
}

function TripCard({
  tripNumber,
  status,
  start,
  destination,
  driver,
  vehicle,
  distance,
  income,
  flagReason,
  onViewDetails,
}: TripCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#fbbd26]/50 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-[#111827]">{tripNumber}</p>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadge(status)}`}>
            {status}
          </span>
        </div>
        <button
          type="button"
          onClick={onViewDetails}
          className="text-sm font-semibold text-[#111827] hover:text-[#f4b20a]"
        >
          View Details
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500">Start Location</p>
          <p className="font-semibold text-[#111827]">{start}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Destination</p>
          <p className="font-semibold text-[#111827]">{destination}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Driver</p>
          <p className="font-semibold text-[#111827]">{driver}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Vehicle</p>
          <p className="font-semibold text-[#111827]">{vehicle}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f8fafc] p-3 md:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500">Distance</p>
          <p className="font-semibold text-[#111827]">{distance}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Income</p>
          <p className="font-semibold text-emerald-600">{income}</p>
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

function TripList({ trips, onViewTrip }: TripListProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#111827]">Trip List</h3>
      </div>
      <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
        {trips.map((trip) => (
          <TripCard key={trip.id} {...trip} onViewDetails={() => onViewTrip(trip.tripNumber)} />
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
        <h2 className="text-xl font-semibold text-[#111827]">Trips (GPS-Free)</h2>
        <button
          type="button"
          onClick={onOpenLogTrip}
          disabled={!canLogTrips}
          title={!canLogTrips ? 'Only fleet owners can log new trips.' : undefined}
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
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 sm:max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as 'All' | TripStatusUi)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 sm:w-52"
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

function tripToRow(t: TripListDto): TripRow {
  const ui = toUiStatus(t)
  const dist =
    t.distance_km !== null && t.distance_km !== undefined
      ? `${t.distance_km} km${t.distance_is_estimated ? ' (est.)' : ''}`
      : '—'
  return {
    id: t.id,
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
  const router = useRouter()
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

  return (
    <>
    <section className="space-y-4 rounded-2xl p-4">
        {!token ? (
          <p className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Sign in to view and manage trips.
          </p>
        ) : null}

        {token && tripsQuery.isLoading ? (
          <p className="text-sm text-gray-600">Loading trips…</p>
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
            onViewTrip={(tripNumber) => router.push(AppRoutesPaths.dashboard.tripProfile(tripNumber))}
          />
        ) : null}
      </section>
      <LogTripModal isOpen={isLogTripOpen} onClose={() => setIsLogTripOpen(false)} />
    </>
  )
}

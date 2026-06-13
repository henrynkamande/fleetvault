"use client";

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react'
import { HiArrowLeft } from 'react-icons/hi2'
import { fleetAlertError, fleetAlertSuccess, fleetConfirm } from '@/lib/fleetAlert'
import { AppRoutesPaths } from '@/route/paths'
import { useTripDetailQuery } from '@/hooks/queries/useTripDetail'
import {
  useCancelTripMutation,
  useDeleteTripMutation,
  useUpdateTripMutation,
} from '@/hooks/queries/useTripMutations'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { getErrorDetail } from '@/lib/apiErrors'
import { driverPaymentModeLabel } from '@/lib/driverPaymentModes'
import { formatActualTripTime, formatTripDistanceKm } from '@/lib/tripDisplay'
import TripProfileEditForm from './TripProfileEditForm'
import { LoadingCard } from "@/components/ui/LoadingSpinner"

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function formatMoney(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number.parseFloat(String(value))
  if (!Number.isFinite(n)) return String(value)
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PLANNED: 'Planned',
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    FLAGGED: 'Flagged',
    DELAYED: 'Delayed',
  }
  return map[status] ?? status
}

function statusBadge(status: string): string {
  if (status === 'COMPLETED') return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  if (status === 'ONGOING') return 'bg-indigo-100 text-indigo-700 ring-indigo-200'
  if (status === 'PLANNED') return 'bg-amber-100 text-amber-700 ring-amber-200'
  if (status === 'CANCELLED') return 'bg-rose-100 text-rose-700 ring-rose-200'
  return 'bg-slate-100 text-slate-700 ring-slate-200'
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
      <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[#111827] dark:text-slate-100">{value}</p>
    </div>
  )
}

export default function TripProfilePage() {
  const params = useParams<{ tripRef: string | string[] }>()
  const rawRef = Array.isArray(params.tripRef) ? params.tripRef[0] : params.tripRef
  const tripRef =
    typeof rawRef === 'string' && rawRef.length > 0 ? decodeURIComponent(rawRef) : undefined
  const router = useRouter()
  const userQuery = useCurrentUser()
  const tripQuery = useTripDetailQuery(tripRef)
  const updateMutation = useUpdateTripMutation(tripRef)
  const cancelMutation = useCancelTripMutation(tripRef)
  const deleteTripMutation = useDeleteTripMutation()
  const [isEditing, setIsEditing] = useState(false)

  const isFleetOwner = userQuery.data?.role === 'FLEET_OWNER'

  if (!tripRef) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-[#111827]">Trip not found</p>
        <Link
          href={AppRoutesPaths.dashboard.trips}
          className="mt-6 inline-flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to trips
        </Link>
      </section>
    )
  }

  if (tripQuery.isLoading) {
    return (
      <LoadingCard />
    )
  }

  if (tripQuery.isError || !tripQuery.data) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-[#111827]">Trip not found</p>
        <p className="mt-2 text-sm text-gray-600" role="alert">
          {tripQuery.isError ? getErrorDetail(tripQuery.error) : 'This trip does not exist or you do not have access.'}
        </p>
        <Link
          href={AppRoutesPaths.dashboard.trips}
          className="mt-6 inline-flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to trips
        </Link>
      </section>
    )
  }

  const trip = tripQuery.data
  const canEdit =
    isFleetOwner && (trip.status === 'PLANNED' || trip.status === 'DELAYED') && !isEditing
  const canCancel =
    isFleetOwner && trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED'
  const canDelete = isFleetOwner && (trip.status === 'PLANNED' || trip.status === 'DELAYED')

  async function handleCancelTrip() {
    const confirmed = await fleetConfirm({
      title: 'Cancel this trip?',
      html: `<p class="text-sm text-slate-600">Trip <strong>${trip.trip_number}</strong> will be marked cancelled. This action cannot be undone.</p>`,
      confirmText: 'Yes, cancel trip',
      cancelText: 'Keep trip',
      icon: 'warning',
    })
    if (!confirmed) return
    cancelMutation.mutate('Cancelled from trip profile', {
      onSuccess: async (data) => {
        await fleetAlertSuccess('Trip cancelled', data.message || 'The trip has been cancelled successfully.')
        router.push(AppRoutesPaths.dashboard.trips)
      },
      onError: async () => {
        await fleetAlertError('Could not cancel trip', 'Please try again or contact support if the problem continues.')
      },
    })
  }

  async function handleDeleteTrip() {
    const confirmed = await fleetConfirm({
      title: 'Edit this trip record?',
      html: `<p class="text-sm text-slate-600">Trip <strong>${trip.trip_number}</strong> can be removed from owner records if it was logged by mistake. Driver effort and payout context stay transparent.</p>`,
      confirmText: 'Remove from records',
      cancelText: 'Keep record',
      icon: 'warning',
    })
    if (!confirmed) return
    try {
      const data = await deleteTripMutation.mutateAsync(trip.id)
      await fleetAlertSuccess('Trip record updated', data.message)
      router.push(AppRoutesPaths.dashboard.trips)
    } catch {
      await fleetAlertError('Could not delete trip', 'Please try again or contact support if the problem continues.')
    }
  }

  return (
    <section className="space-y-4 rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={AppRoutesPaths.dashboard.trips}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-[#111827]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600">
            <HiArrowLeft className="h-4 w-4" />
          </span>
          Back to trips
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={AppRoutesPaths.dashboard.trips}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            + New trip
          </Link>
          {canEdit ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-[#fbbd26] px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#f4b20a]"
            >
              Edit trip
            </button>
          ) : null}
          {isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              View details
            </button>
          ) : null}
          {canCancel ? (
            <button
              type="button"
              onClick={handleCancelTrip}
              disabled={cancelMutation.isPending}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-60"
            >
              {cancelMutation.isPending ? 'Cancelling…' : 'Cancel trip'}
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={() => void handleDeleteTrip()}
              disabled={deleteTripMutation.isPending}
              className="rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            >
              {deleteTripMutation.isPending ? 'Updating…' : 'Edit or remove record'}
            </button>
          ) : null}

        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Trip</p>
            <h1 className="mt-1 text-2xl font-bold text-[#111827]">{trip.trip_number}</h1>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ${statusBadge(trip.status)}`}>
            {statusLabel(trip.status)}
          </span>
        </div>

        {trip.is_flagged && trip.flag_reason && !isEditing ? (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-100">
            {trip.flag_reason}
          </p>
        ) : null}

        {isEditing ? (
          <TripProfileEditForm
            trip={trip}
            isPending={updateMutation.isPending}
            error={updateMutation.error}
            onCancel={() => setIsEditing(false)}
            onSubmit={(payload) => {
              updateMutation.mutate(payload, {
                onSuccess: async (data) => {
                  await fleetAlertSuccess('Trip updated', data.message || 'Your changes have been saved.')
                  setIsEditing(false)
                },
                onError: async () => {
                  await fleetAlertError('Could not save trip', 'Check the form for errors and try again.')
                },
              })
            }}
          />
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Pickup" value={trip.pickup_location} />
              <DetailRow label="Destination" value={trip.destination} />
              <DetailRow label="Vehicle" value={trip.vehicle_registration?.trim() || '—'} />
              <DetailRow label="Driver" value={trip.driver_name?.trim() || 'Unassigned'} />
              <DetailRow label="Planned departure" value={formatWhen(trip.planned_departure_time)} />
              <DetailRow label="Planned arrival" value={formatWhen(trip.planned_arrival_time)} />
              <DetailRow
                label="Actual departure"
                value={formatActualTripTime(trip.actual_departure_time, trip.status, 'departure')}
              />
              <DetailRow
                label="Actual arrival"
                value={formatActualTripTime(trip.actual_arrival_time, trip.status, 'arrival')}
              />
              <DetailRow label="Distance" value={formatTripDistanceKm(trip)} />
              <DetailRow label="Revenue" value={formatMoney(trip.revenue_amount)} />
              <DetailRow label="Driver pay mode" value={driverPaymentModeLabel(trip.driver_payment_mode)} />
              <DetailRow label="Driver payout" value={formatMoney(trip.driver_payment)} />
              <DetailRow label="Total expenses" value={formatMoney(trip.total_expenses)} />
              <DetailRow label="Profit" value={formatMoney(trip.profit)} />
              {trip.customer_name ? <DetailRow label="Customer" value={trip.customer_name} /> : null}
              {trip.cargo_description ? <DetailRow label="Cargo" value={trip.cargo_description} /> : null}
              {trip.manager_notes ? <DetailRow label="Manager notes" value={trip.manager_notes} /> : null}
            </div>
            {trip.driver_notes ? (
              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-500">Driver notes</p>
                <p className="mt-1">{trip.driver_notes}</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

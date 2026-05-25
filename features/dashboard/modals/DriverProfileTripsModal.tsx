"use client";

import { useEffect, useRef, useState } from 'react'
import { HiArrowLeft } from 'react-icons/hi2'
import { useCompanyUserQuery } from '@/hooks/queries/useCompanyUser'
import { useDriverCompletedTripsQuery } from '@/hooks/queries/useDriverCompletedTrips'
import { useVehiclesQuery } from '@/hooks/queries/useVehicles'
import type { TripPeriodFilter } from '@/lib/tripDateRange'
import type { TripListDto } from '@/types/trip'

type DriverProfileTripsModalProps = {
  driverId: string
  onClose: () => void
}

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

export default function DriverProfileTripsModal({ driverId, onClose }: DriverProfileTripsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [period, setPeriod] = useState<TripPeriodFilter>('weekly')

  const userQuery = useCompanyUserQuery(driverId, true)
  const tripsQuery = useDriverCompletedTripsQuery(driverId, period, true)
  const vehiclesQuery = useVehiclesQuery(undefined)

  useEffect(() => {
    overlayRef.current?.scrollTo(0, 0)
  }, [driverId])

  const assignedVehicleLabel = (() => {
    const v = vehiclesQuery.data?.vehicles.find((x) => x.assigned_driver === driverId)
    if (!v) return 'Unassigned'
    return `${v.make} ${v.model} (${v.registration_number})`
  })()

  const user = userQuery.data

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden bg-slate-900/45"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="flex min-h-full items-start justify-center p-4 pb-10 pt-4 sm:pt-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="driver-profile-title"
          className="mt-0 w-full max-w-4xl max-h-[min(92vh,92dvh)] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-2xl scroll-mt-4"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-white px-6 py-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Driver profile</p>
              {userQuery.isLoading ? (
                <h2 id="driver-profile-title" className="mt-1 text-xl font-semibold text-[#111827]">
                  Loading…
                </h2>
              ) : userQuery.isError || !user ? (
                <h2 id="driver-profile-title" className="mt-1 text-xl font-semibold text-[#111827]">
                  Driver not found
                </h2>
              ) : (
                <>
                  <h2 id="driver-profile-title" className="mt-1 truncate text-xl font-semibold text-[#111827]">
                    {user.full_name}
                  </h2>
                  <p className="mt-1 truncate text-sm text-gray-700">
                    {user.email} · <span className="font-mono text-xs">{user.id}</span>
                  </p>
                </>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {user ? (
                <span
                  className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold ring-1 sm:inline-flex ${
                    user.is_active
                      ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                      : 'bg-slate-100 text-slate-600 ring-slate-200'
                  }`}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close profile"
                className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>
          </div>

          {user ? (
            <div className="space-y-4 border-b border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-[#111827]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600">
                  <HiArrowLeft className="h-4 w-4" />
                </span>
                Back to drivers
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <section className="rounded-xl border border-gray-200 bg-[#f8fafc] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</h3>
                  <p className="mt-2 text-sm font-medium text-[#111827]">{user.email}</p>
                  <p className="mt-1 text-sm text-gray-700">{user.phone_number || '—'}</p>
                </section>
                <section className="rounded-xl border border-gray-200 bg-[#f8fafc] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned vehicle</h3>
                  <p className="mt-2 text-sm font-medium text-[#111827]">{assignedVehicleLabel}</p>
                  {vehiclesQuery.isLoading ? (
                    <p className="mt-1 text-xs text-gray-500">Loading fleet…</p>
                  ) : null}
                </section>
              </div>
            </div>
          ) : null}

          <div className="px-6 py-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#111827]">Completed trips</h3>
                <p className="text-sm text-gray-600">
                  Trips with status completed in the selected period (by planned departure date).
                </p>
              </div>
              <div className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-[#f8fafc] p-1 text-xs font-semibold shadow-sm">
                {(['weekly', 'monthly'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPeriod(key)}
                    className={`rounded-md px-3 py-1.5 capitalize transition ${
                      period === key ? 'bg-[#fbbd26] text-[#111827]' : 'text-gray-700 hover:bg-white'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {tripsQuery.isLoading ? (
              <p className="py-8 text-center text-sm text-gray-600">Loading trips…</p>
            ) : tripsQuery.isError ? (
              <p className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                Could not load trips for this driver.
              </p>
            ) : (tripsQuery.data?.trips.length ?? 0) === 0 ? (
              <p className="rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-8 text-center text-sm text-gray-600">
                No completed trips in this {period === 'weekly' ? 'week' : 'month'}.
              </p>
            ) : (
              <ul className="space-y-3">
                {tripsQuery.data!.trips.map((trip) => (
                  <li
                    key={trip.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold text-[#111827]">{trip.trip_number}</p>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                        Completed
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">
                      <span className="font-medium text-[#111827]">Route:</span> {trip.pickup_location} →{' '}
                      {trip.destination}
                    </p>
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
                        <span className="font-medium text-emerald-700">
                          {formatMoney(parseDecimal(trip.revenue_amount))}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-500">Expenses:</span>{' '}
                        {formatMoney(parseDecimal(trip.total_expenses))}
                      </p>
                      <p>
                        <span className="text-gray-500">Profit:</span>{' '}
                        <span
                          className={
                            parseDecimal(trip.profit) >= 0 ? 'font-medium text-emerald-700' : 'font-medium text-rose-700'
                          }
                        >
                          {formatMoney(parseDecimal(trip.profit))}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client";

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useCompanyDriversQuery } from '@/hooks/queries/useCompanyDrivers'
import { useVehiclesQuery } from '@/hooks/queries/useVehicles'
import { flattenFieldErrors, getErrorDetail, getResponseErrorData } from '@/lib/apiErrors'
import { fleetConfirm } from '@/lib/fleetAlert'
import { formatOdometerKm } from '@/lib/vehicleDisplay'
import { getDriverSelectLabel } from '@/lib/userDisplay'
import type { TripDetailDto, TripRevenueModel, UpdateTripPayload } from '@/types/trip'

type RevenueModelUi = 'Fixed Rate' | 'Per km' | 'Per delivery' | 'Contract'

const REVENUE_UI_TO_API: Record<RevenueModelUi, TripRevenueModel> = {
  'Fixed Rate': 'FIXED_RATE',
  'Per km': 'PER_KM',
  'Per delivery': 'PER_DELIVERY',
  Contract: 'CONTRACT',
}

const API_TO_REVENUE_UI: Record<TripRevenueModel, RevenueModelUi> = {
  FIXED_RATE: 'Fixed Rate',
  PER_KM: 'Per km',
  PER_DELIVERY: 'Per delivery',
  CONTRACT: 'Contract',
  HOURLY: 'Fixed Rate',
}

export type TripEditFormState = {
  pickupLocation: string
  destination: string
  estimatedDistanceKm: string
  vehicleId: string
  driverProfileId: string
  plannedDeparture: string
  plannedArrival: string
  customerName: string
  cargoDescription: string
  revenueModel: RevenueModelUi
  expectedRevenue: string
  fuelCost: string
  tollCost: string
  otherExpenses: string
  managerNotes: string
}

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function tripToEditForm(trip: TripDetailDto): TripEditFormState {
  const model = trip.revenue_model ? API_TO_REVENUE_UI[trip.revenue_model] : 'Fixed Rate'
  return {
    pickupLocation: trip.pickup_location ?? '',
    destination: trip.destination ?? '',
    estimatedDistanceKm:
      trip.planned_distance_km != null
        ? String(trip.planned_distance_km)
        : trip.distance_km != null && trip.distance_is_estimated
          ? String(trip.distance_km)
          : '',
    vehicleId: trip.vehicle ?? '',
    driverProfileId: trip.driver ?? '',
    plannedDeparture: toDatetimeLocalValue(trip.planned_departure_time),
    plannedArrival: toDatetimeLocalValue(trip.planned_arrival_time),
    customerName: trip.customer_name ?? '',
    cargoDescription: trip.cargo_description ?? '',
    revenueModel: model,
    expectedRevenue: trip.revenue_amount != null ? String(trip.revenue_amount) : '',
    fuelCost: trip.fuel_cost != null ? String(trip.fuel_cost) : '0',
    tollCost: trip.toll_cost != null ? String(trip.toll_cost) : '0',
    otherExpenses: trip.other_expenses != null ? String(trip.other_expenses) : '0',
    managerNotes: trip.manager_notes ?? '',
  }
}

export function editFormToPayload(form: TripEditFormState): UpdateTripPayload {
  const dep = new Date(form.plannedDeparture)
  const arr = form.plannedArrival ? new Date(form.plannedArrival) : null
  return {
    vehicle: form.vehicleId,
    pickup_location: form.pickupLocation.trim(),
    destination: form.destination.trim(),
    planned_departure_time: dep.toISOString(),
    planned_arrival_time: arr && !Number.isNaN(arr.getTime()) ? arr.toISOString() : null,
    planned_distance_km: form.estimatedDistanceKm.trim()
      ? Math.max(0, Math.round(Number.parseFloat(form.estimatedDistanceKm.trim())))
      : null,
    revenue_model: REVENUE_UI_TO_API[form.revenueModel],
    revenue_amount: Number.parseFloat(form.expectedRevenue.trim()),
    driver: form.driverProfileId || null,
    customer_name: form.customerName.trim() || null,
    cargo_description: form.cargoDescription.trim() || null,
    fuel_cost: Number.parseFloat(form.fuelCost.trim() || '0'),
    toll_cost: Number.parseFloat(form.tollCost.trim() || '0'),
    other_expenses: Number.parseFloat(form.otherExpenses.trim() || '0'),
    manager_notes: form.managerNotes.trim() || null,
  }
}

type TripProfileEditFormProps = {
  trip: TripDetailDto
  isPending: boolean
  error: unknown
  onSubmit: (payload: UpdateTripPayload) => void
  onCancel: () => void
}

function fieldClass(error?: string): string {
  return `w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 ${
    error
      ? 'border-rose-300 focus:ring-rose-200'
      : 'border-gray-300 focus:border-[#fbbd26] focus:ring-[#fbbd26]/30'
  }`
}

export default function TripProfileEditForm({
  trip,
  isPending,
  error,
  onSubmit,
  onCancel,
}: TripProfileEditFormProps) {
  const [form, setForm] = useState<TripEditFormState>(() => tripToEditForm(trip))
  const [errors, setErrors] = useState<Partial<Record<keyof TripEditFormState, string>>>({})

  const vehiclesQuery = useVehiclesQuery(undefined)
  const driversQuery = useCompanyDriversQuery(true)

  useEffect(() => {
    setForm(tripToEditForm(trip))
    setErrors({})
  }, [trip])

  const vehicleOptions = useMemo(() => {
    const list = vehiclesQuery.data?.vehicles ?? []
    return list.map((v) => ({
      id: v.id,
      label: `${v.make} ${v.model} (${v.registration_number})`,
      odometer: v.current_odometer,
    }))
  }, [vehiclesQuery.data?.vehicles])

  const vehicleOdometerLabel = useMemo(() => {
    const v = vehicleOptions.find((x) => x.id === form.vehicleId)
    return v ? formatOdometerKm(v.odometer) : ''
  }, [form.vehicleId, vehicleOptions])

  const driverOptions = useMemo(() => {
    const list = driversQuery.data?.drivers ?? []
    return list
      .filter((d) => d.driver_profile_id)
      .map((d) => ({
        profileId: d.driver_profile_id as string,
        label: getDriverSelectLabel(d),
      }))
  }, [driversQuery.data?.drivers])

  const apiErrors = error ? flattenFieldErrors(getResponseErrorData(error)) : {}
  const generalError =
    error && Object.keys(apiErrors).length === 0 ? getErrorDetail(error) : null

  function onFieldChange<K extends keyof TripEditFormState>(field: K, value: TripEditFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const next: Partial<Record<keyof TripEditFormState, string>> = {}
    if (!form.pickupLocation.trim()) next.pickupLocation = 'Required'
    if (!form.destination.trim()) next.destination = 'Required'
    if (!form.vehicleId) next.vehicleId = 'Required'
    if (!form.plannedDeparture) next.plannedDeparture = 'Required'
    if (!form.expectedRevenue.trim() || Number.isNaN(Number.parseFloat(form.expectedRevenue))) {
      next.expectedRevenue = 'Enter a valid amount'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return
    onSubmit(editFormToPayload(form))
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {generalError ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          {generalError}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Pickup</label>
          <input
            value={form.pickupLocation}
            onChange={(e) => onFieldChange('pickupLocation', e.target.value)}
            className={fieldClass(errors.pickupLocation)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Destination</label>
          <input
            value={form.destination}
            onChange={(e) => onFieldChange('destination', e.target.value)}
            className={fieldClass(errors.destination)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Estimated distance (km)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.estimatedDistanceKm}
            onChange={(e) => onFieldChange('estimatedDistanceKm', e.target.value)}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Vehicle</label>
          <select
            value={form.vehicleId}
            onChange={(e) => onFieldChange('vehicleId', e.target.value)}
            className={fieldClass(errors.vehicleId)}
          >
            <option value="">Select vehicle</option>
            {vehicleOptions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-600">
            Vehicle odometer (latest):{' '}
            <span className="font-semibold text-[#111827]">
              {vehicleOdometerLabel || 'Select a vehicle'}
            </span>
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Driver (optional)</label>
          <select
            value={form.driverProfileId}
            onChange={(e) => onFieldChange('driverProfileId', e.target.value)}
            className={fieldClass()}
          >
            <option value="">Unassigned</option>
            {driverOptions.map((d) => (
              <option key={d.profileId} value={d.profileId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Planned departure</label>
          <input
            type="datetime-local"
            value={form.plannedDeparture}
            onChange={(e) => onFieldChange('plannedDeparture', e.target.value)}
            className={fieldClass(errors.plannedDeparture)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Planned arrival (optional)</label>
          <input
            type="datetime-local"
            value={form.plannedArrival}
            onChange={(e) => onFieldChange('plannedArrival', e.target.value)}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Revenue model</label>
          <select
            value={form.revenueModel}
            onChange={(e) => onFieldChange('revenueModel', e.target.value as RevenueModelUi)}
            className={fieldClass()}
          >
            <option value="Fixed Rate">Fixed Rate</option>
            <option value="Per km">Per km</option>
            <option value="Per delivery">Per delivery</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Expected revenue</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.expectedRevenue}
            onChange={(e) => onFieldChange('expectedRevenue', e.target.value)}
            className={fieldClass(errors.expectedRevenue)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Customer (optional)</label>
          <input
            value={form.customerName}
            onChange={(e) => onFieldChange('customerName', e.target.value)}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Fuel cost</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.fuelCost}
            onChange={(e) => onFieldChange('fuelCost', e.target.value)}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Toll cost</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.tollCost}
            onChange={(e) => onFieldChange('tollCost', e.target.value)}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Other expenses</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.otherExpenses}
            onChange={(e) => onFieldChange('otherExpenses', e.target.value)}
            className={fieldClass()}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Cargo description (optional)</label>
          <textarea
            value={form.cargoDescription}
            onChange={(e) => onFieldChange('cargoDescription', e.target.value)}
            rows={2}
            className={fieldClass()}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Manager notes</label>
          <textarea
            value={form.managerNotes}
            onChange={(e) => onFieldChange('managerNotes', e.target.value)}
            rows={2}
            className={fieldClass()}
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={async () => {
            const confirmed = await fleetConfirm({
              title: 'Discard changes?',
              text: 'Unsaved edits to this trip will be lost.',
              confirmText: 'Discard',
              cancelText: 'Keep editing',
              icon: 'question',
            })
            if (confirmed) onCancel()
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#f4b20a] disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

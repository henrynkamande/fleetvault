"use client";

import { useRouter } from 'next/navigation';
import axios from 'axios'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { fleetAlertError, fleetAlertSuccess } from '@/lib/fleetAlert'
import { AppRoutesPaths } from '@/route/paths'
import { useCompanyDriversQuery } from '@/hooks/queries/useCompanyDrivers'
import { useCreateTripMutation } from '@/hooks/queries/useCreateTrip'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { useVehiclesQuery } from '@/hooks/queries/useVehicles'
import { flattenFieldErrors, getErrorDetail, getResponseErrorData } from '@/lib/apiErrors'
import { formatOdometerKm } from '@/lib/vehicleDisplay'
import type { TripRevenueModel } from '@/types/trip'

type RevenueModelUi = 'Fixed Rate' | 'Per km' | 'Per delivery' | 'Contract'

const REVENUE_UI_TO_API: Record<RevenueModelUi, TripRevenueModel> = {
  'Fixed Rate': 'FIXED_RATE',
  'Per km': 'PER_KM',
  'Per delivery': 'PER_DELIVERY',
  Contract: 'CONTRACT',
}

type LogTripModalProps = {
  isOpen: boolean
  onClose: () => void
}

type LogTripForm = {
  pickupLocation: string
  destination: string
  estimatedDistanceKm: string
  vehicleId: string
  driverProfileId: string
  plannedDeparture: string
  plannedArrival: string
  customerName: string
  revenueModel: RevenueModelUi
  expectedRevenue: string
  fuelCost: string
  tollCost: string
  otherExpenses: string
  cargoDescription: string
  managerNotes: string
}

type RouteInfoFormProps = {
  form: LogTripForm
  onFieldChange: <K extends keyof LogTripForm>(field: K, value: LogTripForm[K]) => void
  errors: Partial<Record<keyof LogTripForm, string>>
}

type FleetDriverFormProps = RouteInfoFormProps & {
  vehicles: { id: string; label: string }[]
  drivers: { profileId: string; label: string }[]
  startingOdometer: string
  vehiclesLoading: boolean
  driversLoading: boolean
  driversError: boolean
}

type ScheduleFinancialFormProps = RouteInfoFormProps

type ModalActionsProps = {
  onClose: () => void
  isPending: boolean
}

const initialForm: LogTripForm = {
  pickupLocation: '',
  destination: '',
  estimatedDistanceKm: '',
  vehicleId: '',
  driverProfileId: '',
  plannedDeparture: '',
  plannedArrival: '',
  customerName: '',
  revenueModel: 'Fixed Rate',
  expectedRevenue: '',
  fuelCost: '0',
  tollCost: '0',
  otherExpenses: '0',
  cargoDescription: '',
  managerNotes: '',
}

/** Map DRF field names to form keys for inline errors. */
const API_FIELD_TO_FORM: Partial<Record<string, keyof LogTripForm>> = {
  pickup_location: 'pickupLocation',
  destination: 'destination',
  vehicle: 'vehicleId',
  driver: 'driverProfileId',
  planned_departure_time: 'plannedDeparture',
  customer_name: 'customerName',
  revenue_model: 'revenueModel',
  revenue_amount: 'expectedRevenue',
}

function fieldClass(error?: string): string {
  return `w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-2 ${
    error
      ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-200'
      : 'border-gray-300 focus:border-[#fbbd26] focus:ring-[#fbbd26]/30'
  }`
}

function RouteInfoForm({ form, onFieldChange, errors }: RouteInfoFormProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Route Information</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <input
            value={form.pickupLocation}
            onChange={(event) => onFieldChange('pickupLocation', event.target.value)}
            placeholder="Pickup Location (e.g. Warehouse A, Berlin)"
            className={fieldClass(errors.pickupLocation)}
          />
          {errors.pickupLocation ? <p className="mt-1 text-xs text-rose-600">{errors.pickupLocation}</p> : null}
        </div>
        <div>
          <input
            value={form.destination}
            onChange={(event) => onFieldChange('destination', event.target.value)}
            placeholder="Destination (e.g. Central Hub, Munich)"
            className={fieldClass(errors.destination)}
          />
          {errors.destination ? <p className="mt-1 text-xs text-rose-600">{errors.destination}</p> : null}
        </div>
        <div>
          <input
            type="number"
            value={form.estimatedDistanceKm}
            onChange={(event) => onFieldChange('estimatedDistanceKm', event.target.value)}
            placeholder="Estimated Distance (km) — optional note"
            className={fieldClass()}
          />
          <p className="mt-1 text-xs text-gray-500">
            Saved on the trip until odometer readings replace it after the driver completes the run.
          </p>
        </div>
      </div>
    </section>
  )
}

function FleetDriverForm({
  form,
  onFieldChange,
  errors,
  vehicles,
  drivers,
  startingOdometer,
  vehiclesLoading,
  driversLoading,
  driversError,
}: FleetDriverFormProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Fleet &amp; Driver Assignments</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <select
            value={form.vehicleId}
            onChange={(event) => onFieldChange('vehicleId', event.target.value)}
            disabled={vehiclesLoading}
            className={fieldClass(errors.vehicleId)}
          >
            <option value="">{vehiclesLoading ? 'Loading vehicles…' : 'Assign Vehicle'}</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
          </select>
          {errors.vehicleId ? <p className="mt-1 text-xs text-rose-600">{errors.vehicleId}</p> : null}
        </div>
        <div>
          <select
            value={form.driverProfileId}
            onChange={(event) => onFieldChange('driverProfileId', event.target.value)}
            disabled={driversLoading}
            className={fieldClass()}
          >
            <option value="">{driversLoading ? 'Loading drivers…' : 'Assign Driver (optional)'}</option>
            {drivers.map((driver) => (
              <option key={driver.profileId} value={driver.profileId}>
                {driver.label}
              </option>
            ))}
          </select>
          {driversError ? (
            <p className="mt-1 text-xs text-amber-700">Could not load drivers — you can still create the trip without assignment.</p>
          ) : null}
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-600">
        Vehicle odometer (latest): <span className="font-semibold text-[#111827]">{startingOdometer || 'Select a vehicle'}</span>
      </p>
    </section>
  )
}

function ScheduleFinancialForm({ form, onFieldChange, errors }: ScheduleFinancialFormProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Schedule &amp; Financials</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Planned departure</label>
          <input
            type="datetime-local"
            value={form.plannedDeparture}
            onChange={(event) => onFieldChange('plannedDeparture', event.target.value)}
            className={fieldClass(errors.plannedDeparture)}
          />
          {errors.plannedDeparture ? <p className="mt-1 text-xs text-rose-600">{errors.plannedDeparture}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Planned arrival (optional)</label>
          <input
            type="datetime-local"
            value={form.plannedArrival}
            onChange={(event) => onFieldChange('plannedArrival', event.target.value)}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Customer / client (optional)</label>
          <input
            value={form.customerName}
            onChange={(event) => onFieldChange('customerName', event.target.value)}
            placeholder="Company or contact name"
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Revenue model</label>
          <select
            value={form.revenueModel}
            onChange={(event) => onFieldChange('revenueModel', event.target.value as RevenueModelUi)}
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
            onChange={(event) => onFieldChange('expectedRevenue', event.target.value)}
            placeholder="0.00"
            className={fieldClass(errors.expectedRevenue)}
          />
          {errors.expectedRevenue ? <p className="mt-1 text-xs text-rose-600">{errors.expectedRevenue}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Fuel cost</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.fuelCost}
            onChange={(event) => onFieldChange('fuelCost', event.target.value)}
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
            onChange={(event) => onFieldChange('tollCost', event.target.value)}
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
            onChange={(event) => onFieldChange('otherExpenses', event.target.value)}
            className={fieldClass()}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Cargo description (optional)</label>
          <textarea
            value={form.cargoDescription}
            onChange={(event) => onFieldChange('cargoDescription', event.target.value)}
            rows={2}
            className={fieldClass()}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Manager notes (optional)</label>
          <textarea
            value={form.managerNotes}
            onChange={(event) => onFieldChange('managerNotes', event.target.value)}
            rows={2}
            className={fieldClass()}
          />
        </div>
      </div>
    </section>
  )
}

function ModalActions({ onClose, isPending }: ModalActionsProps) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a] focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/50 disabled:opacity-60"
      >
        {isPending ? 'Creating…' : 'Create Trip'}
      </button>
    </div>
  )
}

export default function LogTripModal({ isOpen, onClose }: LogTripModalProps) {
  const router = useRouter()
  const [form, setForm] = useState<LogTripForm>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof LogTripForm, string>>>({})
  const overlayRef = useRef<HTMLDivElement>(null)

  const userQuery = useCurrentUser()
  const vehiclesQuery = useVehiclesQuery(undefined)
  const driversQuery = useCompanyDriversQuery(isOpen)
  const createMutation = useCreateTripMutation()

  const isFleetOwner = userQuery.data?.role === 'FLEET_OWNER'

  const vehicleOptions = useMemo(() => {
    const list = vehiclesQuery.data?.vehicles ?? []
    return list.map((v) => ({
      id: v.id,
      label: `${v.make} ${v.model} (${v.registration_number})`,
      odometer: v.current_odometer,
    }))
  }, [vehiclesQuery.data?.vehicles])

  const driverOptions = useMemo(() => {
    const list = driversQuery.data?.drivers ?? []
    return list
      .filter((d) => d.driver_profile_id)
      .map((d) => ({
        profileId: d.driver_profile_id as string,
        label: `${d.full_name} (${d.email})`,
      }))
  }, [driversQuery.data?.drivers])

  const startingOdometer = useMemo(() => {
    const v = vehicleOptions.find((x) => x.id === form.vehicleId)
    return v ? formatOdometerKm(v.odometer) : ''
  }, [form.vehicleId, vehicleOptions])

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm)
      setErrors({})
      createMutation.reset()
    }
  }, [isOpen, createMutation])

  useEffect(() => {
    if (!isOpen) return
    overlayRef.current?.scrollTo(0, 0)
  }, [isOpen])

  if (!isOpen) return null

  function onFieldChange<K extends keyof LogTripForm>(field: K, value: LogTripForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    if (createMutation.isError) createMutation.reset()
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof LogTripForm, string>> = {}
    if (!form.pickupLocation.trim()) nextErrors.pickupLocation = 'Pickup location is required.'
    if (!form.destination.trim()) nextErrors.destination = 'Destination is required.'
    if (!form.vehicleId) nextErrors.vehicleId = 'Vehicle assignment is required.'
    if (!form.plannedDeparture) nextErrors.plannedDeparture = 'Planned departure is required.'
    const rev = form.expectedRevenue.trim()
    if (!rev) nextErrors.expectedRevenue = 'Expected revenue is required.'
    else if (Number.isNaN(Number.parseFloat(rev)) || Number.parseFloat(rev) < 0) {
      nextErrors.expectedRevenue = 'Enter a valid amount.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isFleetOwner) return
    if (!validate()) return

    const dep = new Date(form.plannedDeparture)
    if (Number.isNaN(dep.getTime())) {
      setErrors((e) => ({ ...e, plannedDeparture: 'Invalid date.' }))
      return
    }

    const arr = form.plannedArrival ? new Date(form.plannedArrival) : null
    const payload = {
      vehicle: form.vehicleId,
      pickup_location: form.pickupLocation.trim(),
      destination: form.destination.trim(),
      planned_departure_time: dep.toISOString(),
      planned_arrival_time: arr && !Number.isNaN(arr.getTime()) ? arr.toISOString() : null,
      revenue_model: REVENUE_UI_TO_API[form.revenueModel],
      revenue_amount: Number.parseFloat(form.expectedRevenue.trim()),
      fuel_cost: Number.parseFloat(form.fuelCost.trim() || '0'),
      toll_cost: Number.parseFloat(form.tollCost.trim() || '0'),
      other_expenses: Number.parseFloat(form.otherExpenses.trim() || '0'),
      ...(form.driverProfileId ? { driver: form.driverProfileId } : {}),
      ...(form.customerName.trim() ? { customer_name: form.customerName.trim() } : {}),
      ...(form.cargoDescription.trim() ? { cargo_description: form.cargoDescription.trim() } : {}),
      ...(form.managerNotes.trim() ? { manager_notes: form.managerNotes.trim() } : {}),
      ...(form.estimatedDistanceKm.trim()
        ? { planned_distance_km: Math.max(0, Math.round(Number.parseFloat(form.estimatedDistanceKm.trim()))) }
        : {}),
    }

    createMutation.mutate(payload, {
      onSuccess: async (data) => {
        onClose()
        await fleetAlertSuccess('Trip created', data.message || 'The trip record was created successfully.')
        router.push(AppRoutesPaths.dashboard.tripProfile(data.trip.trip_number))
      },
      onError: async () => {
        await fleetAlertError('Could not create trip', 'Review the highlighted fields or try again in a moment.')
      },
    })
  }

  const permissionError = axios.isAxiosError(createMutation.error) && createMutation.error.response?.status === 403
  const rawApiErrors = createMutation.isError ? flattenFieldErrors(getResponseErrorData(createMutation.error)) : {}
  const mergedFieldErrors: Partial<Record<keyof LogTripForm, string>> = { ...errors }
  for (const [apiKey, msg] of Object.entries(rawApiErrors)) {
    const formKey = API_FIELD_TO_FORM[apiKey]
    if (formKey && msg) mergedFieldErrors[formKey] = msg
  }
  const hasOnlyUnmappedFieldErrors =
    Object.keys(rawApiErrors).length > 0 && Object.keys(rawApiErrors).every((k) => !API_FIELD_TO_FORM[k])
  const generalError =
    createMutation.isError && !permissionError &&
    (Object.keys(rawApiErrors).length === 0 || hasOnlyUnmappedFieldErrors)
      ? getErrorDetail(createMutation.error)
      : null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-slate-900/45 [touch-action:pan-y]"
    >
      <div className="flex min-h-full w-full items-center justify-center p-4 py-6 sm:py-10">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-trip-title"
          className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 id="log-trip-title" className="text-xl font-semibold text-[#111827]">
                Log New Trip
              </h2>
              <p className="text-sm text-gray-700">Create a new trip record for manual tracking.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ×
            </button>
          </div>

          {!isFleetOwner ? (
            <p className="border-b border-amber-100 bg-amber-50 px-6 py-3 text-sm text-amber-900">
              Only fleet owners can create trips. Ask your fleet administrator to log this trip.
            </p>
          ) : null}
          {permissionError ? (
            <p className="border-b border-amber-100 bg-amber-50 px-6 py-3 text-sm text-amber-900">
              You do not have permission to create trips.
            </p>
          ) : null}
          {generalError ? (
            <p className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-800" role="alert">
              {generalError}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <RouteInfoForm form={form} onFieldChange={onFieldChange} errors={mergedFieldErrors} />
            <FleetDriverForm
              form={form}
              onFieldChange={onFieldChange}
              errors={mergedFieldErrors}
              vehicles={vehicleOptions}
              drivers={driverOptions}
              startingOdometer={startingOdometer}
              vehiclesLoading={vehiclesQuery.isLoading}
              driversLoading={driversQuery.isLoading}
              driversError={driversQuery.isError}
            />
            <ScheduleFinancialForm form={form} onFieldChange={onFieldChange} errors={mergedFieldErrors} />
            <ModalActions onClose={onClose} isPending={createMutation.isPending} />
          </form>
        </div>
      </div>
    </div>
  )
}

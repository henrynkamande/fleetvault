"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react'
import axios from 'axios'
import { useCompanyDriversQuery } from '@/hooks/queries/useCompanyDrivers'
import { useCreateVehicleMutation } from '@/hooks/queries/useCreateVehicle'
import { apiStatusFromModal, VEHICLE_TYPE_OPTIONS } from '@/lib/vehicleDisplay'
import { getDriverSelectLabel } from '@/lib/userDisplay'
import type { VehicleTypeCode } from '@/types/vehicle'
import { flattenFieldErrors, getErrorDetail, getResponseErrorData } from '@/lib/apiErrors'
import type { CreateVehiclePayload } from '@/types/vehicle'

type UiStatus = 'Active' | 'Maintenance' | 'Inactive'

type AddVehicleModalProps = {
  isOpen: boolean
  onClose: () => void
}

type FormState = {
  registration_number: string
  make: string
  model: string
  color: string
  vehicle_type: VehicleTypeCode
  year: string
  load_capacity: string
  current_odometer: string
  initialStatus: UiStatus
  assigned_driver_id: string
}

const initialForm: FormState = {
  registration_number: '',
  make: '',
  model: '',
  color: '',
  vehicle_type: 'TRUCK',
  year: '',
  load_capacity: '',
  current_odometer: '',
  initialStatus: 'Active',
  assigned_driver_id: '',
}

function fieldClass(hasError = false): string {
  return `w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 disabled:opacity-60 dark:text-slate-200 dark:placeholder:text-slate-500 ${
    hasError
      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-900/40'
      : 'border-slate-300 focus:border-[#fbbd26] focus:ring-[#fbbd26]/30 dark:border-slate-700'
  }`
}

export default function AddVehicleModal({ isOpen, onClose }: AddVehicleModalProps) {
  const [form, setForm] = useState<FormState>(initialForm)
  const driversQuery = useCompanyDriversQuery(isOpen)
  const createMutation = useCreateVehicleMutation()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) return undefined
    const timer = window.setTimeout(() => setForm(initialForm), 0)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    overlayRef.current?.scrollTo(0, 0)
  }, [isOpen])

  if (!isOpen) return null

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const yearNum = form.year.trim() ? Number.parseInt(form.year, 10) : undefined
    const odo = form.current_odometer.trim()
      ? Number.parseInt(form.current_odometer.replace(/,/g, ''), 10)
      : 0

    const payload: CreateVehiclePayload = {
      registration_number: form.registration_number.trim().toUpperCase(),
      make: form.make.trim(),
      model: form.model.trim(),
      color: form.color.trim(),
      vehicle_type: form.vehicle_type,
      status: apiStatusFromModal(form.initialStatus),
      current_odometer: Number.isFinite(odo) ? odo : 0,
    }

    if (yearNum !== undefined && !Number.isNaN(yearNum)) {
      payload.year = yearNum
    }
    if (form.load_capacity.trim()) {
      payload.load_capacity = form.load_capacity.trim()
    }
    if (form.assigned_driver_id) {
      const d = driversQuery.data?.drivers.find((u) => u.id === form.assigned_driver_id)
      const profileId = d?.driver_profile_id
      if (profileId) {
        payload.assigned_driver = profileId
      }
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        onClose()
        setForm(initialForm)
      },
    })
  }

  const fieldErrors = createMutation.isError ? flattenFieldErrors(getResponseErrorData(createMutation.error)) : {}
  const generalError =
    createMutation.isError && Object.keys(fieldErrors).length === 0 ? getErrorDetail(createMutation.error) : null
  const permissionError = axios.isAxiosError(createMutation.error) && createMutation.error.response?.status === 403

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-slate-900/45 [touch-action:pan-y]"
    >
      {/* Single scroll container: backdrop scrolls on small screens / zoom. No nested max-h+overflow on the card (breaks many mobile browsers). */}
      <div className="flex min-h-full w-full items-center justify-center p-4 py-6 sm:py-10">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-vehicle-title"
          className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 shadow-2xl dark:border-slate-700"
        >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 id="add-vehicle-title" className="text-xl font-semibold ff-heading">
              Add New Vehicle
            </h2>
            <p className="text-sm ff-muted">Enter vehicle details and optionally assign a driver.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            ×
          </button>
        </div>

        {permissionError ? (
          <p className="border-b border-amber-100 bg-amber-50 px-6 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            Only vehicle owners can add vehicles.
          </p>
        ) : null}
        {generalError ? (
          <p className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200" role="alert">
            {generalError}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">General Information</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-medium ff-heading">Registration number (license plate)</span>
                <input
                  required
                  value={form.registration_number}
                  onChange={(e) => {
                    updateField('registration_number', e.target.value)
                    if (createMutation.isError) createMutation.reset()
                  }}
                  placeholder="e.g. KCA 123A"
                  autoComplete="off"
                  aria-invalid={fieldErrors.registration_number ? true : undefined}
                  className={fieldClass(Boolean(fieldErrors.registration_number))}
                />
                <p className="text-xs ff-muted">
                  Must be unique within your fleet. Stored in uppercase to avoid duplicate plates that differ only by
                  letter case.
                </p>
                {fieldErrors.registration_number ? (
                  <span className="text-xs text-red-600 dark:text-red-300">{fieldErrors.registration_number}</span>
                ) : null}
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium ff-heading">Make</span>
                <input
                  required
                  value={form.make}
                  onChange={(e) => updateField('make', e.target.value)}
                  placeholder="e.g. Volvo"
                  className={fieldClass()}
                />
                {fieldErrors.make ? <span className="text-xs text-red-600 dark:text-red-300">{fieldErrors.make}</span> : null}
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium ff-heading">Model</span>
                <input
                  required
                  value={form.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  placeholder="e.g. FH16"
                  className={fieldClass()}
                />
                {fieldErrors.model ? <span className="text-xs text-red-600 dark:text-red-300">{fieldErrors.model}</span> : null}
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium ff-heading">Year of manufacture</span>
                <input
                  value={form.year}
                  onChange={(e) => updateField('year', e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 2021"
                  className={fieldClass()}
                />
                {fieldErrors.year ? <span className="text-xs text-red-600 dark:text-red-300">{fieldErrors.year}</span> : null}
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium ff-heading">Color</span>
                <input
                  required
                  value={form.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  placeholder="e.g. White"
                  className={fieldClass()}
                />
                {fieldErrors.color ? <span className="text-xs text-red-600 dark:text-red-300">{fieldErrors.color}</span> : null}
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium ff-heading">Vehicle type</span>
                <select
                  required
                  value={form.vehicle_type}
                  onChange={(e) => updateField('vehicle_type', e.target.value as VehicleTypeCode)}
                  className={fieldClass()}
                >
                  {VEHICLE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.vehicle_type ? (
                  <span className="text-xs text-red-600 dark:text-red-300">{fieldErrors.vehicle_type}</span>
                ) : null}
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="font-medium ff-heading">Load capacity (tons)</span>
                <input
                  value={form.load_capacity}
                  onChange={(e) => updateField('load_capacity', e.target.value)}
                  placeholder="e.g. 24"
                  className={fieldClass()}
                />
                {fieldErrors.load_capacity ? (
                  <span className="text-xs text-red-600 dark:text-red-300">{fieldErrors.load_capacity}</span>
                ) : null}
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Status &amp; odometer</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-medium ff-heading">Starting odometer (km)</span>
                <input
                  value={form.current_odometer}
                  onChange={(e) => updateField('current_odometer', e.target.value)}
                  placeholder="e.g. 120500"
                  className={fieldClass()}
                />
                {fieldErrors.current_odometer ? (
                  <span className="text-xs text-red-600 dark:text-red-300">{fieldErrors.current_odometer}</span>
                ) : null}
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium ff-heading">Initial status</span>
                <select
                  value={form.initialStatus}
                  onChange={(e) => updateField('initialStatus', e.target.value as UiStatus)}
                  className={fieldClass()}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>
            <p className="text-xs ff-muted">Odometer readings support GPS-free trip tracking.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Driver assignment</h3>
            <label className="space-y-1 text-sm">
              <span className="font-medium ff-heading">Assign driver (optional)</span>
              <select
                value={form.assigned_driver_id}
                onChange={(e) => updateField('assigned_driver_id', e.target.value)}
                disabled={driversQuery.isLoading}
                className={fieldClass()}
              >
                <option value="">{driversQuery.isLoading ? 'Loading drivers…' : 'Unassigned'}</option>
                {driversQuery.data?.drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {getDriverSelectLabel(d)}
                  </option>
                ))}
              </select>
              {driversQuery.isError ? (
                <span className="text-xs text-amber-700 dark:text-amber-300">Could not load drivers — you can still save without assignment.</span>
              ) : null}
              {fieldErrors.assigned_driver ? (
                <span className="text-xs text-red-600 dark:text-red-300">{fieldErrors.assigned_driver}</span>
              ) : null}
            </label>
          </section>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="ff-secondary-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a] focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/50 disabled:opacity-60"
            >
              {createMutation.isPending ? 'Saving…' : 'Save vehicle'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

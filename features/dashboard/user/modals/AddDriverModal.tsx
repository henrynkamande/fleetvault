"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useCreateDriverMutation } from '@/hooks/queries/useCreateDriver'
import { useVehiclesQuery } from '@/hooks/queries/useVehicles'
import { flattenFieldErrors, getErrorDetail, getResponseErrorData } from '@/lib/apiErrors'
import { DRIVER_PAYMENT_MODES, type DriverPaymentMode } from '@/lib/driverPaymentModes'
import { splitFullName } from '@/services/driverService'

type AddDriverModalProps = {
  isOpen: boolean
  onClose: () => void
}

type AddDriverForm = {
  fullName: string
  phone: string
  licenseNumber: string
  assignVehicle: string
  initialStatus: 'On Duty' | 'Off Duty'
  paymentType: DriverPaymentMode
  paymentRate: string
}

const initialForm: AddDriverForm = {
  fullName: '',
  phone: '',
  licenseNumber: '',
  assignVehicle: '',
  initialStatus: 'Off Duty',
  paymentType: 'PER_TRIP',
  paymentRate: '',
}

export default function AddDriverModal({ isOpen, onClose }: AddDriverModalProps) {
  const [form, setForm] = useState<AddDriverForm>(initialForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const overlayRef = useRef<HTMLDivElement>(null)
  const createMutation = useCreateDriverMutation()
  const vehiclesQuery = useVehiclesQuery()

  const unassignedVehicles = useMemo(() => {
    return (vehiclesQuery.data?.vehicles ?? []).filter((v) => !v.assigned_driver)
  }, [vehiclesQuery.data?.vehicles])

  useEffect(() => {
    if (isOpen) return undefined
    const timer = window.setTimeout(() => {
      setForm(initialForm)
      setFieldErrors({})
    }, 0)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    overlayRef.current?.scrollTo(0, 0)
  }, [isOpen])

  if (!isOpen) return null

  function updateField<K extends keyof AddDriverForm>(field: K, value: AddDriverForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      delete next.non_field_errors
      return next
    })
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})

    const { first_name, last_name } = splitFullName(form.fullName)
    const phone_number = form.phone.trim().replace(/\s+/g, '')

    const clientErrors: Record<string, string> = {}
    if (!first_name) clientErrors.fullName = 'Enter the driver’s full name.'
    if (!phone_number) clientErrors.phone = 'Phone number is required.'
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }

    const employment_status = form.initialStatus === 'On Duty' ? 'FULL_TIME' : 'PART_TIME'

    createMutation.mutate(
      {
        phone_number,
        first_name,
        last_name,
        employment_status,
        payment_type: form.paymentType,
        ...(form.paymentRate.trim() ? { payment_rate: Number.parseFloat(form.paymentRate.trim()) } : {}),
        ...(form.licenseNumber.trim()
          ? { drivers_license_number: form.licenseNumber.trim() }
          : {}),
        ...(form.assignVehicle ? { vehicleId: form.assignVehicle } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Driver added successfully.')
          onClose()
          setForm(initialForm)
        },
        onError: (err) => {
          const data = getResponseErrorData(err)
          const flat = flattenFieldErrors(data)
          if (Object.keys(flat).length > 0) {
            const mapped: Record<string, string> = {}
            for (const [key, msg] of Object.entries(flat)) {
              if (key === 'first_name' || key === 'last_name') mapped.fullName = msg
              else if (key === 'phone_number') {
                mapped.phone =
                  msg.includes('already exists')
                    ? `${msg} Check your Drivers list — you may have added this person already.`
                    : msg
              } else if (key === 'drivers_license_number') {
                mapped.licenseNumber =
                  msg.includes('already exists')
                    ? `${msg} Use the existing driver or enter a different license number.`
                    : msg
              } else mapped[key] = msg
            }
            setFieldErrors(mapped)
          } else {
            toast.error(getErrorDetail(err) ?? 'Could not add driver.')
          }
        },
      },
    )
  }

  const pending = createMutation.isPending

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-slate-900/45 [touch-action:pan-y]"
    >
      <div className="flex min-h-full w-full items-center justify-center p-4 py-6 sm:py-10">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-driver-title"
          className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 id="add-driver-title" className="text-xl font-semibold text-[#111827]">
                Add New Driver
              </h2>
              <p className="text-sm text-gray-700">Create a driver profile and optionally assign a vehicle.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              aria-label="Close modal"
              className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 px-6 py-5" noValidate>
            {fieldErrors.non_field_errors ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                {fieldErrors.non_field_errors}
              </p>
            ) : null}

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-[#111827]">Full Name</span>
              <input
                value={form.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
                placeholder="e.g. John Doe"
                required
                autoComplete="name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              />
              {fieldErrors.fullName ? (
                <span className="text-xs text-red-600">{fieldErrors.fullName}</span>
              ) : null}
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-[#111827]">Phone</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="+1 …"
                required
                autoComplete="tel"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              />
              {fieldErrors.phone ? <span className="text-xs text-red-600">{fieldErrors.phone}</span> : null}
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-[#111827]">License Number</span>
              <input
                value={form.licenseNumber}
                onChange={(event) => updateField('licenseNumber', event.target.value)}
                placeholder="e.g. DL-982341"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              />
              {fieldErrors.licenseNumber ? (
                <span className="text-xs text-red-600">{fieldErrors.licenseNumber}</span>
              ) : null}
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-[#111827]">Assign Vehicle (Optional)</span>
              <select
                value={form.assignVehicle}
                onChange={(event) => updateField('assignVehicle', event.target.value)}
                disabled={vehiclesQuery.isPending}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 disabled:opacity-60"
              >
                <option value="">Unassigned</option>
                {unassignedVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.registration_number})
                  </option>
                ))}
              </select>
              {vehiclesQuery.isSuccess && unassignedVehicles.length === 0 ? (
                <span className="text-xs text-gray-500">No unassigned vehicles. Add a vehicle first or assign later.</span>
              ) : null}
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-[#111827]">Initial Status</span>
              <select
                value={form.initialStatus}
                onChange={(event) =>
                  updateField('initialStatus', event.target.value as AddDriverForm['initialStatus'])
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              >
                <option value="Off Duty">Off Duty</option>
                <option value="On Duty">On Duty</option>
              </select>
              <span className="text-xs text-gray-500">Stored as employment type on the driver profile.</span>
            </label>

            <section className="rounded-xl border border-[#fbbd26]/30 bg-[#fff8e6] p-3">
              <p className="text-sm font-semibold text-[#111827]">Secure your earnings</p>
              <p className="mt-1 text-xs text-gray-600">
                Choose the pay rhythm that fits this driver. Your effort, your reward.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-[#111827]">Payment mode</span>
                  <select
                    value={form.paymentType}
                    onChange={(event) => updateField('paymentType', event.target.value as DriverPaymentMode)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
                  >
                    {DRIVER_PAYMENT_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500">
                    {DRIVER_PAYMENT_MODES.find((mode) => mode.value === form.paymentType)?.framing}
                  </span>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-[#111827]">Pay rate</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.paymentRate}
                    onChange={(event) => updateField('paymentRate', event.target.value)}
                    placeholder="e.g. 40000"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
                  />
                  <span className="text-xs text-gray-500">Monthly salary, daily rate, or per-trip amount.</span>
                </label>
              </div>
            </section>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a] focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? 'Saving…' : 'Save Driver'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

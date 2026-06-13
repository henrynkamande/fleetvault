"use client";

import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import FinanceFiltersBar, { financeFiltersToParams, type FinanceFiltersState } from './finance/FinanceFiltersBar'
import { formatCurrency, formatDeltaPct } from './finance/financeFormat'
import { useExpenseMutations, useExpenses } from '@/hooks/queries/useExpenses'
import { useExpensesReportQuery } from '@/hooks/queries/useFinanceReports'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import type { DriverPayoutModeSummary, FinanceGranularity } from '@/types/finance'
import { flattenFieldErrors, getErrorDetail, getResponseErrorData } from '@/lib/apiErrors'
import { normalizeCurrency } from '@/lib/currencies'
import { DRIVER_PAYMENT_MODES, type DriverPaymentMode } from '@/lib/driverPaymentModes'
import { LoadingState } from "@/components/ui/LoadingSpinner"
import { useTripsListQuery } from '@/hooks/queries/useTripsList'
import { useVehiclesQuery } from '@/hooks/queries/useVehicles'
import type { ExpenseCategory, ExpenseInput, ExpenseScope, ExpenseStatus as ApiExpenseStatus } from '@/types/expense'

type ExpenseStatus = 'paid' | 'pending' | 'overdue'
type Aggregation = 'Monthly' | 'Quarterly'
type SortBy = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'

type ExpenseRecord = {
  id: string
  category: string
  reference?: { type: 'trip' | 'vehicle' | 'other'; id: string; label?: string }
  dateIssued: string
  amount: number
  status: ExpenseStatus
  notes?: string
  vendor?: string
  description?: string
}

type ExpenseChartData = { period: string; total: number; byCategory?: { category: string; amount: number }[] }

type KpiCardProps = {
  label: string
  value: string
  delta: string
  tone: 'positive' | 'negative' | 'neutral'
  active?: boolean
  onClick: () => void
}

type ExpenseChartProps = {
  data: ExpenseChartData[]
  aggregation: Aggregation
  onAggregationChange: (value: Aggregation) => void
  onBarClick: (period: string) => void
  selectedPeriod: string
  currency: string
}

type CategoryListProps = {
  items: { category: string; total: number }[]
  selectedCategory: string
  onSelect: (category: string) => void
  currency: string
}

type ExpenseTableProps = {
  rows: ExpenseRecord[]
  totalRows: number
  categoryOptions: string[]
  sortBy: SortBy
  onSortByChange: (value: SortBy) => void
  statusFilter: 'all' | ExpenseStatus
  onStatusFilterChange: (value: 'all' | ExpenseStatus) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  searchTerm: string
  onSearchTermChange: (value: string) => void
  page: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  currency: string
}

type ExpenseFormState = {
  scope: ExpenseScope
  category: ExpenseCategory
  status: ApiExpenseStatus
  amount: string
  driver_payment_mode: DriverPaymentMode
  description: string
  vendor: string
  expense_date: string
  vehicle: string
  trip: string
  odometer_reading: string
  notes: string
}

type CreateExpenseModalProps = {
  open: boolean
  onClose: () => void
}

type DriverPayoutModesProps = {
  items: DriverPayoutModeSummary[]
  currency: string
}

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'FUEL', label: 'Fuel' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'REGISTRATION', label: 'Registration' },
  { value: 'TOLL', label: 'Toll' },
  { value: 'PARKING', label: 'Parking' },
  { value: 'DRIVER_WAGES', label: 'Driver wages' },
  { value: 'OTHER', label: 'Other' },
]

const initialExpenseForm = (): ExpenseFormState => ({
  scope: 'FLEET',
  category: 'FUEL',
  status: 'PENDING',
  amount: '',
  driver_payment_mode: 'PER_TRIP',
  description: '',
  vendor: '',
  expense_date: new Date().toISOString().slice(0, 10),
  vehicle: '',
  trip: '',
  odometer_reading: '',
  notes: '',
})

function statusLabel(status: ExpenseStatus): string {
  if (status === 'paid') return 'Paid'
  if (status === 'pending') return 'Pending'
  return 'Overdue'
}

function statusBadgeClass(status: ExpenseStatus): string {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  if (status === 'pending') return 'bg-amber-100 text-amber-700 ring-amber-200'
  return 'bg-rose-100 text-rose-700 ring-rose-200'
}

function normalizeExpenseStatus(status: string): ExpenseStatus {
  const normalized = status.toLowerCase()
  if (normalized === 'pending') return 'pending'
  if (normalized === 'overdue') return 'overdue'
  return 'paid'
}

function readableCategory(category: string): string {
  return category
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}

function deltaToneClass(tone: KpiCardProps['tone']): string {
  if (tone === 'positive') return 'text-emerald-600'
  if (tone === 'negative') return 'text-rose-600'
  return 'text-slate-500'
}

function KpiCard({ label, value, delta, tone, active, onClick }: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
        active ? 'border-[#fbbd26] ring-2 ring-[#fbbd26]/35' : 'border-gray-200'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[#111827]">{value}</p>
      <p className={`mt-1 text-sm font-medium ${deltaToneClass(tone)}`}>{delta}</p>
    </button>
  )
}

function ExpenseChart({ data, aggregation, onAggregationChange, onBarClick, selectedPeriod, currency }: ExpenseChartProps) {
  const max = Math.max(...data.map((item) => item.total), 1)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#111827]">Expense Trend</h3>
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs">
          {(['Monthly', 'Quarterly'] as Aggregation[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onAggregationChange(item)}
              className={`rounded-md px-3 py-1 font-semibold transition ${
                aggregation === item ? 'bg-white text-[#111827] shadow-sm' : 'text-gray-600'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="grid h-56 grid-cols-6 items-end gap-3">
        {data.map((point) => (
          <button
            key={point.period}
            type="button"
            onClick={() => onBarClick(point.period)}
            className="group flex h-full flex-col items-center justify-end"
            title={`${point.period}: ${formatCurrency(point.total, currency)}`}
            aria-label={`Filter by ${point.period}`}
          >
            <div
              className={`w-full rounded-t-md transition ${
                selectedPeriod === point.period
                  ? 'bg-orange-500'
                  : 'bg-orange-300 group-hover:bg-orange-400'
              }`}
              style={{ height: `${Math.max((point.total / max) * 100, 8)}%` }}
            />
            <p className="mt-2 text-xs text-gray-600">{point.period}</p>
          </button>
        ))}
      </div>
    </section>
  )
}

function CategoryList({ items, selectedCategory, onSelect, currency }: CategoryListProps) {
  const total = items.reduce((sum, item) => sum + item.total, 0)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#111827]">By Category</h3>
        <button type="button" className="text-sm font-semibold text-[#111827] hover:text-[#f4b20a]" onClick={() => onSelect('All')}>
          View All
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const pct = total === 0 ? 0 : Math.round((item.total / total) * 100)
          const isActive = selectedCategory === item.category
          return (
            <button
              key={item.category}
              type="button"
              onClick={() => onSelect(item.category)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                isActive ? 'bg-[#fff8e6] ring-1 ring-[#fbbd26]/45' : 'hover:bg-gray-50'
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-gray-700">{item.category}</span>
                <span className="font-semibold text-[#111827]">{formatCurrency(item.total, currency)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200">
                <div className="h-1.5 rounded-full bg-orange-400" style={{ width: `${pct}%` }} />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function referenceText(reference?: ExpenseRecord['reference']): string {
  if (!reference) return '—'
  if (reference.label) return reference.label
  return `${reference.type.toUpperCase()}-${reference.id}`
}

function expenseTitle(row: ExpenseRecord): string {
  return row.description?.trim() || `${row.category} expense`
}

function expenseSubtitle(row: ExpenseRecord): string | null {
  if (row.notes?.trim()) return row.notes.trim()
  if (row.vendor?.trim()) return `Vendor: ${row.vendor.trim()}`
  return null
}

function CreateExpenseModal({ open, onClose }: CreateExpenseModalProps) {
  const [form, setForm] = useState<ExpenseFormState>(() => initialExpenseForm())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const mutations = useExpenseMutations()
  const vehiclesQuery = useVehiclesQuery({ page_size: 100, is_active: true })
  const tripsQuery = useTripsListQuery()

  if (!open) return null

  const vehicleOptions = vehiclesQuery.data?.vehicles ?? []
  const tripOptions = tripsQuery.data?.trips ?? []
  const creating = mutations.create.isPending

  function update<K extends keyof ExpenseFormState>(field: K, value: ExpenseFormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'scope') {
        next.vehicle = ''
        next.trip = ''
      }
      return next
    })
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function closeAndReset() {
    setForm(initialExpenseForm())
    setFieldErrors({})
    mutations.create.reset()
    onClose()
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.description.trim()) next.description = 'Description is required.'
    if (!form.amount.trim()) next.amount = 'Amount is required.'
    else if (Number.isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      next.amount = 'Enter an amount greater than 0.'
    }
    if (!form.expense_date) next.expense_date = 'Date is required.'
    if (form.scope === 'VEHICLE' && !form.vehicle) next.vehicle = 'Select a vehicle.'
    if (form.scope === 'TRIP' && !form.trip) next.trip = 'Select a trip.'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    const payload: ExpenseInput = {
      scope: form.scope,
      category: form.category,
      status: form.status,
      amount: Number(form.amount),
      driver_payment_mode: form.category === 'DRIVER_WAGES' ? form.driver_payment_mode : null,
      description: form.description.trim(),
      vendor: form.vendor.trim(),
      expense_date: form.expense_date,
      vehicle: form.scope === 'VEHICLE' ? form.vehicle : null,
      trip: form.scope === 'TRIP' ? form.trip : null,
      odometer_reading: form.odometer_reading.trim() ? Number(form.odometer_reading) : null,
      notes: form.notes.trim(),
    }

    mutations.create.mutate(payload, {
      onSuccess: () => {
        toast.success('Expense created successfully.')
        closeAndReset()
      },
      onError: (error) => {
        setFieldErrors(flattenFieldErrors(getResponseErrorData(error)))
        toast.error(getErrorDetail(error) || 'Could not create expense.')
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">Create Expense</h2>
            <p className="mt-1 text-sm text-slate-600">Add a fleet, vehicle, or trip cost to your expense ledger.</p>
          </div>
          <button
            type="button"
            onClick={closeAndReset}
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close create expense"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Scope</span>
              <select
                value={form.scope}
                onChange={(event) => update('scope', event.target.value as ExpenseScope)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              >
                <option value="FLEET">Fleet expense</option>
                <option value="VEHICLE">Vehicle expense</option>
                <option value="TRIP">Trip expense</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Category</span>
              <select
                value={form.category}
                onChange={(event) => update('category', event.target.value as ExpenseCategory)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </label>
          </div>

          {form.category === 'DRIVER_WAGES' ? (
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Driver payment mode</span>
              <select
                value={form.driver_payment_mode}
                onChange={(event) => update('driver_payment_mode', event.target.value as DriverPaymentMode)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              >
                {DRIVER_PAYMENT_MODES.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500">Clear pay context builds trust for drivers.</span>
            </label>
          ) : null}

          {form.scope === 'VEHICLE' ? (
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Vehicle</span>
              <select
                value={form.vehicle}
                onChange={(event) => update('vehicle', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              >
                <option value="">{vehiclesQuery.isLoading ? 'Loading vehicles...' : 'Select vehicle'}</option>
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration_number} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
              {fieldErrors.vehicle ? <span className="text-xs text-rose-600">{fieldErrors.vehicle}</span> : null}
            </label>
          ) : null}

          {form.scope === 'TRIP' ? (
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Trip</span>
              <select
                value={form.trip}
                onChange={(event) => update('trip', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              >
                <option value="">{tripsQuery.isLoading ? 'Loading trips...' : 'Select trip'}</option>
                {tripOptions.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.trip_number} - {trip.pickup_location} to {trip.destination}
                  </option>
                ))}
              </select>
              {fieldErrors.trip ? <span className="text-xs text-rose-600">{fieldErrors.trip}</span> : null}
            </label>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Description</span>
              <input
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                placeholder="e.g. Diesel refill, parking fee, garage repair"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              />
              {fieldErrors.description ? <span className="text-xs text-rose-600">{fieldErrors.description}</span> : null}
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) => update('amount', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              />
              {fieldErrors.amount ? <span className="text-xs text-rose-600">{fieldErrors.amount}</span> : null}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Date</span>
              <input
                type="date"
                value={form.expense_date}
                onChange={(event) => update('expense_date', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              />
              {fieldErrors.expense_date ? <span className="text-xs text-rose-600">{fieldErrors.expense_date}</span> : null}
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Status</span>
              <select
                value={form.status}
                onChange={(event) => update('status', event.target.value as ApiExpenseStatus)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Vendor</span>
              <input
                value={form.vendor}
                onChange={(event) => update('vendor', event.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => update('notes', event.target.value)}
              rows={3}
              placeholder="Optional internal notes"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
            />
          </label>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={closeAndReset}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#f4b20a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ExpenseTable({
  rows,
  totalRows,
  categoryOptions,
  sortBy,
  onSortByChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  searchTerm,
  onSearchTermChange,
  page,
  totalPages,
  pageSize,
  onPageChange,
  currency,
}: ExpenseTableProps) {
  const startRow = totalRows === 0 ? 0 : (page - 1) * pageSize + 1
  const endRow = Math.min(totalRows, (page - 1) * pageSize + rows.length)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/70 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#111827]">Recent Expense Records</h3>
            <p className="mt-1 text-sm text-slate-500">Track fleet, vehicle, and trip costs in one ledger.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search expense, category, or reference..."
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          />
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as 'all' | ExpenseStatus)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          >
            <option value="All">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as SortBy)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          >
            <option value="date_desc">Newest date</option>
            <option value="date_asc">Oldest date</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
            <tr className="border-b border-slate-100">
              <th className="px-4 py-3 font-semibold">Expense</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Date Issued</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <p className="text-sm font-medium text-[#111827]">No expense records found.</p>
                  <p className="mt-1 text-xs text-gray-600">Try adjusting filters or add your first expense entry.</p>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-none">
                  <td className="px-4 py-4">
                    <p className="max-w-[18rem] truncate font-semibold text-[#111827]">{expenseTitle(row)}</p>
                    {expenseSubtitle(row) ? (
                      <p className="mt-1 max-w-[18rem] truncate text-xs text-slate-500">{expenseSubtitle(row)}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-slate-700">{row.category}</td>
                  <td className="px-4 py-4 text-slate-700">{referenceText(row.reference)}</td>
                  <td className="px-4 py-4 text-slate-700">
                    {new Date(row.dateIssued).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-[#111827]">{formatCurrency(row.amount, currency, true)}</td>
                  <td className="px-4 py-4">
                    <span
                      aria-label={`Expense status ${statusLabel(row.status)}`}
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClass(row.status)}`}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <p className="text-sm text-gray-600">
          {totalRows === 0 ? 'No records' : `Showing ${startRow}-${endRow} of ${totalRows}`} · Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

function QuickActions({ onCreateExpense }: { onCreateExpense: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onCreateExpense}
        className="rounded-lg bg-[#fbbd26] px-3 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a]"
      >
        Create Expense
      </button>
    </div>
  )
}

function DriverPayoutModes({ items, currency }: DriverPayoutModesProps) {
  if (items.length === 0) return null
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-[#111827]">Driver payouts by mode</h3>
        <p className="text-xs text-gray-600">Control and transparency for every earning style.</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.mode} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-[#111827]">{item.label}</p>
            <p className="mt-1 text-xl font-bold text-[#111827]">{formatCurrency(item.total, currency)}</p>
            <p className="mt-1 text-xs text-gray-500">{item.trip_count} trips tracked</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function Expenses() {
  const [filters, setFilters] = useState<FinanceFiltersState>({ period: '90d', vehicle: '', driver: '' })
  const [aggregation, setAggregation] = useState<Aggregation>('Monthly')
  const [selectedPeriod, setSelectedPeriod] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'all' | ExpenseStatus>('all')
  const [sortBy, setSortBy] = useState<SortBy>('date_desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [activeKpi, setActiveKpi] = useState<'none' | 'pending' | 'overdue' | 'total' | 'month'>('none')
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false)
  const userQuery = useCurrentUser()
  const currency = normalizeCurrency(userQuery.data?.preferred_currency)

  const granularity: FinanceGranularity = aggregation === 'Quarterly' ? 'quarterly' : 'monthly'
  const reportQuery = useExpensesReportQuery({ ...financeFiltersToParams(filters), granularity })
  const ledgerQuery = useExpenses({
    page: 1,
    page_size: 100,
    scope: 'FLEET',
  })
  const summary = reportQuery.data?.summary
  const categoryTotals = useMemo(() => reportQuery.data?.by_category ?? [], [reportQuery.data?.by_category])
  const topCategory = categoryTotals[0]?.category ?? '—'

  const kpis = useMemo(() => {
    if (!summary) {
      return [
        { key: 'total' as const, label: 'Trip expenses', value: '—', delta: '—', tone: 'negative' as const },
        { key: 'month' as const, label: 'Net profit', value: '—', delta: '—', tone: 'positive' as const },
        { key: 'pending' as const, label: 'Trip revenue', value: '—', delta: '—', tone: 'neutral' as const },
        { key: 'overdue' as const, label: 'Top category', value: '—', delta: '—', tone: 'neutral' as const },
      ]
    }
    return [
      { key: 'total' as const, label: 'Trip expenses', value: formatCurrency(summary.expenses_total, currency), delta: formatDeltaPct(summary.expenses_change_pct), tone: 'negative' as const },
      {
        key: 'month' as const,
        label: 'Net profit',
        value: formatCurrency(summary.profit_total, currency),
        delta: formatDeltaPct(summary.profit_change_pct),
        tone: summary.profit_total >= 0 ? ('positive' as const) : ('negative' as const),
      },
      { key: 'pending' as const, label: 'Trip revenue', value: formatCurrency(summary.revenue_total, currency), delta: `${summary.trip_count} trips`, tone: 'neutral' as const },
      { key: 'overdue' as const, label: 'Top category', value: topCategory, delta: categoryTotals[0] ? formatCurrency(categoryTotals[0].total, currency) : '—', tone: 'neutral' as const },
    ]
  }, [currency, summary, categoryTotals, topCategory])

  const chartData = useMemo(() => {
    return (reportQuery.data?.trend ?? []).map((t) => ({ period: t.period, total: t.total ?? 0 }))
  }, [reportQuery.data?.trend])

  const seedRows: ExpenseRecord[] = useMemo(() => {
    const ledgerRows = ledgerQuery.data?.expenses ?? []
    if (ledgerRows.length > 0) {
      return ledgerRows.map((expense) => ({
        id: expense.id,
        category: readableCategory(expense.category),
        reference: expense.trip_number
          ? { type: 'trip' as const, id: expense.trip ?? expense.trip_number, label: expense.trip_number }
          : expense.vehicle_registration
            ? { type: 'vehicle' as const, id: expense.vehicle ?? expense.vehicle_registration, label: expense.vehicle_registration }
            : undefined,
        dateIssued: expense.expense_date,
        amount: Number(expense.amount),
        status: normalizeExpenseStatus(expense.status),
        notes: expense.notes || undefined,
        vendor: expense.vendor || undefined,
        description: expense.description || undefined,
      }))
    }

    return (reportQuery.data?.records ?? []).map((r) => ({
      id: r.id,
      category: r.category,
      reference: { type: 'trip' as const, id: r.trip_number, label: r.trip_number },
      dateIssued: r.date,
      amount: r.amount,
      status: r.status,
      notes: r.notes ?? undefined,
      vendor: r.vendor ?? undefined,
      description: r.notes ?? undefined,
    }))
  }, [ledgerQuery.data?.expenses, reportQuery.data?.records])

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(seedRows.map((row) => row.category))).sort((a, b) => a.localeCompare(b))
  }, [seedRows])

  const filteredRows = useMemo(() => {
    let rows = [...seedRows]

    if (selectedCategory !== 'All') {
      rows = rows.filter((row) => row.category === selectedCategory)
    }

    if (statusFilter !== 'all') {
      rows = rows.filter((row) => row.status === statusFilter)
    }

    if (activeKpi === 'pending') {
      rows = rows.filter((row) => row.status === 'pending')
    }
    if (activeKpi === 'overdue') {
      rows = rows.filter((row) => row.status === 'overdue')
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      rows = rows.filter((row) =>
        `${expenseTitle(row)} ${referenceText(row.reference)} ${row.category} ${row.vendor ?? ''} ${row.notes ?? ''}`.toLowerCase().includes(q),
      )
    }

    if (selectedPeriod !== 'All') {
      const month = selectedPeriod.slice(0, 3)
      rows = rows.filter((row) =>
        new Date(row.dateIssued).toLocaleDateString('en-US', { month: 'short' }) === month,
      )
    }

    rows.sort((a, b) => {
      if (sortBy === 'date_desc') return +new Date(b.dateIssued) - +new Date(a.dateIssued)
      if (sortBy === 'date_asc') return +new Date(a.dateIssued) - +new Date(b.dateIssued)
      if (sortBy === 'amount_desc') return b.amount - a.amount
      return a.amount - b.amount
    })

    return rows
  }, [seedRows, selectedCategory, statusFilter, activeKpi, searchTerm, selectedPeriod, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentRows = useMemo(() => {
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, page, totalPages])

  if (reportQuery.isError || ledgerQuery.isError) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        Could not load expenses: {getErrorDetail(reportQuery.error ?? ledgerQuery.error)}
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-2xl  p-4">
        <FinanceFiltersBar value={filters} onChange={(next) => { setFilters(next); setPage(1) }} />
        {reportQuery.isLoading || ledgerQuery.isLoading ? <LoadingState /> : null}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <QuickActions onCreateExpense={() => setCreateExpenseOpen(true)} />
          <select
            value={aggregation}
            onChange={(event) => setAggregation(event.target.value as Aggregation)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          >
            <option value="Monthly">Period: This Month</option>
            <option value="Quarterly">Period: This Quarter</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              tone={kpi.tone}
              active={activeKpi === kpi.key}
              onClick={() => {
                setActiveKpi((prev) => (prev === kpi.key ? 'none' : kpi.key))
                setPage(1)
              }}
            />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <ExpenseChart
            data={chartData}
            aggregation={aggregation}
            onAggregationChange={setAggregation}
            selectedPeriod={selectedPeriod}
            onBarClick={(period) => {
              setSelectedPeriod((prev) => (prev === period ? 'All' : period))
              setPage(1)
            }}
            currency={currency}
          />
          <CategoryList
            items={categoryTotals}
            selectedCategory={selectedCategory}
            currency={currency}
            onSelect={(category) => {
              setSelectedCategory(category)
              setPage(1)
            }}
          />
        </div>

        <DriverPayoutModes items={reportQuery.data?.driver_payouts_by_mode ?? []} currency={currency} />

        <ExpenseTable
          rows={currentRows}
          totalRows={filteredRows.length}
          categoryOptions={categoryOptions}
          sortBy={sortBy}
          onSortByChange={(value) => {
            setSortBy(value)
            setPage(1)
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}
          categoryFilter={selectedCategory}
          onCategoryFilterChange={(value) => {
            setSelectedCategory(value)
            setPage(1)
          }}
          searchTerm={searchTerm}
          onSearchTermChange={(value) => {
            setSearchTerm(value)
            setPage(1)
          }}
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          currency={currency}
        />
        <CreateExpenseModal open={createExpenseOpen} onClose={() => setCreateExpenseOpen(false)} />
      </section>
)
}

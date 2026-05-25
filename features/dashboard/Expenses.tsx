"use client";

import { useMemo, useState } from 'react'
import FinanceFiltersBar, { financeFiltersToParams, type FinanceFiltersState } from './finance/FinanceFiltersBar'
import { formatDeltaPct, formatUsd } from './finance/financeFormat'
import { useExpensesReportQuery } from '@/hooks/queries/useFinanceReports'
import type { FinanceGranularity } from '@/types/finance'
import { getErrorDetail } from '@/lib/apiErrors'

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
}

type CategoryListProps = {
  items: { category: string; total: number }[]
  selectedCategory: string
  onSelect: (category: string) => void
}

type ExpenseTableProps = {
  rows: ExpenseRecord[]
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
  onPageChange: (page: number) => void
}

function formatCurrency(value: number, withCents = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: withCents ? 2 : 0,
    minimumFractionDigits: withCents ? 2 : 0,
  }).format(value)
}

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

function ExpenseChart({ data, aggregation, onAggregationChange, onBarClick, selectedPeriod }: ExpenseChartProps) {
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
            title={`${point.period}: ${formatCurrency(point.total)}`}
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

function CategoryList({ items, selectedCategory, onSelect }: CategoryListProps) {
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
                <span className="font-semibold text-[#111827]">{formatCurrency(item.total)}</span>
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

function ExpenseTable({
  rows,
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
  onPageChange,
}: ExpenseTableProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <h3 className="text-lg font-semibold text-[#111827]">Recent Expense Records</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search ID or reference..."
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          />
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as 'all' | ExpenseStatus)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          >
            <option value="All">All categories</option>
            <option value="Fuel">Fuel</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Driver Wages">Driver Wages</option>
            <option value="Insurance">Insurance</option>
            <option value="Tolls & Parking">Tolls & Parking</option>
            <option value="Others">Others</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as SortBy)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          >
            <option value="date_desc">Newest date</option>
            <option value="date_asc">Oldest date</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
          <button
            type="button"
            className="rounded-lg bg-[#fbbd26] px-3 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a]"
          >
            + Log Expense
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-gray-500">
            <tr className="border-b border-gray-100">
              <th className="pb-3 font-medium">Expense ID</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Reference (Trip/Vehicle)</th>
              <th className="pb-3 font-medium">Date Issued</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  <p className="text-sm font-medium text-[#111827]">No expense records found.</p>
                  <p className="mt-1 text-xs text-gray-600">Try adjusting filters or add your first expense entry.</p>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-none">
                  <td className="py-3 font-semibold text-[#111827]">{row.id}</td>
                  <td className="py-3 text-gray-700">{row.category}</td>
                  <td className="py-3 text-gray-700">{referenceText(row.reference)}</td>
                  <td className="py-3 text-gray-700">
                    {new Date(row.dateIssued).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 font-semibold text-[#111827]">{formatCurrency(row.amount, true)}</td>
                  <td className="py-3">
                    <span
                      aria-label={`Expense status ${statusLabel(row.status)}`}
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClass(row.status)}`}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <button type="button" className="text-[#111827] hover:text-[#f4b20a]">View</button>
                      <button type="button" className="text-gray-700 hover:text-gray-900">Edit</button>
                      <button type="button" className="text-emerald-700 hover:text-emerald-800">Mark Paid</button>
                      <button type="button" className="text-amber-700 hover:text-amber-800">Send Reminder</button>
                      <button type="button" className="text-gray-700 hover:text-gray-900">Export PDF</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
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

function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="rounded-lg bg-[#fbbd26] px-3 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a]"
      >
        Create Expense
      </button>
      <button
        type="button"
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#fbbd26]/60 hover:bg-[#fffef8]"
      >
        Bulk Upload
      </button>
      <button
        type="button"
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#fbbd26]/60 hover:bg-[#fffef8]"
      >
        Export
      </button>
      <button
        type="button"
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#fbbd26]/60 hover:bg-[#fffef8]"
      >
        Share Report
      </button>
    </div>
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

  const granularity: FinanceGranularity = aggregation === 'Quarterly' ? 'quarterly' : 'monthly'
  const reportQuery = useExpensesReportQuery({ ...financeFiltersToParams(filters), granularity })
  const summary = reportQuery.data?.summary
  const categoryTotals = reportQuery.data?.by_category ?? []
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
      { key: 'total' as const, label: 'Trip expenses', value: formatUsd(summary.expenses_total), delta: formatDeltaPct(summary.expenses_change_pct), tone: 'negative' as const },
      {
        key: 'month' as const,
        label: 'Net profit',
        value: formatUsd(summary.profit_total),
        delta: formatDeltaPct(summary.profit_change_pct),
        tone: summary.profit_total >= 0 ? ('positive' as const) : ('negative' as const),
      },
      { key: 'pending' as const, label: 'Trip revenue', value: formatUsd(summary.revenue_total), delta: `${summary.trip_count} trips`, tone: 'neutral' as const },
      { key: 'overdue' as const, label: 'Top category', value: topCategory, delta: categoryTotals[0] ? formatUsd(categoryTotals[0].total) : '—', tone: 'neutral' as const },
    ]
  }, [summary, categoryTotals, topCategory])

  const chartData = useMemo(() => {
    return (reportQuery.data?.trend ?? []).map((t) => ({ period: t.period, total: t.total ?? 0 }))
  }, [reportQuery.data?.trend])

  const seedRows: ExpenseRecord[] = useMemo(() => {
    return (reportQuery.data?.records ?? []).map((r) => ({
      id: r.id,
      category: r.category,
      reference: { type: 'trip' as const, id: r.trip_number, label: r.trip_number },
      dateIssued: r.date,
      amount: r.amount,
      status: r.status,
      notes: r.notes ?? undefined,
      vendor: r.vendor ?? undefined,
    }))
  }, [reportQuery.data?.records])

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
        `${row.id} ${referenceText(row.reference)} ${row.category} ${row.vendor ?? ''}`.toLowerCase().includes(q),
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

  if (reportQuery.isError) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        Could not load expenses report: {getErrorDetail(reportQuery.error)}
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-2xl  p-4">
        <FinanceFiltersBar value={filters} onChange={(next) => { setFilters(next); setPage(1) }} />
        {reportQuery.isLoading ? <p className="text-sm text-gray-600">Loading trip expenses…</p> : null}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <QuickActions />
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
          />
          <CategoryList
            items={categoryTotals}
            selectedCategory={selectedCategory}
            onSelect={(category) => {
              setSelectedCategory(category)
              setPage(1)
            }}
          />
        </div>

        <ExpenseTable
          rows={currentRows}
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
          onPageChange={setPage}
        />
      </section>
)
}

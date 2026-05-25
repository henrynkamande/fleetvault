"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react'
import FinanceFiltersBar, { financeFiltersToParams, type FinanceFiltersState } from './finance/FinanceFiltersBar'
import { formatDeltaPct, formatUsd } from './finance/financeFormat'
import { useIncomeReportQuery } from '@/hooks/queries/useFinanceReports'
import { AppRoutesPaths } from '@/route/paths'
import type { FinanceGranularity } from '@/types/finance'
import { getErrorDetail } from '@/lib/apiErrors'

type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue'
type TimeView = 'Monthly' | 'Quarterly'
type SortBy = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'

type KpiMetric = {
  key: 'totalRevenue' | 'collected' | 'outstanding' | 'overdue'
  label: string
  value: string
  delta: string
  positive: boolean
}

type InvoiceRecord = {
  invoiceId: string
  client: string
  tripRef: string
  tripNumber: string
  dateIssued: string
  amount: number
  status: InvoiceStatus
}

type KpiCardProps = KpiMetric & {
  active?: boolean
  onClick: () => void
}

type IncomeChartProps = {
  data: { label: string; amount: number }[]
  timeView: TimeView
  onTimeViewChange: (view: TimeView) => void
}

type TopClientsListProps = {
  clients: { name: string; total: number }[]
  activeClient: string
  onSelectClient: (client: string) => void
}

type IncomeTableProps = {
  rows: InvoiceRecord[]
  sortBy: SortBy
  onSortByChange: (sortBy: SortBy) => void
  statusFilter: 'All' | InvoiceStatus
  onStatusFilterChange: (status: 'All' | InvoiceStatus) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatCurrencyWithCents(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function KpiCard({ label, value, delta, positive, active, onClick }: KpiCardProps) {
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
      <p className={`mt-1 text-sm font-medium ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{delta}</p>
    </button>
  )
}

function IncomeChart({ data, timeView, onTimeViewChange }: IncomeChartProps) {
  const max = Math.max(...data.map((d) => d.amount), 1)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#111827]">Income Trend</h3>
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs">
          {(['Monthly', 'Quarterly'] as TimeView[]).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => onTimeViewChange(view)}
              className={`rounded-md px-3 py-1 font-semibold transition ${
                timeView === view ? 'bg-white text-[#111827] shadow-sm' : 'text-gray-600'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>
      <div className="grid h-56 grid-cols-6 items-end gap-3">
        {data.map((point) => (
          <div key={point.label} className="flex h-full flex-col items-center justify-end">
            <div
              className="w-full rounded-t-md bg-emerald-500/80 hover:bg-emerald-500"
              style={{ height: `${Math.max((point.amount / max) * 100, 6)}%` }}
              title={`${point.label}: ${formatCurrency(point.amount)}`}
              aria-label={`${point.label} income ${formatCurrency(point.amount)}`}
            />
            <p className="mt-2 text-xs text-gray-600">{point.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function TopClientsList({ clients, activeClient, onSelectClient }: TopClientsListProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#111827]">Top Clients</h3>
        <button type="button" onClick={() => onSelectClient('All')} className="text-sm font-semibold text-[#111827] hover:text-[#f4b20a]">
          View All
        </button>
      </div>
      <div className="space-y-2">
        {clients.map((client) => (
          <button
            key={client.name}
            type="button"
            onClick={() => onSelectClient(client.name)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
              activeClient === client.name ? 'bg-[#fff8e6] ring-1 ring-[#fbbd26]/50' : 'hover:bg-gray-50'
            }`}
          >
            <span className="font-medium text-gray-700">{client.name}</span>
            <span className="font-semibold text-[#111827]">{formatCurrency(client.total)}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function statusBadgeClass(status: InvoiceStatus): string {
  if (status === 'Paid') return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  if (status === 'Pending') return 'bg-amber-100 text-amber-700 ring-amber-200'
  return 'bg-rose-100 text-rose-700 ring-rose-200'
}

function IncomeTable({
  rows,
  sortBy,
  onSortByChange,
  statusFilter,
  onStatusFilterChange,
  page,
  totalPages,
  onPageChange,
}: IncomeTableProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-lg font-semibold text-[#111827]">Recent Income Records</h3>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as 'All' | InvoiceStatus)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
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
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-gray-500">
            <tr className="border-b border-gray-100">
              <th className="pb-3 font-medium">Invoice ID</th>
              <th className="pb-3 font-medium">Client</th>
              <th className="pb-3 font-medium">Trip Ref</th>
              <th className="pb-3 font-medium">Date Issued</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.invoiceId} className="border-b border-gray-100 last:border-none">
                <td className="py-3 font-semibold text-[#111827]">{row.invoiceId}</td>
                <td className="py-3 text-gray-700">{row.client}</td>
                <td className="py-3 font-medium text-emerald-700">
                  <Link
                    href={AppRoutesPaths.dashboard.tripProfile(row.tripNumber)}
                    className="hover:underline"
                  >
                    {row.tripRef}
                  </Link>
                </td>
                <td className="py-3 text-gray-700">
                  {new Date(row.dateIssued).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="py-3 font-semibold text-[#111827]">{formatCurrencyWithCents(row.amount)}</td>
                <td className="py-3">
                  <span
                    aria-label={`Invoice status ${row.status}`}
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClass(row.status)}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-3">
                  <Link
                    href={AppRoutesPaths.dashboard.tripProfile(row.tripNumber)}
                    className="text-xs font-semibold text-[#111827] hover:text-[#f4b20a]"
                  >
                    View trip
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
        <div className="flex items-center gap-2">
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

function ExportControls() {
  return (
    <div className="flex items-center gap-2">
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
        Share
      </button>
    </div>
  )
}

export default function Income() {
  const [filters, setFilters] = useState<FinanceFiltersState>({ period: '90d', vehicle: '', driver: '' })
  const [timeView, setTimeView] = useState<TimeView>('Monthly')
  const [activeClient, setActiveClient] = useState('All')
  const [activeKpi, setActiveKpi] = useState<KpiMetric['key'] | 'none'>('none')
  const [statusFilter, setStatusFilter] = useState<'All' | InvoiceStatus>('All')
  const [sortBy, setSortBy] = useState<SortBy>('date_desc')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const granularity: FinanceGranularity =
    timeView === 'Quarterly' ? 'quarterly' : 'monthly'

  const reportQuery = useIncomeReportQuery({
    ...financeFiltersToParams(filters),
    granularity,
  })

  const summary = reportQuery.data?.summary
  const kpis: KpiMetric[] = useMemo(() => {
    if (!summary) {
      return [
        { key: 'totalRevenue', label: 'Trip revenue', value: '—', delta: '—', positive: true },
        { key: 'collected', label: 'Collected (completed)', value: '—', delta: '—', positive: true },
        { key: 'outstanding', label: 'Outstanding', value: '—', delta: '—', positive: true },
        { key: 'overdue', label: 'Flagged / overdue', value: '—', delta: '—', positive: false },
      ]
    }
    const revDelta = formatDeltaPct(summary.revenue_change_pct)
    return [
      {
        key: 'totalRevenue',
        label: 'Trip revenue',
        value: formatUsd(summary.revenue_total),
        delta: revDelta,
        positive: (summary.revenue_change_pct ?? 0) >= 0,
      },
      {
        key: 'collected',
        label: 'Collected (completed)',
        value: formatUsd(summary.collected),
        delta: `${summary.trip_count} trips in range`,
        positive: true,
      },
      {
        key: 'outstanding',
        label: 'Outstanding',
        value: formatUsd(summary.outstanding),
        delta: 'Planned / ongoing',
        positive: true,
      },
      {
        key: 'overdue',
        label: 'Flagged / overdue',
        value: formatUsd(summary.overdue),
        delta: revDelta,
        positive: false,
      },
    ]
  }, [summary])

  const topClients = reportQuery.data?.top_clients ?? []

  const chartData = useMemo(() => {
    const trend = reportQuery.data?.trend ?? []
    return trend.map((t) => ({ label: t.period, amount: t.amount ?? 0 }))
  }, [reportQuery.data?.trend])

  const allRows: InvoiceRecord[] = useMemo(() => {
    return (reportQuery.data?.records ?? []).map((r) => ({
      invoiceId: r.invoice_id,
      client: r.client,
      tripRef: r.trip_number,
      tripNumber: r.trip_number,
      dateIssued: r.date,
      amount: r.amount,
      status: r.status,
    }))
  }, [reportQuery.data?.records])

  const computedRows = useMemo(() => {
    let rows = [...allRows]

    if (activeClient !== 'All') {
      rows = rows.filter((row) => row.client === activeClient)
    }

    if (activeKpi === 'overdue') {
      rows = rows.filter((row) => row.status === 'Overdue')
    } else if (activeKpi === 'outstanding') {
      rows = rows.filter((row) => row.status === 'Pending' || row.status === 'Overdue')
    } else if (activeKpi === 'collected') {
      rows = rows.filter((row) => row.status === 'Paid')
    }

    if (statusFilter !== 'All') {
      rows = rows.filter((row) => row.status === statusFilter)
    }

    rows.sort((a, b) => {
      if (sortBy === 'date_desc') return +new Date(b.dateIssued) - +new Date(a.dateIssued)
      if (sortBy === 'date_asc') return +new Date(a.dateIssued) - +new Date(b.dateIssued)
      if (sortBy === 'amount_desc') return b.amount - a.amount
      return a.amount - b.amount
    })

    return rows
  }, [allRows, activeClient, activeKpi, statusFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(computedRows.length / pageSize))
  const currentRows = useMemo(() => {
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * pageSize
    return computedRows.slice(start, start + pageSize)
  }, [computedRows, page, totalPages])

  if (reportQuery.isError) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        Could not load income report: {getErrorDetail(reportQuery.error)}
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-2xl p-4">
        <FinanceFiltersBar value={filters} onChange={(next) => { setFilters(next); setPage(1) }} />
        {reportQuery.isLoading ? <p className="text-sm text-gray-600">Loading trip revenue…</p> : null}
        <div className="flex items-center justify-end">
          <ExportControls />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((metric) => (
            <KpiCard
              key={metric.key}
              label={metric.label}
              value={metric.value}
              delta={metric.delta}
              positive={metric.positive}
              active={activeKpi === metric.key}
              onClick={() => {
                setActiveKpi((prev) => (prev === metric.key ? 'none' : metric.key))
                setPage(1)
              }}
            />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <IncomeChart data={chartData} timeView={timeView} onTimeViewChange={setTimeView} />
          <TopClientsList
            clients={topClients}
            activeClient={activeClient}
            onSelectClient={(client) => {
              setActiveClient(client)
              setPage(1)
            }}
          />
        </div>

        <IncomeTable
          rows={currentRows}
          sortBy={sortBy}
          onSortByChange={(next) => {
            setSortBy(next)
            setPage(1)
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(next) => {
            setStatusFilter(next)
            setPage(1)
          }}
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>
)
}

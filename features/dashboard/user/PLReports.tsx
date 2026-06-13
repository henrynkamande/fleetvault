"use client";

import { useMemo, useState } from 'react'
import FinanceFiltersBar, { financeFiltersToParams, type FinanceFiltersState } from './finance/FinanceFiltersBar'
import { formatCurrency, formatDeltaPct } from './finance/financeFormat'
import { usePlReportQuery } from '@/hooks/queries/useFinanceReports'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import type { FinanceGranularity } from '@/types/finance'
import { getErrorDetail } from '@/lib/apiErrors'
import { normalizeCurrency } from '@/lib/currencies'
import { LoadingState } from "@/components/ui/LoadingSpinner"

type TimeMode = 'Monthly' | 'Quarterly' | 'Yearly'

type PnlKpi = {
  label: string
  value: string
  delta: string
  tone: 'positive' | 'negative' | 'neutral'
}

type TrendDatum = {
  period: string
  revenue: number
  expenses: number
}

type StatementRow = {
  section: 'Income' | 'Expenses'
  account: string
  amount: number
  percentOfRevenue: number
}

type KpiCardProps = PnlKpi

type TrendChartProps = {
  data: TrendDatum[]
  mode: TimeMode
  onModeChange: (mode: TimeMode) => void
  currency: string
}

type StatementTableProps = {
  rows: StatementRow[]
  currency: string
}

function KpiCard({ label, value, delta, tone }: KpiCardProps) {
  const toneClass =
    tone === 'positive' ? 'text-emerald-600' : tone === 'negative' ? 'text-rose-600' : 'text-slate-500'
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[#111827]">{value}</p>
      <p className={`mt-1 text-sm font-medium ${toneClass}`}>{delta}</p>
    </article>
  )
}

function TrendChart({ data, mode, onModeChange, currency }: TrendChartProps) {
  const max = Math.max(...data.map((item) => Math.max(item.revenue, item.expenses)), 1)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#111827]">Revenue vs Expenses Trend</h3>
          <p className="text-xs text-gray-600">Monthly breakdown of profitability</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Revenue
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Expenses
            </span>
          </div>
          <select
            value={mode}
            onChange={(event) => onModeChange(event.target.value as TimeMode)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div className="grid h-64 grid-cols-6 items-end gap-3">
        {data.map((datum) => {
          const revenueHeight = Math.max((datum.revenue / max) * 100, 5)
          const expensesHeight = Math.max((datum.expenses / max) * 100, 5)
          return (
            <div key={datum.period} className="flex h-full flex-col items-center justify-end gap-1">
              <div className="grid h-full w-full grid-cols-2 items-end gap-1">
                <div
                  className="rounded-t-md bg-emerald-500/85 hover:bg-emerald-500"
                  style={{ height: `${revenueHeight}%` }}
                  title={`${datum.period} Revenue: ${formatCurrency(datum.revenue, currency)}`}
                />
                <div
                  className="rounded-t-md bg-rose-400/85 hover:bg-rose-400"
                  style={{ height: `${expensesHeight}%` }}
                  title={`${datum.period} Expenses: ${formatCurrency(datum.expenses, currency)}`}
                />
              </div>
              <p className="text-xs text-gray-600">{datum.period}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function StatementTable({ rows, currency }: StatementTableProps) {
  const grouped = useMemo(() => {
    const income = rows.filter((row) => row.section === 'Income')
    const expenses = rows.filter((row) => row.section === 'Expenses')
    return { income, expenses }
  }, [rows])

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#111827]">Detailed Profit &amp; Loss Statement</h3>
          <p className="text-xs text-gray-600">Consolidated summary for the selected period</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Print
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#fbbd26] px-3 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a]"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-gray-500">
            <tr className="border-b border-gray-100">
              <th className="pb-3 font-medium">Account / Category</th>
              <th className="pb-3 font-medium">Amount ({currency})</th>
              <th className="pb-3 font-medium">% of Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50">
              <td className="py-2 font-semibold text-[#111827]">Income</td>
              <td />
              <td />
            </tr>
            {grouped.income.map((row) => (
              <tr key={`income-${row.account}`} className="border-b border-gray-100">
                <td className="py-3 text-gray-700">{row.account}</td>
                <td className="py-3 font-semibold text-[#111827]">{formatCurrency(row.amount, currency, true)}</td>
                <td className="py-3 text-gray-700">{row.percentOfRevenue.toFixed(1)}%</td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="py-2 font-semibold text-[#111827]">Expenses</td>
              <td />
              <td />
            </tr>
            {grouped.expenses.map((row) => (
              <tr key={`expense-${row.account}`} className="border-b border-gray-100">
                <td className="py-3 text-gray-700">{row.account}</td>
                <td className="py-3 font-semibold text-[#111827]">{formatCurrency(row.amount, currency, true)}</td>
                <td className="py-3 text-gray-700">{row.percentOfRevenue.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const statementSeed: StatementRow[] = [
  { section: 'Income', account: 'Freight Revenue (Manual Trips)', amount: 230400, percentOfRevenue: 93.8 },
  { section: 'Income', account: 'Surcharges & Accessorials', amount: 12100, percentOfRevenue: 4.9 },
  { section: 'Income', account: 'Other Income', amount: 3100, percentOfRevenue: 1.3 },
  { section: 'Expenses', account: 'Fuel Costs', amount: 82400, percentOfRevenue: 33.6 },
  { section: 'Expenses', account: 'Driver Wages', amount: 56200, percentOfRevenue: 22.9 },
  { section: 'Expenses', account: 'Maintenance & Repairs', amount: 24400, percentOfRevenue: 9.9 },
  { section: 'Expenses', account: 'Insurance & Compliance', amount: 15400, percentOfRevenue: 6.3 },
]

export default function PLReports() {
  const [filters, setFilters] = useState<FinanceFiltersState>({ period: 'ytd', vehicle: '', driver: '' })
  const [timeMode, setTimeMode] = useState<TimeMode>('Quarterly')
  const userQuery = useCurrentUser()
  const currency = normalizeCurrency(userQuery.data?.preferred_currency)

  const granularity: FinanceGranularity =
    timeMode === 'Yearly' ? 'yearly' : timeMode === 'Monthly' ? 'monthly' : 'quarterly'

  const reportQuery = usePlReportQuery({ ...financeFiltersToParams(filters), granularity })

  const summary = reportQuery.data?.summary

  const trendData = useMemo(() => {
    return (reportQuery.data?.trend ?? []).map((t) => ({
      period: t.period,
      revenue: t.revenue ?? 0,
      expenses: t.expenses ?? 0,
    }))
  }, [reportQuery.data?.trend])

  const statementRows: StatementRow[] = useMemo(() => {
    return (reportQuery.data?.statement ?? []).map((r) => ({
      section: r.section,
      account: r.account,
      amount: r.amount,
      percentOfRevenue: r.percent_of_revenue,
    }))
  }, [reportQuery.data?.statement])

  const kpis: PnlKpi[] = useMemo(() => {
    if (!summary) {
      return [
        { label: 'Total Revenue', value: '—', delta: '—', tone: 'positive' },
        { label: 'Total Expenses', value: '—', delta: '—', tone: 'negative' },
        { label: 'Net Profit', value: '—', delta: '—', tone: 'positive' },
        { label: 'Profit Margin', value: '—', delta: '—', tone: 'positive' },
      ]
    }
    const margin = summary.revenue_total > 0 ? (summary.profit_total / summary.revenue_total) * 100 : 0
    return [
      { label: 'Total Revenue', value: formatCurrency(summary.revenue_total, currency), delta: formatDeltaPct(summary.revenue_change_pct), tone: 'positive' },
      { label: 'Total Expenses', value: formatCurrency(summary.expenses_total, currency), delta: formatDeltaPct(summary.expenses_change_pct), tone: 'negative' },
      { label: 'Net Profit', value: formatCurrency(summary.profit_total, currency), delta: formatDeltaPct(summary.profit_change_pct), tone: summary.profit_total >= 0 ? 'positive' : 'negative' },
      { label: 'Profit Margin', value: `${margin.toFixed(1)}%`, delta: `${summary.trip_count} trips`, tone: margin >= 0 ? 'positive' : 'negative' },
    ]
  }, [currency, summary])

  if (reportQuery.isError) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        Could not load P&amp;L report: {getErrorDetail(reportQuery.error)}
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-2xl  p-4">
        <FinanceFiltersBar value={filters} onChange={setFilters} />
        {reportQuery.isLoading ? <LoadingState /> : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        <TrendChart data={trendData} mode={timeMode} onModeChange={setTimeMode} currency={currency} />
        <StatementTable rows={statementRows.length ? statementRows : statementSeed} currency={currency} />
      </section>
)
}

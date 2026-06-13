"use client";

import Link from 'next/link';
import { useMemo } from 'react'
import { useDashboardPeriod } from '@/context/DashboardPeriodContext'
import { useDashboardOverviewQuery } from '@/hooks/queries/useDashboardOverview'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { getErrorDetail } from '@/lib/apiErrors'
import { normalizeCurrency } from '@/lib/currencies'
import { AppRoutesPaths } from '@/route/paths'
import type {
  DashboardExpenseSegmentDto,
  DriverPayoutModeSummary,
  DashboardOngoingTripDto,
  DashboardTopDriverDto,
  DashboardTopVehicleDto,
  DashboardTripDisplayStatus,
} from '@/types/finance'
import { formatCurrency, formatDeltaPct } from './finance/financeFormat'

type Trend = 'positive' | 'negative'

type KpiCardProps = {
  title: string
  value: string
  delta: string
  trend: Trend
}

type InsightCardProps = {
  title: string
  value: string
  meta: string
  tone: 'positive' | 'negative' | 'neutral'
}

type DriverEntry = {
  rank: number
  name: string
  meta: string
  score: string
}

type VehicleEntry = {
  rank: number
  name: string
  meta: string
  distance: string
  netProfit: string
}

type ChartSegment = {
  label: string
  value: string
  ratio: number
  tone: DashboardExpenseSegmentDto['tone']
}

type ChartCardProps = {
  revenueValue: string
  expenseSegments: ChartSegment[]
  payoutModes: DriverPayoutModeSummary[]
  revenueRatio: number
  currency: string
}

type LeaderboardListProps = {
  title: string
  entries: DriverEntry[] | VehicleEntry[]
  variant: 'drivers' | 'vehicles'
}

function KpiCard({ title, value, delta, trend }: KpiCardProps) {
  return (
    <article className="ff-card">
      <p className="text-sm font-medium ff-muted">{title}</p>
      <p className="mt-2 text-3xl font-semibold ff-heading">{value}</p>
      <p className={`mt-1 text-sm font-medium ${trend === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
        {delta}
      </p>
    </article>
  )
}

function InsightCard({ title, value, meta, tone }: InsightCardProps) {
  const toneClass =
    tone === 'positive'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'negative'
        ? 'text-rose-600 dark:text-rose-400'
        : 'ff-heading'

  return (
    <article className="ff-card">
      <p className="text-sm font-medium ff-muted">{title}</p>
      <p className={`mt-2 truncate text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-1 truncate text-sm ff-muted">{meta}</p>
    </article>
  )
}

function statusBadge(status: DashboardTripDisplayStatus): string {
  if (status === 'On Schedule') return 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900'
  if (status === 'Delayed') return 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900'
  return 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900'
}

function DataTable({ rows }: { rows: DashboardOngoingTripDto[] }) {
  return (
    <article className="ff-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold ff-heading">Ongoing Trips (Manual Tracking)</h2>
          <p className="text-sm ff-muted">Monitor current dispatched drivers and routes.</p>
        </div>
        <Link href={AppRoutesPaths.dashboard.trips} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="pb-3 font-medium">Driver &amp; Vehicle</th>
              <th className="pb-3 font-medium">Route</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-500 dark:text-slate-400">
                  No active trips right now.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
              <tr key={row.trip_uuid} className="border-b border-slate-100 last:border-none dark:border-slate-800">
                <td className="py-3 font-medium text-slate-700 dark:text-slate-300">{row.driver_vehicle}</td>
                <td className="py-3">
                  <Link
                    href={AppRoutesPaths.dashboard.tripProfile(row.trip_uuid)}
                    className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {row.route}
                  </Link>
                </td>
                <td className="py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadge(row.status)}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function toneClasses(tone: ChartSegment['tone']): string {
  if (tone === 'positive') return 'bg-emerald-500'
  if (tone === 'warning') return 'bg-amber-500'
  return 'bg-rose-500'
}

function ChartCard({ revenueValue, expenseSegments, payoutModes, revenueRatio, currency }: ChartCardProps) {
  return (
    <article className="ff-card">
      <h2 className="text-lg font-semibold text-slate-900">P&amp;L Breakdown</h2>
      <div className="mt-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="text-2xl font-semibold text-emerald-600">{revenueValue}</p>
          <div className="mt-3 h-3 rounded-full bg-slate-200">
            <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${revenueRatio}%` }} />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {expenseSegments.map((segment) => (
            <div key={segment.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{segment.label}</span>
                <span className="text-slate-500">{segment.value}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className={`h-2 rounded-full ${toneClasses(segment.tone)}`} style={{ width: `${segment.ratio}%` }} />
              </div>
            </div>
          ))}
        </div>
        {payoutModes.length > 0 ? (
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm font-semibold text-slate-900">Driver payouts by mode</p>
            <p className="text-xs text-slate-500">Secure your earnings: every mode is tracked clearly.</p>
            <div className="mt-3 space-y-2">
              {payoutModes.map((mode) => (
                <div key={mode.mode} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">{mode.label}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(mode.total, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}

function isDriverEntry(entry: DriverEntry | VehicleEntry): entry is DriverEntry {
  return 'score' in entry
}

function LeaderboardList({ title, entries, variant }: LeaderboardListProps) {
  return (
    <article className="ff-card">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">No data for this period yet.</p>
      ) : (
      <ol className="space-y-3">
        {entries.map((entry) => (
          <li key={`${entry.rank}-${entry.name}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <span className="text-sm font-semibold text-slate-500">#{entry.rank}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{entry.name}</p>
              <p className="truncate text-sm text-slate-500">{entry.meta}</p>
            </div>
            {isDriverEntry(entry) ? (
              <p className="text-sm font-semibold text-emerald-700">{entry.score} score</p>
            ) : (
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-700">{entry.netProfit}</p>
                <p className="text-xs text-slate-500">{entry.distance}</p>
              </div>
            )}
            {variant === 'vehicles' ? <span className="text-emerald-600">↗</span> : null}
          </li>
        ))}
      </ol>
      )}
    </article>
  )
}

function mapDrivers(drivers: DashboardTopDriverDto[]): DriverEntry[] {
  return drivers.map((d, i) => ({
    rank: i + 1,
    name: d.name,
    meta: `${d.trip_count} trips • ${d.on_time_pct.toFixed(0)}% on-time`,
    score: `${d.on_time_pct.toFixed(0)}%`,
  }))
}

function mapVehicles(vehicles: DashboardTopVehicleDto[], currency: string): VehicleEntry[] {
  return vehicles.map((v, i) => ({
    rank: i + 1,
    name: v.name,
    meta: `${v.registration} • ${v.distance_km.toLocaleString()} km this period`,
    distance: `${v.distance_km.toLocaleString()} km`,
    netProfit: formatCurrency(v.net_profit, currency),
  }))
}

function vehicleInsightMeta(vehicle: DashboardTopVehicleDto | null, currency: string): string {
  if (!vehicle) return 'No vehicle performance data yet'
  return `${vehicle.registration} • ${vehicle.distance_km.toLocaleString()} km • ${formatCurrency(vehicle.net_profit, currency)} net`
}

function trendFromPct(pct: number | null | undefined, invert = false): Trend {
  if (pct === null || pct === undefined) return 'positive'
  if (invert) return pct <= 0 ? 'positive' : 'negative'
  return pct >= 0 ? 'positive' : 'negative'
}

function DashboardSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="xl:col-span-3">
          <div className="ff-card h-28 animate-pulse bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </section>
  )
}

export default function Dashboard() {
  const { period } = useDashboardPeriod()
  const overviewQuery = useDashboardOverviewQuery({ period })
  const userQuery = useCurrentUser()
  const currency = normalizeCurrency(userQuery.data?.preferred_currency)

  const view = useMemo(() => {
    const data = overviewQuery.data
    if (!data) return null
    const { summary } = data
    const revenueRatio =
      summary.revenue_total > 0
        ? Math.min(100, Math.round((summary.profit_total / summary.revenue_total) * 100))
        : 0
    const expenseSegments: ChartSegment[] = data.expense_breakdown.map((s) => ({
      label: s.label,
      value: formatCurrency(s.amount, currency),
      ratio: s.ratio,
      tone: s.tone,
    }))
    return {
      revenueRatio,
      expenseSegments,
      topDrivers: mapDrivers(data.top_drivers),
      topVehicles: mapVehicles(data.top_vehicles, currency),
      payoutModes: data.driver_payouts_by_mode ?? [],
      mostProfitableVehicle: data.most_profitable_vehicle,
      worstPerformingVehicle: data.worst_performing_vehicle,
      activeTripCount: data.active_trip_count,
      summary,
      ongoing: data.ongoing_trips,
      tripCountDelta: data.trip_count_change,
    }
  }, [currency, overviewQuery.data])

  if (overviewQuery.isLoading) {
    return <DashboardSkeleton />
  }

  if (overviewQuery.isError) {
    return (
      <div className="ff-card border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {getErrorDetail(overviewQuery.error) ?? 'Could not load dashboard data.'}
      </div>
    )
  }

  if (!view) {
    return null
  }

  const { summary, tripCountDelta } = view
  const tripDeltaLabel =
    tripCountDelta === 0
      ? 'Same as prior period'
      : `${tripCountDelta > 0 ? '+' : ''}${tripCountDelta} vs prior period`

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
      <div className="xl:col-span-3">
        <KpiCard
          title="Revenue (Current)"
          value={formatCurrency(summary.revenue_total, currency)}
          delta={formatDeltaPct(summary.revenue_change_pct)}
          trend={trendFromPct(summary.revenue_change_pct)}
        />
      </div>
      <div className="xl:col-span-3">
        <KpiCard
          title="Total Income"
          value={formatCurrency(summary.collected, currency)}
          delta={formatDeltaPct(summary.profit_change_pct)}
          trend={trendFromPct(summary.profit_change_pct)}
        />
      </div>
      <div className="xl:col-span-3">
        <KpiCard
          title="Expenses"
          value={formatCurrency(summary.expenses_total, currency)}
          delta={formatDeltaPct(summary.expenses_change_pct)}
          trend={trendFromPct(summary.expenses_change_pct, true)}
        />
      </div>
      <div className="xl:col-span-3">
        <KpiCard
          title="Trips Count"
          value={String(summary.trip_count)}
          delta={tripDeltaLabel}
          trend={tripCountDelta >= 0 ? 'positive' : 'negative'}
        />
      </div>

      <div className="xl:col-span-4">
        <InsightCard
          title="Most Profitable Vehicle"
          value={view.mostProfitableVehicle?.name ?? 'No vehicle data'}
          meta={vehicleInsightMeta(view.mostProfitableVehicle, currency)}
          tone="positive"
        />
      </div>
      <div className="xl:col-span-4">
        <InsightCard
          title="Worst Performing Vehicle"
          value={view.worstPerformingVehicle?.name ?? 'No vehicle data'}
          meta={vehicleInsightMeta(view.worstPerformingVehicle, currency)}
          tone="negative"
        />
      </div>
      <div className="xl:col-span-4">
        <InsightCard
          title="Active Trips"
          value={String(view.activeTripCount)}
          meta="Currently dispatched, planned, delayed, or flagged"
          tone="neutral"
        />
      </div>

      <div className="xl:col-span-8">
        <DataTable rows={view.ongoing} />
      </div>
      <div className="xl:col-span-4">
        <ChartCard
          revenueValue={formatCurrency(summary.revenue_total, currency)}
          expenseSegments={view.expenseSegments}
          payoutModes={view.payoutModes}
          revenueRatio={view.revenueRatio}
          currency={currency}
        />
      </div>
      <div className="xl:col-span-6">
        <LeaderboardList title="Top Performing Drivers" entries={view.topDrivers} variant="drivers" />
      </div>
      <div className="xl:col-span-6">
        <LeaderboardList title="Highest ROI Vehicles" entries={view.topVehicles} variant="vehicles" />
      </div>
    </section>
  )
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlatformOverview } from "@/hooks/queries/usePlatformOverview";
import { getErrorDetail } from "@/lib/apiErrors";
import { AppRoutesPaths } from "@/route/paths";
import type { FinancePeriodPreset } from "@/types/finance";
import { formatBillingStatus } from "@/types/platform";
import { LoadingCard, LoadingSpinner, LoadingState } from "@/components/ui/LoadingSpinner"

const periodOptions: { label: string; value: FinancePeriodPreset }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <article className="ff-card">
      <p className="text-sm font-medium ff-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold ff-heading">{value}</p>
      {hint ? <p className="mt-1 text-xs ff-muted">{hint}</p> : null}
    </article>
  );
}

function money(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function AdminOverview() {
  const [period, setPeriod] = useState<FinancePeriodPreset>("30d");
  const { data, isLoading, isError, error } = usePlatformOverview(period);

  if (isLoading) {
    return <LoadingState />;
  }
  if (isError || !data) {
    return (
      <p className="text-rose-600">
        {getErrorDetail(error) ?? "Could not load platform overview."}
      </p>
    );
  }

  const billing = data.companies.billing_breakdown;
  const subs = data.subscriptions;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm ff-muted">
          Period {data.period.start} → {data.period.end}
        </p>
        <select
          className="ff-dashboard-select"
          value={period}
          onChange={(e) => setPeriod(e.target.value as FinancePeriodPreset)}
        >
          {periodOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total companies" value={data.companies.total} hint={`+${data.companies.new_in_period} new`} />
        <StatCard title="Total users" value={data.users.total} />
        <StatCard title="Fleet owners" value={data.users.fleet_owners} />
        <StatCard title="Drivers" value={data.users.drivers} hint={`${data.users.drivers_verified} verified`} />
        <StatCard title="Vehicles" value={data.fleet_ops.vehicles} />
        <StatCard title="Total trips" value={data.fleet_ops.trips_total} />
        <StatCard title="Trips (period)" value={data.fleet_ops.trips_in_period} />
        <StatCard title="KYC pending" value={data.risk.kyc_pending} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <StatCard title="Revenue (period)" value={money(data.fleet_ops.revenue)} hint={`Prev ${money(data.fleet_ops.revenue_previous)}`} />
        <StatCard title="Total expenses (period)" value={money(data.fleet_ops.expenses)} />
        <StatCard
          title="Profit & loss (period)"
          value={money(data.fleet_ops.profit)}
          hint={data.fleet_ops.profit >= 0 ? "Net positive" : "Net negative"}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Active subscriptions" value={subs.active} />
        <StatCard title="Trial accounts" value={subs.trialing} />
        <StatCard title="Pending payments" value={subs.pending_payment} />
        <StatCard title="Monthly recurring revenue" value={money(subs.mrr)} />
        <StatCard title="Outstanding revenue" value={money(subs.outstanding_revenue)} />
      </section>

      <section className="ff-card">
        <h2 className="text-lg font-semibold ff-heading">Subscription overview</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {Object.entries(billing).map(([status, count]) => (
            <span
              key={status}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {formatBillingStatus(status)}: {count}
            </span>
          ))}
        </div>
        <Link
          href={AppRoutesPaths.dashboard.admin.subscriptions}
          className="mt-4 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400"
        >
          View subscriptions & payments →
        </Link>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="ff-card">
          <h2 className="text-lg font-semibold ff-heading">Recent signups</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {data.recent_signups.length === 0 ? (
              <li className="py-4 ff-muted">No recent company signups.</li>
            ) : (
              data.recent_signups.map((c) => (
                <li key={c.id} className="flex justify-between gap-2 py-2">
                  <div>
                    <Link
                      href={AppRoutesPaths.dashboard.admin.companyDetail(c.id)}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {c.name}
                    </Link>
                    <p className="ff-muted">{c.owner_email}</p>
                  </div>
                  <span className="ff-muted">{formatBillingStatus(c.billing_status)}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="ff-card">
          <h2 className="text-lg font-semibold ff-heading">Recent activity</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {data.recent_activity.length === 0 ? (
              <li className="py-4 ff-muted">No recent activity.</li>
            ) : (
              data.recent_activity.map((item, i) => (
                <li key={`${item.at}-${i}`} className="py-2">
                  <p className="font-medium ff-heading">{item.title}</p>
                  <p className="ff-muted">{item.detail}</p>
                  <p className="text-xs ff-muted">{item.at.slice(0, 10)}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="ff-card">
        <h2 className="text-lg font-semibold ff-heading">Alerts / items requiring attention</h2>
        <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {data.companies_needing_attention.length === 0 && data.risk.kyc_pending === 0 ? (
            <li className="py-4 ff-muted">Nothing flagged right now.</li>
          ) : null}
          {data.risk.kyc_pending > 0 ? (
            <li className="py-2">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                {data.risk.kyc_pending} driver KYC document(s) pending review
              </p>
            </li>
          ) : null}
          {data.companies_needing_attention.map((c) => (
            <li key={c.id} className="py-2">
              <Link
                href={AppRoutesPaths.dashboard.admin.companyDetail(c.id)}
                className="font-medium text-indigo-600 dark:text-indigo-400"
              >
                {c.name}
              </Link>
              <p className="ff-muted">
                {formatBillingStatus(c.billing_status)}
                {c.trial_ends_at ? ` · trial ends ${c.trial_ends_at.slice(0, 10)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

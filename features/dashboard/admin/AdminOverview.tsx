"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlatformOverview } from "@/hooks/queries/usePlatformOverview";
import { getErrorDetail } from "@/lib/apiErrors";
import { AppRoutesPaths } from "@/route/paths";
import type { FinancePeriodPreset } from "@/types/finance";

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

export default function AdminOverview() {
  const [period, setPeriod] = useState<FinancePeriodPreset>("30d");
  const { data, isLoading, isError, error } = usePlatformOverview(period);

  if (isLoading) {
    return <p className="ff-muted">Loading platform pulse…</p>;
  }
  if (isError || !data) {
    return (
      <p className="text-rose-600">
        {getErrorDetail(error) ?? "Could not load platform overview."}
      </p>
    );
  }

  const billing = data.companies.billing_breakdown;

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
        <StatCard title="Companies" value={data.companies.total} hint={`+${data.companies.new_in_period} new`} />
        <StatCard title="Fleet owners" value={data.users.fleet_owners} />
        <StatCard
          title="Drivers"
          value={data.users.drivers}
          hint={`${data.users.drivers_verified} verified`}
        />
        <StatCard title="Vehicles" value={data.fleet_ops.vehicles} />
        <StatCard title="Trips (period)" value={data.fleet_ops.trips_in_period} />
        <StatCard
          title="Revenue (period)"
          value={`$${data.fleet_ops.revenue.toLocaleString()}`}
        />
        <StatCard
          title="Expenses (period)"
          value={`$${data.fleet_ops.expenses.toLocaleString()}`}
        />
        <StatCard title="KYC pending" value={data.risk.kyc_pending} />
      </section>

      <section className="ff-card">
        <h2 className="text-lg font-semibold ff-heading">Billing status</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {Object.entries(billing).map(([status, count]) => (
            <span
              key={status}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {status}: {count}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="ff-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold ff-heading">Recent signups</h2>
            <Link
              href={AppRoutesPaths.dashboard.admin.companies}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
            >
              All companies
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {data.recent_signups.map((c) => (
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
                <span className="ff-muted">{c.billing_status}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ff-card">
          <h2 className="text-lg font-semibold ff-heading">Needs attention</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {data.companies_needing_attention.length === 0 ? (
              <li className="py-4 ff-muted">Nothing flagged right now.</li>
            ) : (
              data.companies_needing_attention.map((c) => (
                <li key={c.id} className="py-2">
                  <Link
                    href={AppRoutesPaths.dashboard.admin.companyDetail(c.id)}
                    className="font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    {c.name}
                  </Link>
                  <p className="ff-muted">
                    {c.billing_status}
                    {c.trial_ends_at ? ` · trial ends ${c.trial_ends_at.slice(0, 10)}` : ""}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useDashboardPeriodOptional } from "@/context/DashboardPeriodContext";
import { usePlatformOverview } from "@/hooks/queries/usePlatformOverview";
import {
  usePlatformRecentActivity,
  usePlatformRecentSignups,
} from "@/hooks/queries/usePlatformOverviewLists";
import { getErrorDetail } from "@/lib/apiErrors";
import { AppRoutesPaths } from "@/route/paths";
import { formatBillingStatus, formatPlatformRole } from "@/types/platform";
import { LoadingState } from "@/components/ui/LoadingSpinner";

const SIGNUPS_PAGE_SIZE = 8;
const ACTIVITY_PAGE_SIZE = 5;

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

function ListPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
      <span className="text-xs ff-muted">
        Showing {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          className="ff-dashboard-select disabled:opacity-40"
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </button>
        <span className="text-xs ff-muted">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          className="ff-dashboard-select disabled:opacity-40"
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const periodCtx = useDashboardPeriodOptional();
  const period = periodCtx?.period ?? "30d";
  const [signupsPage, setSignupsPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);

  const { data, isLoading, isError, error } = usePlatformOverview(period);
  const signupsQuery = usePlatformRecentSignups({
    page: signupsPage,
    page_size: SIGNUPS_PAGE_SIZE,
  });
  const activityQuery = usePlatformRecentActivity({
    page: activityPage,
    page_size: ACTIVITY_PAGE_SIZE,
  });

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
  const signups = signupsQuery.data;
  const activity = activityQuery.data;

  return (
    <div className="space-y-8">
      <p className="text-sm ff-muted">
        Period {data.period.start} → {data.period.end} (use the header control to change range)
      </p>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total users" value={data.users.total} hint={`${data.users.fleet_owners} fleet owners`} />
        <StatCard title="Drivers" value={data.users.drivers} hint={`${data.users.drivers_verified} verified`} />
        <StatCard title="Vehicles" value={data.fleet_ops.vehicles} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <StatCard
          title="Revenue (period)"
          value={money(data.fleet_ops.revenue)}
          hint={`${data.fleet_ops.trip_count ?? 0} trips · prev ${money(data.fleet_ops.revenue_previous)}`}
        />
        <StatCard
          title="Total expenses (period)"
          value={money(data.fleet_ops.expenses)}
          hint={`Fleet trip expenses · platform ${money(data.fleet_ops.platform_system_expenses ?? 0)}`}
        />
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold ff-heading">Items requiring attention</h2>
          <Link
            href={AppRoutesPaths.dashboard.admin.notifications}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
          >
            Open notifications →
          </Link>
        </div>
        <p className="mt-2 text-sm ff-muted">
          Billing, trials, and account issues appear in your notification center (bell icon).
        </p>
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
            {signupsQuery.isLoading ? (
              <li className="py-4 ff-muted">Loading…</li>
            ) : signups?.results.length === 0 ? (
              <li className="py-4 ff-muted">No recent company signups.</li>
            ) : (
              signups?.results.map((c) => (
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
          {signups ? (
            <ListPagination
              page={signups.page}
              pageSize={signups.page_size}
              total={signups.count}
              onPageChange={setSignupsPage}
            />
          ) : null}
        </section>

        <section className="ff-card">
          <h2 className="text-lg font-semibold ff-heading">Recent activity</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {activityQuery.isLoading ? (
              <li className="py-4 ff-muted">Loading…</li>
            ) : activity?.results.length === 0 ? (
              <li className="py-4 ff-muted">No recent activity.</li>
            ) : (
              activity?.results.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div>
                    <p className="font-medium ff-heading">{item.title}</p>
                    <p className="text-sm ff-muted">{formatPlatformRole(item.role)}</p>
                  </div>
                  <time className="shrink-0 text-xs ff-muted" dateTime={item.at}>
                    {item.at.slice(0, 10)}
                  </time>
                </li>
              ))
            )}
          </ul>
          {activity ? (
            <ListPagination
              page={activity.page}
              pageSize={activity.page_size}
              total={activity.count}
              onPageChange={setActivityPage}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

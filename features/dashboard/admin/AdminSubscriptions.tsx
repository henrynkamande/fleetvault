"use client";

import { useState } from "react";
import { usePlatformSubscriptions } from "@/hooks/queries/usePlatformSubscriptions";
import { getErrorDetail } from "@/lib/apiErrors";
import { formatBillingStatus } from "@/types/platform";
import { LoadingState } from "@/components/ui/LoadingSpinner"

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <article className="ff-card">
      <p className="text-sm ff-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold ff-heading">{value}</p>
    </article>
  );
}

function money(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const BILLING_FILTERS = [
  "",
  "ACTIVE",
  "TRIALING",
  "INCOMPLETE",
  "PAST_DUE",
  "CANCELED",
  "NOT_STARTED",
];

export default function AdminSubscriptions() {
  const [search, setSearch] = useState("");
  const [billingStatus, setBillingStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = usePlatformSubscriptions({
    page,
    search: search || undefined,
    billing_status: billingStatus || undefined,
  });

  const summary = data?.summary;

  return (
    <div className="space-y-4">
      {summary ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Active subscriptions" value={summary.active} />
          <StatCard title="Trial accounts" value={summary.trialing} />
          <StatCard title="Pending payments" value={summary.pending_payment} />
          <StatCard title="Monthly recurring revenue" value={money(summary.mrr)} />
          <StatCard title="Outstanding revenue" value={money(summary.outstanding_revenue)} />
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search company or owner…"
          className="ff-dashboard-select min-w-[200px] flex-1"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="ff-dashboard-select"
          value={billingStatus}
          onChange={(e) => {
            setBillingStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All billing statuses</option>
          {BILLING_FILTERS.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {formatBillingStatus(s)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <p className="text-rose-600">{getErrorDetail(error)}</p>
      ) : (
        <>
          <p className="text-sm ff-muted">{data?.count ?? 0} companies</p>
          <div className="overflow-x-auto ff-card p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Billing status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Renewal / trial end</th>
                  <th className="px-4 py-3 font-medium">Trial</th>
                </tr>
              </thead>
              <tbody>
                {data?.results.map((row) => (
                  <tr
                    key={row.company_id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 font-medium">{row.company_name}</td>
                    <td className="px-4 py-3">{row.subscription_plan}</td>
                    <td className="px-4 py-3">{formatBillingStatus(row.billing_status)}</td>
                    <td className="px-4 py-3">{row.payment_status}</td>
                    <td className="px-4 py-3">{money(row.amount_paid)}</td>
                    <td className="px-4 py-3">{money(row.amount_due)}</td>
                    <td className="px-4 py-3 ff-muted">
                      {row.renewal_date ? row.renewal_date.slice(0, 10) : "—"}
                    </td>
                    <td className="px-4 py-3">{row.trial_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              className="ff-dashboard-select disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={(data?.results.length ?? 0) < 25}
              className="ff-dashboard-select disabled:opacity-40"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

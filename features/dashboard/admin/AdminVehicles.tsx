"use client";

import { useState } from "react";
import {
  usePlatformVehicleDetail,
  usePlatformVehicles,
} from "@/hooks/queries/usePlatformVehicles";
import { getErrorDetail } from "@/lib/apiErrors";
import { LoadingState } from "@/components/ui/LoadingSpinner"

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <article className="ff-card">
      <p className="text-sm ff-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold ff-heading">{value}</p>
    </article>
  );
}

export default function AdminVehicles() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = usePlatformVehicles({
    page,
    search: search || undefined,
    status: status || undefined,
  });
  const detailQuery = usePlatformVehicleDetail(detailId);

  return (
    <div className="space-y-4">
      {data?.stats ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total vehicles" value={data.stats.total} />
          <StatCard title="Active" value={data.stats.active} />
          <StatCard title="Inactive" value={data.stats.inactive} />
          <StatCard title="Under maintenance" value={data.stats.maintenance} />
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search registration, make, company…"
          className="ff-dashboard-select min-w-[200px] flex-1"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="ff-dashboard-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="UNDER_MAINTENANCE">Under maintenance</option>
          <option value="OUT_OF_SERVICE">Out of service</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <p className="text-rose-600">{getErrorDetail(error)}</p>
      ) : (
        <>
          <p className="text-sm ff-muted">{data?.count ?? 0} vehicles</p>
          <div className="overflow-x-auto ff-card p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Registration</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Fleet owner</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {data?.results.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-medium">{row.vehicle_name}</td>
                    <td className="px-4 py-3">{row.registration_number}</td>
                    <td className="px-4 py-3">{row.vehicle_type}</td>
                    <td className="px-4 py-3 ff-muted">{row.assigned_owner_name ?? "—"}</td>
                    <td className="px-4 py-3">{row.company_name ?? "—"}</td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3 ff-muted">{row.created_at.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
                        onClick={() => setDetailId(row.id)}
                      >
                        View
                      </button>
                    </td>
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

      {detailId && detailQuery.data ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDetailId(null)}
          />
          <div className="relative w-full max-w-lg ff-card">
            <h3 className="text-lg font-semibold ff-heading">Vehicle details</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="ff-muted">Name</dt>
                <dd className="font-medium">{detailQuery.data.vehicle_name}</dd>
              </div>
              <div>
                <dt className="ff-muted">Registration</dt>
                <dd>{detailQuery.data.registration_number}</dd>
              </div>
              <div>
                <dt className="ff-muted">Assigned fleet owner</dt>
                <dd>
                  {detailQuery.data.assigned_owner_name ?? "—"}
                  {detailQuery.data.assigned_owner_email
                    ? ` (${detailQuery.data.assigned_owner_email})`
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="ff-muted">Company</dt>
                <dd>{detailQuery.data.company_name ?? "—"}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="mt-6 ff-dashboard-select"
              onClick={() => setDetailId(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

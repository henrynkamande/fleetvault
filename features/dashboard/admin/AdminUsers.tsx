"use client";

import { useMemo, useState } from "react";
import {
  usePlatformUsers,
  usePlatformUserStatusMutation,
} from "@/hooks/queries/usePlatformUsers";
import { getErrorDetail } from "@/lib/apiErrors";
import { formatPlatformRole } from "@/types/platform";
import type { PlatformUserListItem } from "@/types/platform";
import { LoadingCard, LoadingSpinner, LoadingState } from "@/components/ui/LoadingSpinner"

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          : "rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-300"
      }
    >
      {active ? "Active" : "Suspended"}
    </span>
  );
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<"" | "active" | "suspended">("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PlatformUserListItem | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      search: search || undefined,
      role: role || undefined,
      is_active:
        status === "active" ? true : status === "suspended" ? false : undefined,
    }),
    [page, search, role, status],
  );

  const { data, isLoading, isError, error } = usePlatformUsers(queryParams);
  const statusMutation = usePlatformUserStatusMutation();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search name or email…"
          className="ff-dashboard-select min-w-[200px] flex-1"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="ff-dashboard-select"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="FLEET_OWNER">Fleet owner</option>
          <option value="DRIVER">Driver</option>
        </select>
        <select
          className="ff-dashboard-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | "active" | "suspended");
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <p className="text-rose-600">{getErrorDetail(error)}</p>
      ) : (
        <>
          <p className="text-sm ff-muted">{data?.count ?? 0} users</p>
          <div className="overflow-x-auto ff-card p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Full name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Last active</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {data?.results.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-medium">{row.full_name}</td>
                    <td className="px-4 py-3 ff-muted">{row.email}</td>
                    <td className="px-4 py-3">{formatPlatformRole(row.role)}</td>
                    <td className="px-4 py-3">{row.company_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={row.is_active} />
                    </td>
                    <td className="px-4 py-3 ff-muted">{row.date_joined?.slice(0, 10)}</td>
                    <td className="px-4 py-3 ff-muted">
                      {row.last_login ? row.last_login.slice(0, 10) : "—"}
                    </td>
                    <td className="px-4 py-3">{row.is_verified ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
                        onClick={() => setSelected(row)}
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

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelected(null)}
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto ff-card">
            <h3 className="text-lg font-semibold ff-heading">User details</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="ff-muted">Full name</dt>
                <dd className="font-medium">{selected.full_name}</dd>
              </div>
              <div>
                <dt className="ff-muted">Email</dt>
                <dd>{selected.email}</dd>
              </div>
              <div>
                <dt className="ff-muted">Role</dt>
                <dd>{formatPlatformRole(selected.role)}</dd>
              </div>
              <div>
                <dt className="ff-muted">Company</dt>
                <dd>{selected.company_name ?? "—"}</dd>
              </div>
              <div>
                <dt className="ff-muted">Verification</dt>
                <dd>{selected.is_verified ? "Verified" : "Not verified"}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              {selected.is_active ? (
                <button
                  type="button"
                  className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:text-rose-400"
                  disabled={statusMutation.isPending}
                  onClick={() =>
                    statusMutation.mutate(
                      { userId: selected.id, is_active: false },
                      {
                        onSuccess: () =>
                          setSelected({ ...selected, is_active: false }),
                      },
                    )
                  }
                >
                  Suspend account
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                  disabled={statusMutation.isPending}
                  onClick={() =>
                    statusMutation.mutate(
                      { userId: selected.id, is_active: true },
                      {
                        onSuccess: () =>
                          setSelected({ ...selected, is_active: true }),
                      },
                    )
                  }
                >
                  Activate account
                </button>
              )}
              <button
                type="button"
                className="ff-dashboard-select"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

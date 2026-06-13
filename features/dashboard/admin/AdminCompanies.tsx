"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlatformCompanies } from "@/hooks/queries/usePlatformCompanies";
import { getErrorDetail } from "@/lib/apiErrors";
import { AppRoutesPaths } from "@/route/paths";
import { LoadingState } from "@/components/ui/LoadingSpinner"

export default function AdminCompanies() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = usePlatformCompanies({
    page,
    search: search || undefined,
  });

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search company or owner email…"
        className="ff-dashboard-select w-full max-w-md"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
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
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Billing</th>
                  <th className="px-4 py-3 font-medium">Drivers</th>
                  <th className="px-4 py-3 font-medium">Vehicles</th>
                  <th className="px-4 py-3 font-medium">Trips</th>
                </tr>
              </thead>
              <tbody>
                {data?.results.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={AppRoutesPaths.dashboard.admin.companyDetail(row.id)}
                        className="text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 ff-muted">{row.owner_email}</td>
                    <td className="px-4 py-3">{row.billing_status}</td>
                    <td className="px-4 py-3">{row.driver_count}</td>
                    <td className="px-4 py-3">{row.vehicle_count}</td>
                    <td className="px-4 py-3">{row.trip_count}</td>
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

"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlatformNotifications } from "@/hooks/queries/usePlatformNotifications";
import { getErrorDetail } from "@/lib/apiErrors";
import { LoadingState } from "@/components/ui/LoadingSpinner";

const PAGE_SIZE = 15;

function severityClass(severity: string) {
  if (severity === "error") return "text-rose-700 dark:text-rose-400";
  if (severity === "warning") return "text-amber-700 dark:text-amber-400";
  return "text-slate-600 dark:text-slate-400";
}

export default function AdminNotifications() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = usePlatformNotifications({
    page,
    page_size: PAGE_SIZE,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data) {
    return (
      <p className="text-rose-600">{getErrorDetail(error) ?? "Could not load notifications."}</p>
    );
  }

  const totalPages = Math.max(1, Math.ceil(data.count / data.page_size));

  return (
    <div className="space-y-6">
      <p className="text-sm ff-muted">
        {data.count} notification{data.count === 1 ? "" : "s"} requiring your attention.
      </p>
      <section className="ff-card">
        <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {data.results.length === 0 ? (
            <li className="py-8 text-center ff-muted">Nothing needs attention right now.</li>
          ) : (
            data.results.map((n) => (
              <li key={n.id} className="py-3">
                <Link href={n.href} className="block hover:opacity-90">
                  <p className={`font-medium ${severityClass(n.severity)}`}>{n.title}</p>
                  <p className="mt-1 ff-muted">{n.detail}</p>
                  <p className="mt-1 text-xs ff-muted">{n.at.slice(0, 10)}</p>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
      {data.count > PAGE_SIZE ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="ff-dashboard-select disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="text-sm ff-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            className="ff-dashboard-select disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

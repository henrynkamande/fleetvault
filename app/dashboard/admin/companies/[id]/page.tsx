"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platformApi";
import { getErrorDetail } from "@/lib/apiErrors";
import { LoadingState } from "@/components/ui/LoadingSpinner"

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["platform", "company", id],
    queryFn: async () => {
      const res = await platformApi.get(`/companies/${id}/`, {
        params: { period: "30d" },
      });
      return res.data as {
        company: { name: string; billing_status: string };
        counts: { drivers: number; vehicles: number; trips: number };
        finance_summary: {
          revenue_total: number;
          expenses_total: number;
          profit_total: number;
        };
        recent_trips: Array<{ trip_number: string; status: string }>;
      };
    },
    enabled: !!id,
  });

  return (
    <div className="space-y-6">
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <p className="text-rose-600">{getErrorDetail(error)}</p>
      ) : data ? (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Billing: {data.company.billing_status} · {data.counts.drivers} drivers ·{" "}
            {data.counts.vehicles} vehicles · {data.counts.trips} trips
          </p>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="ff-card">
              <p className="text-sm ff-muted">Revenue (30d)</p>
              <p className="text-xl font-semibold ff-heading">
                ${data.finance_summary.revenue_total.toLocaleString()}
              </p>
            </div>
            <div className="ff-card">
              <p className="text-sm ff-muted">Expenses (30d)</p>
              <p className="text-xl font-semibold ff-heading">
                ${data.finance_summary.expenses_total.toLocaleString()}
              </p>
            </div>
            <div className="ff-card">
              <p className="text-sm ff-muted">Profit (30d)</p>
              <p className="text-xl font-semibold ff-heading">
                ${data.finance_summary.profit_total.toLocaleString()}
              </p>
            </div>
          </section>
          <section className="ff-card">
            <h2 className="font-semibold ff-heading">Recent trips (read-only)</h2>
            <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {data.recent_trips.map((t) => (
                <li key={t.trip_number} className="flex justify-between py-2">
                  <span>{t.trip_number}</span>
                  <span className="ff-muted">{t.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}

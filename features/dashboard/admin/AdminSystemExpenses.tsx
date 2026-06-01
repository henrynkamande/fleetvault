"use client";

import { useState } from "react";
import {
  usePlatformExpenseMutations,
  usePlatformSystemExpenses,
  type PlatformExpenseInput,
} from "@/hooks/queries/usePlatformSystemExpenses";
import { getErrorDetail } from "@/lib/apiErrors";
import {
  PLATFORM_EXPENSE_CATEGORIES,
  type PlatformSystemExpense,
} from "@/types/platform";

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="ff-card">
      <p className="text-sm ff-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold ff-heading">{value}</p>
    </article>
  );
}

function money(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function categoryLabel(cat: string) {
  return cat
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

const emptyForm: PlatformExpenseInput = {
  name: "",
  description: "",
  category: "OTHER",
  amount: "",
  recorded_at: new Date().toISOString().slice(0, 10),
};

export default function AdminSystemExpenses() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformSystemExpense | null>(null);
  const [form, setForm] = useState<PlatformExpenseInput>(emptyForm);

  const { data, isLoading, isError, error } = usePlatformSystemExpenses({
    page,
    search: search || undefined,
    category: category || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });
  const { create, update, remove } = usePlatformExpenseMutations();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (row: PlatformSystemExpense) => {
    setEditing(row);
    setForm({
      name: row.name,
      description: row.description,
      category: row.category,
      amount: row.amount,
      recorded_at: row.recorded_at,
    });
    setFormOpen(true);
  };

  const submitForm = async () => {
    if (!form.name || !form.amount) return;
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...form });
    } else {
      await create.mutateAsync(form);
    }
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const summary = data?.summary;

  return (
    <div className="space-y-4">
      {summary ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total expenses" value={money(summary.total_expenses)} />
          <StatCard title="This month" value={money(summary.expenses_this_month)} />
          <StatCard title="This year" value={money(summary.expenses_this_year)} />
          <StatCard title="Avg monthly" value={money(summary.average_monthly_expense)} />
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search expenses…"
          className="ff-dashboard-select min-w-[160px] flex-1"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="ff-dashboard-select"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {PLATFORM_EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="ff-dashboard-select"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="From date"
        />
        <input
          type="date"
          className="ff-dashboard-select"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="To date"
        />
        <button
          type="button"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={openCreate}
        >
          Add expense
        </button>
      </div>

      {isLoading ? (
        <p className="ff-muted">Loading expenses…</p>
      ) : isError ? (
        <p className="text-rose-600">{getErrorDetail(error)}</p>
      ) : (
        <>
          <div className="overflow-x-auto ff-card p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Added by</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {data?.results.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="max-w-xs truncate px-4 py-3 ff-muted">{row.description || "—"}</td>
                    <td className="px-4 py-3">{categoryLabel(row.category)}</td>
                    <td className="px-4 py-3">{money(Number(row.amount))}</td>
                    <td className="px-4 py-3">{row.recorded_at}</td>
                    <td className="px-4 py-3">{row.added_by_name ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        className="mr-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
                        onClick={() => openEdit(row)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-sm font-semibold text-rose-600 dark:text-rose-400"
                        disabled={remove.isPending}
                        onClick={() => {
                          if (confirm("Delete this expense?")) {
                            remove.mutate(row.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/40"
            onClick={() => setFormOpen(false)}
          />
          <div className="relative w-full max-w-md space-y-3 ff-card">
            <h3 className="text-lg font-semibold ff-heading">
              {editing ? "Edit expense" : "Add expense"}
            </h3>
            <input
              className="ff-dashboard-select w-full"
              placeholder="Expense name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <textarea
              className="ff-dashboard-select w-full min-h-[80px]"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <select
              className="ff-dashboard-select w-full"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {PLATFORM_EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              className="ff-dashboard-select w-full"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <input
              type="date"
              className="ff-dashboard-select w-full"
              value={form.recorded_at}
              onChange={(e) => setForm((f) => ({ ...f, recorded_at: e.target.value }))}
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={create.isPending || update.isPending}
                onClick={() => void submitForm()}
              >
                Save
              </button>
              <button
                type="button"
                className="ff-dashboard-select"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

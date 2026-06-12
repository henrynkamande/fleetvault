"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePlatformNotifications } from "@/hooks/queries/usePlatformNotifications";
import { AppRoutesPaths } from "@/route/paths";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0h6z"
      />
    </svg>
  );
}

export default function PlatformNotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { data } = usePlatformNotifications({ page: 1, page_size: 8 });
  const count = data?.count ?? 0;
  const items = data?.results ?? [];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        className="ff-dashboard-icon-btn relative"
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold ff-heading">Notifications</p>
            <p className="text-xs ff-muted">{count} item{count === 1 ? "" : "s"} need attention</p>
          </div>
          <ul className="max-h-80 overflow-y-auto text-sm">
            {items.length === 0 ? (
              <li className="px-4 py-6 ff-muted">You&apos;re all caught up.</li>
            ) : (
              items.map((n) => (
                <li key={n.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800">
                  <Link
                    href={n.href}
                    className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                    onClick={() => setOpen(false)}
                  >
                    <p className="font-medium ff-heading">{n.title}</p>
                    <p className="mt-0.5 text-xs ff-muted line-clamp-2">{n.detail}</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800">
            <Link
              href={AppRoutesPaths.dashboard.admin.notifications}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
              onClick={() => setOpen(false)}
            >
              View all notifications →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

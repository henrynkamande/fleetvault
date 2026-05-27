"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/constants";
import { AppRoutesPaths } from "@/route/paths";

export default function SuperAdminAuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="ff-dashboard-shell flex min-h-screen items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          {APP_NAME} · Super admin
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Fleet owner or driver?{" "}
          <Link
            href={AppRoutesPaths.auth.signin}
            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Use fleet sign-in
          </Link>
        </p>
      </div>
    </div>
  );
}

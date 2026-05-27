"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "react-toastify";
import SuperAdminAuthShell from "@/features/auth/superAdmin/SuperAdminAuthShell";
import { usePlatformRegisterMutation } from "@/hooks/queries/usePlatformAuthMutations";
import { flattenFieldErrors, getErrorDetail, getResponseErrorData } from "@/lib/apiErrors";
import { toastApiError } from "@/lib/toastApiError";
import { AppRoutesPaths } from "@/route/paths";
import type { PlatformRegisterPayload } from "@/types/platformAuth";

const emptyForm: PlatformRegisterPayload = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  password: "",
  confirm_password: "",
};

export default function SuperAdminSignUp() {
  const router = useRouter();
  const registerMutation = usePlatformRegisterMutation();
  const [formData, setFormData] = useState(emptyForm);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    registerMutation.mutate(
      {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        phone_number: formData.phone_number.trim(),
      },
      {
        onSuccess: (data) => {
          toast.success(data.message ?? "Super admin account created.");
          router.push(AppRoutesPaths.dashboard.root);
        },
        onError: (err) => toastApiError(err),
      },
    );
  }

  const fieldErrors = registerMutation.isError
    ? flattenFieldErrors(getResponseErrorData(registerMutation.error))
    : {};
  const generalError =
    registerMutation.isError && Object.keys(fieldErrors).length === 0
      ? getErrorDetail(registerMutation.error)
      : null;

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-900/40";

  return (
    <SuperAdminAuthShell
      title="Super admin sign up"
      subtitle="Create a platform administrator account."
    >
      {generalError ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {generalError}
        </p>
      ) : null}
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            First name
            <input
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Last name
            <input
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
        </div>
        <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Email
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
          />
          {fieldErrors.email ? (
            <span className="text-xs text-red-600">{fieldErrors.email}</span>
          ) : null}
        </label>
        <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Phone
          <input
            name="phone_number"
            required
            value={formData.phone_number}
            onChange={handleChange}
            className={inputClass}
          />
          {fieldErrors.phone_number ? (
            <span className="text-xs text-red-600">{fieldErrors.phone_number}</span>
          ) : null}
        </label>
        <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Password
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className={inputClass}
          />
        </label>
        <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Confirm password
          <input
            type="password"
            name="confirm_password"
            required
            value={formData.confirm_password}
            onChange={handleChange}
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {registerMutation.isPending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have access?{" "}
        <Link
          href={AppRoutesPaths.authSuperAdmin.signin}
          className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Sign in
        </Link>
      </p>
    </SuperAdminAuthShell>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { HiEye, HiEyeSlash } from "react-icons/hi2";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  const passwordInputClass = `${inputClass} pr-11`;
  const toggleBtnClass =
    "absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200";

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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              className={passwordInputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={toggleBtnClass}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <HiEyeSlash className="h-5 w-5" aria-hidden />
              ) : (
                <HiEye className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </label>
        <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Confirm password
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              required
              autoComplete="new-password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={passwordInputClass}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className={toggleBtnClass}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <HiEyeSlash className="h-5 w-5" aria-hidden />
              ) : (
                <HiEye className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
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

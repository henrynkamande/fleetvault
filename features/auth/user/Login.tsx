"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { AppRoutesPaths } from '@/route/paths'
import { HiArrowLeft, HiEye, HiEyeSlash } from 'react-icons/hi2'
import { useLoginMutation } from '@/hooks/queries/useAuthMutations'
import { resolvePostAuthPath } from '@/lib/authNavigation'
import { flattenFieldErrors, getErrorDetail, getResponseErrorData } from '@/lib/apiErrors'
import { toastApiError } from '@/lib/toastApiError'
import type { LoginPayload } from '@/types/auth'
import { APP_NAME } from '@/lib/constants'
import Image from 'next/image'
import fleetImage from '@/assets/6.png'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next')
  const wantsDashboard =
    nextPath === AppRoutesPaths.dashboard.root || (nextPath?.startsWith('/dashboard') ?? false)
  const loginMutation = useLoginMutation()
  const [formData, setFormData] = useState<LoginPayload>({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: LoginPayload = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    }
    loginMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success('Signed in successfully.')
        router.push(resolvePostAuthPath(data))
      },
      onError: (err) => {
        toastApiError(err)
      },
    })
  }

  const fieldErrors = loginMutation.isError ? flattenFieldErrors(getResponseErrorData(loginMutation.error)) : {}

  const generalError =
    loginMutation.isError && Object.keys(fieldErrors).length === 0
      ? getErrorDetail(loginMutation.error)
      : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D2D2D2] to-[#F9F9F9] p-4 md:p-6">
      <div className="mx-auto grid min-h-[90vh] w-full max-w-7xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:grid-cols-[1fr_1.05fr]">
        <aside className="relative hidden md:block">
          <Image src={fleetImage} alt={`${APP_NAME} vehicles`} className="h-full w-full object-cover" fill />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/70 via-[#0f172a]/25 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <p className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide">Welcome back</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">Run daily fleet operations with confidence.</h2>
            <p className="mt-3 text-base text-white/90">Access driver status, trip records, and fleet financial performance in one workspace.</p>
          </div>
        </aside>

        <div className="flex flex-col justify-center p-7 md:p-12">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center  gap-2 rounded-full   text-base font-semibold text-slate-700  transition "
            type="button"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-600">
              <HiArrowLeft className="h-3.5 w-3.5" />
            </span>
            Back
          </button>

          <h1 className="text-4xl font-bold text-[#111827] md:text-5xl">Sign in to {APP_NAME}</h1>
          {wantsDashboard ? (
            <p className="mt-3 rounded-xl border border-[#e7ecf4] bg-[#f7f9fd] px-4 py-3 text-base text-gray-800 md:text-lg">
              Sign in to open your vehicle owner dashboard, or{' '}
              <Link className="font-semibold text-[#2f5aab] underline" href={AppRoutesPaths.auth.signup}>
                create an account
              </Link>{' '}
              to get started.
            </p>
          ) : (
            <p className="mt-3 text-base text-gray-700 md:text-xl">Access trip, driver, and fleet financial operations.</p>
          )}

          {generalError ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {generalError}
            </p>
          ) : null}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <label className="block space-y-1">
              <span className="text-lg font-semibold text-gray-700">Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-lg text-gray-700 outline-none transition focus:border-[#fbbd26] focus:bg-white focus:ring-2 focus:ring-[#fbbd26]/30"
              />
              {fieldErrors.email ? <span className="text-sm text-red-600">{fieldErrors.email}</span> : null}
            </label>
            <label className="block space-y-1">
              <span className="text-lg font-semibold text-gray-700">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-300 bg-[#f9fafb] py-3.5 pl-4 pr-12 text-lg text-gray-700 outline-none transition focus:border-[#fbbd26] focus:bg-white focus:ring-2 focus:ring-[#fbbd26]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbd26]/50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.password ? (
                <span className="text-sm text-red-600">{fieldErrors.password}</span>
              ) : null}
            </label>
            <p className="text-right text-sm">
              <Link
                className="font-semibold text-[#2f5aab] hover:underline"
                href={AppRoutesPaths.auth.forgotPassword}
              >
                Forgot password?
              </Link>
            </p>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-xl bg-[#fbbd26] px-4 py-3.5 text-lg font-semibold text-[#111827] transition hover:bg-[#f4b20a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className="mt-5 text-center text-base text-gray-700">
            Don&apos;t have an account?{' '}
            <Link className="font-semibold text-[#111827] underline" href={AppRoutesPaths.auth.signup}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

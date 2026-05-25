"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { AppRoutesPaths } from '@/route/paths'
const fleetImage = '/fleet-hero.png'
import { HiArrowLeft, HiEye, HiEyeSlash } from 'react-icons/hi2'
import OtpModal from './OtpModal'
import {
  useRegisterFleetOwnerMutation,
  useResendSignupOtpMutation,
  useVerifySignupOtpMutation,
} from '@/hooks/queries/useAuthMutations'
import { toastApiError } from '@/lib/toastApiError'
import type { FleetOwnerRegisterPayload } from '@/types/auth'
import { APP_NAME } from '@/lib/constants'

export default function SignupPage() {
  const router = useRouter()
  const registerMutation = useRegisterFleetOwnerMutation()
  const verifyOtpMutation = useVerifySignupOtpMutation()
  const resendOtpMutation = useResendSignupOtpMutation()
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [formData, setFormData] = useState<FleetOwnerRegisterPayload>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: FleetOwnerRegisterPayload = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      phone_number: formData.phone_number.trim(),
    }
    registerMutation.mutate(payload, {
      onSuccess: (data) => {
        setPendingEmail(data.email)
        setOtpModalOpen(true)
        toast.success(data.message || 'Check your email for a verification code.')
      },
      onError: (err) => {
        toastApiError(err)
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D2D2D2] to-[#F9F9F9] p-4 md:p-6">
      <div className="mx-auto grid min-h-[90vh] w-full max-w-7xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:grid-cols-[1fr_1.05fr]">
        <aside className="relative hidden md:block">
          <img src={fleetImage} alt={`${APP_NAME} vehicles`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/70 via-[#0f172a]/25 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <p className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide">{APP_NAME}</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">Scale your fleet operations with clarity.</h2>
            <p className="mt-3 text-base text-white/90">Driver management, trip records, and profitability insights - all in one platform.</p>
          </div>
        </aside>

        <div className="flex flex-col justify-center  p-7 md:p-12">
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

          <h1 className="text-4xl font-bold text-[#111827] md:text-5xl">Create your {APP_NAME} account</h1>
          <p className="mt-3 text-base text-gray-700 md:text-xl">Set up your workspace in less than two minutes.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-lg font-semibold text-gray-700">First name</span>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                  className="w-full rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-lg text-gray-700 outline-none transition focus:border-[#fbbd26] focus:bg-white focus:ring-2 focus:ring-[#fbbd26]/30"
                />
              </label>
              <label className="space-y-1">
                <span className="text-lg font-semibold text-gray-700">Last name</span>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                  className="w-full rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-lg text-gray-700 outline-none transition focus:border-[#fbbd26] focus:bg-white focus:ring-2 focus:ring-[#fbbd26]/30"
                />
              </label>
            </div>

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
            </label>

            <label className="block space-y-1">
              <span className="text-lg font-semibold text-gray-700">Phone number</span>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                autoComplete="tel"
                placeholder="+254712345678"
                className="w-full rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-lg text-gray-700 outline-none transition focus:border-[#fbbd26] focus:bg-white focus:ring-2 focus:ring-[#fbbd26]/30"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-lg font-semibold text-gray-700">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
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
              </label>
              <label className="space-y-1">
                <span className="text-lg font-semibold text-gray-700">Confirm password</span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-300 bg-[#f9fafb] py-3.5 pl-4 pr-12 text-lg text-gray-700 outline-none transition focus:border-[#fbbd26] focus:bg-white focus:ring-2 focus:ring-[#fbbd26]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbd26]/50"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                  </button>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="mt-2 w-full rounded-xl bg-[#fbbd26] px-4 py-3.5 text-lg font-semibold text-[#111827] transition hover:bg-[#f4b20a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {registerMutation.isPending ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-base text-gray-700">
            Already have an account?{' '}
            <Link className="font-semibold text-[#111827] underline" href={AppRoutesPaths.auth.signin}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <OtpModal
        open={otpModalOpen}
        email={pendingEmail}
        pending={verifyOtpMutation.isPending || resendOtpMutation.isPending}
        onClose={() => setOtpModalOpen(false)}
        onVerify={async (otp) => {
          try {
            await verifyOtpMutation.mutateAsync({ email: pendingEmail, otp })
            toast.success('Email verified. You can sign in now.')
            setOtpModalOpen(false)
            router.replace(AppRoutesPaths.auth.signin)
          } catch (err) {
            toastApiError(err)
          }
        }}
        onResend={async () => {
          try {
            const data = await resendOtpMutation.mutateAsync({ email: pendingEmail })
            toast.success(data.message || 'A new code was sent.')
          } catch (err) {
            toastApiError(err)
          }
        }}
      />
    </div>
  )
}

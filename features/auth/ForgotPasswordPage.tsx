"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, type ClipboardEvent, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { HiArrowLeft, HiEye, HiEyeSlash } from 'react-icons/hi2'
import { AppRoutesPaths } from '@/route/paths'
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyResetCodeMutation,
} from '@/hooks/queries/useAuthMutations'
import { useResendCooldown } from '@/hooks/useResendCooldown'
import { toastApiError } from '@/lib/toastApiError'
import { isPasswordValid, PASSWORD_RULES } from '@/lib/passwordRules'
import { APP_NAME } from '@/lib/constants'

type Step = 'email' | 'code' | 'password'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const forgotMutation = useForgotPasswordMutation()
  const verifyMutation = useVerifyResetCodeMutation()
  const resetMutation = useResetPasswordMutation()
  const { secondsLeft, canResend, startCooldown } = useResendCooldown(60)

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function sendCode(targetEmail: string) {
    const normalized = targetEmail.trim().toLowerCase()
    await forgotMutation.mutateAsync({ email: normalized })
    setEmail(normalized)
    startCooldown(60)
    toast.success('If an account exists, a reset code was sent.')
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await sendCode(email)
      setStep('code')
    } catch (err) {
      toastApiError(err)
    }
  }

  async function handleResend() {
    if (!canResend || !email) return
    try {
      await sendCode(email)
    } catch (err) {
      toastApiError(err)
    }
  }

  async function handleCodeSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await verifyMutation.mutateAsync({ email, code: code.trim() })
      setStep('password')
      toast.success('Code verified. Choose a new password.')
    } catch (err) {
      toastApiError(err)
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isPasswordValid(newPassword)) {
      toast.error('Password does not meet all requirements.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    try {
      await resetMutation.mutateAsync({
        email,
        code: code.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      toast.success('Password reset. You can sign in now.')
      router.replace(AppRoutesPaths.auth.signin)
    } catch (err) {
      toastApiError(err)
    }
  }

  const pending = forgotMutation.isPending || verifyMutation.isPending || resetMutation.isPending

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D2D2D2] to-[#F9F9F9] p-4 md:p-6">
      <div className="mx-auto flex min-h-[90vh] w-full max-w-lg flex-col justify-center rounded-3xl border border-gray-200 bg-white p-7 shadow-lg md:p-10">
        <button
          type="button"
          onClick={() => (step === 'email' ? router.back() : setStep(step === 'password' ? 'code' : 'email'))}
          className="mb-6 inline-flex items-center gap-2 text-base font-semibold text-slate-700"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-600">
            <HiArrowLeft className="h-3.5 w-3.5" />
          </span>
          Back
        </button>

        <h1 className="text-3xl font-bold text-[#111827] md:text-4xl">Reset password</h1>
        <p className="mt-2 text-gray-600">
          {step === 'email' && `Enter your ${APP_NAME} account email.`}
          {step === 'code' && 'Enter the 6-digit code from your email.'}
          {step === 'password' && 'Create a new password for your account.'}
        </p>

        {step === 'email' && (
          <form className="mt-8 space-y-5" onSubmit={handleEmailSubmit} noValidate>
            <label className="block space-y-1">
              <span className="text-lg font-semibold text-gray-700">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-lg outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-[#fbbd26] py-3.5 font-semibold text-[#111827] disabled:opacity-60"
            >
              {pending ? 'Sending…' : 'Send reset code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form className="mt-8 space-y-5" onSubmit={handleCodeSubmit} noValidate>
            <p className="text-sm text-gray-600">{email}</p>
            <label className="block space-y-1">
              <span className="text-lg font-semibold text-gray-700">Reset code</span>
              <input
                required
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onPaste={(e: ClipboardEvent<HTMLInputElement>) => {
                  e.preventDefault()
                  setCode(e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6))
                }}
                className="w-full rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-center font-mono text-2xl tracking-[0.35em] outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              />
            </label>
            <button
              type="submit"
              disabled={pending || code.length !== 6}
              className="w-full rounded-xl bg-[#fbbd26] py-3.5 font-semibold text-[#111827] disabled:opacity-60"
            >
              {pending ? 'Verifying…' : 'Continue'}
            </button>
            <p className="text-center text-sm text-gray-600">
              <button
                type="button"
                disabled={!canResend || pending}
                onClick={handleResend}
                className="font-semibold text-[#2f5aab] disabled:text-gray-400"
              >
                {canResend ? 'Resend code' : `Resend in ${secondsLeft}s`}
              </button>
            </p>
          </form>
        )}

        {step === 'password' && (
          <form className="mt-8 space-y-5" onSubmit={handlePasswordSubmit} noValidate>
            <ul className="space-y-1 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              {PASSWORD_RULES.map((rule) => (
                <li
                  key={rule.id}
                  className={rule.test(newPassword) ? 'text-emerald-700' : ''}
                >
                  {rule.test(newPassword) ? '✓' : '○'} {rule.label}
                </li>
              ))}
            </ul>
            <label className="block space-y-1">
              <span className="text-lg font-semibold text-gray-700">New password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-300 bg-[#f9fafb] py-3.5 pl-4 pr-12 text-lg outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-gray-500"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                </button>
              </div>
            </label>
            <label className="block space-y-1">
              <span className="text-lg font-semibold text-gray-700">Confirm password</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-lg outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-[#fbbd26] py-3.5 font-semibold text-[#111827] disabled:opacity-60"
            >
              {pending ? 'Saving…' : 'Reset password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-base text-gray-700">
          <Link className="font-semibold underline" href={AppRoutesPaths.auth.signin}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

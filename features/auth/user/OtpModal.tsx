"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent } from 'react'
import { HiOutlineXMark } from 'react-icons/hi2'
import { useResendCooldown } from '@/hooks/useResendCooldown'

type OtpModalProps = {
  open: boolean
  email: string
  title?: string
  description?: string
  verifyLabel?: string
  pending?: boolean
  onClose: () => void
  onVerify: (otp: string) => void | Promise<void>
  onResend: () => void | Promise<void>
}

function normalizeOtp(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6)
}

export default function OtpModal({
  open,
  email,
  title = 'Verify your email',
  description = 'Enter the 6-digit code we sent to your inbox.',
  verifyLabel = 'Verify',
  pending = false,
  onClose,
  onVerify,
  onResend,
}: OtpModalProps) {
  const [code, setCode] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { secondsLeft, canResend, startCooldown } = useResendCooldown(60)

  useEffect(() => {
    if (!open) return undefined
    const timer = window.setTimeout(() => {
      setCode('')
      startCooldown(60)
      inputRef.current?.focus()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [open, startCooldown])

  if (!open) return null

  const otp = normalizeOtp(code)

  function applyCode(raw: string) {
    setCode(normalizeOtp(raw))
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    applyCode(pasted)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) return
    await onVerify(otp)
  }

  async function handleResend() {
    if (!canResend) return
    await onResend()
    startCooldown(60)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close"
        >
          <HiOutlineXMark className="h-5 w-5" />
        </button>

        <h2 id="otp-modal-title" className="text-xl font-bold text-[#111827]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <p className="mt-1 text-sm font-medium text-[#111827]">{email}</p>

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="block text-sm font-medium text-gray-700" htmlFor="signup-otp-input">
            Verification code
          </label>
          <input
            id="signup-otp-input"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => applyCode(e.target.value)}
            onPaste={handlePaste}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3.5 text-center font-mono text-2xl tracking-[0.35em] outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30"
          />
          <p className="mt-2 text-center text-xs text-gray-500">You can type or paste all 6 digits at once.</p>

          <button
            type="submit"
            disabled={pending || otp.length !== 6}
            className="mt-6 w-full rounded-xl bg-[#fbbd26] py-3 font-semibold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Verifying…' : verifyLabel}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Didn&apos;t get the code?{' '}
          <button
            type="button"
            disabled={!canResend || pending}
            onClick={handleResend}
            className="font-semibold text-[#2f5aab] disabled:cursor-not-allowed disabled:text-gray-400"
          >
            {canResend ? 'Resend OTP' : `Resend in ${secondsLeft}s`}
          </button>
        </p>
        <p className="mt-2 text-center text-xs text-gray-500">Codes expire after 30 minutes.</p>
      </div>
    </div>
  )
}

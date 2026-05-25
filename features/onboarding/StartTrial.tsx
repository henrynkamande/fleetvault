"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, type ReactNode } from 'react'
import { FiArrowRight, FiCheck, FiCreditCard, FiShield } from 'react-icons/fi'
import { getAccessToken } from '@/lib/tokenStorage'
import { CHECKOUT_SESSION_STORAGE_KEY } from '@/lib/billingApi'
import { useBillingConfig, useBillingStatus, useStartTrialCheckout } from '@/hooks/queries/useBilling'
import { AppRoutesPaths } from '@/route/paths'
import { APP_NAME } from '@/lib/constants'

const BENEFITS = [
  'Full platform access during your trial',
  'Card collected securely by Stripe — not stored on our servers',
  'Update or cancel anytime from billing settings',
] as const

export default function StartTrial() {
  const router = useRouter()
  const hasToken = !!getAccessToken()
  const configQuery = useBillingConfig()
  const statusQuery = useBillingStatus()
  const startCheckout = useStartTrialCheckout()

  useEffect(() => {
    if (!hasToken) {
      router.replace(AppRoutesPaths.auth.signin)
    }
  }, [router, hasToken])

  const pricing = configQuery.data?.pricing
  const trialDays = pricing?.trial_days ?? 7
  const perVehicle = pricing?.per_vehicle_label ?? '$4 USD per vehicle / month'
  const unitDisplay = pricing?.unit_amount_display ?? '$4.00'
  const pendingSessionId =
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(CHECKOUT_SESSION_STORAGE_KEY)
      : null

  useEffect(() => {
    if (pendingSessionId && !statusQuery.data?.has_access) {
      router.replace(
        `${AppRoutesPaths.onboarding.billingSuccess}?session_id=${encodeURIComponent(pendingSessionId)}`,
      )
    }
  }, [router, pendingSessionId, statusQuery.data?.has_access])

  if (!hasToken) {
    return null
  }

  if (statusQuery.data?.has_access) {
    return (
      <OnboardingShell>
        <Card className="text-center">
          <h1 className="text-2xl font-bold text-[#111827] md:text-3xl">You&apos;re all set</h1>
          <p className="mt-2 text-gray-600">Your trial or subscription is active.</p>
          <Link
            href={AppRoutesPaths.dashboard.root}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#2f5aab] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#2f5aab]/25 transition hover:bg-[#264a94]"
          >
            Go to dashboard <FiArrowRight />
          </Link>
        </Card>
      </OnboardingShell>
    )
  }

  const resumeHref = pendingSessionId
    ? `${AppRoutesPaths.onboarding.billingSuccess}?session_id=${encodeURIComponent(pendingSessionId)}`
    : AppRoutesPaths.onboarding.billingSuccess

  return (
    <OnboardingShell>
      <Card>
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#2f5aab]">
          {trialDays}-day free trial
        </p>
        <h1 className="mt-3 text-center font-title text-3xl font-bold leading-tight text-[#111827] md:text-4xl">
          Start your trial
        </h1>
        <p className="mx-auto mt-4 max-w-md text-center text-base leading-relaxed text-gray-600">
          Add a payment method to unlock {APP_NAME}. You won&apos;t be charged until your {trialDays}-day trial ends.
        </p>

        <PricingHighlight trialDays={trialDays} unitDisplay={unitDisplay} perVehicle={perVehicle} />

        <ul className="mt-8 space-y-4">
          {BENEFITS.map((text) => (
            <li key={text} className="flex items-start gap-3 text-sm text-gray-700 md:text-base">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fbbd26]/20 text-[#b8860b]">
                <FiCheck className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-gray-100 pt-6 text-xs font-medium uppercase tracking-wide text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <FiShield className="h-4 w-4 text-[#2f5aab]" /> Encrypted checkout
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiCreditCard className="h-4 w-4 text-[#2f5aab]" /> Powered by Stripe
          </span>
        </div>

        <button
          type="button"
          disabled={startCheckout.isPending || !configQuery.data?.stripe_configured}
          onClick={() => startCheckout.mutate()}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#fbbd26] px-8 py-4 text-base font-bold text-[#111827] shadow-md shadow-[#fbbd26]/30 transition hover:bg-[#f4b20a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {startCheckout.isPending ? 'Opening secure checkout…' : 'Continue to secure checkout'}
          {!startCheckout.isPending && <FiArrowRight className="h-5 w-5" />}
        </button>

        {!configQuery.data?.stripe_configured && (
          <p className="mt-4 text-center text-sm text-amber-800" role="alert">
            Billing is not configured on the server yet. Contact support or try again later.
          </p>
        )}
        {startCheckout.isError && (
          <p className="mt-4 text-center text-sm text-red-600" role="alert">
            {startCheckout.error.message}
          </p>
        )}

        <p className="mt-6 text-center text-xs leading-relaxed text-gray-500">
          By continuing, you agree to recurring billing at {perVehicle} after the trial, based on vehicles in your
          fleet.
        </p>
      </Card>

      <FooterLinks resumeHref={resumeHref} />
    </OnboardingShell>
  )
}

function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D2D2D2] to-[#F9F9F9] px-4 py-10 md:py-14">
      <div className="mx-auto w-full max-w-xl">
        <p className="mb-6 text-center text-sm font-semibold text-slate-600">
          <Link href={AppRoutesPaths.landing} className="text-[#2f5aab] hover:underline">
            {APP_NAME}
          </Link>
        </p>
        {children}
      </div>
    </div>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:p-10 ${className}`}
    >
      {children}
    </div>
  )
}

function PricingHighlight({
  trialDays,
  unitDisplay,
  perVehicle,
}: {
  trialDays: number
  unitDisplay: string
  perVehicle: string
}) {
  return (
    <div className="mt-8 rounded-2xl border border-[#2f5aab]/15 bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600">After trial</p>
          <p className="mt-1 text-3xl font-bold text-[#111827]">
            {unitDisplay}
            <span className="text-lg font-semibold text-gray-500"> / vehicle</span>
          </p>
          <p className="mt-1 text-sm font-medium text-[#2f5aab]">{trialDays} days free first</p>
        </div>
        <p className="max-w-[10rem] text-right text-xs text-gray-500">{perVehicle}</p>
      </div>
    </div>
  )
}

function FooterLinks({ resumeHref }: { resumeHref: string }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2 text-center">
      <Link href={resumeHref} className="text-sm font-medium text-[#2f5aab] hover:underline">
        Already completed checkout?
      </Link>
      <Link href={AppRoutesPaths.auth.signin} className="text-sm text-gray-500 hover:text-gray-700">
        Sign out
      </Link>
    </div>
  )
}

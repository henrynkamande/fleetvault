"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { useQueryClient } from '@tanstack/react-query'
import { AppRoutesPaths } from '@/route/paths'
import { APP_NAME } from '@/lib/constants'
import { CHECKOUT_SESSION_STORAGE_KEY } from '@/lib/billingApi'
import { useBillingStatus, useConfirmCheckout } from '@/hooks/queries/useBilling'

type Phase = 'confirming' | 'ready' | 'error'

export default function BillingSuccess() {
  const params = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const confirm = useConfirmCheckout()
  const statusQuery = useBillingStatus()
  const attempted = useRef(false)

  const sessionId =
    params.get('session_id') ?? sessionStorage.getItem(CHECKOUT_SESSION_STORAGE_KEY) ?? ''

  useEffect(() => {
    if (!sessionId || attempted.current) return
    attempted.current = true
    confirm.mutate(sessionId, {
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: ['billing', 'status'] })
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per sessionId on mount
  }, [sessionId])

  const phase: Phase = (() => {
    if (confirm.isError) return 'error'
    if (statusQuery.data?.has_access || confirm.data?.has_access) return 'ready'
    if (confirm.isPending || statusQuery.isFetching) return 'confirming'
    if (confirm.isSuccess && !confirm.data?.has_access) return 'error'
    return 'confirming'
  })()

  useEffect(() => {
    if (phase !== 'ready') return
    const t = window.setTimeout(() => {
      router.replace(AppRoutesPaths.dashboard.root)
    }, 2200)
    return () => window.clearTimeout(t)
  }, [phase, router])

  return (
    <Shell>
      <Card>
        {phase === 'confirming' && (
          <>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#2f5aab]/20 border-t-[#2f5aab]" />
            <h1 className="mt-6 text-2xl font-bold text-[#111827]">Activating your trial</h1>
            <p className="mt-2 text-gray-600">Confirming your payment method with Stripe…</p>
          </>
        )}

        {phase === 'ready' && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <FiCheck className="h-8 w-8" strokeWidth={2.5} />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-[#111827]">You&apos;re in</h1>
            <p className="mt-2 text-gray-600">
              Your free trial is active. Taking you to the dashboard…
            </p>
            <Link
              href={AppRoutesPaths.dashboard.root}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#2f5aab] px-8 py-3.5 font-semibold text-white transition hover:bg-[#264a94]"
            >
              Continue now <FiArrowRight />
            </Link>
          </>
        )}

        {phase === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-[#111827]">Almost there</h1>
            <p className="mt-2 text-gray-600">
              {confirm.error?.message ??
                'We could not verify checkout yet. If you were charged, wait a moment and try again.'}
            </p>
            {sessionId ? (
              <button
                type="button"
                onClick={() => {
                  attempted.current = false
                  confirm.reset()
                  confirm.mutate(sessionId)
                }}
                className="mt-6 rounded-full bg-[#2f5aab] px-6 py-3 text-sm font-semibold text-white"
              >
                Retry activation
              </button>
            ) : null}
            <Link
              href={AppRoutesPaths.onboarding.startTrial}
              className="mt-4 block text-sm font-medium text-[#2f5aab] hover:underline"
            >
              Back to trial setup
            </Link>
          </>
        )}
      </Card>
    </Shell>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D2D2D2] to-[#F9F9F9] px-4 py-10 md:py-14">
      <ShellInner>{children}</ShellInner>
    </div>
  )
}

function ShellInner({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg">
      <p className="mb-6 text-center text-sm font-semibold text-slate-600">
        <Link href={AppRoutesPaths.landing} className="text-[#2f5aab] hover:underline">
          {APP_NAME}
        </Link>
      </p>
      {children}
    </div>
  )
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:p-10">
      {children}
    </div>
  )
}

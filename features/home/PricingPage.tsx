"use client";

import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import MarketingPageHero from '@/components/marketing/MarketingPageHero'
import PricingPlans from './PricingPlans'
import { useBillingConfig } from '@/hooks/queries/useBilling'
import { AppRoutesPaths } from '@/route/paths'
import { APP_NAME } from '@/lib/constants'
import { MARKETING_CONTAINER } from '@/lib/marketingLayout'

const faqItems = [
  {
    q: 'How does the free trial work?',
    a: 'You add a payment method at signup to unlock the product. You are not charged until the trial period ends. Cancel anytime before then to avoid charges.',
  },
  {
    q: 'What am I billed for?',
    a: 'Billing is per active vehicle on your fleet, per month. Drivers are included on your plan — you do not pay per driver seat.',
  },
  {
    q: 'Can I add or remove vehicles later?',
    a: 'Yes. As you add vehicles in the dashboard, subscription quantity scales automatically with your fleet size.',
  },
  {
    q: 'Is pricing in USD?',
    a: 'Yes. Display amounts are shown in USD; underlying configuration may reference regional equivalents for your market.',
  },
  {
    q: 'What is included in the plan?',
    a: 'Full access to trips, vehicles, drivers, income and expense tracking, P&L reports, and settings — one product, no tier maze.',
  },
]

const includedFeatures = [
  'Unlimited drivers on your fleet plan',
  'GPS-free trip logging with odometer records',
  'Vehicle and driver profiles',
  'Income, expenses, and P&L reporting',
  'Company settings and team onboarding',
  'Stripe-powered billing and trial management',
]

export default function PricingPage() {
  const { data } = useBillingConfig()
  const pricing = data?.pricing
  const trialDays = pricing?.trial_days ?? 7

  return (
    <>
      <MarketingPageHero
        centered
        eyebrow="Pricing"
        title="Simple, vehicle-based pricing"
        description={`Pay for the vehicles you manage. Start with a ${trialDays}-day free trial on ${APP_NAME} — transparent billing that grows with your fleet.`}
      />

      <section className="pb-8">
        <div className={MARKETING_CONTAINER}>
          <PricingPlans variant="detailed" />
        </div>
      </section>

      <section className="bg-white py-14">
        <div className={MARKETING_CONTAINER}>
          <h2 className="text-center font-title text-2xl font-bold text-[#111827] md:text-3xl">Everything in one plan</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-gray-600">
            No feature gates between “starter” and “enterprise” — you get the full operating system for your fleet.
          </p>
          <ul className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
            {includedFeatures.map((feature) => (
              <li key={feature} className="flex gap-2 rounded-xl border border-gray-100 bg-[#F9F9F9] px-4 py-3 text-sm text-gray-800">
                <span className="shrink-0 text-[#fbbd26]">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14">
        <div className={MARKETING_CONTAINER}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-title text-2xl font-bold text-[#111827] md:text-3xl">What&apos;s broken in fleet operations</h2>
            <p className="mt-2 text-gray-600">
              Most systems force teams into disconnected tools, delayed decisions, and invisible costs. {APP_NAME} pricing
              matches a single connected workflow.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[28px] bg-[#f3f3f3] p-6 shadow-[16px_16px_30px_rgba(0,0,0,0.08),-12px_-12px_30px_#ffffff] md:p-8">
              <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Pricing pressure
              </p>
              <h3 className="mt-3 text-3xl font-semibold leading-tight text-[#111827] md:text-4xl">
                Margin leakage is often hidden.
              </h3>
              <p className="mt-2 max-w-lg text-sm text-gray-600 md:text-base">
                Manual reconciliation and fragmented records make it hard to see where profitability drops per trip,
                vehicle, and driver.
              </p>
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-end gap-2">
                  <div className="h-12 w-8 rounded-t-md bg-gray-200" />
                  <div className="h-16 w-8 rounded-t-md bg-gray-300" />
                  <div className="h-10 w-8 rounded-t-md bg-gray-300" />
                  <div className="h-20 w-8 rounded-t-md bg-[#fbbd26]" />
                  <div className="h-24 w-8 rounded-t-md bg-[#2f5aab]" />
                </div>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Cost variance across weekly trips
                </p>
              </div>
            </article>

            <div className="grid gap-4">
              <article className="rounded-[24px] bg-[#f3f3f3] p-5 shadow-[14px_14px_26px_rgba(0,0,0,0.07),-10px_-10px_22px_#ffffff]">
                <h3 className="text-2xl font-semibold text-[#111827]">Disconnected workflows</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Dispatch, trip logs, and finances live in separate systems, causing slow handoffs and duplicated effort.
                </p>
              </article>
              <article className="rounded-[24px] bg-[#f3f3f3] p-5 shadow-[14px_14px_26px_rgba(0,0,0,0.07),-10px_-10px_22px_#ffffff]">
                <h3 className="text-2xl font-semibold text-[#111827]">Missed opportunities</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Without a single operational view, fleet owners miss route-level optimization and revenue growth signals.
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#2f5aab]">
                  {APP_NAME} unifies this into one operating layer.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className={MARKETING_CONTAINER}>
          <h2 className="text-center font-title text-2xl font-bold text-[#111827]">Frequently asked questions</h2>
          <dl className="mx-auto mt-10 max-w-3xl divide-y divide-gray-200">
            {faqItems.map((item) => (
              <div key={item.q} className="py-5">
                <dt className="text-base font-semibold text-[#111827]">{item.q}</dt>
                <dd className="mt-2 text-sm text-gray-600">{item.a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-12 flex justify-center">
            <Link
              href={AppRoutesPaths.auth.signup}
              className="inline-flex items-center gap-2 rounded-full bg-[#2f5aab] px-8 py-3 text-base font-semibold text-white transition hover:bg-[#254a93]"
            >
              Start free trial <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

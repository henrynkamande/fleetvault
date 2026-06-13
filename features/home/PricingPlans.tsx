"use client";

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi'
import { useBillingConfig } from '@/hooks/queries/useBilling'
import { AppRoutesPaths } from '@/route/paths'
import { APP_NAME } from '@/lib/constants'

type PricingPlansProps = {
  variant?: 'compact' | 'detailed'
}

export default function PricingPlans({ variant = 'compact' }: PricingPlansProps) {
  const { data } = useBillingConfig()
  const pricing = data?.pricing
  const trialDays = pricing?.trial_days ?? 7
  const unitLabel = pricing?.unit_amount_display ?? '$10.00'
  const perVehicle = pricing?.per_vehicle_label ?? '$10 USD per vehicle / month'
  const isDetailed = variant === 'detailed'

  const detailedExtras = [
    'Payment method required at signup; no charge until trial ends',
    'Cancel before trial ends to avoid billing',
    'Quantity updates automatically when you add or remove vehicles',
    'Secure checkout and subscription management via Stripe',
  ]

  return (
    <div className={`mx-auto max-w-4xl ${isDetailed ? '' : 'mt-12'}`}>
      <div className="rounded-[28px] border border-[#e7ecf4] bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-10">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-[#2f5aab]">Simple pricing</p>
        <h3 className="mt-2 text-center text-3xl font-bold text-[#111827] md:text-4xl">
          {unitLabel} <span className="text-lg font-semibold text-gray-500">per vehicle / month</span>
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
          {perVehicle}. Start with a {trialDays}-day free trial — add a payment method to unlock {APP_NAME}. No charge until the trial ends.
        </p>
        <p className="mt-2 text-center text-xs text-gray-500">{pricing?.note ?? 'USD pricing per vehicle after the free trial.'}</p>

        <ul className={`mx-auto mt-8 gap-2 text-sm text-gray-700 ${isDetailed ? 'grid max-w-2xl sm:grid-cols-2' : 'grid max-w-md'}`}>
          <li className="flex gap-2">
            <span className="text-[#fbbd26]">✓</span> Unlimited drivers on your fleet plan
          </li>
          <li className="flex gap-2">
            <span className="text-[#fbbd26]">✓</span> Trips, vehicles, and P&amp;L in one place
          </li>
          <li className="flex gap-2">
            <span className="text-[#fbbd26]">✓</span> Scale billing automatically as you add vehicles
          </li>
          {isDetailed &&
            detailedExtras.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-[#fbbd26]">✓</span> {line}
              </li>
            ))}
        </ul>

        {isDetailed ? (
          <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f9fd] text-xs font-semibold uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Included</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 font-medium text-[#111827]">Drivers</td>
                  <td className="px-4 py-3 text-gray-600">Unlimited on your plan</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-[#111827]">Vehicles</td>
                  <td className="px-4 py-3 text-gray-600">Billed per vehicle / month</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-[#111827]">Trial</td>
                  <td className="px-4 py-3 text-gray-600">{trialDays} days — card on file, no charge until end</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-[#111827]">Product access</td>
                  <td className="px-4 py-3 text-gray-600">Full dashboard during trial and subscription</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-8 flex justify-center">
          <Link
            href={AppRoutesPaths.auth.signup}
            className="inline-flex items-center gap-2 rounded-full bg-[#fbbd26] px-8 py-3 text-base font-semibold text-[#111827] transition hover:bg-[#f4b20a]"
          >
            Start free trial <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  )
}

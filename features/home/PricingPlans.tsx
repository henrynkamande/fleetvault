"use client";

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi'
import { useBillingConfig } from '@/hooks/queries/useBilling'
import { AppRoutesPaths } from '@/route/paths'
import { APP_NAME } from '@/lib/constants'

export default function PricingPlans() {
  const { data } = useBillingConfig()
  const pricing = data?.pricing
  const trialDays = pricing?.trial_days ?? 7
  const unitLabel = pricing?.unit_amount_display ?? '$4.00'
  const perVehicle = pricing?.per_vehicle_label ?? '$4 USD per vehicle / month'

  return (
    <div className="mx-auto mt-12 max-w-4xl">
      <div className="rounded-[28px] border border-[#e7ecf4] bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-10">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-[#2f5aab]">Simple pricing</p>
        <h3 className="mt-2 text-center text-3xl font-bold text-[#111827] md:text-4xl">
          {unitLabel} <span className="text-lg font-semibold text-gray-500">per vehicle / month</span>
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
          {perVehicle}. Start with a {trialDays}-day free trial — add a payment method to unlock {APP_NAME}. No charge until the trial ends.
        </p>
        <p className="mt-2 text-center text-xs text-gray-500">{pricing?.note ?? 'USD pricing (converted from KES 500 per vehicle).'}</p>

        <ul className="mx-auto mt-8 grid max-w-md gap-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-[#fbbd26]">✓</span> Unlimited drivers on your fleet plan
          </li>
          <li className="flex gap-2">
            <span className="text-[#fbbd26]">✓</span> Trips, vehicles, and P&amp;L in one place
          </li>
          <li className="flex gap-2">
            <span className="text-[#fbbd26]">✓</span> Scale billing automatically as you add vehicles
          </li>
        </ul>

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

import { APP_NAME } from '@/lib/constants'
import PricingPlans from './PricingPlans'

export default function Price() {
  return (
    <section id="pricing" className="bg-[#F9F9F9] py-16">
      <div className="mx-auto w-[92vw] max-w-[1280px]">
        <h2 className="font-title text-center text-[clamp(2rem,4.8vw,4.4rem)] font-bold leading-[1] text-[#111827]">
          Pricing built for growing fleets
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-gray-700">
          Pay only for the vehicles you manage. Start with a free trial — payment method required, no charge until trial ends.
        </p>

        <PricingPlans />

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <h3 className="text-xl font-semibold text-[#111827]">What&apos;s broken in fleet operations</h3>
          <p className="mt-2 text-gray-600">
            Most systems force teams into disconnected tools, delayed decisions, and invisible costs.
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
              Manual reconciliation and fragmented records make it hard to see where profitability drops per trip, vehicle, and driver.
            </p>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-end gap-2">
                <div className="h-12 w-8 rounded-t-md bg-gray-200" />
                <div className="h-16 w-8 rounded-t-md bg-gray-300" />
                <div className="h-10 w-8 rounded-t-md bg-gray-300" />
                <div className="h-20 w-8 rounded-t-md bg-[#fbbd26]" />
                <div className="h-24 w-8 rounded-t-md bg-[#2f5aab]" />
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">Cost variance across weekly trips</p>
            </div>
          </article>

          <div className="grid gap-4">
            <article className="rounded-[24px] bg-[#f3f3f3] p-5 shadow-[14px_14px_26px_rgba(0,0,0,0.07),-10px_-10px_22px_#ffffff]">
              <h3 className="text-2xl font-semibold text-[#111827]">Disconnected workflows</h3>
              <p className="mt-2 text-sm text-gray-600">
                Dispatch, trip logs, and finances live in separate systems, causing slow handoffs and duplicated effort.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="rounded-full bg-white px-3 py-1">Dispatch</span>
                <span className="rounded-full bg-white px-3 py-1">Trips</span>
                <span className="rounded-full bg-white px-3 py-1">Finance</span>
              </div>
            </article>

            <article className="rounded-[24px] bg-[#f3f3f3] p-5 shadow-[14px_14px_26px_rgba(0,0,0,0.07),-10px_-10px_22px_#ffffff]">
              <h3 className="text-2xl font-semibold text-[#111827]">Missed opportunities</h3>
              <p className="mt-2 text-sm text-gray-600">
                Without a single operational view, fleet owners miss route-level optimization and revenue growth signals.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#2f5aab]">{APP_NAME} unifies this into one operating layer.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

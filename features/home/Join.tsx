"use client";

import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi'
import MarketingSection from '@/components/marketing/MarketingSection'
import { APP_NAME } from '@/lib/constants'

export default function Join() {
  const router = useRouter()

  return (
    <MarketingSection id="get-started" className="bg-white py-[clamp(3rem,6vw,8rem)]">
      <div className="rounded-[2.2rem] border border-[#e7ecf4] bg-gradient-to-b from-[#f7f9fd] to-[#f2f5fb] px-[clamp(1.4rem,3.6vw,3.4rem)] py-[clamp(2.2rem,5vw,4rem)] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-[#d8e1ef] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2f5aab]">
            Join {APP_NAME}
          </p>
          <h2 className="mt-4 font-title text-[clamp(2rem,3.8vw,4rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#0f172a]">
            Build a more profitable fleet, without surveillance-heavy tools.
          </h2>
          <p className="mx-auto mt-4 max-w-[720px] font-title text-[clamp(1rem,1.2vw,1.2rem)] leading-[1.55] text-[#334155]">
            Centralize trips, drivers, and margins in one workflow your team can trust. {APP_NAME} is designed for
            real operations, fast decisions, and privacy-first execution.
          </p>
        </div>

        <div className="mx-auto mt-7 grid max-w-[760px] grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#d8e1ef] bg-white p-4 text-left">
            <p className="text-sm font-semibold text-[#0f172a]">Trip Intelligence</p>
            <p className="mt-1 text-xs text-[#475569]">Track routes, costs, and outcomes.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e1ef] bg-white p-4 text-left">
            <p className="text-sm font-semibold text-[#0f172a]">Driver Operations</p>
            <p className="mt-1 text-xs text-[#475569]">Manage assignments and compliance.</p>
          </div>
          <div className="rounded-2xl border border-[#d8e1ef] bg-white p-4 text-left">
            <p className="text-sm font-semibold text-[#0f172a]">Profit Visibility</p>
            <p className="mt-1 text-xs text-[#475569]">See margin by vehicle and period.</p>
          </div>
        </div>

        <div className="mb-[clamp(1.2rem,2.4vw,2rem)] mt-[clamp(1.8rem,3vw,2.6rem)] flex flex-col items-center justify-center gap-[clamp(0.8rem,2vw,1rem)] sm:flex-row">
          <button
            onClick={() => router.push('/auth/signup')}
            className="order-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#2f5aab] px-[clamp(1.2rem,1.8vw,2rem)] py-[clamp(0.8rem,1vw,1rem)] text-[clamp(0.9rem,1.05vw,1rem)] font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:bg-[#254a93] sm:order-2 sm:w-auto"
            type="button"
          >
            Start free trial
            <FiArrowRight className="text-[clamp(0.9rem,1.05vw,1rem)]" />
          </button>
          <button
            onClick={() => router.push('/auth/signup')}
            className="order-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#fbbd26] px-[clamp(1.2rem,1.8vw,2rem)] py-[clamp(0.8rem,1vw,1rem)] text-[clamp(0.9rem,1.05vw,1rem)] font-semibold text-[#111827] transition-all duration-300 hover:scale-[1.01] hover:bg-[#f4b20a] sm:order-1 sm:w-auto"
            type="button"
          >
            Free trial on {APP_NAME}
            <FiArrowRight className="text-[clamp(0.9rem,1.05vw,1rem)]" />
          </button>
        </div>

        <p className="mt-[clamp(1rem,2vw,1.5rem)] text-center text-[clamp(0.9rem,1.05vw,1rem)] font-medium text-[#475569]">
          Trusted by growing transport teams that need control, clarity, and privacy by design.
        </p>
      </div>
    </MarketingSection>
  )
}

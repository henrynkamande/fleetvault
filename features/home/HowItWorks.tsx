import Image from 'next/image'
import {
  HiOutlineChartBarSquare,
  HiOutlineClipboardDocumentList,
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
  HiOutlineCamera,
} from 'react-icons/hi2'
import MarketingSection from '@/components/marketing/MarketingSection'
import { APP_NAME } from '@/lib/constants'
import { marketingImages } from '@/lib/marketingAssets'

const steps = [
  {
    title: '1. Create Trip',
    description: 'Log pickup, destination, vehicle, and driver in a single flow designed for ops teams.',
    icon: HiOutlineClipboardDocumentList,
  },
  {
    title: '2. Verify Distance',
    description: 'Capture odometer start/end with optional photo proof for reliable distance records.',
    icon: HiOutlineCamera,
  },
  {
    title: '3. Track Money',
    description: 'Record trip income and expenses to understand true route-level profitability.',
    icon: HiOutlineCurrencyDollar,
  },
  {
    title: '4. Manage Drivers',
    description: 'Monitor work hours, docs, and assignments without always-on location tracking.',
    icon: HiOutlineUserGroup,
  },
  {
    title: '5. Report & Improve',
    description: 'Use dashboards and alerts to improve margins, compliance, and daily execution.',
    icon: HiOutlineChartBarSquare,
  },
]

export default function HowItWorks() {
  return (
    <MarketingSection id="how-it-works" className="bg-white py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-title text-[clamp(2.2rem,4.8vw,4.6rem)] font-bold leading-[0.98] text-[#111827]">
          How {APP_NAME} Works
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-gray-700">
          A practical GPS-free workflow that turns daily fleet operations into auditable records, clear margins, and
          better decisions.
        </p>
      </div>

      <div className="mt-10 grid items-stretch gap-5 md:grid-cols-[1fr_1.05fr]">
        <article className="relative min-h-[320px] overflow-hidden rounded-3xl bg-[#2f5aab] p-6 text-white md:min-h-[400px] md:p-8">
          <Image
            src={marketingImages.howItWorks}
            alt={`${APP_NAME} operational fleet`}
            fill
            className="object-cover object-center opacity-40"
            sizes="(max-width: 1120px) 50vw, 560px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-[#0f172a]/35 to-[#2f5aab]/40" />
          <div className="relative z-10">
            <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              GPS-Free Model
            </p>
            <h3 className="mt-4 max-w-md text-3xl font-semibold leading-tight md:text-4xl">
              Your terms. Your control. One connected operational layer.
            </h3>
            <p className="mt-3 max-w-md text-sm text-white/90 md:text-base">
              {APP_NAME} gives owners and managers visibility over trips, drivers, and profitability without
              surveillance-heavy workflows.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                <p className="text-sm font-semibold">Audit-ready</p>
                <p className="mt-1 text-xs text-white/80">Trip records</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                <p className="text-sm font-semibold">Driver-safe</p>
                <p className="mt-1 text-xs text-white/80">No live GPS</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                <p className="text-sm font-semibold">Margin-focused</p>
                <p className="mt-1 text-xs text-white/80">P&L visibility</p>
              </div>
            </div>
          </div>
        </article>

        <div className="grid gap-3 sm:grid-cols-2">
          {steps.map((step, idx) => (
            <article
              key={step.title}
              className={`rounded-2xl border p-4 shadow-sm transition ${idx === 0 ? 'border-[#fbbd26] bg-[#fff8e6]' : 'border-gray-200 bg-white'}`}
            >
              <step.icon className="h-7 w-7 text-[#111827]" />
              <h3 className="mt-3 text-base font-semibold text-[#111827] md:text-lg">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-700">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </MarketingSection>
  )
}

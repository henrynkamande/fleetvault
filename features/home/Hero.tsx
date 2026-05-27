import Image from 'next/image'
import Link from 'next/link'
import { FaArrowDown } from 'react-icons/fa6'
import { FiArrowRight } from 'react-icons/fi'
import Navbar from '@/components/ui/Navbar'
import { APP_NAME } from '@/lib/constants'
import { marketingImages } from '@/lib/marketingAssets'
import { AppRoutesPaths } from '@/route/paths'
import { MARKETING_CONTAINER } from '@/lib/marketingLayout'

const stats = [
  { value: '24/7', label: 'Ops visibility' },
  { value: 'GPS-Free', label: 'Privacy-first' },
  { value: 'Real-time', label: 'Trip records' },
] as const

export default function Hero() {
  return (
    <section id="hero" className="relative w-full overflow-hidden bg-gradient-to-b from-slate-100 via-[#F9F9F9] to-[#F9F9F9] pb-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(47,90,171,0.12),transparent)]"
        aria-hidden
      />
      <Navbar />

      <div
        className={`relative mt-6 flex flex-col gap-8 sm:mt-8 lg:mt-10 lg:flex-row lg:items-stretch lg:justify-center lg:gap-8 ${MARKETING_CONTAINER}`}
      >
        <div className="flex flex-1 flex-col justify-center text-left lg:max-w-[50%] lg:px-6 lg:py-4">
          <p className="inline-flex w-fit items-center rounded-full border border-[#2f5aab]/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2f5aab] shadow-sm">
            GPS-free fleet management
          </p>
          <h1 className="mt-4 font-title text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em] text-[#0f172a]">
            Full fleet control.
            <span className="block text-[#2f5aab]">Zero driver surveillance.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {APP_NAME} is the all-in-one GPS-free platform to manage drivers, vehicles, trips, and fleet finances
            with total operational control.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={AppRoutesPaths.auth.signup}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fbbd26] px-6 py-3 text-sm font-semibold text-[#111827] shadow-md transition hover:bg-[#f4b20a] sm:text-base"
            >
              Start free trial <FiArrowRight />
            </Link>
            <Link
              href={AppRoutesPaths.dashboard.root}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition hover:border-slate-400 hover:bg-slate-50 sm:text-base"
            >
              Fleet dashboard
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-[#0f172a] p-3 text-white sm:max-w-md sm:p-4">
            {stats.map((item) => (
              <div key={item.value}>
                <p className="text-xs font-bold sm:text-sm">{item.value}</p>
                <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-400 sm:text-[10px]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:max-w-[50%] lg:justify-center lg:px-6 lg:py-4">
          <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:min-h-[260px] lg:min-h-0">
            <Image
              src={marketingImages.hero}
              alt={`${APP_NAME} fleet operations`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 480px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/75 via-transparent to-transparent lg:bg-gradient-to-l lg:from-[#0f172a]/60 lg:via-transparent lg:to-transparent" />
            <div className="relative flex h-full min-h-[220px] flex-col justify-end p-5 sm:min-h-[260px] lg:min-h-full lg:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70 sm:text-xs">{APP_NAME}</p>
              <p className="mt-1 max-w-xs font-title text-lg font-semibold leading-snug text-white sm:text-xl">
                One platform. Endless ways to move.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-8 ${MARKETING_CONTAINER}`}>
        <a
          href="#explore"
          className="flex flex-col items-center gap-2 text-slate-500 transition hover:text-[#0f172a]"
        >
          <span className="text-xs font-medium uppercase tracking-widest">Learn more</span>
          <FaArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </div>
    </section>
  )
}

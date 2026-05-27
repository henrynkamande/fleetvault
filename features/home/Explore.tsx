import Image from 'next/image'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'
import MarketingSection from '@/components/marketing/MarketingSection'
import { APP_NAME } from '@/lib/constants'
import { marketingImages } from '@/lib/marketingAssets'
import { AppRoutesPaths } from '@/route/paths'

export default function Explore() {
  return (
    <MarketingSection id="explore" className="bg-[#F9F9F9] py-12 md:py-16">
      <div className="relative min-h-[620px] w-full overflow-hidden rounded-3xl bg-[#2f5aab] sm:min-h-[660px] md:min-h-[700px] lg:min-h-[740px]">
        <Image
          src={marketingImages.explore}
          alt={`${APP_NAME} explore section`}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1120px) 100vw, 1120px"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0d2f6e]/90 via-[#0d2f6e]/55 to-[#0d2f6e]/15" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute left-4 top-6 z-30 flex max-w-[92%] flex-col gap-4 pb-8 sm:left-8 sm:top-10 sm:max-w-[48%] sm:gap-5 sm:pb-10 md:gap-6 md:pb-12">
          <h2 className="font-title text-3xl font-bold leading-tight tracking-tight text-[#FDFCFA] sm:text-4xl md:text-5xl">
            One platform. Endless fleet possibilities.
          </h2>

          <p className="max-w-lg text-base leading-relaxed text-[#FDFCFA]/95 sm:text-lg">
            {APP_NAME} brings driver management, vehicles, trip logs, and finances together so your team can operate
            from a single source of truth.
          </p>

          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="flex flex-col justify-center rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur-md">
              <h3 className="font-title text-lg font-semibold text-[#FDFCFA]">Run Your Fleet</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#FDFCFA]/90">
                Manage assignments, compliance, and utilization from one dashboard.
              </p>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur-md">
              <h3 className="font-title text-lg font-semibold text-[#FDFCFA]">Log Trips Without GPS</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#FDFCFA]/90">
                Capture trip and odometer records while keeping driver privacy intact.
              </p>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur-md sm:col-span-2 sm:max-w-md">
              <h3 className="font-title text-lg font-semibold text-[#FDFCFA]">Track Profitability</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#FDFCFA]/90">
                Understand revenue, expenses, and margins per route, driver, and vehicle.
              </p>
            </div>

            <Link
              href={AppRoutesPaths.dashboard.root}
              className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-white px-6 text-base font-medium text-[#2f5aab] transition hover:bg-[#f1f5ff] sm:col-span-2"
            >
              <span>Explore the platform</span>
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </MarketingSection>
  )
}

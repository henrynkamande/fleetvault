import Image from 'next/image'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import MarketingPageHero from '@/components/marketing/MarketingPageHero'
import { APP_MARKETING_URL, APP_NAME } from '@/lib/constants'
import { marketingImages } from '@/lib/marketingAssets'
import { AppRoutesPaths } from '@/route/paths'
import { MARKETING_CONTAINER } from '@/lib/marketingLayout'

const values = [
  {
    title: 'Privacy by design',
    body: 'We believe fleet visibility should not require always-on GPS. Drivers deserve dignity; owners deserve reliable records.',
  },
  {
    title: 'Operational truth',
    body: 'Trips, odometer proof, and money in one system create audit-ready history — not scattered chats and spreadsheets.',
  },
  {
    title: 'Owner-first economics',
    body: 'Margins matter. Every feature ties back to utilization, cost control, and route-level profitability.',
  },
  {
    title: 'Practical software',
    body: 'Built for dispatchers, managers, and owners who run real vehicles — not demo dashboards that never ship.',
  },
]

const milestones = [
  { year: 'Today', label: 'GPS-free fleet OS', detail: 'Vehicles, drivers, trips, and P&L in one dashboard.' },
  { year: 'Approach', label: 'No surveillance tax', detail: 'Replace live tracking with verified trip records and trust.' },
  { year: 'Vision', label: 'Global operators', detail: 'USD billing with room to serve emerging transport markets.' },
]

export default function AboutPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="About"
        title={`Why we built ${APP_NAME}`}
        description={`${APP_NAME} is a privacy-first fleet management platform for vehicle owners and managers who need control, clarity, and profitability — without turning drivers into live dots on a map.`}
      />

      <section className="py-14">
        <div className={`grid gap-10 lg:grid-cols-2 lg:items-center ${MARKETING_CONTAINER}`}>
          <div>
            <h2 className="font-title text-2xl font-bold text-[#111827] md:text-3xl">Our mission</h2>
            <p className="mt-4 text-gray-700 leading-relaxed">
              Transport teams run on thin margins and heavy coordination. Most software forces a false choice: either
              surveil drivers with constant GPS, or fly blind with spreadsheets. {APP_NAME} exists to give owners a third
              path — structured trip records, financial visibility, and team workflows that respect people.
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              We work with fleet owners, managers, and drivers who want the same thing: know what happened on the road,
              what it cost, and what to improve next — without friction or fear.
            </p>
            <div className="mt-8 rounded-2xl border border-[#e7ecf4] bg-white p-6 shadow-sm lg:hidden">
              <h3 className="text-lg font-semibold text-[#111827]">At a glance</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                <li>
                  <span className="font-semibold text-[#111827]">Product:</span> GPS-free fleet management
                </li>
                <li>
                  <span className="font-semibold text-[#111827]">Audience:</span> Fleet owners &amp; managers
                </li>
                <li>
                  <span className="font-semibold text-[#111827]">Model:</span> Per-vehicle monthly billing
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={marketingImages.aboutMission}
                  alt="Fleet operators coordinating daily transport work"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
              </div>
              <figcaption className="mt-3 text-sm text-slate-600">
                <span className="font-semibold text-[#111827]">Built for real teams</span> — owners and managers who run
                vehicles every day, not slide decks.
              </figcaption>
            </figure>
            <div className="hidden rounded-2xl border border-[#e7ecf4] bg-white p-6 shadow-sm lg:block">
              <h3 className="text-lg font-semibold text-[#111827]">At a glance</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                <li>
                  <span className="font-semibold text-[#111827]">Product:</span> GPS-free fleet management
                </li>
                <li>
                  <span className="font-semibold text-[#111827]">Audience:</span> Fleet owners &amp; managers
                </li>
                <li>
                  <span className="font-semibold text-[#111827]">Model:</span> Per-vehicle monthly billing
                </li>
                <li>
                  <span className="font-semibold text-[#111827]">Site:</span>{' '}
                  <a href={APP_MARKETING_URL} className="text-[#2f5aab] hover:underline">
                    myfleetvault.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className={MARKETING_CONTAINER}>
          <h2 className="text-center font-title text-2xl font-bold text-[#111827] md:text-3xl">What we stand for</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <article key={v.title} className="rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#111827]">{v.title}</h3>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className={MARKETING_CONTAINER}>
          <h2 className="font-title text-2xl font-bold text-[#111827]">How we think about the road ahead</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {milestones.map((m) => (
              <article key={m.label} className="rounded-2xl bg-[#2f5aab] p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{m.year}</p>
                <h3 className="mt-2 text-xl font-semibold">{m.label}</h3>
                <p className="mt-2 text-sm text-white/90">{m.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F9F9F9] py-14">
        <div className={`grid gap-10 lg:grid-cols-2 lg:items-center ${MARKETING_CONTAINER}`}>
          <figure className="relative order-2 aspect-[16/11] overflow-hidden rounded-[28px] shadow-lg lg:order-1">
            <Image
              src={marketingImages.aboutVisibility}
              alt="Fleet operations with accountability, not live GPS tracking"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/50 to-transparent" />
          </figure>
          <div className="order-1 lg:order-2">
            <h2 className="font-title text-2xl font-bold text-[#111827] md:text-3xl">
              GPS-free is not “less visibility”
            </h2>
            <p className="mt-4 text-gray-700 leading-relaxed">
              Visibility means verified trips, documented distances, and financial outcomes — not a blinking icon on a
              map. {APP_NAME} helps teams document what matters for operations and compliance, while keeping driver
              experience humane.
            </p>
            <p className="mt-4 text-sm text-slate-600">
              That is how modern fleets earn trust and still run tight ships — with proof, not surveillance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={AppRoutesPaths.dashboard.root}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-[#111827] hover:border-gray-400"
              >
                Explore the owner dashboard <FiArrowRight />
              </Link>
              <Link
                href={AppRoutesPaths.marketing.pricing}
                className="inline-flex items-center gap-2 rounded-full bg-[#fbbd26] px-6 py-3 text-sm font-semibold text-[#111827] hover:bg-[#f4b20a]"
              >
                View pricing <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

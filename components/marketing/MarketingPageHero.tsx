import { MARKETING_CONTAINER } from '@/lib/marketingLayout'

type MarketingPageHeroProps = {
  eyebrow?: string
  title: string
  description: string
  /** Center headline block (e.g. pricing page). */
  centered?: boolean
}

export default function MarketingPageHero({ eyebrow, title, description, centered = false }: MarketingPageHeroProps) {
  return (
    <section className="border-b border-gray-200/80 bg-white py-14 md:py-20">
      <div
        className={`${MARKETING_CONTAINER} ${centered ? 'flex flex-col items-center text-center' : ''}`}
      >
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2f5aab]">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 font-title text-[clamp(2rem,4.5vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#111827]">
          {title}
        </h1>
        <p className={`mt-4 max-w-3xl text-lg text-gray-700 ${centered ? 'mx-auto' : ''}`}>{description}</p>
      </div>
    </section>
  )
}

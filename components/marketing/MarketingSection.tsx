import { MARKETING_CONTAINER } from '@/lib/marketingLayout'

type MarketingSectionProps = {
  id?: string
  className?: string
  children: React.ReactNode
}

export default function MarketingSection({ id, className = '', children }: MarketingSectionProps) {
  return (
    <section id={id} className={className}>
      <div className={MARKETING_CONTAINER}>{children}</div>
    </section>
  )
}

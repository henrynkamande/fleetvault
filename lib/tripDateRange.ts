/** Local YYYY-MM-DD for API `date_from` / `date_to` query params. */
export function formatLocalYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Monday 00:00:00 local of the week containing `ref`. */
export function startOfWeekMonday(ref: Date): Date {
  const d = new Date(ref)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const offset = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + offset)
  return d
}

export type TripPeriodFilter = 'weekly' | 'monthly'

export function completedTripsDateRange(period: TripPeriodFilter, ref: Date = new Date()): {
  date_from: string
  date_to: string
} {
  if (period === 'weekly') {
    const start = startOfWeekMonday(ref)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return { date_from: formatLocalYmd(start), date_to: formatLocalYmd(end) }
  }
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1)
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0)
  return { date_from: formatLocalYmd(start), date_to: formatLocalYmd(end) }
}

export function formatCurrency(value: number, currency = 'USD', withCents = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: withCents ? 2 : 0,
    minimumFractionDigits: withCents ? 2 : 0,
  }).format(value)
}

export function formatUsd(value: number, withCents = false): string {
  return formatCurrency(value, 'USD', withCents)
}

export function formatDeltaPct(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return '— vs prior period'
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}% vs prior period`
}

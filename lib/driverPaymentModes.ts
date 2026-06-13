export type DriverPaymentMode = 'MONTHLY_FIXED' | 'WEEKLY_TRIPS' | 'FIXED_DAILY' | 'PER_TRIP'

export const DRIVER_PAYMENT_MODES: {
  value: DriverPaymentMode
  label: string
  framing: string
}[] = [
  { value: 'MONTHLY_FIXED', label: 'Paid Monthly', framing: 'Stability: secure consistent earnings.' },
  { value: 'WEEKLY_TRIPS', label: 'Weekly Payment', framing: 'Balance: effort adds up and settles weekly.' },
  { value: 'FIXED_DAILY', label: 'Fixed Pay Daily', framing: 'Flexibility: every worked day is valued.' },
  { value: 'PER_TRIP', label: 'Per Trip', framing: 'Instant reward: each completed trip counts.' },
]

export function driverPaymentModeLabel(mode: string | null | undefined): string {
  return DRIVER_PAYMENT_MODES.find((item) => item.value === mode)?.label ?? 'Per Trip'
}

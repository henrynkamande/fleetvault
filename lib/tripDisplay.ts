import type { TripDetailDto, TripListDto } from '@/types/trip'

type TripDistanceSource = Pick<TripListDto, 'distance_km' | 'distance_is_estimated'>

export function formatTripDistanceKm(trip: TripDistanceSource): string {
  if (trip.distance_km === null || trip.distance_km === undefined) return '—'
  const suffix = trip.distance_is_estimated ? ' (estimated)' : ''
  return `${trip.distance_km} km${suffix}`
}

export function formatActualTripTime(
  iso: string | null | undefined,
  status: TripDetailDto['status'] | TripListDto['status'],
  kind: 'departure' | 'arrival',
): string {
  if (iso) {
    const d = new Date(iso)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    }
  }
  if (status === 'PLANNED' || status === 'DELAYED') {
    return kind === 'departure' ? 'Recorded when driver starts trip' : 'Recorded when driver completes trip'
  }
  return '—'
}

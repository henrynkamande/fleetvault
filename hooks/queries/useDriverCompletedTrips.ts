import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { completedTripsDateRange, type TripPeriodFilter } from '@/lib/tripDateRange'
import { listTrips } from '@/services/tripService'

/** `driverProfileId` is the DriverProfile PK (same as user id for record-only drivers). */
export function useDriverCompletedTripsQuery(
  driverProfileId: string | undefined,
  period: TripPeriodFilter,
  enabled: boolean,
) {
  const range = useMemo(() => completedTripsDateRange(period), [period])

  return useQuery({
    queryKey: ['trips', 'driver', driverProfileId, 'COMPLETED', period, range.date_from, range.date_to],
    queryFn: () =>
      listTrips({
        driver: driverProfileId!,
        status: 'COMPLETED',
        date_from: range.date_from,
        date_to: range.date_to,
      }),
    enabled: enabled && !!driverProfileId,
    staleTime: 30_000,
  })
}

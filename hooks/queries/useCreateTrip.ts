import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTrip } from '@/services/tripService'
import type { CreateTripPayload, ListTripsResponse, TripListDto } from '@/types/trip'

function makeOptimisticTrip(payload: CreateTripPayload): TripListDto {
  const now = new Date().toISOString()
  return {
    id: `optimistic-trip-${Date.now()}`,
    trip_number: 'Saving...',
    status: 'PLANNED',
    pickup_location: payload.pickup_location,
    destination: payload.destination,
    vehicle_registration: null,
    driver: payload.driver ?? null,
    driver_name: null,
    customer: payload.customer ?? null,
    customer_display_name: payload.customer_name ?? null,
    planned_departure_time: payload.planned_departure_time,
    actual_departure_time: null,
    actual_arrival_time: null,
    updated_at: now,
    is_flagged: false,
    flag_reason: null,
    planned_distance_km: payload.planned_distance_km ?? null,
    revenue_amount: String(payload.revenue_amount),
    fuel_cost: String(payload.fuel_cost ?? 0),
    driver_payment: String(payload.driver_payment ?? 0),
    driver_payment_mode: payload.driver_payment_mode ?? 'PER_TRIP',
    driver_payment_mode_label: 'Per trip',
    driver_payment_rate: payload.driver_payment_rate === undefined ? null : String(payload.driver_payment_rate),
    driver_payment_auto_calculated: payload.driver_payment_auto_calculated ?? false,
    income_status: 'PENDING',
    income_status_label: 'Pending',
    toll_cost: String(payload.toll_cost ?? 0),
    other_expenses: String(payload.other_expenses ?? 0),
    total_expenses: null,
    profit: null,
    created_at: now,
  }
}

export function useCreateTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTripPayload) => createTrip(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['trips', 'list'] })
      const previousTrips = queryClient.getQueriesData<ListTripsResponse>({ queryKey: ['trips', 'list'] })
      const optimisticTrip = makeOptimisticTrip(payload)

      for (const [queryKey, previous] of previousTrips) {
        if (!previous) continue
        const statusFilter = Array.isArray(queryKey) ? queryKey[2] : undefined
        if (statusFilter !== 'all' && statusFilter !== optimisticTrip.status) continue
        queryClient.setQueryData<ListTripsResponse>(queryKey, {
          ...previous,
          count: previous.count + 1,
          trips: [optimisticTrip, ...previous.trips],
        })
      }

      return { previousTrips, optimisticTrip }
    },
    onError: (_err, _payload, ctx) => {
      ctx?.previousTrips.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSuccess: (data, _payload, ctx) => {
      if (ctx?.optimisticTrip) {
        const currentTrips = queryClient.getQueriesData<ListTripsResponse>({ queryKey: ['trips', 'list'] })
        for (const [queryKey, current] of currentTrips) {
          if (!current) continue
          queryClient.setQueryData<ListTripsResponse>(queryKey, {
            ...current,
            trips: current.trips.map((trip) =>
              trip.id === ctx.optimisticTrip.id ? data.trip : trip,
            ),
          })
        }
      }
      void queryClient.invalidateQueries({ queryKey: ['trips'], refetchType: 'inactive' })
      void queryClient.invalidateQueries({ queryKey: ['finance'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelTrip, deleteTrip, updateTrip, updateTripIncomeStatus } from '@/services/tripService'
import type {
  ListTripsResponse,
  TripDetailDto,
  TripIncomeStatus,
  TripListDto,
  UpdateTripPayload,
} from '@/types/trip'

function tripMatchesRef(trip: Pick<TripListDto, 'id' | 'trip_number'>, tripRef: string): boolean {
  return trip.id === tripRef || trip.trip_number === tripRef
}

function moneyPatch(value: string | number | undefined, fallback: string | null): string | null {
  return value === undefined ? fallback : String(value)
}

function applyTripListPatch(trip: TripListDto, payload: UpdateTripPayload): TripListDto {
  return {
    ...trip,
    ...payload,
    revenue_amount: moneyPatch(payload.revenue_amount, trip.revenue_amount),
    fuel_cost: moneyPatch(payload.fuel_cost, trip.fuel_cost),
    driver_payment: moneyPatch(payload.driver_payment, trip.driver_payment),
    toll_cost: moneyPatch(payload.toll_cost, trip.toll_cost),
    other_expenses: moneyPatch(payload.other_expenses, trip.other_expenses),
  }
}

function applyTripDetailPatch(trip: TripDetailDto, payload: UpdateTripPayload): TripDetailDto {
  return {
    ...trip,
    ...payload,
    revenue_amount: moneyPatch(payload.revenue_amount, trip.revenue_amount),
    fuel_cost: moneyPatch(payload.fuel_cost, trip.fuel_cost),
    driver_payment: moneyPatch(payload.driver_payment, trip.driver_payment),
    toll_cost: moneyPatch(payload.toll_cost, trip.toll_cost),
    other_expenses: moneyPatch(payload.other_expenses, trip.other_expenses),
  }
}

export function useUpdateTripMutation(tripRef: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTripPayload) => updateTrip(tripRef!, payload),
    onMutate: async (payload) => {
      if (!tripRef) return undefined

      await queryClient.cancelQueries({ queryKey: ['trips'] })
      const previousTrips = queryClient.getQueriesData<ListTripsResponse>({ queryKey: ['trips', 'list'] })
      const previousDetail = queryClient.getQueryData<TripDetailDto>(['trips', 'detail', tripRef])

      for (const [queryKey, previous] of previousTrips) {
        if (!previous) continue
        queryClient.setQueryData<ListTripsResponse>(queryKey, {
          ...previous,
          trips: previous.trips.map((trip) =>
            tripMatchesRef(trip, tripRef) ? applyTripListPatch(trip, payload) : trip,
          ),
        })
      }
      if (previousDetail) {
        queryClient.setQueryData<TripDetailDto>(
          ['trips', 'detail', tripRef],
          applyTripDetailPatch(previousDetail, payload),
        )
      }

      return { previousTrips, previousDetail }
    },
    onError: (_err, _payload, ctx) => {
      ctx?.previousTrips.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      if (tripRef && ctx?.previousDetail) {
        queryClient.setQueryData(['trips', 'detail', tripRef], ctx.previousDetail)
      }
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['trips'], refetchType: 'inactive' })
      void queryClient.invalidateQueries({ queryKey: ['finance'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      if (tripRef) {
        queryClient.setQueryData(['trips', 'detail', tripRef], data.trip)
      }
      if (data.trip.trip_number && data.trip.trip_number !== tripRef) {
        queryClient.setQueryData(['trips', 'detail', data.trip.trip_number], data.trip)
      }
    },
  })
}

export function useCancelTripMutation(tripRef: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reason?: string) => cancelTrip(tripRef!, reason),
    onMutate: async () => {
      if (!tripRef) return undefined
      await queryClient.cancelQueries({ queryKey: ['trips'] })
      const previousTrips = queryClient.getQueriesData<ListTripsResponse>({ queryKey: ['trips', 'list'] })

      for (const [queryKey, previous] of previousTrips) {
        if (!previous) continue
        queryClient.setQueryData<ListTripsResponse>(queryKey, {
          ...previous,
          trips: previous.trips.map((trip) =>
            tripMatchesRef(trip, tripRef) ? { ...trip, status: 'CANCELLED' } : trip,
          ),
        })
      }

      return { previousTrips }
    },
    onError: (_err, _reason, ctx) => {
      ctx?.previousTrips.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips'], refetchType: 'inactive' })
      void queryClient.invalidateQueries({ queryKey: ['finance'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tripRef: string) => deleteTrip(tripRef),
    onMutate: async (tripRef) => {
      await queryClient.cancelQueries({ queryKey: ['trips'] })
      const previousTrips = queryClient.getQueriesData<ListTripsResponse>({ queryKey: ['trips', 'list'] })

      for (const [queryKey, previous] of previousTrips) {
        if (!previous) continue
        const nextTrips = previous.trips.filter((trip) => !tripMatchesRef(trip, tripRef))
        queryClient.setQueryData<ListTripsResponse>(queryKey, {
          ...previous,
          count: Math.max(0, previous.count - (previous.trips.length - nextTrips.length)),
          trips: nextTrips,
        })
      }

      return { previousTrips }
    },
    onError: (_err, _tripRef, ctx) => {
      ctx?.previousTrips.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips'], refetchType: 'inactive' })
      void queryClient.invalidateQueries({ queryKey: ['finance'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateTripIncomeStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripRef, incomeStatus }: { tripRef: string; incomeStatus: TripIncomeStatus }) =>
      updateTripIncomeStatus(tripRef, incomeStatus),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['trips'] })
      void queryClient.invalidateQueries({ queryKey: ['finance'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.setQueryData(['trips', 'detail', data.trip.id], data.trip)
      if (data.trip.trip_number) {
        queryClient.setQueryData(['trips', 'detail', data.trip.trip_number], data.trip)
      }
    },
  })
}

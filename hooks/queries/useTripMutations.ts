import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelTrip, updateTrip } from '@/services/tripService'
import type { UpdateTripPayload } from '@/types/trip'

export function useUpdateTripMutation(tripRef: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTripPayload) => updateTrip(tripRef!, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['trips'] })
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips'] })
      void queryClient.invalidateQueries({ queryKey: ['finance'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

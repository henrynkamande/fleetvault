import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeTrip, startTrip } from '@/services/tripService'

export function useStartTripMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tripId, odometer }: { tripId: string; odometer: number }) =>
      startTrip(tripId, { odometer }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['driverTrips'] })
      void queryClient.invalidateQueries({ queryKey: ['driverDashboard'] })
    },
  })
}

export function useCompleteTripMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      tripId,
      odometer,
      notes,
    }: {
      tripId: string
      odometer: number
      notes?: string
    }) => completeTrip(tripId, { odometer, notes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['driverTrips'] })
      void queryClient.invalidateQueries({ queryKey: ['driverDashboard'] })
    },
  })
}

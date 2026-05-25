import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTrip } from '@/services/tripService'
import type { CreateTripPayload } from '@/types/trip'

export function useCreateTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTripPayload) => createTrip(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips'] })
      void queryClient.invalidateQueries({ queryKey: ['finance'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

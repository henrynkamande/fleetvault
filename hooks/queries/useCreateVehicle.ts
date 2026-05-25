import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createVehicle } from '@/services/vehicleService'
import type { CreateVehiclePayload } from '@/types/vehicle'

export function useCreateVehicleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

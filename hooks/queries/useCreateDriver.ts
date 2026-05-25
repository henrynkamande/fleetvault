import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignDriverToVehicle, createDriver } from '@/services/driverService'
import type { CreateDriverPayload } from '@/types/driverCreate'

export type CreateDriverVariables = CreateDriverPayload & {
  vehicleId?: string
}

export function useCreateDriverMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: CreateDriverVariables) => {
      const { vehicleId, ...payload } = vars
      const data = await createDriver(payload)
      const profileId = data.driver?.driver_profile_id
      if (vehicleId && profileId) {
        await assignDriverToVehicle(vehicleId, profileId)
      }
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['companyUsers'] })
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      void queryClient.invalidateQueries({ queryKey: ['companyDrivers'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateVehicle } from '@/services/vehicleService'
import type { UpdateVehiclePayload, VehicleDto } from '@/types/vehicle'
import {
  getVehicleListSnapshots,
  restoreVehicleListSnapshots,
  upsertVehicleInLists,
} from '@/hooks/queries/vehicleCache'

type UpdateVehicleVariables = {
  vehicleId: string
  payload: UpdateVehiclePayload
}

export function useUpdateVehicleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ vehicleId, payload }: UpdateVehicleVariables) => updateVehicle(vehicleId, payload),
    onMutate: async ({ vehicleId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['vehicles'] })
      await queryClient.cancelQueries({ queryKey: ['vehicle', vehicleId] })

      const previousVehicles = getVehicleListSnapshots(queryClient)
      const previousVehicle = queryClient.getQueryData<VehicleDto>(['vehicle', vehicleId])
      if (previousVehicle) {
        const nextVehicle = {
          ...previousVehicle,
          ...payload,
          updated_at: new Date().toISOString(),
        }
        queryClient.setQueryData(['vehicle', vehicleId], nextVehicle)
        upsertVehicleInLists(queryClient, nextVehicle)
      }

      return { previousVehicles, previousVehicle }
    },
    onError: (_err, vars, ctx) => {
      if (ctx?.previousVehicles) restoreVehicleListSnapshots(queryClient, ctx.previousVehicles)
      if (ctx?.previousVehicle) queryClient.setQueryData(['vehicle', vars.vehicleId], ctx.previousVehicle)
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData(['vehicle', vars.vehicleId], data.vehicle)
      queryClient.setQueryData(['vehicle', data.vehicle.id], data.vehicle)
      upsertVehicleInLists(queryClient, data.vehicle)
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteVehicle } from '@/services/vehicleService'
import {
  getVehicleListSnapshots,
  removeVehicleFromLists,
  restoreVehicleListSnapshots,
} from '@/hooks/queries/vehicleCache'

export function useDeleteVehicleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vehicleId: string) => deleteVehicle(vehicleId),
    onMutate: async (vehicleId) => {
      await queryClient.cancelQueries({ queryKey: ['vehicles'] })
      await queryClient.cancelQueries({ queryKey: ['vehicle', vehicleId] })
      const previousVehicles = getVehicleListSnapshots(queryClient)
      const previousVehicle = queryClient.getQueryData(['vehicle', vehicleId])

      removeVehicleFromLists(queryClient, vehicleId)
      queryClient.removeQueries({ queryKey: ['vehicle', vehicleId] })

      return { previousVehicles, previousVehicle }
    },
    onError: (_err, _vehicleId, ctx) => {
      if (ctx?.previousVehicles) restoreVehicleListSnapshots(queryClient, ctx.previousVehicles)
      if (ctx?.previousVehicle) queryClient.setQueryData(['vehicle', _vehicleId], ctx.previousVehicle)
    },
    onSuccess: (data, vehicleId) => {
      removeVehicleFromLists(queryClient, data.vehicle?.id ?? vehicleId)
      queryClient.removeQueries({ queryKey: ['vehicle', data.vehicle?.id ?? vehicleId] })
    },
  })
}

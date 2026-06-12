import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createVehicle } from '@/services/vehicleService'
import type { CreateVehiclePayload, VehicleDto } from '@/types/vehicle'
import {
  getVehicleListSnapshots,
  removeVehicleFromLists,
  restoreVehicleListSnapshots,
  upsertVehicleInLists,
} from '@/hooks/queries/vehicleCache'

function makeOptimisticVehicle(payload: CreateVehiclePayload): VehicleDto {
  const now = new Date().toISOString()
  return {
    id: `optimistic-vehicle-${Date.now()}`,
    fleet_owner: '',
    company_name: null,
    registration_number: payload.registration_number,
    make: payload.make,
    model: payload.model,
    year: payload.year ?? null,
    color: payload.color,
    vehicle_type: payload.vehicle_type,
    status: payload.status ?? 'ACTIVE',
    current_odometer: payload.current_odometer ?? 0,
    assigned_driver: payload.assigned_driver ?? null,
    assigned_driver_name: null,
    notes: payload.notes ?? null,
    image: null,
    load_capacity: payload.load_capacity ?? null,
    fuel_type: payload.fuel_type ?? '',
    is_active: true,
    updated_at: now,
    created_at: now,
  }
}

export function useCreateVehicleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['vehicles'] })
      const previousVehicles = getVehicleListSnapshots(queryClient)
      const optimisticVehicle = makeOptimisticVehicle(payload)

      upsertVehicleInLists(queryClient, optimisticVehicle)

      return { previousVehicles, optimisticVehicle }
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previousVehicles) restoreVehicleListSnapshots(queryClient, ctx.previousVehicles)
    },
    onSuccess: (data, _payload, ctx) => {
      if (ctx?.optimisticVehicle) {
        removeVehicleFromLists(queryClient, ctx.optimisticVehicle.id)
      }
      queryClient.setQueryData(['vehicle', data.vehicle.id], data.vehicle)
      upsertVehicleInLists(queryClient, data.vehicle)
    },
  })
}

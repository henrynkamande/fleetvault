import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignDriverToVehicle, createDriver } from '@/services/driverService'
import type { ListCompanyUsersResponse } from '@/services/companyUsersService'
import type { CreateDriverPayload } from '@/types/driverCreate'
import type { User } from '@/types/user'

export type CreateDriverVariables = CreateDriverPayload & {
  vehicleId?: string
}

function makeOptimisticDriver(vars: CreateDriverVariables): User {
  const now = new Date().toISOString()
  const fullName = `${vars.first_name} ${vars.last_name}`.trim()
  return {
    id: `optimistic-driver-${Date.now()}`,
    email: '',
    phone_number: vars.phone_number,
    first_name: vars.first_name,
    last_name: vars.last_name,
    full_name: fullName,
    role: 'DRIVER',
    avatar: null,
    avatar_url: null,
    is_verified: false,
    is_active: true,
    date_joined: now,
    last_login: null,
    company_id: null,
    company_name: null,
    has_company: true,
    driver_profile_id: null,
  }
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
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['companyUsers'] })
      const previousDrivers = queryClient.getQueriesData<ListCompanyUsersResponse>({ queryKey: ['companyUsers'] })
      const optimisticDriver = makeOptimisticDriver(vars)

      for (const [queryKey, previous] of previousDrivers) {
        if (!previous) continue
        queryClient.setQueryData<ListCompanyUsersResponse>(queryKey, {
          ...previous,
          count: previous.count + 1,
          users: [optimisticDriver, ...previous.users],
        })
      }

      return { previousDrivers, optimisticDriver }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previousDrivers.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSuccess: (data, _vars, ctx) => {
      if (ctx?.optimisticDriver) {
        const currentDrivers = queryClient.getQueriesData<ListCompanyUsersResponse>({ queryKey: ['companyUsers'] })
        for (const [queryKey, current] of currentDrivers) {
          if (!current) continue
          queryClient.setQueryData<ListCompanyUsersResponse>(queryKey, {
            ...current,
            users: current.users.map((user) =>
              user.id === ctx.optimisticDriver.id ? data.driver : user,
            ),
          })
        }
      }
      void queryClient.invalidateQueries({ queryKey: ['companyUsers'], refetchType: 'inactive' })
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      void queryClient.invalidateQueries({ queryKey: ['companyDrivers'] })
    },
  })
}

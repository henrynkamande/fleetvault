import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deactivateCompanyUser, type ListCompanyUsersResponse } from '@/services/companyUsersService'

export function useDeactivateDriverMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => deactivateCompanyUser(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['companyUsers'] })
      const previousDrivers = queryClient.getQueriesData<ListCompanyUsersResponse>({ queryKey: ['companyUsers'] })

      for (const [queryKey, previous] of previousDrivers) {
        if (!previous) continue
        queryClient.setQueryData<ListCompanyUsersResponse>(queryKey, {
          ...previous,
          users: previous.users.map((user) =>
            user.id === userId ? { ...user, is_active: false } : user,
          ),
        })
      }

      return { previousDrivers }
    },
    onError: (_err, _userId, ctx) => {
      ctx?.previousDrivers.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSuccess: (data) => {
      const currentDrivers = queryClient.getQueriesData<ListCompanyUsersResponse>({ queryKey: ['companyUsers'] })
      for (const [queryKey, current] of currentDrivers) {
        if (!current) continue
        queryClient.setQueryData<ListCompanyUsersResponse>(queryKey, {
          ...current,
          users: current.users.map((user) =>
            user.id === data.user.id ? data.user : user,
          ),
        })
      }
      void queryClient.invalidateQueries({ queryKey: ['companyUsers'], refetchType: 'inactive' })
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

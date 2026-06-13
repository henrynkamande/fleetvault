import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
} from '@/services/customerService'
import { getAccessToken } from '@/lib/tokenStorage'
import { listStaleTime } from '@/lib/queryKeys'
import { useAuthStore } from '@/store/useAuthStore'
import type { CustomerPayload } from '@/types/customer'

export function customersQueryKey(search = '') {
  return ['customers', 'list', search] as const
}

export function useCustomersQuery(search = '', enabled = true) {
  const ready = useAuthStore((s) => s.ready)
  const version = useAuthStore((s) => s.version)
  void version

  return useQuery({
    queryKey: [...customersQueryKey(search), version],
    queryFn: () => listCustomers(search.trim() ? { q: search.trim() } : undefined),
    enabled: enabled && ready && !!getAccessToken(),
    staleTime: listStaleTime.customers,
    placeholderData: keepPreviousData,
  })
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CustomerPayload) => createCustomer(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ customerId, payload }: { customerId: string; payload: CustomerPayload }) =>
      updateCustomer(customerId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
      void queryClient.invalidateQueries({ queryKey: ['trips'] })
      void queryClient.invalidateQueries({ queryKey: ['finance'] })
    },
  })
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (customerId: string) => deleteCustomer(customerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

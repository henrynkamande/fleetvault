import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registerCompany, updateCompany } from '@/services/companyService'
import type { UpdateCompanyPayload } from '@/services/companyService'
import type { RegisterCompanyPayload } from '@/types/company'
import { useAuthStore } from '@/store/useAuthStore'

export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCompanyPayload) => updateCompany(payload),
    onSuccess: (company) => {
      queryClient.setQueryData(['company'], company)
      void queryClient.invalidateQueries({ queryKey: ['company'] })
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export function useRegisterCompanyMutation() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: (payload: RegisterCompanyPayload) => registerCompany(payload),
    onSuccess: (data) => {
      setSession(data.tokens)
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      void queryClient.invalidateQueries({ queryKey: ['company'] })
    },
  })
}

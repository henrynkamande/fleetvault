import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile, type UpdateProfilePayload } from '@/services/userService'

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user)
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

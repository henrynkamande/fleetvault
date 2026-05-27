import { useMutation, useQueryClient } from "@tanstack/react-query";
import { platformLogin, platformRegister } from "@/services/platformAuthService";
import type {
  PlatformLoginPayload,
  PlatformRegisterPayload,
} from "@/types/platformAuth";
import { useAuthStore } from "@/store/useAuthStore";

export function usePlatformLoginMutation() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: PlatformLoginPayload) => platformLogin(payload),
    onSuccess: (data) => {
      setSession(data.tokens);
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function usePlatformRegisterMutation() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: PlatformRegisterPayload) => platformRegister(payload),
    onSuccess: (data) => {
      setSession(data.tokens);
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

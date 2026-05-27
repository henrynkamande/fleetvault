import { platformApi } from "@/lib/platformApi";
import type {
  PlatformAuthResponse,
  PlatformLoginPayload,
  PlatformRegisterPayload,
} from "@/types/platformAuth";

export async function platformLogin(
  payload: PlatformLoginPayload,
): Promise<PlatformAuthResponse> {
  const res = await platformApi.post<PlatformAuthResponse>("/auth/login/", payload, {
    skipAuth: true,
  });
  return res.data;
}

export async function platformRegister(
  payload: PlatformRegisterPayload,
): Promise<PlatformAuthResponse> {
  const res = await platformApi.post<PlatformAuthResponse>(
    "/auth/register/",
    payload,
    { skipAuth: true },
  );
  return res.data;
}

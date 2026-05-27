import { createFleetApiClient } from "@/lib/createFleetApiClient";
import { getApiOrigin } from "@/lib/apiOrigin";

export const platformApi = createFleetApiClient(
  `${getApiOrigin()}/platform/api`,
);

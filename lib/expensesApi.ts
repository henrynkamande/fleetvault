import { getApiOrigin } from "@/lib/apiOrigin";
import { createFleetApiClient } from "@/lib/createFleetApiClient";

const expensesApi = createFleetApiClient(`${getApiOrigin()}/expenses/api`);

export default expensesApi;

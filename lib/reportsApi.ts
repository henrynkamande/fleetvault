import { getApiOrigin } from '@/lib/apiOrigin'
import { createFleetApiClient } from '@/lib/createFleetApiClient'

const reportsApi = createFleetApiClient(`${getApiOrigin()}/reports/api`)

export default reportsApi

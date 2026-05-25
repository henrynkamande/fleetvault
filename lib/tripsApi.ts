import { getApiOrigin } from '@/lib/apiOrigin'
import { createFleetApiClient } from '@/lib/createFleetApiClient'

const tripsApi = createFleetApiClient(`${getApiOrigin()}/trips/api`)

export default tripsApi

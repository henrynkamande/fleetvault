import { getApiOrigin } from '@/lib/apiOrigin'
import { createFleetApiClient } from '@/lib/createFleetApiClient'

const vehiclesApi = createFleetApiClient(`${getApiOrigin()}/vehicles/api`)

export default vehiclesApi

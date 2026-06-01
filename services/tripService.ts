import tripsApi from '@/lib/tripsApi'
import type {
  CancelTripResponse,
  CreateTripPayload,
  CreateTripResponse,
  ListTripsResponse,
  TripDetailDto,
  TripListDto,
  UpdateTripPayload,
  UpdateTripResponse,
} from '@/types/trip'

export async function listTrips(params?: {
  vehicle?: string
  status?: string
  driver?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
  include_stats?: boolean
}): Promise<ListTripsResponse> {
  const res = await tripsApi.get<ListTripsResponse>('/', {
    params: {
      ...params,
      include_stats: params?.include_stats ? 'true' : undefined,
    },
  })
  return res.data
}

export async function createTrip(payload: CreateTripPayload): Promise<CreateTripResponse> {
  const res = await tripsApi.post<CreateTripResponse>('/create/', payload)
  return res.data
}

/** Fetch by trip UUID or trip_number (e.g. TRIP-20260517-0001). */
export async function getTrip(tripRef: string): Promise<TripDetailDto> {
  const res = await tripsApi.get<TripDetailDto>(`/${encodeURIComponent(tripRef)}/`)
  return res.data
}

export async function updateTrip(tripRef: string, payload: UpdateTripPayload): Promise<UpdateTripResponse> {
  const res = await tripsApi.patch<UpdateTripResponse>(
    `/${encodeURIComponent(tripRef)}/update/`,
    payload,
  )
  return res.data
}

export async function cancelTrip(tripRef: string, reason?: string): Promise<CancelTripResponse> {
  const res = await tripsApi.post<CancelTripResponse>(
    `/${encodeURIComponent(tripRef)}/cancel/`,
    reason ? { reason } : {},
  )
  return res.data
}

export async function startTrip(
  tripId: string,
  body: { odometer: number },
): Promise<{ message: string; trip: TripListDto }> {
  const res = await tripsApi.post<{ message: string; trip: TripListDto }>(`/${tripId}/start/`, body)
  return res.data
}

export async function completeTrip(
  tripId: string,
  body: { odometer: number; notes?: string },
): Promise<{ message: string; trip: TripListDto }> {
  const res = await tripsApi.post<{ message: string; trip: TripListDto }>(`/${tripId}/complete/`, body)
  return res.data
}

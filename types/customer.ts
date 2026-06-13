export interface CustomerDto {
  id: string
  name: string
  phone: string
  email: string
  address: string
  notes: string
  is_default: boolean
  trip_count?: number
  created_at: string
  updated_at: string
}

export interface ListCustomersResponse {
  count: number
  customers: CustomerDto[]
}

export interface CustomerPayload {
  name: string
  phone?: string
  email?: string
  address?: string
  notes?: string
}

export interface CustomerMutationResponse {
  message: string
  customer: CustomerDto
}

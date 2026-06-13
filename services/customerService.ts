import tripsApi from '@/lib/tripsApi'
import type {
  CustomerMutationResponse,
  CustomerPayload,
  ListCustomersResponse,
} from '@/types/customer'

export async function listCustomers(params?: { q?: string }): Promise<ListCustomersResponse> {
  const res = await tripsApi.get<ListCustomersResponse>('/customers/', { params })
  return res.data
}

export async function createCustomer(payload: CustomerPayload): Promise<CustomerMutationResponse> {
  const res = await tripsApi.post<CustomerMutationResponse>('/customers/create/', payload)
  return res.data
}

export async function updateCustomer(
  customerId: string,
  payload: CustomerPayload,
): Promise<CustomerMutationResponse> {
  const res = await tripsApi.patch<CustomerMutationResponse>(
    `/customers/${encodeURIComponent(customerId)}/update/`,
    payload,
  )
  return res.data
}

export async function deleteCustomer(customerId: string): Promise<{ message: string }> {
  const res = await tripsApi.delete<{ message: string }>(
    `/customers/${encodeURIComponent(customerId)}/delete/`,
  )
  return res.data
}

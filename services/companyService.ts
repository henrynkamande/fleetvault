import api from '@/lib/api'
import type { Company, RegisterCompanyPayload, RegisterCompanyResponse } from '@/types/company'

/** GET `/company/` — authenticated; 404 if user has no company (caller should gate with `user.has_company`). */
export async function fetchCompany(): Promise<Company> {
  const res = await api.get<Company>('/company/')
  return res.data
}

export type UpdateCompanyPayload = {
  name?: string
  registration_number?: string
  address?: string
  contact_email?: string
  contact_phone?: string
}

export async function updateCompany(payload: UpdateCompanyPayload): Promise<Company> {
  const res = await api.patch<{ message: string; company: Company }>('/company/update/', payload)
  return res.data.company
}

function appendIfPresent(fd: FormData, key: string, value: string | undefined): void {
  if (value !== undefined && value !== '') fd.append(key, value)
}

/**
 * Fleet owner step 2 — `POST /company/register/` (authenticated).
 * Uses JSON when there is no logo file; otherwise `FormData` so the file uploads correctly.
 */
export async function registerCompany(payload: RegisterCompanyPayload): Promise<RegisterCompanyResponse> {
  const { name, registration_number, address, contact_email, contact_phone, logo } = payload

  if (logo) {
    const fd = new FormData()
    fd.append('name', name)
    appendIfPresent(fd, 'registration_number', registration_number)
    appendIfPresent(fd, 'address', address)
    appendIfPresent(fd, 'contact_email', contact_email)
    appendIfPresent(fd, 'contact_phone', contact_phone)
    fd.append('logo', logo)

    const res = await api.post<RegisterCompanyResponse>('/company/register/', fd, {
      transformRequest: [(data, headers) => {
        if (data instanceof FormData) {
          delete headers['Content-Type']
        }
        return data
      }],
    })
    return res.data
  }

  const body: Record<string, string> = { name }
  if (registration_number) body.registration_number = registration_number
  if (address) body.address = address
  if (contact_email) body.contact_email = contact_email
  if (contact_phone) body.contact_phone = contact_phone

  const res = await api.post<RegisterCompanyResponse>('/company/register/', body)
  return res.data
}

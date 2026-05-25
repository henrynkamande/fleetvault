import axios from 'axios'

function firstMessage(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return value[0]
  }
  return null
}

/** Keys DRF uses for whole-request messages (not per-field form keys). */
const GLOBAL_DRF_KEYS = new Set(['non_field_errors', 'detail'])

/** Flatten DRF-style `{ field: string[] }` errors into single strings per field. */
export function flattenFieldErrors(data: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (!data || typeof data !== 'object' || Array.isArray(data)) return out

  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    if (GLOBAL_DRF_KEYS.has(key)) continue
    const msg = firstMessage(val) ?? (typeof val === 'object' && val !== null ? firstMessage(Object.values(val)[0]) : null)
    if (msg) out[key] = msg
  }
  return out
}

/** Axios response body from DRF (field errors, detail, non_field_errors). */
export function getResponseErrorData(error: unknown): unknown {
  if (axios.isAxiosError(error)) return error.response?.data
  return undefined
}

/** Collect human-readable strings from typical DRF / Django validation JSON. */
function collectValidationStrings(data: unknown, out: string[], depth: number): void {
  if (depth > 8) return
  if (typeof data === 'string') {
    out.push(data)
    return
  }
  if (Array.isArray(data)) {
    for (const item of data) collectValidationStrings(item, out, depth + 1)
    return
  }
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    if (typeof o.message === 'string') out.push(o.message)
    for (const [k, v] of Object.entries(o)) {
      if (k === 'message' && typeof v === 'string') continue
      collectValidationStrings(v, out, depth + 1)
    }
  }
}

/** True if the server returned Django's HTML debug page or other non-JSON noise. */
function isLikelyHtmlOrDebugDump(text: string): boolean {
  const t = text.trim()
  if (t.startsWith('<!DOCTYPE') || t.startsWith('<html')) return true
  if (t.includes('DEFAULT_FROM_EMAIL') && t.includes('EMAIL_BACKEND')) return true
  if (t.length > 4000) return true
  return false
}

export function getErrorDetail(error: unknown): string {
  if (error == null) return ''
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const d = data as Record<string, unknown>
      if (typeof d.detail === 'string') return d.detail
      if (Array.isArray(d.detail) && d.detail.length > 0) {
        const first = d.detail[0]
        if (typeof first === 'string') return first
        if (first != null && typeof first === 'object' && 'string' in first) {
          return String((first as { string: string }).string)
        }
      }
      if (typeof d.error === 'string') return d.error
      const nf = firstMessage(d.non_field_errors)
      if (nf) return nf
      const collected: string[] = []
      collectValidationStrings(d, collected, 0)
      const firstReal = collected.find((s) => s.trim().length > 0)
      if (firstReal) return firstReal
    }
    if (typeof data === 'string' && data.trim()) {
      if (isLikelyHtmlOrDebugDump(data)) {
        return error.response?.status === 500
          ? 'Something went wrong on the server. Please try again later.'
          : 'Something went wrong. Please try again.'
      }
      return data
    }
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

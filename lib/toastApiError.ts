import { toast } from 'react-toastify'
import { flattenFieldErrors, getErrorDetail, getResponseErrorData } from './apiErrors'

/** Show a single error toast from a failed API call (DRF field errors or global messages). */
export function toastApiError(error: unknown): void {
  const data = getResponseErrorData(error)
  const fields = flattenFieldErrors(data)
  const fieldMsgs = Object.values(fields)
  const message =
    fieldMsgs.length > 0 ? fieldMsgs.slice(0, 4).join(' · ') : getErrorDetail(error)
  toast.error(message)
}

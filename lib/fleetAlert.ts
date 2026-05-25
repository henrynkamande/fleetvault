import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const fleetSwal = Swal.mixin({
  customClass: {
    popup: 'fleet-swal-popup',
    title: 'fleet-swal-title',
    htmlContainer: 'fleet-swal-text',
    confirmButton: 'fleet-swal-btn fleet-swal-btn-primary',
    cancelButton: 'fleet-swal-btn fleet-swal-btn-muted',
  },
  buttonsStyling: false,
})

export async function fleetConfirm(options: {
  title: string
  text?: string
  html?: string
  confirmText?: string
  cancelText?: string
  icon?: 'warning' | 'question'
}): Promise<boolean> {
  const result = await fleetSwal.fire({
    title: options.title,
    text: options.text,
    html: options.html,
    icon: options.icon ?? 'warning',
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'Yes, continue',
    cancelButtonText: options.cancelText ?? 'Cancel',
    reverseButtons: true,
    focusCancel: true,
  })
  return result.isConfirmed === true
}

export async function fleetAlertSuccess(title: string, text?: string): Promise<void> {
  await fleetSwal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'OK',
    timer: text ? undefined : 2200,
    timerProgressBar: !text,
  })
}

export async function fleetAlertError(title: string, text?: string): Promise<void> {
  await fleetSwal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
  })
}

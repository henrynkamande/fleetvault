import type { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from 'sweetalert2'

type FleetSwal = {
  fire: <T = unknown>(options: SweetAlertOptions) => Promise<SweetAlertResult<Awaited<T>>>
}

let fleetSwalPromise: Promise<FleetSwal> | null = null

async function getFleetSwal(): Promise<FleetSwal | null> {
  if (typeof window === 'undefined') return null
  if (!fleetSwalPromise) {
    fleetSwalPromise = (async () => {
      await import('sweetalert2/dist/sweetalert2.min.css')
      const { default: Swal } = await import('sweetalert2')
      return Swal.mixin({
        customClass: {
          popup: 'fleet-swal-popup',
          title: 'fleet-swal-title',
          htmlContainer: 'fleet-swal-text',
          confirmButton: 'fleet-swal-btn fleet-swal-btn-primary',
          cancelButton: 'fleet-swal-btn fleet-swal-btn-muted',
        },
        buttonsStyling: false,
        heightAuto: false,
      }) as FleetSwal
    })()
  }
  return fleetSwalPromise
}

export async function fleetConfirm(options: {
  title: string
  text?: string
  html?: string
  confirmText?: string
  cancelText?: string
  icon?: 'warning' | 'question'
}): Promise<boolean> {
  const fleetSwal = await getFleetSwal()
  if (!fleetSwal) return false
  const result = await fleetSwal.fire({
    title: options.title,
    text: options.text,
    html: options.html,
    icon: (options.icon ?? 'warning') as SweetAlertIcon,
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'Yes, continue',
    cancelButtonText: options.cancelText ?? 'Cancel',
    reverseButtons: true,
    focusCancel: true,
  })
  return result.isConfirmed === true
}

export async function fleetAlertSuccess(title: string, text?: string): Promise<void> {
  const fleetSwal = await getFleetSwal()
  if (!fleetSwal) return
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
  const fleetSwal = await getFleetSwal()
  if (!fleetSwal) return
  await fleetSwal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
  })
}

/** Clears SweetAlert2 UI so route changes are never blocked by a stale backdrop. */
export async function dismissFleetSwal(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const { default: Swal } = await import('sweetalert2')
    if (Swal.isVisible()) Swal.close()
  } catch {
    /* ignore */
  }
  document.body.classList.remove('swal2-shown', 'swal2-height-auto')
  document.body.style.removeProperty('padding-right')
}

import { useQuery } from '@tanstack/react-query'
import { STATIC_DRIVER_DASHBOARD } from '@/features/driver/driverStaticData'
import { useDriverStaticPreview } from '../useDriverStaticPreview'
import { fetchDriverDashboard } from '@/services/driverService'
import { getAccessToken } from '@/lib/tokenStorage'
import { useAuthStore } from '@/store/useAuthStore'

export function useDriverDashboardQuery() {
  const staticPreview = useDriverStaticPreview()
  const ready = useAuthStore((s) => s.ready)

  return useQuery({
    queryKey: ['driverDashboard'],
    queryFn: fetchDriverDashboard,
    enabled: ready && !!getAccessToken() && !staticPreview,
    staleTime: 30_000,
    initialData: staticPreview ? STATIC_DRIVER_DASHBOARD : undefined,
  })
}

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { AppRoutesPaths } from '@/route/paths'

type OptionalCompanyBannerProps = {
  className?: string
}

/** Shown when a fleet owner has not added formal company details yet. */
export function OptionalCompanyBanner({ className = '' }: OptionalCompanyBannerProps) {
  const userQuery = useCurrentUser()
  const user = userQuery.data

  if (!user || user.role !== 'FLEET_OWNER' || user.has_company) {
    return null
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-950 sm:flex-row sm:items-center sm:justify-between dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-100 ${className}`}
    >
      <p>
        <span className="font-semibold">Company details are optional.</span> You can add vehicles and drivers now, or
        register your business when you are ready.
      </p>
      <Link
        href={AppRoutesPaths.onboarding.registerCompany}
        className="inline-flex shrink-0 justify-center rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        Add company (optional)
      </Link>
    </div>
  )
}

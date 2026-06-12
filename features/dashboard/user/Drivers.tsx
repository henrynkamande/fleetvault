"use client";

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState } from 'react'
import { formatDriverEmailForDisplay } from '@/lib/userDisplay'
import { useDriversListQuery } from '@/hooks/queries/useDriversList'
import { useVehiclesQuery } from '@/hooks/queries/useVehicles'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { useDeactivateDriverMutation } from '@/hooks/queries/useDeactivateDriver'
import { fleetAlertSuccess, fleetConfirm } from '@/lib/fleetAlert'
import { getErrorDetail } from '@/lib/apiErrors'
import { toast } from 'react-toastify'
import { getAccessToken } from '@/lib/tokenStorage'
import { LoadingCard } from '@/components/ui/LoadingSpinner'
import { AppRoutesPaths } from '@/route/paths'
import { useAuthStore } from '@/store/useAuthStore'
import type { User } from '@/types/user'

const AddDriverModal = dynamic(() => import('./modals/AddDriverModal'), {
  ssr: false,
})

function initialsFromUser(u: User): string {
  const a = u.first_name?.[0] ?? ''
  const b = u.last_name?.[0] ?? ''
  const s = `${a}${b}`.toUpperCase()
  if (s) return s
  return u.email?.[0]?.toUpperCase() ?? '?'
}

function statusBadgeClasses(isActive: boolean): string {
  if (isActive) return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  return 'bg-slate-100 text-slate-600 ring-slate-200'
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 17h14v-5l-2-4H7l-2 4v5zM7 17v2a1 1 0 001 1h1a1 1 0 001-1v-2M15 17v2a1 1 0 001 1h1a1 1 0 001-1v-2M3 13h18" strokeLinecap="round" />
    </svg>
  )
}

function DriverCard({
  user,
  assignedVehicle,
  onViewProfile,
  onDelete,
  deletePending,
}: {
  user: User
  assignedVehicle: string
  onViewProfile: () => void
  onDelete?: (user: User) => void
  deletePending?: boolean
}) {
  const isUnassigned = assignedVehicle === 'Unassigned'
  const displayEmail = formatDriverEmailForDisplay(user.email)

  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#fbbd26]/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#fff8e6] to-[#fde68a] text-sm font-semibold text-[#111827] ring-2 ring-[#fbbd26]/30">
            {initialsFromUser(user)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-[#111827]">{user.full_name}</p>
            <p className="truncate text-sm text-gray-700">{user.phone_number}</p>
            {displayEmail ? <p className="truncate text-xs text-gray-500">{displayEmail}</p> : null}
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClasses(user.is_active)}`}
        >
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-start gap-2 text-gray-700">
          <CarIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
          <div className="min-w-0 flex-1">
            <span className="text-gray-500">Assigned vehicle</span>
            <p className={`font-medium ${isUnassigned ? 'text-slate-500' : 'text-[#111827]'}`}>{assignedVehicle}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onViewProfile}
          className="inline-flex flex-1 justify-center rounded-lg border border-[#fbbd26]/70 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-[#fff8e6] hover:text-[#111827]"
        >
          View profile
        </button>
        {onDelete && user.is_active ? (
          <button
            type="button"
            onClick={() => onDelete(user)}
            disabled={deletePending}
            className="inline-flex flex-1 justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
          >
            Remove
          </button>
        ) : null}
      </div>
    </article>
  )
}

type StatusFilter = 'All' | 'Active' | 'Inactive'

export default function Drivers() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false)

  const authReady = useAuthStore((s) => s.ready)
  const authVersion = useAuthStore((s) => s.version)
  void authVersion
  const hasToken = Boolean(getAccessToken())

  const driversQuery = useDriversListQuery()
  const vehiclesQuery = useVehiclesQuery(undefined)

  const vehicleByDriverId = useMemo(() => {
    const m = new Map<string, string>()
    for (const v of vehiclesQuery.data?.vehicles ?? []) {
      if (v.assigned_driver) {
        const label = `${v.make} ${v.model} (${v.registration_number})`
        m.set(v.assigned_driver, label)
      }
    }
    return m
  }, [vehiclesQuery.data?.vehicles])

  const userQuery = useCurrentUser()
  const isFleetOwner = userQuery.data?.role === 'FLEET_OWNER'
  const deactivateMutation = useDeactivateDriverMutation()

  async function handleRemoveDriver(user: User) {
    const confirmed = await fleetConfirm({
      title: 'Remove this driver?',
      html: `<p class="text-sm text-slate-600"><strong>${user.full_name}</strong> will be deactivated and can no longer sign in. You can re-invite them later if needed.</p>`,
      confirmText: 'Yes, remove',
      cancelText: 'Cancel',
      icon: 'warning',
    })
    if (!confirmed) return
    try {
      const data = await deactivateMutation.mutateAsync(user.id)
      await fleetAlertSuccess('Driver removed', data.message)
    } catch (err) {
      toast.error(getErrorDetail(err) ?? 'Could not remove driver.')
    }
  }

  const filteredDrivers = useMemo(() => {
    const users = driversQuery.data?.users ?? []
    return users.filter((u) => {
      const matchesStatus =
        statusFilter === 'All' ? true : statusFilter === 'Active' ? u.is_active : !u.is_active
      const q = searchTerm.trim().toLowerCase()
      const hay = `${u.full_name} ${u.phone_number} ${u.email} ${u.id}`.toLowerCase()
      const matchesSearch = q.length === 0 ? true : hay.includes(q)
      return matchesStatus && matchesSearch
    })
  }, [driversQuery.data?.users, searchTerm, statusFilter])

  return (
    <>
    <section className="space-y-4 rounded-2xl p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-xl font-semibold text-[#111827]">Drivers</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddDriverOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a] focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/50"
              >
                <span className="text-base leading-none">+</span>
                Add New Driver
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search drivers..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 sm:max-w-sm"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 sm:w-44"
            >
              <option value="All">Status: All</option>
              <option value="Active">Status: Active</option>
              <option value="Inactive">Status: Inactive</option>
            </select>
          </div>
        </div>

        {!authReady ? (
          <LoadingCard />
        ) : !hasToken ? (
          <p className="rounded-2xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-600 shadow-sm">
            Sign in as a vehicle owner to load drivers.{' '}
            <Link href={AppRoutesPaths.auth.signin} className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        ) : driversQuery.isPending ? (
          <LoadingCard />
        ) : driversQuery.isError ? (
          <p className="rounded-2xl border border-rose-100 bg-rose-50 py-12 text-center text-sm text-rose-800 shadow-sm">
            {getErrorDetail(driversQuery.error)}
          </p>
        ) : driversQuery.isSuccess && driversQuery.data.users.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-600 shadow-sm">
            No drivers in your company yet. Add a driver to get started.
          </p>
        ) : filteredDrivers.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-600 shadow-sm">
            No drivers match your filters.
          </p>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {filteredDrivers.map((u) => (
              <DriverCard
                key={u.id}
                user={u}
                assignedVehicle={
                  vehicleByDriverId.get(u.driver_profile_id ?? u.id) ?? 'Unassigned'
                }
                onViewProfile={() => router.push(AppRoutesPaths.dashboard.driverProfile(u.id))}
                onDelete={isFleetOwner ? handleRemoveDriver : undefined}
                deletePending={deactivateMutation.isPending}
              />
            ))}
          </section>
        )}
      </section>

      <AddDriverModal isOpen={isAddDriverOpen} onClose={() => setIsAddDriverOpen(false)} />
    </>
  )
}

"use client";

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation';
import { useDeferredValue, useMemo, useState } from 'react'
import { useVehiclesQuery } from '@/hooks/queries/useVehicles'
import type { VehicleApiStatus, VehicleListDto } from '@/types/vehicle'
import {
  formatOdometerKm,
  vehicleStatusLabel,
  vehicleTypeLabel,
} from '@/lib/vehicleDisplay'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { useDeleteVehicleMutation } from '@/hooks/queries/useDeleteVehicle'
import { fleetAlertSuccess, fleetConfirm } from '@/lib/fleetAlert'
import { getErrorDetail } from '@/lib/apiErrors'
import { toast } from 'react-toastify'
import { AppRoutesPaths } from '@/route/paths'
import { LoadingCard } from "@/components/ui/LoadingSpinner"

const AddVehicleModal = dynamic(() => import('./modals/AddVehicleModal'), {
  ssr: false,
})

const VEHICLES_PAGE_SIZE = 24

type UiStatusFilter = 'All' | 'Active' | 'Maintenance' | 'Inactive' | 'Out of service'

type VehicleCardProps = {
  vehicle: VehicleListDto
  onViewProfile: (vehicleId: string) => void
  onDelete?: (vehicle: VehicleListDto) => void
  deletePending?: boolean
}

function statusBadgeClasses(status: VehicleApiStatus): string {
  if (status === 'ACTIVE') return 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900'
  if (status === 'UNDER_MAINTENANCE') return 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900'
  if (status === 'OUT_OF_SERVICE') return 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
  return 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
}

function VehicleCard({ vehicle, onViewProfile, onDelete, deletePending }: VehicleCardProps) {
  const driverLabel = vehicle.assigned_driver_name?.trim() || 'Unassigned'

  return (
    <article className="ff-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold ff-heading">{vehicle.registration_number}</p>
            <p className="truncate text-sm text-slate-700 dark:text-slate-300">
              {vehicle.make} {vehicle.model}
              {vehicle.year ? ` (${vehicle.year})` : ''}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClasses(vehicle.status)}`}
        >
          {vehicleStatusLabel(vehicle.status)}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="ff-muted">Assigned Driver</span>
          <span className={driverLabel === 'Unassigned' ? 'font-medium ff-muted' : 'font-semibold text-slate-700 dark:text-slate-300'}>
            {driverLabel}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="ff-muted">Updated</span>
          <span className="text-right text-xs font-medium text-slate-700 dark:text-slate-300">
            {vehicle.updated_at ? new Date(vehicle.updated_at).toLocaleString() : '—'}
          </span>
        </div>
      </div>

      <div className="ff-panel mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs ff-muted">Color</p>
          <p className="text-sm font-semibold ff-heading">{vehicle.color}</p>
        </div>
        <div>
          <p className="text-xs ff-muted">Odometer</p>
          <p className="text-sm font-semibold ff-heading">{formatOdometerKm(vehicle.current_odometer)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs ff-muted">Vehicle type</p>
          <p className="text-sm font-semibold ff-heading">{vehicleTypeLabel(vehicle.vehicle_type)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => onViewProfile(vehicle.id)}
          className="inline-flex flex-1 justify-center rounded-lg border border-[#fbbd26]/70 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#fff8e6] hover:text-[#111827] dark:text-slate-200 dark:hover:bg-amber-950/30 dark:hover:text-slate-100"
        >
          View Profile
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(vehicle)}
            disabled={deletePending}
            className="inline-flex flex-1 justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70"
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  )
}

function AddVehicleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a] focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/50"
    >
      <span className="text-base leading-none">+</span>
      Add New Vehicle
    </button>
  )
}

export default function Vehicles() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [statusFilter, setStatusFilter] = useState<UiStatusFilter>('All')
  const [page, setPage] = useState(1)
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false)

  const apiStatus: VehicleApiStatus | undefined =
    statusFilter === 'All'
      ? undefined
      : statusFilter === 'Active'
        ? 'ACTIVE'
        : statusFilter === 'Maintenance'
          ? 'UNDER_MAINTENANCE'
          : statusFilter === 'Inactive'
            ? 'INACTIVE'
            : 'OUT_OF_SERVICE'

  const userQuery = useCurrentUser()
  const isFleetOwner = userQuery.data?.role === 'FLEET_OWNER'
  const deleteVehicleMutation = useDeleteVehicleMutation()
  const vehiclesQuery = useVehiclesQuery({
    status: apiStatus,
    search: deferredSearchTerm,
    page,
    page_size: VEHICLES_PAGE_SIZE,
  })
  const vehicles = useMemo(() => vehiclesQuery.data?.vehicles ?? [], [vehiclesQuery.data?.vehicles])
  const totalPages = vehiclesQuery.data?.total_pages ?? 1

  async function handleDeleteVehicle(vehicle: VehicleListDto) {
    const confirmed = await fleetConfirm({
      title: 'Delete this vehicle?',
      html: `<p class="text-sm text-slate-600"><strong>${vehicle.registration_number}</strong> will be permanently removed. Trips linked to this vehicle must be handled first.</p>`,
      confirmText: 'Yes, delete',
      cancelText: 'Cancel',
      icon: 'warning',
    })
    if (!confirmed) return
    try {
      const data = await deleteVehicleMutation.mutateAsync(vehicle.id)
      await fleetAlertSuccess('Vehicle deleted', data.message)
    } catch (err) {
      toast.error(getErrorDetail(err) ?? 'Could not delete vehicle.')
    }
  }

  function goToVehicleProfile(vehicleId: string) {
    router.push(AppRoutesPaths.dashboard.vehicleProfile(vehicleId))
  }

  return (
    <>
    <section className="space-y-4 rounded-2xl p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold ff-heading">Vehicles</h2>
            <AddVehicleButton onClick={() => setIsAddVehicleModalOpen(true)} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setPage(1)
              }}
              placeholder="Search vehicles..."
              className="ff-field w-full sm:max-w-sm"
            />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as UiStatusFilter)
                setPage(1)
              }}
              className="ff-field sm:min-w-[12rem]"
            >
              <option value="All">Status: All</option>
              <option value="Active">Status: Active</option>
              <option value="Maintenance">Status: Maintenance</option>
              <option value="Inactive">Status: Inactive</option>
              <option value="Out of service">Status: Out of service</option>
            </select>
          </div>
        </div>

        {vehiclesQuery.isPending ? (
          <LoadingCard className="border-0 bg-transparent shadow-none" />
        ) : vehiclesQuery.isError ? (
          <p className="ff-alert-danger" role="alert">
            {getErrorDetail(vehiclesQuery.error) || 'Could not load vehicles. Check that you are signed in and the API is running.'}
          </p>
        ) : vehicles.length === 0 && !searchTerm.trim() && statusFilter === 'All' ? (
          <p className="text-sm ff-muted">
            No vehicles yet. Use <span className="font-semibold">Add New Vehicle</span> to add your first one.
          </p>
        ) : vehicles.length === 0 ? (
          <p className="text-sm ff-muted">No vehicles match your filters.</p>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  onViewProfile={goToVehicleProfile}
                  onDelete={isFleetOwner ? handleDeleteVehicle : undefined}
                  deletePending={deleteVehicleMutation.isPending}
                />
              ))}
            </section>
            {(vehiclesQuery.data?.count ?? 0) > VEHICLES_PAGE_SIZE ? (
              <div className="flex flex-col gap-2 pt-2 text-sm ff-muted sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Page {vehiclesQuery.data?.page ?? page} of {totalPages} · {vehiclesQuery.data?.count ?? 0} vehicles
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="ff-secondary-btn"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    className="ff-secondary-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
      />
    </>
  )
}

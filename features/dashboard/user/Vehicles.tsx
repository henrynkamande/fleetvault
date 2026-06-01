"use client";

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react'
import AddVehicleModal from './modals/AddVehicleModal'
import { useVehiclesQuery } from '@/hooks/queries/useVehicles'
import type { VehicleApiStatus, VehicleDto } from '@/types/vehicle'
import {
  formatOdometerKm,
  vehicleImageUrl,
  vehicleStatusLabel,
  vehicleTypeLabel,
} from '@/lib/vehicleDisplay'
import { OptionalCompanyBanner } from '@/components/onboarding/OptionalCompanyBanner'
import { getErrorDetail } from '@/lib/apiErrors'
import { AppRoutesPaths } from '@/route/paths'
import { LoadingCard, LoadingSpinner, LoadingState } from "@/components/ui/LoadingSpinner"

type UiStatusFilter = 'All' | 'Active' | 'Maintenance' | 'Inactive' | 'Out of service'

type VehicleCardProps = {
  vehicle: VehicleDto
  onViewProfile: (vehicleId: string) => void
}

function statusBadgeClasses(status: VehicleApiStatus): string {
  if (status === 'ACTIVE') return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  if (status === 'UNDER_MAINTENANCE') return 'bg-amber-100 text-amber-700 ring-amber-200'
  if (status === 'OUT_OF_SERVICE') return 'bg-slate-100 text-slate-600 ring-slate-200'
  return 'bg-slate-100 text-slate-600 ring-slate-200'
}

function VehicleCard({ vehicle, onViewProfile }: VehicleCardProps) {
  const driverLabel = vehicle.assigned_driver_name?.trim() || 'Unassigned'
  const imgUrl = vehicleImageUrl(vehicle)

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {imgUrl ? (
            <img src={imgUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold text-[#111827]">{vehicle.registration_number}</p>
            <p className="truncate text-sm text-gray-700">
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
          <span className="text-gray-500">Assigned Driver</span>
          <span className={driverLabel === 'Unassigned' ? 'font-medium text-slate-500' : 'font-semibold text-gray-700'}>
            {driverLabel}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">Company</span>
          <span className="text-right font-medium text-gray-700">{vehicle.company_name ?? '—'}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">Updated</span>
          <span className="text-right text-xs font-medium text-gray-700">
            {vehicle.updated_at ? new Date(vehicle.updated_at).toLocaleString() : '—'}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f8fafc] p-3">
        <div>
          <p className="text-xs text-gray-500">Color</p>
          <p className="text-sm font-semibold text-[#111827]">{vehicle.color}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Odometer</p>
          <p className="text-sm font-semibold text-[#111827]">{formatOdometerKm(vehicle.current_odometer)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500">Vehicle type</p>
          <p className="text-sm font-semibold text-[#111827]">{vehicleTypeLabel(vehicle.vehicle_type)}</p>
        </div>
      </div>

      {vehicle.notes ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">{vehicle.notes}</p>
      ) : null}

      <button
        type="button"
        onClick={() => onViewProfile(vehicle.id)}
        className="mt-4 inline-flex w-full justify-center rounded-lg border border-[#fbbd26]/70 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-[#fff8e6] hover:text-[#111827]"
      >
        View Profile
      </button>
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
  const [statusFilter, setStatusFilter] = useState<UiStatusFilter>('All')
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

  const vehiclesQuery = useVehiclesQuery(apiStatus)
  const vehicles = vehiclesQuery.data?.vehicles ?? []

  const filteredVehicles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (q.length === 0) return vehicles
    return vehicles.filter((v) => {
      const hay = `${v.registration_number} ${v.make} ${v.model} ${v.assigned_driver_name ?? ''} ${v.company_name ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [vehicles, searchTerm])

  function goToVehicleProfile(vehicleId: string) {
    router.push(AppRoutesPaths.dashboard.vehicleProfile(vehicleId))
  }

  return (
    <>
    <section className="space-y-4 rounded-2xl p-4">
        <OptionalCompanyBanner className="mb-1" />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-[#111827]">Vehicles</h2>
            <AddVehicleButton onClick={() => setIsAddVehicleModalOpen(true)} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search vehicles..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 sm:max-w-sm"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as UiStatusFilter)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 sm:min-w-[12rem]"
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
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
            {getErrorDetail(vehiclesQuery.error) || 'Could not load vehicles. Check that you are signed in and the API is running.'}
          </p>
        ) : vehicles.length === 0 ? (
          <p className="text-sm text-gray-600">
            No vehicles yet. Use <span className="font-semibold">Add New Vehicle</span> to add your first one — company registration is optional.
          </p>
        ) : filteredVehicles.length === 0 ? (
          <p className="text-sm text-gray-600">No vehicles match your filters.</p>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onViewProfile={goToVehicleProfile} />
            ))}
          </section>
        )}
      </section>
      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
      />
    </>
  )
}

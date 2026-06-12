"use client";

type TrendPoint = {
  day: string
  netProfit: number
  trips: number
}

type DriverProfileData = {
  name: string
  role: string
  driverId: string
  status: 'Active' | 'Off Duty'
  contact: {
    email: string
    phone: string
    address: string
  }
  vehicle: {
    model: string
    plate: string
  }
  documents: {
    licenseNo: string
    licenseExpiry: string
    nationalIdNo: string
    nationalIdStatus: string
  }
  performance: {
    totalTrips: { value: number; delta: string; positive: boolean }
    netProfit: { value: string; delta: string; positive: boolean }
    hoursLogged: { value: string; warning: boolean }
    driverScore: { value: string; rating: string }
  }
  trends: TrendPoint[]
}

type DriverProfileProps = {
  isOpen: boolean
  onClose: () => void
  driver: DriverProfileData
}

function DriverProfileHeader({
  name,
  role,
  driverId,
  status,
  onClose,
}: Pick<DriverProfileData, 'name' | 'role' | 'driverId' | 'status'> & { onClose: () => void }) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
      <div>
        <h2 className="text-xl font-semibold text-[#111827]">{name}</h2>
        <p className="text-sm text-gray-700">
          {driverId} • {role}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${status === 'Active' ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
          {status}
        </span>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
    </div>
  )
}

function DriverContactInfo({ contact }: Pick<DriverProfileData, 'contact'>) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Contact Information</h3>
      <div className="space-y-2 text-sm text-gray-700">
        <p>{contact.email}</p>
        <p>{contact.phone}</p>
        <p>{contact.address}</p>
      </div>
    </section>
  )
}

function DriverVehicleInfo({ vehicle }: Pick<DriverProfileData, 'vehicle'>) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Assigned Vehicle</h3>
      <p className="text-sm font-semibold text-[#111827]">{vehicle.model}</p>
      <p className="text-sm text-gray-700">Plate: {vehicle.plate}</p>
    </section>
  )
}

function DriverDocuments({ documents }: Pick<DriverProfileData, 'documents'>) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">KYC &amp; Documents</h3>
      <div className="space-y-3 text-sm text-gray-700">
        <div>
          <p className="font-semibold text-[#111827]">Driver&apos;s License</p>
          <p>No: {documents.licenseNo}</p>
          <p>Expires: {documents.licenseExpiry}</p>
        </div>
        <div>
          <p className="font-semibold text-[#111827]">National ID</p>
          <p>No: {documents.nationalIdNo}</p>
          <p className="text-emerald-700">{documents.nationalIdStatus}</p>
        </div>
      </div>
    </section>
  )
}

function PerformanceStat({
  label,
  value,
  meta,
  positive,
}: {
  label: string
  value: string
  meta: string
  positive?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#111827]">{value}</p>
      <p className={`mt-1 text-xs font-medium ${positive === undefined ? 'text-slate-500' : positive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {meta}
      </p>
    </div>
  )
}

function DriverPerformanceOverview({ performance }: Pick<DriverProfileData, 'performance'>) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Performance Overview (This Week)</h3>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <PerformanceStat
          label="Total Trips"
          value={String(performance.totalTrips.value)}
          meta={performance.totalTrips.delta}
          positive={performance.totalTrips.positive}
        />
        <PerformanceStat
          label="Net Profit"
          value={performance.netProfit.value}
          meta={performance.netProfit.delta}
          positive={performance.netProfit.positive}
        />
        <PerformanceStat
          label="Hours Logged"
          value={performance.hoursLogged.value}
          meta={performance.hoursLogged.warning ? 'Nearing weekly limit' : 'Within weekly limit'}
          positive={!performance.hoursLogged.warning}
        />
        <PerformanceStat
          label="Driver Score"
          value={performance.driverScore.value}
          meta={performance.driverScore.rating}
          positive
        />
      </div>
    </section>
  )
}

function buildPolyline(points: number[], max: number, min: number, width: number, height: number): string {
  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width
      const normalized = max === min ? 0.5 : (point - min) / (max - min)
      const y = height - normalized * height
      return `${x},${y}`
    })
    .join(' ')
}

function DriverTrendsChart({ trends }: Pick<DriverProfileData, 'trends'>) {
  const chartWidth = 520
  const chartHeight = 180
  const netProfitValues = trends.map((t) => t.netProfit)
  const tripValues = trends.map((t) => t.trips)
  const allValues = [...netProfitValues, ...tripValues]
  const max = Math.max(...allValues)
  const min = Math.min(...allValues)
  const netProfitLine = buildPolyline(netProfitValues, max, min, chartWidth, chartHeight)
  const tripsLine = buildPolyline(tripValues, max, min, chartWidth, chartHeight)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Trips &amp; Profit Trends</h3>
        <div className="flex gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-600" />Net Profit ($)</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Trips Completed</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 28}`} className="min-w-[520px]">
          <polyline fill="none" stroke="#16a34a" strokeWidth="3" points={netProfitLine} />
          <polyline fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" points={tripsLine} />
          {trends.map((point, index) => {
            const x = (index / (trends.length - 1)) * chartWidth
            return (
              <text key={point.day} x={x} y={chartHeight + 22} textAnchor="middle" className="fill-slate-500 text-[10px]">
                {point.day}
              </text>
            )
          })}
        </svg>
      </div>
    </section>
  )
}

function DriverActions() {
  return (
    <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-6 py-4">
      <button type="button" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
        Log New Trip
      </button>
      <button type="button" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
        View Full Logbook
      </button>
      <button type="button" className="rounded-lg bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a]">
        Add Expense/Income
      </button>
    </div>
  )
}

export default function DriverProfile({ isOpen, onClose, driver }: DriverProfileProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4">
      <div className="w-full max-w-6xl rounded-2xl bg-gradient-to-b from-[#D2D2D2] to-[#F9F9F9] p-4 shadow-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white">
          <DriverProfileHeader
            name={driver.name}
            role={driver.role}
            driverId={driver.driverId}
            status={driver.status}
            onClose={onClose}
          />

          <div className="grid gap-4 px-6 py-5 xl:grid-cols-[1.3fr_2fr]">
            <div className="space-y-4">
              <DriverContactInfo contact={driver.contact} />
              <DriverVehicleInfo vehicle={driver.vehicle} />
              <DriverDocuments documents={driver.documents} />
            </div>
            <div className="space-y-4">
              <DriverPerformanceOverview performance={driver.performance} />
              <DriverTrendsChart trends={driver.trends} />
            </div>
          </div>

          <DriverActions />
        </div>
      </div>
    </div>
  )
}

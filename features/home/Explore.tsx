import { FaArrowRight } from 'react-icons/fa'
const fleetImage = '/fleet-hero.png'
import { APP_NAME } from '@/lib/constants'

export default function Explore() {
  return (
    <section id="explore" className="flex w-full items-center justify-center bg-[#F9F9F9] py-[5vw]">
      <div className="relative h-[980px] w-[92vw] overflow-hidden rounded-[30px] bg-[#2f5aab] sm:h-[700px] sm:w-[88vw] md:h-[52vw] md:w-[79.72vw] md:rounded-[2.78vw]">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0d2f6eb8] via-[#0d2f6e7e] to-[#0d2f6e1a]" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        <div className="absolute left-[16px] top-[24px] z-30 flex max-w-[92%] flex-col gap-4 sm:left-[6vw] sm:top-[6vw] sm:max-w-[48%] sm:gap-[1.2rem] md:left-[5vw] md:top-[5vw] md:max-w-[36vw] md:gap-6">
          <h1 className="mt-[10vw] font-title text-[48px] font-bold leading-[105%] tracking-[-0.02em] text-[#FDFCFA] sm:mt-[5vw] sm:text-[4.2vw] md:mt-0 md:text-[4.44vw]">
            One platform. Endless fleet possibilities.
          </h1>

          <p className="max-w-[100%] font-title text-[18px] font-normal leading-[135%] tracking-[0.01em] text-[#FDFCFA] sm:max-w-[80%] sm:text-[1.3vw] md:max-w-[30vw] md:text-[1.04vw]">
            {APP_NAME} brings driver management, vehicles, trip logs, and finances together so your team can operate from a single source of truth.
          </p>

          <div className="z-20 mt-6 grid grid-cols-1 gap-y-4 sm:mt-[3vw] sm:grid-cols-2 sm:gap-x-[4vw] sm:gap-y-[2vw] md:mt-[2vw] md:grid-rows-2 md:gap-x-[1vw] md:gap-y-[0.8vw]">
            <div className="flex h-[180px] w-full flex-col justify-center rounded-[20px] border border-white/25 bg-white/12 p-[16px] backdrop-blur-md sm:h-[15vw] sm:w-[28vw] sm:rounded-[1.8vw] sm:p-[2vw] md:h-auto md:w-[17vw] md:rounded-[1.5vw] md:p-[1.2vw]">
              <h2 className="mb-[0.8vw] font-title text-[22px] font-semibold leading-[115%] text-[#FDFCFA] sm:text-[2.2vw] md:text-[1.25vw]">
                Run Your Fleet
              </h2>
              <p className="font-title text-[18px] font-normal leading-[145%] text-[#FDFCFA]/90 sm:text-[1.35vw] md:text-[1.04vw]">
                Manage assignments, compliance, and utilization from one dashboard.
              </p>
            </div>

            <div className="flex h-[180px] w-full flex-col justify-center rounded-[20px] border border-white/25 bg-white/12 p-[16px] backdrop-blur-md sm:h-[15vw] sm:w-[28vw] sm:rounded-[1.8vw] sm:p-[2vw] md:h-auto md:w-[17vw] md:rounded-[1.5vw] md:p-[1.2vw]">
              <h2 className="mb-[0.8vw] font-title text-[22px] font-semibold leading-[115%] text-[#FDFCFA] sm:text-[2.2vw] md:text-[1.25vw]">
                Log Trips Without GPS
              </h2>
              <p className="font-title text-[18px] font-normal leading-[145%] text-[#FDFCFA]/90 sm:text-[1.35vw] md:text-[1.04vw]">
                Capture trip and odometer records while keeping driver privacy intact.
              </p>
            </div>

            <div className="flex h-[180px] w-full flex-col justify-center rounded-[20px] border border-white/25 bg-white/12 p-[16px] backdrop-blur-md sm:h-[15vw] sm:w-[28vw] sm:rounded-[1.8vw] sm:p-[2vw] md:h-auto md:w-[17vw] md:rounded-[1.5vw] md:p-[1.2vw]">
              <h2 className="mb-[0.8vw] font-title text-[22px] font-semibold leading-[115%] text-[#FDFCFA] sm:text-[2.2vw] md:text-[1.25vw]">
                Track Profitability
              </h2>
              <p className="font-title text-[18px] font-normal leading-[145%] text-[#FDFCFA]/90 sm:text-[1.35vw] md:text-[1.04vw]">
                Understand revenue, expenses, and margins per route, driver, and vehicle.
              </p>
            </div>

            <button
              className="mt-6 flex h-[56px] w-[262px] items-center justify-center gap-[10px] rounded-[40px] bg-white text-[18px] font-medium text-[#2f5aab] transition-all duration-200 hover:bg-[#f1f5ff] sm:ml-[2vw] sm:mt-[4vw] sm:h-[6vw] sm:w-[20vw] sm:text-[1.1vw] md:ml-[3vw] md:mt-[2vw] md:h-[3.3vw] md:w-[14vw] md:gap-[1vw] md:rounded-[2vw] md:text-[0.95vw]"
              type="button"
            >
              <span>Explore the platform</span>
              <FaArrowRight />
            </button>
          </div>
        </div>

        <img
          src={fleetImage}
          alt={`${APP_NAME} explore section visual`}
          className="absolute inset-0 z-0 h-full w-full object-cover object-top"
        />
      </div>
    </section>
  )
}

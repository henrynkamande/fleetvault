import { FaArrowDown } from 'react-icons/fa6'
import Navbar from '@/components/ui/Navbar'
import { APP_NAME } from '@/lib/constants'

const fleetImage = '/fleet-hero.png'

export default function Hero() {
  return (
    <section id="hero" className="w-full bg-gradient-to-b from-[#D2D2D2] to-[#F9F9F9] pb-[4vw]">
      <Navbar />

      <div className="mx-auto mb-[6vw] mt-[15vw] flex w-[92vw] max-w-[1280px] flex-col sm:mt-[6vw] md:mt-[3.8vw]">
        <div className="flex flex-col items-center gap-[6vw] text-center sm:gap-[1.15vw] md:gap-[1.15vw]">
          <h1
            className="max-w-[90vw] break-words pl-[3vw] font-title text-left text-[17vw] font-bold leading-[100%] tracking-[-0.02em] text-gray-900 sm:max-w-none sm:text-[10.7vw] md:max-w-[64.5vw] md:text-[5.67vw]"
          >
            Full fleet control. Zero driver surveillance.
          </h1>
          <p className="max-w-[86vw] font-title text-left text-[4.8vw] font-normal leading-[100%] tracking-[0.015em] text-gray-900 sm:max-w-[70.5vw] sm:text-[2.9vw] md:max-w-[55.6vw] md:text-[1.2vw]">
            {APP_NAME} is the all-in-one GPS-free platform to manage drivers, vehicles, trips, and fleet finances with total operational control.
          </p>
        </div>

        <div className="mt-[10vw] flex flex-col gap-[10vw] md:mt-[4vw] md:flex-row md:justify-center md:gap-[1vw]">
          <div className="flex w-full flex-col gap-[3vw] rounded-[5vw] border border-white/70 bg-white/75 p-[5vw] shadow-[1.94vw_1.94vw_3.47vw_0px_rgba(0,0,0,0.06)] backdrop-blur-[5.2vw] sm:rounded-[3vw] md:w-[39.3vw] md:rounded-[2.78vw] md:p-[3vw]">
            <div>
              <h2 className="text-[6vw] font-semibold text-gray-900 sm:text-[3vw] md:text-[1.8vw]">Get started as</h2>
              <p className="mt-1 text-[3.5vw] text-gray-600 sm:text-[1.9vw] md:text-[0.95vw]">
                Pick your operating profile and launch in minutes.
              </p>
            </div>

            <div className="rounded-[1.56vw] border border-[#E5E7EB] bg-white p-[4vw] md:p-[1.2vw]">
              <div className="flex items-start gap-[1vw]">
                <span className="mt-1 h-[1.4vw] w-[1.4vw] rounded-full bg-[#2f5aab]" />
                <div>
                  <h3 className="font-title text-[5vw] font-semibold leading-[110%] tracking-[0.015em] text-gray-900 sm:text-[2.5vw] md:text-[1.4vw]">
                    Fleet Owner
                  </h3>
                  <p className="mt-1 font-title text-[3.8vw] font-normal leading-[120%] tracking-[0.012em] text-gray-700 sm:text-[1.9vw] md:text-[0.95vw]">
                    I own vehicles and need operations visibility, utilization insights, and profitability tracking.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.56vw] border border-[#E5E7EB] bg-white p-[4vw] md:p-[1.2vw]">
              <div className="flex items-start gap-[1vw]">
                <span className="mt-1 h-[1.4vw] w-[1.4vw] rounded-full bg-[#fbbd26]" />
                <div>
                  <h3 className="font-title text-[5vw] font-semibold leading-[110%] tracking-[0.015em] text-gray-900 sm:text-[2.5vw] md:text-[1.4vw]">
                    Fleet Manager
                  </h3>
                  <p className="mt-1 font-title text-[3.8vw] font-normal leading-[120%] tracking-[0.012em] text-gray-700 sm:text-[1.9vw] md:text-[0.95vw]">
                    I coordinate drivers, monitor trip logs, and keep compliance and operational workflows on track.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[2vw] rounded-[1.56vw] bg-[#0f172a] p-[3vw] text-white md:gap-[0.8vw] md:p-[1vw]">
              <div>
                <p className="text-[4.2vw] font-semibold sm:text-[2.2vw] md:text-[1.1vw]">24/7</p>
                <p className="text-[2.9vw] text-slate-300 sm:text-[1.5vw] md:text-[0.75vw]">Ops visibility</p>
              </div>
              <div>
                <p className="text-[4.2vw] font-semibold sm:text-[2.2vw] md:text-[1.1vw]">GPS-Free</p>
                <p className="text-[2.9vw] text-slate-300 sm:text-[1.5vw] md:text-[0.75vw]">Privacy-first</p>
              </div>
              <div>
                <p className="text-[4.2vw] font-semibold sm:text-[2.2vw] md:text-[1.1vw]">Real-time</p>
                <p className="text-[2.9vw] text-slate-300 sm:text-[1.5vw] md:text-[0.75vw]">Trip records</p>
              </div>
            </div>
          </div>

          <div
            className="relative box-border flex h-[460px] w-full items-end justify-start overflow-hidden rounded-[5vw] bg-cover bg-center p-[4vw] shadow-[1.94vw_1.94vw_3.47vw_0px_rgba(0,0,0,0.1)] sm:h-[62vw] sm:w-[82vw] sm:rounded-[3vw] md:h-[44.3vw] md:w-[38.4vw] md:rounded-[2.78vw] md:p-[2.4vw]"
            style={{ backgroundImage: `url(${fleetImage})` }}
          >
            <h2 className="h-[168px] w-[385px] text-[44px] font-semibold leading-[100%] tracking-[-0.01em] text-white sm:h-auto sm:max-w-[27.7vw] sm:text-[4.4vw] md:max-w-[26.7vw] md:text-[3.33vw]">
              One platform. Endless ways to move.
            </h2>
          </div>
        </div>
      </div>

      <div className="mt-[6vw] flex flex-col items-center gap-[5vw] text-gray-700 sm:gap-[3vw] md:mt-[5vw]">
        <p className="font-title text-[6.8vw] font-light leading-[100%] text-black sm:text-[3.2vw] md:text-[0.94vw]">
          Learn more
        </p>
        <FaArrowDown className="h-[6.4vw] w-[6.4vw] text-gray-900 sm:h-[2.5vw] sm:w-[2.5vw] md:h-[1.25vw] md:w-[1.25vw]" />
      </div>
    </section>
  )
}

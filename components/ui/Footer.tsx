import Link from 'next/link'
import { FaFacebookF, FaXTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa6'
import { APP_MARKETING_URL, APP_NAME } from '@/lib/constants'
import { AppRoutesPaths } from '@/route/paths'
import { MARKETING_CONTAINER } from '@/lib/marketingLayout'

function FleetVaultMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 rounded-xl bg-white p-1" role="img" aria-label={`${APP_NAME} mark`}>
      <rect x="5" y="10" width="26" height="18" rx="4" fill="#111827" />
      <circle cx="14" cy="31" r="4" fill="#fbbd26" />
      <circle cx="28" cy="31" r="4" fill="#fbbd26" />
      <path d="M31 16h8l4 6v6h-12z" fill="#f59e0b" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-white py-16 text-gray-700" id="docs">
      <div className={`grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 ${MARKETING_CONTAINER}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FleetVaultMark />
            <div>
              <h3 className="text-xl font-semibold text-[#111827]">{APP_NAME}</h3>
              <p className="text-xs text-gray-600">
                <a href={APP_MARKETING_URL} className="hover:text-[#111827]">
                  myfleetvault.com
                </a>
              </p>
            </div>
          </div>
          <div className="flex gap-3 text-[#111827]">
            <a href="#" aria-label={`${APP_NAME} Facebook`}>
              <FaFacebookF />
            </a>
            <a href="#" aria-label={`${APP_NAME} X`}>
              <FaXTwitter />
            </a>
            <a href="#" aria-label={`${APP_NAME} Instagram`}>
              <FaInstagram />
            </a>
            <a href="#" aria-label={`${APP_NAME} LinkedIn`}>
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#111827]">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={AppRoutesPaths.marketing.about} className="hover:text-[#111827]">
                About
              </Link>
            </li>
            <li>
              <Link href={AppRoutesPaths.marketing.pricing} className="hover:text-[#111827]">
                Pricing
              </Link>
            </li>
            <li>
              <Link href={AppRoutesPaths.dashboard.root} className="hover:text-[#111827]">
                Fleet dashboard
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="hover:text-[#111827]">
                How It Works
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#111827]">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#docs" className="hover:text-[#111827]">
                Docs
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-[#111827]">
                Contact
              </a>
            </li>
            <li>
              <Link href={AppRoutesPaths.auth.signin} className="hover:text-[#111827]">
                Sign In
              </Link>
            </li>
            <li>
              <Link href={AppRoutesPaths.auth.signup} className="hover:text-[#111827]">
                Get {APP_NAME}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#111827]">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#privacy" className="hover:text-[#111827]">
                Privacy
              </a>
            </li>
            <li>
              <a href="#terms" className="hover:text-[#111827]">
                Terms
              </a>
            </li>
          </ul>
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
            <p className="font-semibold text-[#111827]">Trust & Compliance</p>
            <p>GDPR-aligned controls and audit-ready operational logs.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

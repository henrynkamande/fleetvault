"use client";

import Link from 'next/link'
import { HiOutlineBars3BottomRight } from 'react-icons/hi2'
import { HiOutlineXMark } from 'react-icons/hi2'
import { FiArrowRight } from 'react-icons/fi'
import { useState } from 'react'
import { APP_NAME } from '@/lib/constants'
import { AppRoutesPaths } from '@/route/paths'
import { MARKETING_CONTAINER } from '@/lib/marketingLayout'

const navItems = [
  { label: 'Fleet', href: AppRoutesPaths.dashboard.root },
  { label: 'Pricing', href: AppRoutesPaths.marketing.pricing },
  { label: 'About', href: AppRoutesPaths.marketing.about },
  { label: 'Blog', href: AppRoutesPaths.marketing.blog },
  { label: 'Sign In', href: AppRoutesPaths.auth.signin },
]

function FleetVaultLogo() {
  return (
    <div className="flex items-center gap-2" aria-label={`${APP_NAME} logo`}>
      <svg viewBox="0 0 48 48" className="h-10 w-10 rounded-xl bg-white p-1 shadow-sm" role="img" aria-label={`${APP_NAME} mark`}>
        <rect x="5" y="10" width="26" height="18" rx="4" fill="#111827" />
        <circle cx="14" cy="31" r="4" fill="#fbbd26" />
        <circle cx="28" cy="31" r="4" fill="#fbbd26" />
        <path d="M31 16h8l4 6v6h-12z" fill="#f59e0b" />
      </svg>
      <div>
        <p className="text-2xl font-semibold text-[#111827]">{APP_NAME}</p>
      </div>
    </div>
  )
}

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <header className="w-full py-5" id="top">
      <nav className={`flex items-center justify-between rounded-2xl py-3 ${MARKETING_CONTAINER}`}>
        <Link href={AppRoutesPaths.landing} className="focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/40 rounded-lg">
          <FleetVaultLogo />
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="text-base font-semibold text-gray-700 transition hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/40 rounded-md px-1"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={AppRoutesPaths.auth.signup}
          className="hidden items-center gap-2 rounded-full bg-[#fbbd26] px-7 py-3 text-base font-semibold text-[#111827] transition hover:bg-[#f4b20a] md:inline-flex focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/50"
        >
          Free trial <FiArrowRight />
        </Link>

        <button
          type="button"
          aria-label={isMobileOpen ? 'Close mobile navigation' : 'Open mobile navigation'}
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 lg:hidden"
        >
          {isMobileOpen ? <HiOutlineXMark className="h-6 w-6" /> : <HiOutlineBars3BottomRight className="h-6 w-6" />}
        </button>
      </nav>

      {isMobileOpen && (
        <div className={`mt-2 rounded-2xl border border-gray-200 bg-white p-4 lg:hidden ${MARKETING_CONTAINER}`}>
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-3 text-base font-semibold text-gray-700"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={AppRoutesPaths.auth.signup}
              onClick={() => setIsMobileOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#fbbd26] px-5 py-3 text-base font-semibold text-[#111827]"
            >
              Free trial <FiArrowRight />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

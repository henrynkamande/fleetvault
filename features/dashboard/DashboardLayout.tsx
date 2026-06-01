"use client";

/**
 * Next.js fleet + platform admin shell (`frontend/` → `/dashboard/*`).
 *
 * Production will NOT pick up edits here if your live site is built from
 * `fleetflow-frontend/` (Vite SPA — see `src/features/dashboard/DashboardLayout.tsx`).
 *
 * Vercel: set Root Directory to `frontend`, then redeploy after changes (not just save locally).
 */

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { preloadDashboardPage } from '@/route/dashboardPreload'
import type { IconType } from 'react-icons'
import { useQueryClient } from '@tanstack/react-query'
import { useLogoutMutation } from '@/hooks/queries/useAuthMutations'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { getNavSubtitle, getUserInitials } from '@/lib/userDisplay'
import { AppRoutesPaths } from '@/route/paths'
import { appPageToPath, resolveActiveAppPage } from '@/route/dashboardNavigation'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useAuthStore } from '@/store/useAuthStore'
import { useDashboardPeriodOptional } from '@/context/DashboardPeriodContext'
import { APP_NAME } from '@/lib/constants'
import type { FinancePeriodPreset } from '@/types/finance'
import type { User } from '@/types/user'
import type { AppPage } from '@/types/dashboard'
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineBuildingOffice2,
  HiOutlineChartBar,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronDown,
  HiOutlineCog6Tooth,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentChartBar,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineReceiptPercent,
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineMap,
} from 'react-icons/hi2'

type NavItemProps = {
  label: string
  page: AppPage
  icon: IconType
  collapsed?: boolean
  active?: boolean
  onNavigate?: (page: AppPage) => void
}

type SidebarSectionProps = {
  title?: string
  collapsed?: boolean
  items: NavItemProps[]
}

type DashboardLayoutProps = {
  children: ReactNode
  pageTitle?: string
  activeItem?: AppPage
  showPeriodFilter?: boolean
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0h6z" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 3h15v11H1zM16 8h4l3 3v3h-7zM5.5 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
  )
}

function NavItem({ label, page, icon: Icon, collapsed = false, active = false, onNavigate }: NavItemProps) {
  const pathname = usePathname()
  const path = appPageToPath(page)
  const isActive = active || resolveActiveAppPage(pathname) === page

  return (
    <Link
      href={path}
      prefetch
      onMouseEnter={() => preloadDashboardPage(page)}
      onFocus={() => preloadDashboardPage(page)}
      onClick={() => {
        onNavigate?.(page)
        if (pathname === path) {
          document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }}
      title={collapsed ? label : undefined}
      className={`ff-nav-item ${isActive ? 'ff-nav-item-active' : ''} ${collapsed ? 'justify-center gap-0' : ''}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed ? <span>{label}</span> : null}
    </Link>
  )
}

function SidebarSection({ title, collapsed = false, items }: SidebarSectionProps) {
  return (
    <section className="space-y-2">
      {title && !collapsed ? (
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{title}</p>
      ) : null}
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.label} collapsed={collapsed} {...item} />
        ))}
      </div>
    </section>
  )
}

function SidebarFooter() {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/40">
      <p className="ff-heading text-sm font-semibold">Zero GPS Tracking</p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Privacy-first management for modern fleets.</p>
    </div>
  )
}

function FAB() {
  return (
    <button
      type="button"
      aria-label="Quick add"
      className="fixed bottom-6 left-6 z-20 grid h-12 w-12 place-items-center rounded-full bg-indigo-600 text-xl text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 lg:left-[17.5rem]"
    >
      +
    </button>
  )
}

type NavUserMenuProps = {
  user: User
}

function NavUserMenu({ user }: NavUserMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const logoutMutation = useLogoutMutation()

  useEffect(() => {
    if (!open) return
    function onDocMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function goSettings() {
    setOpen(false)
    router.push(AppRoutesPaths.dashboard.settings)
  }

  function doLogout() {
    setOpen(false)
    void logoutMutation.mutateAsync().finally(() => {
      router.replace(
        user.role === 'PLATFORM_ADMIN'
          ? AppRoutesPaths.authSuperAdmin.signin
          : AppRoutesPaths.landing,
      )
    })
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="ff-dashboard-user-chip max-w-[14rem] text-left transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {getUserInitials(user.full_name)}
          </div>
        )}
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold ff-heading">{user.full_name}</p>
          <p className="truncate text-xs ff-muted">{getNavSubtitle(user)}</p>
        </div>
        <HiOutlineChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 ${open ? 'rotate-180' : ''} transition-transform`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900 dark:ring-white/10"
        >
          <button
            type="button"
            role="menuitem"
            onClick={goSettings}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:bg-slate-800"
          >
            <HiOutlineCog6Tooth className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={doLogout}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 focus:bg-rose-50 focus:outline-none disabled:opacity-50"
          >
            <HiOutlineArrowRightOnRectangle className="h-4 w-4 shrink-0" aria-hidden />
            {logoutMutation.isPending ? 'Signing out…' : 'Log out'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

type DashboardNavProps = {
  pageTitle: string
  showPeriodFilter: boolean
  onOpenSidebar?: () => void
  user: User | undefined
  userLoading: boolean
}

const PERIOD_SELECT_OPTIONS: { label: string; value: FinancePeriodPreset }[] = [
  { label: 'This Week', value: '7d' },
  { label: 'This Month', value: '30d' },
  { label: 'This Quarter', value: '90d' },
]

function DashboardNav({
  pageTitle,
  showPeriodFilter,
  onOpenSidebar,
  user,
  userLoading,
}: DashboardNavProps) {
  const periodCtx = useDashboardPeriodOptional()

  return (
    <header className="ff-dashboard-nav">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="ff-dashboard-icon-btn lg:hidden"
          >
            <MenuIcon />
          </button>
          <h1 className="text-lg font-semibold ff-heading">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {showPeriodFilter && periodCtx ? (
            <>
              <label className="hidden text-sm ff-muted sm:block" htmlFor="period">
                Period
              </label>
              <select
                id="period"
                value={periodCtx.period}
                onChange={(e) => periodCtx.setPeriod(e.target.value as FinancePeriodPreset)}
                className="ff-dashboard-select"
              >
                {PERIOD_SELECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </>
          ) : null}
          <ThemeToggle />
          <button type="button" aria-label="Notifications" className="ff-dashboard-icon-btn">
            <BellIcon />
          </button>
          {userLoading ? (
            <div className="ff-dashboard-user-chip">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="hidden min-w-0 sm:block">
                <div className="h-3.5 w-28 max-w-[10rem] animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          ) : user ? (
            <NavUserMenu user={user} />
          ) : (
            <div className="ff-dashboard-user-chip">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                —
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-500">Account</p>
                <p className="text-xs text-slate-400">Unavailable</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default function DashboardLayout({
  children,
  pageTitle = 'Dashboard Overview',
  activeItem = 'dashboard',
  showPeriodFilter = true,
}: DashboardLayoutProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const userQuery = useCurrentUser()
  const user = userQuery.data
  const userLoading = userQuery.isLoading

  useEffect(() => {
    if (!userQuery.isError || !userQuery.error) return
    if (axios.isAxiosError(userQuery.error) && userQuery.error.response?.status === 401) {
      useAuthStore.getState().clearSession()
      queryClient.removeQueries({ queryKey: ['currentUser'] })
      queryClient.removeQueries({ queryKey: ['company'] })
      router.replace(AppRoutesPaths.auth.signin)
    }
  }, [userQuery.isError, userQuery.error, router, queryClient])

  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isPlatformAdmin = user?.role === 'PLATFORM_ADMIN'
  const resolvedActiveItem =
    activeItem ?? resolveActiveAppPage(pathname, user?.role)

  /** Sidebar uses <Link>; this only closes the mobile drawer. */
  const handleSidebarNav = (_page?: AppPage) => {
    void _page
    setIsMobileSidebarOpen(false)
  }

  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [pathname])

  const navGroups: SidebarSectionProps[] = isPlatformAdmin
    ? [
        {
          items: [
            {
              label: 'Dashboard',
              page: 'admin-overview',
              icon: HiOutlineChartBar,
              active: resolvedActiveItem === 'admin-overview',
              onNavigate: handleSidebarNav,
            },
            {
              label: 'Users',
              page: 'admin-users',
              icon: HiOutlineUsers,
              active: resolvedActiveItem === 'admin-users',
              onNavigate: handleSidebarNav,
            },
            {
              label: 'Vehicles',
              page: 'admin-vehicles',
              icon: HiOutlineTruck,
              active: resolvedActiveItem === 'admin-vehicles',
              onNavigate: handleSidebarNav,
            },
            {
              label: 'Subscriptions & Payments',
              page: 'admin-subscriptions',
              icon: HiOutlineCurrencyDollar,
              active: resolvedActiveItem === 'admin-subscriptions',
              onNavigate: handleSidebarNav,
            },
            {
              label: 'System Expenses',
              page: 'admin-system-expenses',
              icon: HiOutlineReceiptPercent,
              active: resolvedActiveItem === 'admin-system-expenses',
              onNavigate: handleSidebarNav,
            },
            {
              label: 'Blog',
              page: 'admin-blog',
              icon: HiOutlineDocumentText,
              active: resolvedActiveItem === 'admin-blog',
              onNavigate: handleSidebarNav,
            },
            {
              label: 'Settings',
              page: 'admin-settings',
              icon: HiOutlineCog6Tooth,
              active: resolvedActiveItem === 'admin-settings',
              onNavigate: handleSidebarNav,
            },
          ],
        },
      ]
    : [
        {
          items: [
            {
              label: 'Dashboard',
              page: 'dashboard',
              icon: HiOutlineChartBar,
              active: resolvedActiveItem === 'dashboard',
              onNavigate: handleSidebarNav,
            },
          ],
        },
        {
          title: 'Management',
          items: [
            { label: 'Vehicles', page: 'vehicles', icon: HiOutlineTruck, active: resolvedActiveItem === 'vehicles', onNavigate: handleSidebarNav },
            { label: 'Drivers', page: 'drivers', icon: HiOutlineUserGroup, active: resolvedActiveItem === 'drivers', onNavigate: handleSidebarNav },
            { label: 'Trips (GPS-Free)', page: 'trips', icon: HiOutlineMap, active: resolvedActiveItem === 'trips', onNavigate: handleSidebarNav },
          ],
        },
        {
          title: 'Financials',
          items: [
            { label: 'Income', page: 'income', icon: HiOutlineCurrencyDollar, active: resolvedActiveItem === 'income', onNavigate: handleSidebarNav },
            { label: 'Expenses', page: 'expenses', icon: HiOutlineReceiptPercent, active: resolvedActiveItem === 'expenses', onNavigate: handleSidebarNav },
            { label: 'P&L Reports', page: 'reports', icon: HiOutlineDocumentChartBar, active: resolvedActiveItem === 'reports', onNavigate: handleSidebarNav },
          ],
        },
        {
          title: 'System',
          items: [
            { label: 'Settings', page: 'settings', icon: HiOutlineCog6Tooth, active: resolvedActiveItem === 'settings', onNavigate: handleSidebarNav },
          ],
        },
      ]

  const sidebarFooter = isPlatformAdmin ? (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
      <p className="ff-heading text-sm font-semibold">Platform admin</p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        Cross-tenant operations for {APP_NAME}.
      </p>
    </div>
  ) : (
    <SidebarFooter />
  )

  return (
    <div className="ff-dashboard-shell">
      <div className="flex min-h-screen w-full lg:flex">
        {isMobileSidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              aria-label="Close sidebar overlay"
              className="absolute inset-0 bg-black/30"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <aside className="ff-dashboard-sidebar relative h-full w-72">
              <div className="mb-6 flex items-start justify-between">
                <Link
                  href={AppRoutesPaths.dashboard.root}
                  onClick={() => handleSidebarNav()}
                  className="flex items-center gap-2 rounded-xl px-2 py-1 ff-heading"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
                    <TruckIcon />
                  </span>
                  <span className="font-semibold">{APP_NAME}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Close sidebar"
                  className="ff-dashboard-icon-btn h-7 w-7 rounded-md"
                >
                  <HiOutlineChevronDoubleLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-6">
                {navGroups.map((group, idx) => (
                  <SidebarSection key={`mobile-${group.title ?? 'root'}-${idx}`} title={group.title} items={group.items} />
                ))}
              </div>
            </aside>
          </div>
        ) : null}

        <aside
          className={`ff-dashboard-sidebar hidden shrink-0 transition-all duration-200 lg:flex lg:flex-col ${isSidebarCollapsed ? 'w-24' : 'w-72'}`}
        >
          <div className="mb-6 flex items-start justify-between">
            <Link
              href={AppRoutesPaths.dashboard.root}
              onClick={() => handleSidebarNav('dashboard')}
              className="flex items-center gap-2 rounded-xl px-2 py-1 ff-heading"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
                <TruckIcon />
              </span>
              {!isSidebarCollapsed ? <span className="font-semibold">{APP_NAME}</span> : null}
            </Link>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="ff-dashboard-icon-btn h-7 w-7 rounded-md"
            >
              {isSidebarCollapsed ? <HiOutlineChevronDoubleRight className="h-4 w-4" /> : <HiOutlineChevronDoubleLeft className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex-1 space-y-6">
            {navGroups.map((group, idx) => (
              <SidebarSection key={`${group.title ?? 'root'}-${idx}`} title={group.title} collapsed={isSidebarCollapsed} items={group.items} />
            ))}
          </div>

          {!isSidebarCollapsed ? sidebarFooter : null}
        </aside>

        <main className="flex min-w-0 w-full flex-1 flex-col">
          <DashboardNav
            pageTitle={pageTitle}
            showPeriodFilter={showPeriodFilter}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            user={user}
            userLoading={userLoading}
          />
          <div className="w-full max-w-none flex-1 p-4 md:p-6">{children}</div>
        </main>
      </div>
      {!isSidebarCollapsed && !isPlatformAdmin ? <FAB /> : null}
    </div>
  )
}

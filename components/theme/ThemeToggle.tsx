"use client";

import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2'
import { useThemeStore } from '@/store/useThemeStore'

type ThemeToggleProps = {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const resolved = useThemeStore((s) => s.resolved)
  const toggle = useThemeStore((s) => s.toggle)

  const isDark = resolved === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={() => toggle()}
      aria-label={label}
      title={label}
      className={`ff-dashboard-icon-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-500 ${className}`}
    >
      {isDark ? <HiOutlineSun className="h-5 w-5" aria-hidden /> : <HiOutlineMoon className="h-5 w-5" aria-hidden />}
      {showLabel ? <span className="sr-only">{label}</span> : null}
    </button>
  )
}

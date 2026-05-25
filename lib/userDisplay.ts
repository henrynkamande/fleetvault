import type { User } from '@/types/user'

export function getUserInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase()
}

export function formatUserRole(role: string): string {
  if (role === 'FLEET_OWNER') return 'Fleet owner'
  if (role === 'DRIVER') return 'Driver'
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function getNavSubtitle(user: User): string {
  if (user.company_name?.trim()) return user.company_name
  return formatUserRole(user.role)
}

/** Hide internal placeholder emails created for record-only drivers. */
export function formatDriverEmailForDisplay(email: string | null | undefined): string | null {
  if (!email?.trim()) return null
  if (email.toLowerCase().includes('@fleetvault.internal')) return null
  return email
}

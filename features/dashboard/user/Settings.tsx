"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react'
import { useCompany } from '@/hooks/queries/useCompany'
import { useUpdateProfileMutation } from '@/hooks/queries/useProfileMutations'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { flattenFieldErrors, getErrorDetail, getResponseErrorData } from '@/lib/apiErrors'
import { formatUserRole } from '@/lib/userDisplay'
import { APP_NAME } from '@/lib/constants'
import { useBillingPortal, useBillingStatus } from '@/hooks/queries/useBilling'
import { AppRoutesPaths } from '@/route/paths'

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-0 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/40 ${
        active
          ? 'border-b-2 border-[#f4b20a] text-[#111827]'
          : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  )
}

function EditableField({
  label,
  value,
  onChange,
  helper,
  readOnly = false,
  type = 'text',
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  helper: string
  readOnly?: boolean
  type?: string
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <input
        type={type}
        readOnly={readOnly}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 ${
          readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'
        }`}
      />
      <p className="text-xs text-gray-500">{helper}</p>
    </label>
  )
}

function FieldSkeleton() {
  return <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
}

function SettingsSkeletonGrid() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <FieldSkeleton />
      <FieldSkeleton />
      <FieldSkeleton />
      <FieldSkeleton />
    </div>
  )
}

type ProfileForm = {
  first_name: string
  last_name: string
  phone_number: string
}

export default function Settings() {
  const userQuery = useCurrentUser()
  const updateProfile = useUpdateProfileMutation()
  const [profileForm, setProfileForm] = useState<ProfileForm | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'billing'>('general')

  const user = userQuery.data
  const isFleetOwner = user?.role === 'FLEET_OWNER'
  const billingEnabled = activeTab === 'billing' && isFleetOwner
  const companyQuery = useCompany({ enabled: billingEnabled })
  const company = companyQuery.data

  const billingStatus = useBillingStatus({ enabled: billingEnabled })
  const billingPortal = useBillingPortal()

  useEffect(() => {
    if (!user) return
    const timer = window.setTimeout(() => {
      setProfileForm({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [user])

  const profileDirty = useMemo(() => {
    if (!user || !profileForm) return false
    return (
      profileForm.first_name !== user.first_name ||
      profileForm.last_name !== user.last_name ||
      profileForm.phone_number !== user.phone_number
    )
  }, [user, profileForm])

  const canSave = profileDirty
  const isSaving = updateProfile.isPending

  const userError =
    userQuery.isError && !userQuery.isPending
      ? getErrorDetail(userQuery.error) ?? 'Could not load your profile. Refresh the page or sign in again.'
      : null

  const saveError = (() => {
    for (const err of [updateProfile.error]) {
      if (!err) continue
      const fieldMsgs = Object.values(flattenFieldErrors(getResponseErrorData(err))).filter(Boolean)
      if (fieldMsgs.length > 0) return fieldMsgs.join(' ')
      const detail = getErrorDetail(err)
      if (detail) return detail
    }
    return null
  })()

  const handleCancel = () => {
    setSaveMessage(null)
    if (user) {
      setProfileForm({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
      })
    }
  }

  const handleSave = async () => {
    setSaveMessage(null)
    updateProfile.reset()
    try {
      if (profileDirty && profileForm) {
        await updateProfile.mutateAsync({
          first_name: profileForm.first_name.trim(),
          last_name: profileForm.last_name.trim(),
          phone_number: profileForm.phone_number.trim(),
        })
      }
      setSaveMessage('Your changes were saved.')
    } catch {
      /* errors surfaced via saveError */
    }
  }

  return (
    <section className="space-y-4 rounded-2xl p-4 md:p-5">
      <header className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827]">Settings &amp; Preferences</h2>
            <p className="text-sm text-gray-700">Update your vehicle owner account and billing preferences.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!canSave || isSaving}
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSave || isSaving}
              onClick={() => void handleSave()}
              className="rounded-lg bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f4b20a] focus:outline-none focus:ring-2 focus:ring-[#fbbd26]/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-5 border-b border-gray-200">
          <TabButton label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
          <TabButton label="Billing & Plans" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
        </div>
      </header>

      {saveMessage ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          {saveMessage}
        </p>
      ) : null}

      {saveError ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {saveError}
        </p>
      ) : null}

      {userError ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {userError}
        </p>
      ) : null}

      {activeTab === 'billing' && isFleetOwner ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
          <h3 className="text-lg font-semibold text-[#111827]">Billing</h3>
          <p className="mt-1 text-sm text-gray-600">
            Status:{' '}
            <span className="font-semibold text-[#111827]">
              {billingStatus.data?.billing_status ?? company?.billing_status ?? '—'}
            </span>
            {company?.trial_ends_at ? (
              <span className="text-gray-500"> · Trial ends {new Date(company.trial_ends_at).toLocaleDateString()}</span>
            ) : null}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Billable vehicles: {billingStatus.data?.vehicle_count ?? company?.total_vehicles ?? 0}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {billingStatus.data?.requires_checkout ? (
              <Link
                href={AppRoutesPaths.onboarding.startTrial}
                className="rounded-lg bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827]"
              >
                Start free trial
              </Link>
            ) : (
              <button
                type="button"
                disabled={billingPortal.isPending}
                onClick={() => billingPortal.mutate({})}
                className="rounded-lg bg-[#2f5aab] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Manage billing in Stripe
              </button>
            )}
          </div>
        </section>
      ) : null}

      {activeTab === 'general' ? (
      <div className="space-y-4">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
          <h3 className="mb-1 text-lg font-semibold text-[#111827]">Your account</h3>
          <p className="mb-4 text-xs text-gray-600">Name and phone can be updated here.</p>
          {userQuery.isPending && !user ? (
            <SettingsSkeletonGrid />
          ) : user && profileForm ? (
            <div className="grid gap-3 md:grid-cols-2">
              <EditableField
                label="First name"
                value={profileForm.first_name}
                onChange={(v) => setProfileForm((p) => (p ? { ...p, first_name: v } : p))}
                helper="Given name on your account."
              />
              <EditableField
                label="Last name"
                value={profileForm.last_name}
                onChange={(v) => setProfileForm((p) => (p ? { ...p, last_name: v } : p))}
                helper="Family name on your account."
              />
              <EditableField label="Role" value={formatUserRole(user.role)} helper={`Your role in ${APP_NAME}.`} readOnly />
              <EditableField label="Email" value={user.email} helper="Login email (cannot be changed here)." readOnly />
              <EditableField
                label="Phone"
                value={profileForm.phone_number}
                onChange={(v) => setProfileForm((p) => (p ? { ...p, phone_number: v } : p))}
                helper="Account phone number."
                type="tel"
              />
              <EditableField
                label="Verification"
                value={user.is_verified ? 'Verified' : 'Not verified'}
                helper="Account verification status."
                readOnly
              />
            </div>
          ) : null}
        </section>

      </div>
      ) : null}
    </section>
  )
}

"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react'
import { useCompany } from '@/hooks/queries/useCompany'
import { useUpdateProfileMutation } from '@/hooks/queries/useProfileMutations'
import { useCurrentUser } from '@/hooks/queries/useUsers'
import { flattenFieldErrors, getErrorDetail, getResponseErrorData } from '@/lib/apiErrors'
import { getCurrencyOptions, normalizeCurrency } from '@/lib/currencies'
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
          ? 'border-b-2 border-[#f4b20a] text-[#111827] dark:text-slate-100'
          : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
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
      <span className="text-xs font-semibold uppercase tracking-wide ff-muted">{label}</span>
      <input
        type={type}
        readOnly={readOnly}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 dark:border-slate-700 dark:text-slate-200 ${
          readOnly ? 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-white dark:bg-slate-900'
        }`}
      />
      <p className="text-xs ff-muted">{helper}</p>
    </label>
  )
}

function FieldSkeleton() {
  return <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
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
  preferred_currency: string
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
  const currencyOptions = useMemo(() => getCurrencyOptions(), [])

  useEffect(() => {
    if (!user) return
    const timer = window.setTimeout(() => {
      setProfileForm({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        preferred_currency: normalizeCurrency(user.preferred_currency),
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [user])

  const profileDirty = useMemo(() => {
    if (!user || !profileForm) return false
    return (
      profileForm.first_name !== user.first_name ||
      profileForm.last_name !== user.last_name ||
      profileForm.phone_number !== user.phone_number ||
      profileForm.preferred_currency !== normalizeCurrency(user.preferred_currency)
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
        preferred_currency: normalizeCurrency(user.preferred_currency),
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
          preferred_currency: isFleetOwner ? profileForm.preferred_currency : undefined,
        })
      }
      setSaveMessage('Your changes were saved.')
    } catch {
      /* errors surfaced via saveError */
    }
  }

  return (
    <section className="space-y-4 rounded-2xl p-4 md:p-5">
      <header className="ff-card md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold ff-heading">Settings &amp; Preferences</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300">Update your vehicle owner account and billing preferences.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!canSave || isSaving}
              onClick={handleCancel}
              className="ff-secondary-btn px-4"
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
        <div className="mt-4 flex items-center gap-5 border-b border-slate-200 dark:border-slate-800">
          <TabButton label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
          <TabButton label="Billing & Plans" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
        </div>
      </header>

      {saveMessage ? (
        <p className="ff-alert-success rounded-xl" role="status">
          {saveMessage}
        </p>
      ) : null}

      {saveError ? (
        <p className="ff-alert-danger rounded-xl" role="alert">
          {saveError}
        </p>
      ) : null}

      {userError ? (
        <p className="ff-alert-danger rounded-xl" role="alert">
          {userError}
        </p>
      ) : null}

      {activeTab === 'billing' && isFleetOwner ? (
        <section className="ff-card md:p-5">
          <h3 className="text-lg font-semibold ff-heading">Billing</h3>
          <p className="mt-1 text-sm ff-muted">
            Status:{' '}
            <span className="font-semibold ff-heading">
              {billingStatus.data?.billing_status ?? company?.billing_status ?? '—'}
            </span>
            {company?.trial_ends_at ? (
              <span className="ff-muted"> · Trial ends {new Date(company.trial_ends_at).toLocaleDateString()}</span>
            ) : null}
          </p>
          <p className="mt-2 text-sm ff-muted">
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
        <section className="ff-card md:p-5">
          <h3 className="mb-1 text-lg font-semibold ff-heading">Your account</h3>
          <p className="mb-4 text-xs ff-muted">Name and phone can be updated here.</p>
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
              {isFleetOwner ? (
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide ff-muted">Currency</span>
                  <select
                    value={profileForm.preferred_currency}
                    onChange={(e) =>
                      setProfileForm((p) => (p ? { ...p, preferred_currency: e.target.value } : p))
                    }
                    className="ff-field w-full"
                  >
                    {currencyOptions.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs ff-muted">Used to personalize dashboard financial amounts.</p>
                </label>
              ) : null}
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

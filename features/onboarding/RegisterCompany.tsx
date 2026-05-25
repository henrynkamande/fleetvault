"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { AppRoutesPaths } from '@/route/paths'
import { HiArrowLeft } from 'react-icons/hi2'
import { useRegisterCompanyMutation } from '@/hooks/queries/useCompanyMutations'
import { flattenFieldErrors, getErrorDetail, getResponseErrorData } from '@/lib/apiErrors'
import { getAccessToken } from '@/lib/tokenStorage'
import type { RegisterCompanyPayload } from '@/types/company'

const emptyForm: RegisterCompanyPayload = {
  name: '',
  registration_number: '',
  address: '',
  contact_email: '',
  contact_phone: '',
  logo: null,
}

export default function RegisterCompanyPage() {
  const router = useRouter()
  const registerMutation = useRegisterCompanyMutation()
  const [formData, setFormData] = useState<RegisterCompanyPayload>(emptyForm)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const logoPreviewUrl = useMemo(() => {
    if (!formData.logo) return null
    return URL.createObjectURL(formData.logo)
  }, [formData.logo])

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(AppRoutesPaths.auth.signin)
    }
  }, [router])

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl)
    }
  }, [logoPreviewUrl])

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setFormData((prev) => ({ ...prev, logo: file }))
  }

  function clearLogo() {
    setFormData((prev) => ({ ...prev, logo: null }))
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: RegisterCompanyPayload = {
      name: formData.name.trim(),
      registration_number: formData.registration_number?.trim() || undefined,
      address: formData.address?.trim() || undefined,
      contact_email: formData.contact_email?.trim() || undefined,
      contact_phone: formData.contact_phone?.trim() || undefined,
      logo: formData.logo ?? null,
    }
    registerMutation.mutate(payload, {
      onSuccess: () => {
        router.replace(AppRoutesPaths.dashboard.root)
      },
    })
  }

  const fieldErrors = registerMutation.isError ? flattenFieldErrors(getResponseErrorData(registerMutation.error)) : {}

  const generalError =
    registerMutation.isError && Object.keys(fieldErrors).length === 0
      ? getErrorDetail(registerMutation.error)
      : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D2D2D2] to-[#F9F9F9] p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full text-base font-semibold text-slate-700 transition"
          type="button"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-600">
            <HiArrowLeft className="h-3.5 w-3.5" />
          </span>
          Back
        </button>
        <Link
          href={AppRoutesPaths.dashboard.root}
          className="text-base font-semibold text-[#111827] underline decoration-[#fbbd26] decoration-2 underline-offset-4 hover:text-slate-900"
        >
          Go to dashboard
        </Link>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:p-10">
          <h1 className="text-3xl font-bold text-[#111827] md:text-4xl">Register your company</h1>
          <p className="mt-3 text-base text-gray-700 md:text-lg">
            Optional — add your company when you are ready. You can skip and register later from Settings.
          </p>

          {generalError ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {generalError}
            </p>
          ) : null}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <label className="block space-y-1">
              <span className="text-base font-semibold text-gray-700">
                Company name <span className="text-red-600">*</span>
              </span>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="organization"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-lg text-gray-700 outline-none transition focus:border-[#fbbd26] focus:bg-white focus:ring-2 focus:ring-[#fbbd26]/30"
              />
              {fieldErrors.name ? <span className="text-sm text-red-600">{fieldErrors.name}</span> : null}
            </label>

            <label className="block space-y-1">
              <span className="text-base font-semibold text-gray-700">Registration number</span>
              <span className="text-sm font-normal text-gray-500"> (optional)</span>
              <input
                name="registration_number"
                value={formData.registration_number ?? ''}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-lg text-gray-700 outline-none transition focus:border-[#fbbd26] focus:bg-white focus:ring-2 focus:ring-[#fbbd26]/30"
              />
              {fieldErrors.registration_number ? (
                <span className="text-sm text-red-600">{fieldErrors.registration_number}</span>
              ) : null}
            </label>

            <label className="block space-y-1">
              <span className="text-base font-semibold text-gray-700">Address</span>
              <span className="text-sm font-normal text-gray-500"> (optional)</span>
              <textarea
                name="address"
                value={formData.address ?? ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full resize-y rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-lg text-gray-700 outline-none transition focus:border-[#fbbd26] focus:bg-white focus:ring-2 focus:ring-[#fbbd26]/30"
              />
              {fieldErrors.address ? <span className="text-sm text-red-600">{fieldErrors.address}</span> : null}
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-base font-semibold text-gray-700">Contact email</span>
                <span className="text-sm font-normal text-gray-500"> (optional)</span>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email ?? ''}
                  onChange={handleChange}
                  autoComplete="email"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-lg text-gray-700 outline-none transition focus:border-[#fbbd26] focus:bg-white focus:ring-2 focus:ring-[#fbbd26]/30"
                />
                {fieldErrors.contact_email ? (
                  <span className="text-sm text-red-600">{fieldErrors.contact_email}</span>
                ) : null}
              </label>
              <label className="block space-y-1">
                <span className="text-base font-semibold text-gray-700">Contact phone</span>
                <span className="text-sm font-normal text-gray-500"> (optional)</span>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone ?? ''}
                  onChange={handleChange}
                  autoComplete="tel"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-[#f9fafb] px-4 py-3.5 text-lg text-gray-700 outline-none transition focus:border-[#fbbd26] focus:bg-white focus:ring-2 focus:ring-[#fbbd26]/30"
                />
                {fieldErrors.contact_phone ? (
                  <span className="text-sm text-red-600">{fieldErrors.contact_phone}</span>
                ) : null}
              </label>
            </div>

            <div className="space-y-1">
              <span className="text-base font-semibold text-gray-700">Company logo</span>
              <span className="text-sm font-normal text-gray-500"> (optional — JPG, PNG, SVG, WebP)</span>

              {logoPreviewUrl && formData.logo ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-[#f9fafb] p-4">
                  <img
                    src={logoPreviewUrl}
                    alt={`Preview: ${formData.logo.name}`}
                    className="mx-auto max-h-56 w-auto max-w-full object-contain"
                  />
                  <p className="mt-2 truncate text-center text-sm text-gray-600" title={formData.logo.name}>
                    {formData.logo.name}
                  </p>
                </div>
              ) : null}

              <input
                ref={logoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.svg,.webp,image/jpeg,image/png,image/svg+xml,image/webp"
                onChange={handleLogoChange}
                className="mt-3 w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[#fbbd26] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#111827] hover:file:bg-[#f4b20a]"
              />
              {formData.logo ? (
                <button
                  type="button"
                  onClick={clearLogo}
                  className="mt-2 text-sm font-semibold text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-[#111827]"
                >
                  Remove logo
                </button>
              ) : null}
              {fieldErrors.logo ? <span className="mt-1 block text-sm text-red-600">{fieldErrors.logo}</span> : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full rounded-xl bg-[#fbbd26] px-4 py-3.5 text-lg font-semibold text-[#111827] transition hover:bg-[#f4b20a] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
              >
                {registerMutation.isPending ? 'Saving company…' : 'Register company'}
              </button>
              <Link
                href={AppRoutesPaths.dashboard.root}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-center text-lg font-semibold text-slate-700 transition hover:bg-gray-50 sm:w-auto sm:min-w-[10rem]"
              >
                Skip for now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

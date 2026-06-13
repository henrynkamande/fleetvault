"use client";

import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import {
  useCreateCustomerMutation,
  useCustomersQuery,
  useDeleteCustomerMutation,
  useUpdateCustomerMutation,
} from '@/hooks/queries/useCustomers'
import { getErrorDetail } from '@/lib/apiErrors'
import { fleetConfirm } from '@/lib/fleetAlert'
import { LoadingCard } from '@/components/ui/LoadingSpinner'
import type { CustomerDto, CustomerPayload } from '@/types/customer'

type CustomerFormState = CustomerPayload

const emptyForm: CustomerFormState = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
}

function fieldClass(): string {
  return 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30'
}

function customerToForm(customer: CustomerDto): CustomerFormState {
  return {
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    notes: customer.notes,
  }
}

function cleanPayload(form: CustomerFormState): CustomerPayload {
  return {
    name: form.name.trim(),
    phone: form.phone?.trim() ?? '',
    email: form.email?.trim() ?? '',
    address: form.address?.trim() ?? '',
    notes: form.notes?.trim() ?? '',
  }
}

export default function Customers() {
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<CustomerFormState>(emptyForm)
  const [editing, setEditing] = useState<CustomerDto | null>(null)
  const customersQuery = useCustomersQuery(search)
  const createMutation = useCreateCustomerMutation()
  const updateMutation = useUpdateCustomerMutation()
  const deleteMutation = useDeleteCustomerMutation()
  const mutationPending = createMutation.isPending || updateMutation.isPending

  const customers = useMemo(() => customersQuery.data?.customers ?? [], [customersQuery.data?.customers])
  const defaultCustomer = useMemo(() => customers.find((c) => c.is_default), [customers])

  function resetForm() {
    setForm(emptyForm)
    setEditing(null)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const payload = cleanPayload(form)
    if (!payload.name) {
      toast.error('Customer name is required.')
      return
    }

    if (editing) {
      updateMutation.mutate(
        { customerId: editing.id, payload },
        {
          onSuccess: (data) => {
            toast.success(data.message)
            resetForm()
          },
          onError: (err) => toast.error(getErrorDetail(err) ?? 'Could not update customer.'),
        },
      )
      return
    }

    createMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success(data.message)
        resetForm()
      },
      onError: (err) => toast.error(getErrorDetail(err) ?? 'Could not create customer.'),
    })
  }

  async function handleDelete(customer: CustomerDto) {
    const confirmed = await fleetConfirm({
      title: 'Delete this customer?',
      text: `${customer.name} will be removed only if no trips are assigned to them.`,
      confirmText: 'Delete customer',
      cancelText: 'Cancel',
      icon: 'warning',
    })
    if (!confirmed) return
    deleteMutation.mutate(customer.id, {
      onSuccess: (data) => toast.success(data.message),
      onError: (err) => toast.error(getErrorDetail(err) ?? 'Could not delete customer.'),
    })
  }

  return (
    <section className="space-y-4 rounded-2xl p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">Customers</h2>
          <p className="text-sm text-gray-600">
            Assign every trip to a client. Use Cash Payment for walk-in or casual cash trips.
          </p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customers..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#fbbd26] focus:ring-2 focus:ring-[#fbbd26]/30 lg:max-w-xs"
        />
      </div>

      {defaultCustomer ? (
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Default customer: {defaultCustomer.name}</p>
          <p className="mt-1">
            This keeps trip creation fast when the customer is a walk-in or cash payer.
          </p>
        </article>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-[#111827]">{editing ? 'Edit customer' : 'Create customer'}</h3>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className={fieldClass()}
              placeholder="Customer or company name"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Phone</label>
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className={fieldClass()}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className={fieldClass()}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Address</label>
            <textarea
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              className={fieldClass()}
              rows={2}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Notes</label>
            <textarea
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              className={fieldClass()}
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={mutationPending}
              className="flex-1 rounded-lg bg-[#fbbd26] px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#f4b20a] disabled:opacity-60"
            >
              {mutationPending ? 'Saving...' : editing ? 'Save changes' : 'Create customer'}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {customersQuery.isLoading ? <LoadingCard className="border-0 shadow-none" /> : null}
          {customersQuery.isError ? (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
              Could not load customers: {getErrorDetail(customersQuery.error)}
            </p>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {customers.map((customer) => (
              <article key={customer.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111827]">{customer.name}</p>
                    <p className="truncate text-sm text-gray-600">{customer.phone || customer.email || 'No contact saved'}</p>
                  </div>
                  {customer.is_default ? (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                      Default
                    </span>
                  ) : null}
                </div>
                {customer.address ? <p className="mt-3 line-clamp-2 text-sm text-gray-600">{customer.address}</p> : null}
                <p className="mt-3 text-xs text-gray-500">{customer.trip_count ?? 0} assigned trips</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(customer)
                      setForm(customerToForm(customer))
                    }}
                    disabled={customer.is_default}
                    className="flex-1 rounded-lg border border-[#fbbd26]/70 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-[#fff8e6] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(customer)}
                    disabled={customer.is_default || deleteMutation.isPending}
                    className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!customersQuery.isLoading && customers.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No customers found.</p>
          ) : null}
        </section>
      </div>
    </section>
  )
}

import { useGetData, useOptimistic, usePatchData, usePutData } from '@/hooks/use-api'
import type {
  AdminSettingsResponse,
  SaveSettingsRequest,
  SaveSettingsResult,
  SupportResponse,
  SystemHealthResponse,
  Ticket,
  UpdateTicketRequest,
} from '@/types/admin'

/**
 * Admin operations — System Health, Settings, Support.
 *
 * No Figma frames exist for these three (they are sidebar entries only), so
 * the screens are composed from existing tokens and the health vocabulary
 * that IS designed. Contract: docs/api/admin.md §3.6.
 */

/**
 * Polled: a health page that stopped updating looks identical to a healthy
 * one, which is why `checkedAt` is on the wire and shown.
 */
export const useSystemHealth = () =>
  useGetData<SystemHealthResponse>('/api/admin/health/', ['admin', 'health'], {
    refetchInterval: 30_000,
    staleTime: 0,
  })

const SETTINGS_KEY = ['admin', 'settings']

export const useAdminSettings = () =>
  useGetData<AdminSettingsResponse>('/api/admin/settings/', SETTINGS_KEY)

/**
 * PUT with an optimistic-lock `version`. Not optimistic in the UI sense: the
 * server can reject the whole save with 409 `stale_version` when another
 * admin got there first, and pretending otherwise would show one admin's
 * changes silently reverting. See docs/api/admin.md §5.
 */
export const useSaveSettings = () =>
  usePutData<SaveSettingsResult, SaveSettingsRequest>('/api/admin/settings/', SETTINGS_KEY)

const SUPPORT_KEY = ['admin', 'support']

export const useSupport = () => useGetData<SupportResponse>('/api/admin/support/', SUPPORT_KEY)

/** Optimistic — internal bookkeeping, trivially reversible. */
export const useUpdateTicket = (ticketId: string) => {
  const patch = useOptimistic<SupportResponse, UpdateTicketRequest>(SUPPORT_KEY, (prev, vars) => ({
    ...prev,
    tickets: prev.tickets.map((t) => (t.id === ticketId ? { ...t, status: vars.status } : t)),
  }))

  return usePatchData<Ticket, UpdateTicketRequest>(
    `/api/admin/support/tickets/${ticketId}/`,
    SUPPORT_KEY,
    patch,
  )
}

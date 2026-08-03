import { useGetData, usePostData } from '@/hooks/use-api'
import type {
  CreatePaymentRequest,
  FeeStatementResponse,
  FinanceOverviewResponse,
  InstallmentsResponse,
  InvoicesResponse,
  PaymentHistoryResponse,
  PaymentIntent,
  PaymentOptionsResponse,
} from '@/types'

/**
 * Finance module data (6 screens). Contract: docs/api/student.md §3.6.
 *
 * Amounts are decimal strings on the wire (`Money`); render with `money()`
 * and never sum them on the client — the server sends every total.
 *
 * Nothing here is optimistic. See docs/api/student.md §5.3.
 */

export const useFinanceOverview = () =>
  useGetData<FinanceOverviewResponse>('/api/student/finance/overview/', ['finance', 'overview'])

export const usePaymentOptions = () =>
  useGetData<PaymentOptionsResponse>('/api/student/finance/payment-options/', ['finance', 'pay'])

/**
 * The whole `finance` tree is invalidated: a payment moves the overview, the
 * invoices, the installments and the history at once.
 */
export const useCreatePayment = () =>
  usePostData<PaymentIntent, CreatePaymentRequest>('/api/student/finance/payments/', ['finance'])

/** Poll after returning from the gateway, until the status settles. */
export const usePaymentIntent = (id: string | null) =>
  useGetData<PaymentIntent>(`/api/student/finance/payments/${id}/`, ['finance', 'payment', id], {
    enabled: id !== null,
    refetchInterval: (query) => {
      const s = query.state.data?.status
      return s === 'SUCCESS' || s === 'FAILED' || s === 'CANCELLED' ? false : 2000
    },
  })

export const useFeeStatement = (termId?: string) =>
  useGetData<FeeStatementResponse>(
    `/api/student/finance/statement/${termId ? `?termId=${termId}` : ''}`,
    ['finance', 'statement', termId ?? 'current'],
  )

export const useInvoices = () =>
  useGetData<InvoicesResponse>('/api/student/finance/invoices/', ['finance', 'invoices'])

export const useInstallments = () =>
  useGetData<InstallmentsResponse>('/api/student/finance/installments/', ['finance', 'installments'])

export const usePaymentHistory = () =>
  useGetData<PaymentHistoryResponse>('/api/student/finance/history/', ['finance', 'history'])

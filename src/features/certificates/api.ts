import { useGetData, usePostData } from '@/hooks/use-api'
import type { CertificatesResponse, PrintOrder, PrintOrderRequest } from '@/types'

/** Certificates & Achievements — Figma 6:5438 / 6:1047. */
export const useCertificates = () =>
  useGetData<CertificatesResponse>('/api/student/certificates/', ['certificates'])

export const useOrderPrints = () =>
  usePostData<PrintOrder, PrintOrderRequest>(
    '/api/student/certificates/print-orders/',
    ['certificates'],
  )

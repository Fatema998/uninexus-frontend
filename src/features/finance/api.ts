import { useFixture } from '@/lib/fixtures'
import type { MetricTone } from '@/components/patterns/metric-card'

/** Finance module data (Phase 4.5 — 6 screens). Amounts in BDT (see lib/format.ts). */

export const useFinanceOverview = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    nextDue: string
    timeline: { label: string; amount: number; date: string; paid: boolean }[]
  }>(['finance', 'overview'], {
    metrics: [
      { label: 'Total Payable', value: '48,500.00', tone: 'warning' },
      { label: 'Total Paid', value: '127,500.00', tone: 'success' },
      { label: 'Total Due', value: '48,500.00', tone: 'danger' },
      { label: 'Payment Status', value: 'Partial', tone: 'info' },
    ],
    nextDue: '25 May 2026',
    timeline: [
      { label: 'Admission & Initial Fees', amount: 80000, date: '15 Apr 2024', paid: true },
      { label: 'Midterm Installment', amount: 48500, date: '25 May 2024', paid: false },
      { label: 'Final Term Balance', amount: 25500, date: '25 Jun 2024', paid: false },
    ],
  })

export const useMakePayment = () =>
  useFixture<{ outstanding: number; term: string; methods: { label: string; note: string }[] }>(
    ['finance', 'pay'],
    {
      outstanding: 48500,
      term: 'Semester Fall 23-24',
      methods: [
        { label: 'Mobile Banking', note: 'bKash, Nagad, Rocket' },
        { label: 'Debit / Credit Cards', note: 'Visa, Mastercard, Amex' },
        { label: 'Offline Banking', note: 'Bank transfer or branch deposit' },
      ],
    },
  )

export const useFeeStatement = () =>
  useFixture<{
    student: { label: string; value: string }[]
    billing: { label: string; value: string }[]
    lines: { label: string; amount: number }[]
    paid: number
  }>(['finance', 'statement'], {
    student: [
      { label: 'Name', value: 'Adnan Rahman' },
      { label: 'ID', value: 'STU2025001234' },
      { label: 'Department', value: 'Computer Science & Engineering' },
      { label: 'Semester', value: 'Summer 2024 (Year 3, Term 1)' },
    ],
    billing: [
      { label: 'Address', value: 'Road 12, House 45, Banani' },
      { label: 'City', value: 'Dhaka, Bangladesh - 1213' },
      { label: 'Contact', value: '+880 1712 345678' },
      { label: 'Email', value: 'a.rahman.cs@unigpt.edu' },
    ],
    lines: [
      { label: 'Fall Semester Tuition', amount: 32000 },
      { label: 'Lab Access Fees', amount: 6500 },
      { label: 'Hostel Accommodation', amount: 7000 },
    ],
    paid: 32000,
  })

export const useInvoices = () =>
  useFixture<{
    totals: { label: string; value: number; tone: MetricTone }[]
    dueBy: string
    invoices: { id: string; title: string; note: string; amount: number; paid: boolean }[]
    outlook: string
  }>(['finance', 'invoices'], {
    totals: [
      { label: 'Total Payable', value: 45500, tone: 'brand' },
      { label: 'Paid to Date', value: 32000, tone: 'success' },
      { label: 'Outstanding', value: 13500, tone: 'danger' },
    ],
    dueBy: 'Due by Oct 15, 2023',
    invoices: [
      { id: 'INV-4401', title: 'Fall Semester Tuition', note: 'Level 4, Term 1 Enrollment Fees', amount: 32000, paid: true },
      { id: 'INV-4402', title: 'Lab Access Fees', note: 'Advanced Physics & AI Lab Access', amount: 6500, paid: false },
      { id: 'INV-4403', title: 'Hostel Accommodation', note: 'Quarterly Payment for Hall C-3', amount: 7000, paid: false },
    ],
    outlook:
      'Based on your current enrollment and typical historical spend, your estimated remaining fees for this academic year will be ৳85,200.00. Would you like to set up a monthly installment plan?',
  })

export const useInstallments = () =>
  useFixture<{
    student: { name: string; id: string }
    steps: { step: string; label: string; amount: number; note: string; state: 'CLEARED' | 'DUE' | 'UPCOMING' }[]
    tip: string
  }>(['finance', 'installments'], {
    student: { name: 'Zayan Ahmed', id: '21-44390-1' },
    steps: [
      { step: 'Step 1: 50%', label: 'Admission & Initial Fees', amount: 80000, note: 'Cleared on 15 Apr, 2024', state: 'CLEARED' },
      { step: 'Step 2: 30%', label: 'Midterm Installment', amount: 48500, note: 'Due: 25 May, 2024 (8 days left)', state: 'DUE' },
      { step: 'Step 3: 20%', label: 'Final Term Balance', amount: 25500, note: 'Available from 25 June, 2024', state: 'UPCOMING' },
    ],
    tip: 'You are on track for a 100% financial clearance rate. Paying "Step 2" before May 22nd will unlock a 0.5% early bird credit for the Final Term.',
  })

export const usePaymentHistory = () =>
  useFixture<{
    totalPaid: number
    count: number
    rows: { date: string; ref: string; method: string; amount: number; status: 'SUCCESS' | 'PENDING' | 'FAILED' }[]
  }>(['finance', 'history'], {
    totalPaid: 380000,
    count: 14,
    rows: [
      { date: '15 Apr 2024', ref: 'TXN-99120', method: 'bKash', amount: 80000, status: 'SUCCESS' },
      { date: '02 Feb 2024', ref: 'TXN-98771', method: 'Visa •••• 4412', amount: 64000, status: 'SUCCESS' },
      { date: '18 Dec 2023', ref: 'TXN-98002', method: 'Bank Transfer', amount: 72000, status: 'SUCCESS' },
      { date: '05 Nov 2023', ref: 'TXN-97440', method: 'Nagad', amount: 32000, status: 'PENDING' },
    ],
  })

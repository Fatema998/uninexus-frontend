import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { date, money } from '@/lib/format'
import { usePaymentHistory } from '../api'
import type { PaymentStatus } from '@/types'

const TONE: Record<PaymentStatus, BadgeTone> = {
  SUCCESS: 'success',
  PENDING: 'warning',
  REDIRECT_REQUIRED: 'info',
  FAILED: 'danger',
  CANCELLED: 'neutral',
}

/** Payment History — Figma 1:11319. */
export function PaymentHistory() {
  const query = usePaymentHistory()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Payment History" subtitle="Every transaction on your account." />

          <div className="grid gap-6 sm:grid-cols-2">
            <MetricCard label="Total Paid" value={money(d.totalPaid)} tone="success" />
            <MetricCard label="Transactions" value={String(d.count)} tone="brand" />
          </div>

          <Card>
            <CardHeader title="Transactions" />
            <DataTable
              rows={d.results}
              getRowKey={(r) => r.id}
              empty={{ title: 'No transactions yet' }}
              columns={[
                { key: 'date', header: 'Date', cell: (r) => <span className="text-fg-heading">{date(r.paidAt)}</span> },
                { key: 'ref', header: 'Reference', cell: (r) => r.reference },
                { key: 'method', header: 'Method', cell: (r) => r.methodLabel },
                { key: 'amount', header: 'Amount', cell: (r) => money(r.amount), className: 'text-right' },
                { key: 'status', header: 'Status', cell: (r) => <Badge tone={TONE[r.status]}>{r.status}</Badge> },
              ]}
            />
          </Card>
        </div>
      )}
    </QueryState>
  )
}

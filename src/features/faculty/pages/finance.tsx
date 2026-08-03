import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { money } from '@/lib/format'
import { useFacultyFinance } from '../api'

/** Faculty Personal Finance — Figma 1:4777. */
export function FacultyFinance() {
  const query = useFacultyFinance()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Personal Finance" subtitle={d.method} />

          <div className="grid gap-6 sm:grid-cols-3">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={money(m.value)} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Payslips" />
            <DataTable
              rows={d.payslips}
              getRowKey={(r) => r.month}
              empty={{ title: 'No payslips yet' }}
              columns={[
                { key: 'month', header: 'Month', cell: (r) => <span className="text-fg-heading">{r.month}</span> },
                { key: 'paid', header: 'Status', cell: (r) => r.paid },
                { key: 'amount', header: 'Amount', cell: (r) => money(r.amount), className: 'text-right' },
              ]}
            />
          </Card>

          <Card>
            <CardHeader title="Current Breakdown" />
            <CardBody className="flex flex-col gap-2">
              <div className="flex justify-between gap-3">
                <span className="text-fg-muted">Base salary</span>
                <span className="text-link text-fg-heading">{money(d.metrics[0].value)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-fg-muted">Tax deductions</span>
                <span className="text-link text-warning">-{money(d.metrics[2].value)}</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-2">
                <span className="text-fg-muted">Net</span>
                <span className="text-link text-success">
                  {money(d.metrics[0].value - d.metrics[2].value / 4)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}

import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { date, money } from '@/lib/format'
import { useFacultyFinance } from '../api'

/** Faculty Personal Finance — Figma 1:4777. */
export function FacultyFinance() {
  const query = useFacultyFinance()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Personal Finance" subtitle={
            d.payoutMethod
              ? `${d.payoutMethod.label} ${d.payoutMethod.maskedAccount}`
              : 'No payout method on file.'
          } />

          <div className="grid gap-6 sm:grid-cols-3">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Payslips" />
            <DataTable
              rows={d.payslips}
              getRowKey={(r) => r.id}
              empty={{ title: 'No payslips yet' }}
              columns={[
                {
                  key: 'period',
                  header: 'Period',
                  cell: (r) => (
                    <a href={r.pdfUrl} download className="text-brand-700 hover:underline">
                      {r.period}
                    </a>
                  ),
                },
                { key: 'paid', header: 'Paid', cell: (r) => date(r.paidOn) },
                { key: 'gross', header: 'Gross', cell: (r) => money(r.gross), className: 'text-right' },
                { key: 'net', header: 'Net', cell: (r) => money(r.net), className: 'text-right' },
              ]}
            />
          </Card>

          {/* Latest payslip, straight from the server — money is never summed
              or divided on the client. */}
          {d.payslips[0] && (
            <Card>
              <CardHeader title={`Breakdown — ${d.payslips[0].period}`} />
              <CardBody className="flex flex-col gap-2">
                <div className="flex justify-between gap-3">
                  <span className="text-fg-muted">Gross</span>
                  <span className="text-link text-fg-heading">{money(d.payslips[0].gross)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-fg-muted">Deductions</span>
                  <span className="text-link text-warning">-{money(d.payslips[0].deductions)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-border pt-2">
                  <span className="text-fg-muted">Net</span>
                  <span className="text-link text-success">{money(d.payslips[0].net)}</span>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </QueryState>
  )
}

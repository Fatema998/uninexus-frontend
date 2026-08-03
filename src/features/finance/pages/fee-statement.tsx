import { Printer } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { money } from '@/lib/format'
import { useFeeStatement } from '../api'

/** Fee Statement — Figma 1:10138. Print-friendly. */
export function FeeStatement() {
  const query = useFeeStatement()

  return (
    <QueryState query={query}>
      {(d) => {
        const total = d.lines.reduce((s, l) => s + l.amount, 0)

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Fee Statement"
              subtitle="Official statement of charges."
              action={
                <Button onClick={() => window.print()} className="h-11 text-body print:hidden">
                  <Printer className="size-4" aria-hidden />
                  Print
                </Button>
              }
            />

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader title="Student Information" />
                <CardBody>
                  <dl className="flex flex-col gap-3">
                    {d.student.map((f) => (
                      <div key={f.label} className="flex justify-between gap-3">
                        <dt className="text-fg-muted">{f.label}</dt>
                        <dd className="text-right text-link text-fg-heading">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Billing Address" />
                <CardBody>
                  <dl className="flex flex-col gap-3">
                    {d.billing.map((f) => (
                      <div key={f.label} className="flex justify-between gap-3">
                        <dt className="text-fg-muted">{f.label}</dt>
                        <dd className="text-right text-link text-fg-heading">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader title="Statement Summary" />
              <DataTable
                rows={[...d.lines, { label: 'Total', amount: total }]}
                getRowKey={(r) => r.label}
                empty={{ title: 'No charges on this statement' }}
                columns={[
                  {
                    key: 'label',
                    header: 'Description',
                    cell: (r) => <span className="text-fg-heading">{r.label}</span>,
                  },
                  {
                    key: 'amount',
                    header: 'Amount',
                    cell: (r) => money(r.amount),
                    className: 'text-right',
                  },
                ]}
              />
              <CardBody className="border-t border-border">
                <div className="flex justify-between gap-3">
                  <span className="text-fg-muted">Paid to date</span>
                  <span className="text-link text-success">{money(d.paid)}</span>
                </div>
                <div className="mt-1 flex justify-between gap-3">
                  <span className="text-fg-muted">Outstanding</span>
                  <span className="text-link text-danger">{money(total - d.paid)}</span>
                </div>
              </CardBody>
            </Card>

            <p className="text-fg-muted print:hidden">
              If you find any discrepancies in your statement, please contact the Registrar's
              Finance Office immediately.
            </p>
          </div>
        )
      }}
    </QueryState>
  )
}

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
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Fee Statement"
            subtitle={`Official statement of charges — ${d.student.termName}.`}
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
                  <Row label="Name" value={d.student.fullName} />
                  <Row label="ID" value={d.student.registrationNo} />
                  <Row label="Department" value={d.student.department} />
                  <Row label="Semester" value={d.student.termName} />
                </dl>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Billing Address" />
              <CardBody>
                <dl className="flex flex-col gap-3">
                  <Row label="Address" value={d.billing.addressLines.join(', ')} />
                  <Row label="City" value={`${d.billing.city} — ${d.billing.postcode}`} />
                  <Row label="Contact" value={d.billing.phone} />
                  <Row label="Email" value={d.billing.email} />
                </dl>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title="Statement Summary" />
            {/* `total` comes from the server — money is never summed client-side. */}
            <DataTable
              rows={[...d.lines, { id: 'total', label: 'Total', amount: d.total }]}
              getRowKey={(r) => r.id}
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
                <span className="text-link text-danger">{money(d.balance)}</span>
              </div>
            </CardBody>
          </Card>

          <p className="text-fg-muted print:hidden">
            If you find any discrepancies in your statement, please contact the Registrar's Finance
            Office immediately.
          </p>
        </div>
      )}
    </QueryState>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="text-right text-link text-fg-heading">{value}</dd>
    </div>
  )
}

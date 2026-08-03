import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'
import { QueryState } from '@/components/states'
import { date, money } from '@/lib/format'
import { useInvoices } from '../api'

/** Invoices — Figma 1:12541. */
export function Invoices() {
  const query = useInvoices()

  return (
    <QueryState query={query}>
      {(d) => {
        const nextDue = d.invoices.find((i) => !i.paid) ?? null

        return (
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Invoices"
            subtitle={
              nextDue ? `Next due ${date(nextDue.dueOn)}` : 'All invoices are settled.'
            }
            action={
              nextDue ? (
                <Button asChild className="h-11 text-body">
                  <Link to="/student/finance/pay">Pay now</Link>
                </Button>
              ) : undefined
            }
          />

          <div className="grid gap-6 sm:grid-cols-3">
            {d.totals.map((t) => (
              <MetricCard key={t.label} label={t.label} value={money(t.amount)} tone={t.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="All Invoices" />
            <CardBody className="flex flex-col gap-3">
              {d.invoices.map((i) => (
                <div
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div className="min-w-0">
                    <p className="text-link text-fg-heading">{i.title}</p>
                    <p className="text-fg-muted">{i.number} • {i.note}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-link text-fg-heading">{money(i.amount)}</span>
                    <Badge tone={i.paid ? 'success' : 'warning'}>{i.paid ? 'PAID' : 'DUE'}</Badge>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

        </div>
        )
      }}
    </QueryState>
  )
}

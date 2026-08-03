import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { money } from '@/lib/format'
import { useInvoices } from '../api'

/** Invoices — Figma 1:12541. */
export function Invoices() {
  const query = useInvoices()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Invoices"
            subtitle={d.dueBy}
            action={<Button className="h-11 text-body">Pay now</Button>}
          />

          <div className="grid gap-6 sm:grid-cols-3">
            {d.totals.map((t) => (
              <MetricCard key={t.label} label={t.label} value={money(t.value)} tone={t.tone} />
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
                    <p className="text-fg-muted">{i.id} • {i.note}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-link text-fg-heading">{money(i.amount)}</span>
                    <Badge tone={i.paid ? 'success' : 'warning'}>{i.paid ? 'PAID' : 'DUE'}</Badge>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
            <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
              <Sparkles className="size-4" aria-hidden />
              Predictive Financial Outlook
            </p>
            <p className="text-fg-body">{d.outlook}</p>
          </div>
        </div>
      )}
    </QueryState>
  )
}

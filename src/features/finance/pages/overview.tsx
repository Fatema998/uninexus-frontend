import { CheckCircle2, Circle } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { money } from '@/lib/format'
import { useFinanceOverview } from '../api'

/** Finance Overview — Figma 1:9705. */
export function FinanceOverview() {
  const query = useFinanceOverview()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Finance" subtitle={`Next due date: ${d.nextDue}`} />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Payment Timeline" />
            <CardBody className="flex flex-col gap-4">
              {d.timeline.map((t) => (
                <div key={t.label} className="flex items-center gap-4">
                  {t.paid ? (
                    <CheckCircle2 className="size-4.5 shrink-0 text-success" aria-hidden />
                  ) : (
                    <Circle className="size-4.5 shrink-0 text-fg-muted" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-link text-fg-heading">{t.label}</p>
                    <p className="text-fg-muted">{t.date}</p>
                  </div>
                  <span className={t.paid ? 'text-fg-muted' : 'text-link text-fg-heading'}>
                    {money(t.amount)}
                  </span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}

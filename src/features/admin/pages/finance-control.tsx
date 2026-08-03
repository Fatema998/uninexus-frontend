import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { money } from '@/lib/format'
import { useAdminFinance } from '../api'
import { relative } from '@/lib/format'

/** ERP Finance & Accounts Control Center — Figma 7:11851. */
export function FinanceControl() {
  const query = useAdminFinance()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Finance & Accounts" subtitle="Institution-wide financial control." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
            <Card>
              <CardHeader title="Revenue Breakdown" />
              <CardBody className="flex flex-col gap-4">
                <p className="text-fg-muted">Year-to-date category split</p>
                {d.revenueBreakdown.map((b) => (
                  <div key={b.id}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-link text-fg-heading">{b.label}</span>
                      <span className="text-fg-muted">
                        {money(b.amount)} • {b.percent}%
                      </span>
                    </div>
                    <ProgressBar value={b.percent} tone={b.tone} label={b.label} />
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Recent Transactions" />
              <CardBody className="flex flex-col gap-3">
                {d.recentEntries.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-wrap items-center gap-4 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <span
                      className={
                        t.inbound
                          ? 'grid size-9 shrink-0 place-items-center rounded-control bg-success/10 text-success'
                          : 'grid size-9 shrink-0 place-items-center rounded-control bg-warning/10 text-warning'
                      }
                    >
                      {t.inbound ? (
                        <ArrowDownLeft className="size-4" aria-hidden />
                      ) : (
                        <ArrowUpRight className="size-4" aria-hidden />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-link text-fg-heading">{t.title}</p>
                      <p className="truncate text-fg-muted">
                        {t.party} • {t.reference} • {relative(t.at)}
                      </p>
                    </div>
                    <span className={t.inbound ? 'text-link text-success' : 'text-link text-warning'}>
                      {t.inbound ? '+' : '-'}{money(t.amount)}
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  )
}

import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useResearchPortfolio } from '../api'

/** Faculty Research Portfolio — Figma 1:5077. */
export function ResearchPortfolio() {
  const query = useResearchPortfolio()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Research Portfolio" subtitle="Publications and impact." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Published Papers" />
            <CardBody className="flex flex-col gap-3">
              {d.papers.map((p) => (
                <div key={p.title} className="rounded-control border border-border-strong bg-surface p-4">
                  <p className="text-link text-fg-heading">{p.title}</p>
                  <p className="text-fg-muted">{p.venue}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}

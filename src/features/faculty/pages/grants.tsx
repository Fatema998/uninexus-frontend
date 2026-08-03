import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useGrants } from '../api'
import { date, money, percent } from '@/lib/format'
import { ProgressBar } from '@/components/patterns/progress-bar'
import type { ProjectState } from '@/types/faculty'

const TONE: Record<ProjectState, BadgeTone> = {
  ACTIVE: 'success',
  REVIEW: 'warning',
  CLOSED: 'neutral',
}

/** Faculty Research & Grant Management — Figma 1:1490. */
export function Grants() {
  const query = useGrants()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Research & Grants" subtitle="Projects, funding, and publications." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Projects" />
              <CardBody className="flex flex-col gap-3">
                {d.projects.map((p) => {
                  const spentPct = (Number(p.spent) / Number(p.awarded)) * 100
                  return (
                    <div
                      key={p.id}
                      className="rounded-control border border-border-strong bg-surface p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 text-link text-fg-heading">{p.title}</p>
                        <Badge tone={TONE[p.state]}>{p.state}</Badge>
                      </div>
                      <p className="mt-1 text-fg-muted">
                        {p.fundingBody} • {date(p.startsOn)} – {date(p.endsOn)}
                      </p>
                      <ProgressBar
                        value={spentPct}
                        tone={spentPct > 90 ? 'warning' : 'brand'}
                        label={`${p.title} budget used`}
                        className="mt-3"
                      />
                      <p className="mt-2 text-fg-muted">
                        {money(p.spent)} of {money(p.awarded)} used ({percent(spentPct)}) •{' '}
                        {p.assistantCount} RA{p.assistantCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  )
                })}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Publications" />
              <CardBody className="flex flex-col gap-3">
                {d.publications.map((p) => (
                  <div key={p.id} className="border-l-2 border-nav-active-student pl-3">
                    <p className="text-link text-fg-heading">{p.title}</p>
                    <p className="text-fg-muted">
                      {p.venue}, {p.year} • {p.citationCount} citations
                    </p>
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

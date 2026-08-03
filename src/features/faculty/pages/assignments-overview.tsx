import { Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useFacultyAssignments } from '../api'

/** Faculty Assignments Overview — Figma 1:1841. */
export function AssignmentsOverview() {
  const query = useFacultyAssignments()

  return (
    <QueryState query={query}>
      {(d) => {
        const max = Math.max(...d.distribution.map((x) => x.count))

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Assignments" subtitle="Submissions and marking across your courses." />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {d.metrics.map((m) => (
                <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
              ))}
            </div>

            <Card>
              <CardHeader title="Score Distribution" />
              <CardBody className="flex flex-col gap-4">
                {d.distribution.map((b) => (
                  <div key={b.band}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-link text-fg-heading">{b.band}</span>
                      <span className="text-fg-muted">{b.count} students</span>
                    </div>
                    <ProgressBar
                      value={(b.count / max) * 100}
                      tone="accent"
                      label={`${b.band} band`}
                    />
                  </div>
                ))}
              </CardBody>
            </Card>

            <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
              <p className="flex items-center gap-2 text-fg-body">
                <Sparkles className="size-4 shrink-0 text-accent-600" aria-hidden />
                AI Insight — {d.insight}
              </p>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}

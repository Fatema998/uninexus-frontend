import { Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useFacultyAssignments } from '../api'
import { relative } from '@/lib/format'

/** Faculty Assignments Overview — Figma 1:1841. */
export function AssignmentsOverview() {
  const query = useFacultyAssignments()

  return (
    <QueryState query={query}>
      {(d) => {
        const max = Math.max(...d.scoreDistribution.map((x) => x.count), 1)

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
                {d.scoreDistribution.map((b) => (
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

            <Card>
              <CardHeader title="Assignments" />
              <CardBody className="flex flex-col gap-3">
                {d.assignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-link text-fg-heading">
                        {a.title}
                        {!a.published && <Badge tone="neutral">DRAFT</Badge>}
                      </p>
                      <p className="text-fg-muted">
                        {a.section.course.code} Sec {a.section.name} • due {relative(a.dueAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-fg-muted">
                        {a.submittedCount} / {a.enrolledCount} submitted
                      </p>
                      <Link
                        to={`/faculty/assignments/${a.id}/review`}
                        className="text-link text-brand-700 hover:underline"
                      >
                        {a.gradedCount} graded — review
                      </Link>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            {d.insight && (
              <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
                <p className="flex items-center gap-2 text-fg-body">
                  <Sparkles className="size-4 shrink-0 text-accent-600" aria-hidden />
                  AI Insight — {d.insight}
                </p>
              </div>
            )}
          </div>
        )
      }}
    </QueryState>
  )
}

import { Link } from 'react-router'
import { AssistantPanel } from '@/components/patterns/assistant-panel'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useAssignments, type AssignmentState } from '../api'

const TONE: Record<AssignmentState, BadgeTone> = {
  OVERDUE: 'danger',
  'DUE SOON': 'warning',
  SUBMITTED: 'info',
  GRADED: 'success',
}

/** LMS Assignments — Figma 6:2928. */
export function Assignments() {
  const query = useAssignments()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Assignments" subtitle="Everything due, submitted, and graded." />

          <div className="grid gap-6 sm:grid-cols-3">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="All Assignments" />
              <CardBody className="flex flex-col gap-3">
                {d.assignments.map((a) => (
                  <article key={a.id} className="rounded-control border border-border-strong bg-surface p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-link text-fg-heading">{a.title}</p>
                        <p className="text-fg-muted">{a.course} • {a.summary}</p>
                      </div>
                      <Badge tone={TONE[a.state]}>{a.state}</Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-fg-muted">Due {a.due} • {a.meta}</p>
                      {(a.state === 'OVERDUE' || a.state === 'DUE SOON') && (
                        <Link
                          to={`/student/lms/assignments/${a.id}/submit`}
                          className="text-link text-brand-700 hover:underline"
                        >
                          Submit
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </CardBody>
            </Card>

            <AssistantPanel {...d.assistant} />
          </div>
        </div>
      )}
    </QueryState>
  )
}

import { Link } from 'react-router'
import { ConnectedAssistant } from '@/components/patterns/assistant-panel'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useAssignments } from '../api'
import { relative } from '@/lib/format'
import type { AssignmentState } from '@/types'

const TONE: Record<AssignmentState, BadgeTone> = {
  OPEN: 'neutral',
  OVERDUE: 'danger',
  DUE_SOON: 'warning',
  SUBMITTED: 'info',
  GRADED: 'success',
}

const LABEL: Record<AssignmentState, string> = {
  OPEN: 'OPEN',
  OVERDUE: 'OVERDUE',
  DUE_SOON: 'DUE SOON',
  SUBMITTED: 'SUBMITTED',
  GRADED: 'GRADED',
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
                        <p className="text-fg-muted">
                          {a.course.code} • {a.summary}
                        </p>
                      </div>
                      <Badge tone={TONE[a.state]}>{LABEL[a.state]}</Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-fg-muted">
                        Due {relative(a.dueAt)}
                        {a.grade && ` • Graded ${a.grade}`}
                      </p>
                      {(a.state === 'OVERDUE' || a.state === 'DUE_SOON' || a.state === 'OPEN') && (
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

            <ConnectedAssistant context="lms.assignments" />
          </div>
        </div>
      )}
    </QueryState>
  )
}

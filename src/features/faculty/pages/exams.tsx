import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useFacultyExams } from '../api'
import { dateTime, relative } from '@/lib/format'
import { Badge, type BadgeTone } from '@/components/patterns/badge'

const PAPER_TONE: Record<string, BadgeTone> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
}

/** Faculty Examination Management — Figma 1:3320. */
export function FacultyExams() {
  const query = useFacultyExams()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Examination" subtitle="Duties, evaluation, and question papers." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Question Papers" />
            <CardBody className="flex flex-col gap-3">
              {d.papers.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div>
                    <p className="text-link text-fg-heading">
                      {p.section.course.code} — {p.section.course.title}
                    </p>
                    <p className="text-fg-muted">
                      {p.submittedAt
                        ? `Submitted ${relative(p.submittedAt)}`
                        : `Due ${relative(p.dueAt)}`}
                    </p>
                  </div>
                  <Badge tone={PAPER_TONE[p.status] ?? 'neutral'}>{p.status}</Badge>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Exam Duties" />
            <CardBody className="flex flex-col gap-3">
              {d.duties.map((x) => (
                <div
                  key={x.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div>
                    <p className="text-link text-fg-heading">{x.title}</p>
                    <p className="text-fg-muted">{x.venue}</p>
                  </div>
                  <p className="text-link text-brand-700">{dateTime(x.startsAt)}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}

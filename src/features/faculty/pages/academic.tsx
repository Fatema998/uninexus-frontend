import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useFacultyAcademic } from '../api'
import { date } from '@/lib/format'

/** Faculty Academic Overview — Figma 1:1147. */
export function FacultyAcademic() {
  const query = useFacultyAcademic()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Academic Overview" subtitle={`${d.term.name} • Week ${d.term.weekNumber} of ${d.term.totalWeeks}`} />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Weekly Schedule" />
              <CardBody className="flex flex-col gap-3">
                {d.weeklySchedule.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-3"
                  >
                    <span className="text-link text-fg-heading">{s.label}</span>
                    <span className="text-fg-muted">
                      {s.day} {s.startsAt}–{s.endsAt} • {s.room}
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Semester Milestones" />
              <CardBody className="flex flex-col gap-3">
                {d.milestones.map((m) => (
                  <div key={m.id} className="border-l-2 border-nav-active-student pl-3">
                    <p className="text-link text-fg-heading">{m.title}</p>
                    <p className="text-fg-muted">{m.note}</p>
                    <p className="text-fg-muted">Due {date(m.dueAt)}</p>
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

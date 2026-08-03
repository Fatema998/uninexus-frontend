import { CalendarPlus } from 'lucide-react'
import { ConnectedAssistant } from '@/components/patterns/assistant-panel'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { HeroBanner } from '@/components/patterns/hero-banner'
import { MetricCard } from '@/components/patterns/metric-card'
import { Badge } from '@/components/patterns/badge'
import { QueryState } from '@/components/states'
import { dateShort, relative } from '@/lib/format'
import { useStudentDashboard } from './api'
import { iconFor } from './icon-map'

/**
 * Student Dashboard — Figma 9:6820.
 *
 * Section structure (hero → summary cards → centre + right rail) is taken
 * from the frame. Inner content follows the Academic Overview frame (6:7179),
 * which shares the same card vocabulary — the 9:6820 render could not be
 * retrieved. This is the least-verified of the three dashboards; check it
 * against the frame before Phase 4.
 */
export function StudentDashboard() {
  const query = useStudentDashboard()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <HeroBanner badge={d.hero.badge} heading={d.hero.heading}>
            {d.hero.body}
          </HeroBanner>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {d.metrics.map((m) => (
              <MetricCard
                key={m.label}
                label={m.label}
                value={m.value}
                unit={m.unit}
                tone={m.tone}
                icon={iconFor(m.icon)}
                progress={m.progress}
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="Active Courses" action={{ label: 'View Schedule', to: '/student/academic/routine' }} />
              <CardBody className="flex flex-col gap-4">
                {d.courses.map((c) => (
                  <div
                    key={c.course.id}
                    className="flex items-center gap-6 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-link text-fg-heading">{c.course.title}</p>
                      <p className="truncate text-fg-muted">
                        {c.instructorName} • {c.mode}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge tone={c.status === 'ENROLLED' ? 'success' : 'neutral'}>{c.status}</Badge>
                      <p className={c.grade ? 'mt-1 text-link text-fg-heading' : 'mt-1 text-fg-muted'}>
                        Grade: {c.grade ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            <aside className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Upcoming Deadlines" />
                <CardBody className="flex flex-col gap-4">
                  {d.deadlines.map((dl) => {
                    // `25 May` -> ['25', 'May'] for the two-line date block.
                    const [day, month] = dateShort(dl.dueAt).split(' ')
                    return (
                      <div key={dl.id} className="flex gap-4">
                        <div className="w-10 shrink-0 text-center">
                          <p className={dl.isOverdue ? 'text-card-title text-danger' : 'text-card-title'}>{day}</p>
                          <p className="text-eyebrow uppercase text-fg-muted">{month}</p>
                        </div>
                        <div className="border-l border-sidebar-line pl-4">
                          <p className="text-link text-fg-heading">{dl.title}</p>
                          <p className="text-fg-muted">
                            {dl.kind} • {relative(dl.dueAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-control border-2 border-dashed border-sidebar-line p-4 text-link text-fg-muted hover:bg-surface-subtle"
                  >
                    <CalendarPlus className="size-4" aria-hidden />
                    Add Reminder
                  </button>
                </CardBody>
              </Card>

              <ConnectedAssistant context="student.dashboard" />
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}

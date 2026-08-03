import { Sparkles } from 'lucide-react'
import { ConnectedAssistant } from '@/components/patterns/assistant-panel'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { timeRange } from '@/lib/format'
import { useAttendanceOverview } from '../api'
import { MARK_TONE } from '../marks'

/** Attendance Overview — Figma 1:15772. */
export function AttendanceOverview() {
  const query = useAttendanceOverview()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Attendance" subtitle="Your presence across lectures, labs, and seminars." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {d.metrics.map((m) => (
              <MetricCard
                key={m.label}
                label={m.label}
                value={m.value}
                tone={m.tone}
                progress={m.progress}
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="Today's Classes" />
              <CardBody className="flex flex-col gap-3">
                {d.today.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div>
                      <p className="text-link text-fg-heading">{t.course.title}</p>
                      <p className="text-fg-muted">{timeRange(t.startsAt, t.endsAt)}</p>
                    </div>
                    <Badge tone={MARK_TONE[t.mark]}>{t.mark}</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>

            <aside className="flex flex-col gap-6">
              {d.streakNote && (
                <div className="rounded-card border border-success/20 bg-success/5 p-4">
                  <p className="flex items-start gap-2 text-fg-body">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    {d.streakNote}
                  </p>
                </div>
              )}
              <ConnectedAssistant context="attendance.overview" />
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}

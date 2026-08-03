import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { date as fmtDate, time } from '@/lib/format'
import { useDailyAttendance } from '../api'
import { MARK_TONE } from '../marks'

/** Daily Attendance — Figma 1:15435. */
export function DailyAttendance() {
  const query = useDailyAttendance()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Daily Attendance" subtitle={fmtDate(d.date)} />

          <Card>
            <CardHeader title="Classes" />
            <CardBody className="flex flex-col gap-3">
              {d.classes.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div className="min-w-0">
                    <p className="text-link text-fg-heading">{c.course.title}</p>
                    <p className="text-fg-muted">
                      {time(c.startsAt)} • {c.room} • {c.instructorName}
                    </p>
                  </div>
                  <Badge tone={MARK_TONE[c.mark]}>{c.mark}</Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}

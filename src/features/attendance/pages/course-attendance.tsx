import { CalendarClock } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { ConnectedAssistant } from '@/components/patterns/assistant-panel'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { date, timeRange } from '@/lib/format'
import { useCourseAttendance } from '../api'
import { MARK_TONE } from '../marks'

/** Course Attendance — Figma 1:14603. */
export function CourseAttendance() {
  const [params] = useSearchParams()
  const query = useCourseAttendance(params.get('course') ?? undefined)

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title={`${d.course.code} ${d.course.title}`}
            subtitle={`Instructor: ${d.instructorName} • ${d.room} • ${d.course.credits} Credits`}
          />

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Attendance Rate" />
                <CardBody>
                  <p className={`text-metric ${d.percent >= d.requiredPercent ? 'text-info' : 'text-danger'}`}>
                    {d.percent}%
                  </p>
                  <ProgressBar
                    value={d.percent}
                    tone={d.percent >= d.requiredPercent ? 'info' : 'danger'}
                    label="Course attendance"
                    className="mt-3"
                  />
                  <p className="mt-2 text-fg-muted">
                    {d.requiredPercent}% is the mandatory minimum for this course.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Session History" />
                <DataTable
                  rows={d.sessions}
                  getRowKey={(r) => r.id}
                  empty={{ title: 'No sessions recorded yet' }}
                  columns={[
                    { key: 'date', header: 'Date', cell: (r) => <span className="text-fg-heading">{date(r.startsAt)}</span> },
                    { key: 'time', header: 'Time', cell: (r) => timeRange(r.startsAt, r.endsAt) },
                    { key: 'mark', header: 'Status', cell: (r) => <Badge tone={MARK_TONE[r.mark]}>{r.mark}</Badge> },
                  ]}
                />
              </Card>
            </div>

            <aside className="flex flex-col gap-6">
              {d.nextSessionAt && (
                <Card>
                  <CardHeader title="Next Class" icon={CalendarClock} />
                  <CardBody>
                    <p className="text-fg-body">{date(d.nextSessionAt)}</p>
                  </CardBody>
                </Card>
              )}
              <ConnectedAssistant context="attendance.by-course" />
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}

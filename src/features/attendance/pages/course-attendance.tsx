import { CalendarClock } from 'lucide-react'
import { AssistantPanel } from '@/components/patterns/assistant-panel'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useCourseAttendance } from '../api'
import { MARK_TONE } from '../marks'

/** Course Attendance — Figma 1:14603. */
export function CourseAttendance() {
  const query = useCourseAttendance()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title={d.course.name} subtitle={d.course.meta} />

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Attendance Rate" />
                <CardBody>
                  <p className="text-metric text-info">{d.course.percent}%</p>
                  <ProgressBar
                    value={d.course.percent}
                    tone="info"
                    label="Course attendance"
                    className="mt-3"
                  />
                  <p className="mt-2 text-fg-muted">{d.note}</p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Session History" />
                <DataTable
                  rows={d.sessions}
                  getRowKey={(r) => r.date}
                  empty={{ title: 'No sessions recorded yet' }}
                  columns={[
                    { key: 'date', header: 'Date', cell: (r) => <span className="text-fg-heading">{r.date}</span> },
                    { key: 'time', header: 'Time', cell: (r) => r.time },
                    { key: 'mark', header: 'Status', cell: (r) => <Badge tone={MARK_TONE[r.mark]}>{r.mark}</Badge> },
                  ]}
                />
              </Card>
            </div>

            <aside className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Next Class" icon={CalendarClock} />
                <CardBody>
                  <p className="text-fg-body">{d.nextClass}</p>
                </CardBody>
              </Card>
              <AssistantPanel {...d.assistant} />
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}

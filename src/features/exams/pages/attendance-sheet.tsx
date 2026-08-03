import { CheckCircle2, Circle } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useExamAttendanceSheet } from '../api'

/** Exam Attendance Sheet — Figma 1:13906. */
export function ExamAttendanceSheet() {
  const query = useExamAttendanceSheet()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Exam Attendance Sheet" subtitle="Your exam-hall check-in record." />

          <Card>
            <CardHeader title="Exam" />
            <CardBody>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-eyebrow uppercase text-fg-muted">Course Code</dt>
                  <dd className="text-link text-fg-heading">{d.exam.code} {d.exam.name}</dd>
                </div>
                <div>
                  <dt className="text-eyebrow uppercase text-fg-muted">Date & Time</dt>
                  <dd className="text-link text-fg-heading">{d.exam.when}</dd>
                </div>
                <div>
                  <dt className="text-eyebrow uppercase text-fg-muted">Location</dt>
                  <dd className="text-link text-fg-heading">{d.exam.where}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Check-in Log" />
            <CardBody className="flex flex-col gap-3">
              {d.entries.map((e) => (
                <div
                  key={e.label}
                  className="flex items-center gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  {e.done ? (
                    <CheckCircle2 className="size-4.5 shrink-0 text-success" aria-hidden />
                  ) : (
                    <Circle className="size-4.5 shrink-0 text-fg-muted" aria-hidden />
                  )}
                  <span className="flex-1 text-fg-heading">{e.label}</span>
                  <span className="text-fg-muted">{e.time}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}

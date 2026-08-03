import { AlertTriangle } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { relative } from '@/lib/format'
import { useAttendanceHistory } from '../api'

/** Attendance History — Figma 1:15013. */
export function AttendanceHistory() {
  const query = useAttendanceHistory()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Attendance History" subtitle={`Last updated ${relative(d.computedAt)}`} />

          {d.insight && (
            <div className="rounded-card border border-warning/20 bg-warning/5 p-4">
              <p className="mb-1 flex items-center gap-2 text-link text-warning">
                <AlertTriangle className="size-4" aria-hidden />
                Attendance Insight
              </p>
              <p className="text-fg-body">{d.insight}</p>
            </div>
          )}

          <Card>
            <CardHeader title="By Term" />
            <CardBody className="flex flex-col gap-5">
              {d.terms.map((t) => (
                <div key={t.termId}>
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-link text-fg-heading">{t.termName}</span>
                    <span className="text-fg-muted">
                      {t.attended} / {t.total} classes • {t.percent}%
                    </span>
                  </div>
                  <ProgressBar
                    value={t.percent}
                    tone={t.percent >= 90 ? 'success' : 'warning'}
                    label={`${t.termName} attendance`}
                  />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}

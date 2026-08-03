import { Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useAttendanceAnalytics } from '../api'

/** Attendance Analytics — Figma 1:14266. */
export function AttendanceAnalytics() {
  const query = useAttendanceAnalytics()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Attendance Analytics" subtitle="Patterns across the semester." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Day Distribution" />
            <CardBody className="flex flex-col gap-4">
              {d.byDay.map((b) => (
                <div key={b.day}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-link text-fg-heading">{b.day}</span>
                    <span className="text-fg-muted">{b.percent}%</span>
                  </div>
                  <ProgressBar
                    value={b.percent}
                    tone={b.percent >= 90 ? 'success' : b.percent >= 80 ? 'info' : 'warning'}
                    label={`${b.day} attendance`}
                  />
                </div>
              ))}
            </CardBody>
          </Card>

          <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
            <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
              <Sparkles className="size-4" aria-hidden />
              {d.forecast.headline}
            </p>
            <p className="text-fg-body">{d.forecast.body}</p>
          </div>
        </div>
      )}
    </QueryState>
  )
}

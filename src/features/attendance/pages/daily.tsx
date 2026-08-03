import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useDailyAttendance } from '../api'
import { MARK_TONE } from '../marks'

/** Daily Attendance — Figma 1:15435. */
export function DailyAttendance() {
  const query = useDailyAttendance()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Daily Attendance" subtitle={d.date} />

          <Card>
            <CardHeader title="Classes" />
            <CardBody className="flex flex-col gap-3">
              {d.classes.map((c) => (
                <div
                  key={c.title}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div className="min-w-0">
                    <p className="text-link text-fg-heading">{c.title}</p>
                    <p className="text-fg-muted">{c.place}</p>
                  </div>
                  <Badge tone={MARK_TONE[c.mark]}>{c.mark}</Badge>
                </div>
              ))}
            </CardBody>
          </Card>

          <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
            <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
              <Sparkles className="size-4" aria-hidden />
              Next Recommendation
            </p>
            <p className="text-fg-body">{d.recommendation}</p>
          </div>
        </div>
      )}
    </QueryState>
  )
}

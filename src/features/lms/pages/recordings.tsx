import { Play, Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useRecordings } from '../api'

/** LMS Recorded Classes — Figma 6:2573. */
export function Recordings() {
  const query = useRecordings()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Recorded Classes" subtitle="Catch up on any session you missed." />

          <div className="grid gap-6 sm:grid-cols-2">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
            <p className="flex items-start gap-2 text-fg-body">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-accent-600" aria-hidden />
              {d.tip}
            </p>
          </div>

          <Card>
            <CardHeader title="Sessions" />
            <CardBody className="flex flex-col gap-3">
              {d.sessions.map((s) => (
                <div
                  key={s.title + s.date}
                  className="flex flex-wrap items-center gap-4 rounded-control border border-border-strong bg-surface p-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-control bg-brand-600/10 text-brand-700">
                    <Play className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-link text-fg-heading">{s.title}</p>
                    <p className="text-fg-muted">{s.date} • {s.time}</p>
                  </div>
                  <span className="text-fg-muted">{s.duration}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
